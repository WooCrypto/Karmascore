// Sandbox shield for iframe and restricted storage environments.
// This runs before anything else is evaluated to prevent third-party library crashes.

if (typeof window !== 'undefined') {
  const createInMemoryStorage = () => {
    const store: Record<string, string> = {};
    return {
      getItem(key: string): string | null {
        return key in store ? store[key] : null;
      },
      setItem(key: string, value: any) {
        store[key] = String(value);
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        for (const k in store) {
          delete store[k];
        }
      },
      key(index: number): string | null {
        return Object.keys(store)[index] || null;
      },
      get length(): number {
        return Object.keys(store).length;
      }
    };
  };

  const patchStoragePrototype = () => {
    if (typeof Storage === 'undefined' || !Storage.prototype) return;

    const inMemoryStores = new WeakMap<any, any>();
    const getFallback = (storageInstance: any) => {
      let store = inMemoryStores.get(storageInstance);
      if (!store) {
        store = createInMemoryStorage();
        inMemoryStores.set(storageInstance, store);
      }
      return store;
    };

    const patchMethod = (name: 'getItem' | 'setItem' | 'removeItem' | 'clear' | 'key') => {
      try {
        const original = Storage.prototype[name];
        Storage.prototype[name] = function(this: any, ...args: any[]) {
          try {
            return original.apply(this, args);
          } catch (err) {
            console.warn(`Storage.prototype.${name} failed, falling back to in-memory:`, err);
            const fallback = getFallback(this);
            return (fallback as any)[name].apply(fallback, args);
          }
        };
      } catch (e) {
        console.warn(`Could not patch Storage.prototype.${name}:`, e);
      }
    };

    patchMethod('getItem');
    patchMethod('setItem');
    patchMethod('removeItem');
    patchMethod('clear');
    patchMethod('key');

    try {
      const desc = Object.getOwnPropertyDescriptor(Storage.prototype, 'length');
      if (desc && desc.configurable) {
        Object.defineProperty(Storage.prototype, 'length', {
          get() {
            try {
              return desc.get ? desc.get.call(this) : 0;
            } catch (err) {
              return getFallback(this).length;
            }
          },
          set() {
            // Safe silent ignore for write attempts on the readonly length property
          },
          configurable: true
        });
      }
    } catch (e) {
      console.warn('Could not patch Storage.prototype.length getter:', e);
    }
  };

  // Patch Storage.prototype so direct Storage calls are protected
  patchStoragePrototype();

  const makeSafeStorageProxy = (name: 'localStorage' | 'sessionStorage', realStorage: any) => {
    const fallbackStore = createInMemoryStorage();
    const propCache: Record<string, string> = {};

    // Use a fully configurable buffer object as Proxy target to prevent ReadOnly/Invariant errors in strict mode
    const targetBuffer: Record<string, any> = {};

    return new Proxy(targetBuffer, {
      get(target, prop, receiver) {
        if (prop === 'length') {
          try {
            if (realStorage) {
              return realStorage.length;
            }
          } catch (e) {}
          return fallbackStore.length;
        }

        if (prop === 'getItem') {
          return (key: string) => {
            try {
              if (realStorage) {
                const val = realStorage.getItem(key);
                if (val !== null) return val;
              }
            } catch (e) {}
            return fallbackStore.getItem(key) ?? propCache[key] ?? null;
          };
        }

        if (prop === 'setItem') {
          return (key: string, value: any) => {
            const strValue = String(value);
            fallbackStore.setItem(key, strValue);
            propCache[key] = strValue;
            try {
              if (realStorage) {
                realStorage.setItem(key, strValue);
              }
            } catch (e) {
              console.warn(`SafeStorage Proxy intercepted setItem error for ${key}:`, e);
            }
          };
        }

        if (prop === 'removeItem') {
          return (key: string) => {
            fallbackStore.removeItem(key);
            delete propCache[key];
            try {
              if (realStorage) {
                realStorage.removeItem(key);
              }
            } catch (e) {}
          };
        }

        if (prop === 'clear') {
          return () => {
            fallbackStore.clear();
            for (const k in propCache) {
              delete propCache[k];
            }
            try {
              if (realStorage) {
                realStorage.clear();
              }
            } catch (e) {}
          };
        }

        if (prop === 'key') {
          return (index: number) => {
            try {
              if (realStorage) {
                return realStorage.key(index);
              }
            } catch (e) {}
            return fallbackStore.key(index);
          };
        }

        if (typeof prop === 'string') {
          const sourceObj = realStorage || fallbackStore;
          if (prop in sourceObj && typeof sourceObj[prop] === 'function') {
            return sourceObj[prop].bind(sourceObj);
          }

          try {
            if (realStorage && prop in realStorage) {
              const val = realStorage[prop];
              if (val !== undefined) return val;
            }
          } catch (e) {}

          const fallbackVal = fallbackStore.getItem(prop);
          if (fallbackVal !== null) return fallbackVal;
          return propCache[prop];
        }

        return Reflect.get(target, prop, receiver);
      },

      set(target, prop, value, receiver) {
        if (typeof prop === 'string') {
          const strValue = String(value);
          fallbackStore.setItem(prop, strValue);
          propCache[prop] = strValue;
          target[prop] = strValue;

          try {
            if (realStorage) {
              realStorage[prop] = strValue;
            }
          } catch (e) {
            console.warn(`SafeStorage Proxy swallowed property assignment error for ${prop}:`, e);
          }
          return true;
        }
        return Reflect.set(target, prop, value, receiver);
      },

      defineProperty(target, prop, descriptor) {
        const safeDesc = { ...descriptor };
        safeDesc.configurable = true;
        if (safeDesc.get) {
          safeDesc.set = safeDesc.set || (() => {});
        } else {
          safeDesc.writable = true;
        }
        try {
          Object.defineProperty(target, prop, safeDesc);
        } catch (e) {}
        try {
          if (realStorage) {
            Object.defineProperty(realStorage, prop, safeDesc);
          }
        } catch (e) {}
        return true;
      },

      getOwnPropertyDescriptor(target, prop) {
        try {
          if (realStorage) {
            const desc = Reflect.getOwnPropertyDescriptor(realStorage, prop);
            if (desc) {
              desc.configurable = true;
              if (desc.get) {
                desc.set = desc.set || (() => {});
              } else {
                desc.writable = true;
              }
              return desc;
            }
          }
        } catch (e) {}

        const targetDesc = Reflect.getOwnPropertyDescriptor(target, prop);
        if (targetDesc) {
          targetDesc.configurable = true;
          if (targetDesc.get) {
            targetDesc.set = targetDesc.set || (() => {});
          } else {
            targetDesc.writable = true;
          }
          return targetDesc;
        }

        if (typeof prop === 'string' && prop in propCache) {
          return {
            value: propCache[prop],
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        return undefined;
      },

      ownKeys(target) {
        const keys = new Set<string | symbol>();
        try {
          if (realStorage) {
            Reflect.ownKeys(realStorage).forEach(k => keys.add(k));
          }
        } catch (e) {}
        
        Reflect.ownKeys(target).forEach(k => keys.add(k));
        Object.keys(propCache).forEach(k => keys.add(k));
        return Array.from(keys);
      },

      deleteProperty(target, prop) {
        if (typeof prop === 'string') {
          delete target[prop];
          delete propCache[prop];
          fallbackStore.removeItem(prop);
          try {
            if (realStorage) {
              delete realStorage[prop];
            }
          } catch (e) {}
        }
        return true;
      },

      has(target, prop) {
        return prop in target || (typeof prop === 'string' && prop in propCache) || (realStorage ? prop in realStorage : false);
      }
    });
  };

  const shieldProperty = (name: 'localStorage' | 'sessionStorage') => {
    let originalInstance: any = null;

    try {
      originalInstance = window[name];
    } catch (err) {
      originalInstance = null;
    }

    const safeProxy = makeSafeStorageProxy(name, originalInstance);
    let currentValue = safeProxy;

    // 1. Shadow on Window.prototype (where default getters usually reside)
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        const desc = Object.getOwnPropertyDescriptor(Window.prototype, name);
        if (!desc || desc.configurable) {
          Object.defineProperty(Window.prototype, name, {
            get() { return currentValue; },
            set(v) { currentValue = v; },
            configurable: true,
            enumerable: true
          });
        }
      } catch (e) {
        console.warn(`Could not shield ${name} on Window.prototype:`, e);
      }
    }

    // 2. Define/Shadow on window itself
    try {
      const desc = Object.getOwnPropertyDescriptor(window, name);
      if (!desc || desc.configurable) {
        Object.defineProperty(window, name, {
          get() { return currentValue; },
          set(v) { currentValue = v; },
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {
      console.warn(`Could not shield ${name} on window:`, e);
    }

    // 3. Define/Shadow on globalThis
    try {
      const desc = Object.getOwnPropertyDescriptor(globalThis, name);
      if (!desc || desc.configurable) {
        Object.defineProperty(globalThis, name, {
          get() { return currentValue; },
          set(v) { currentValue = v; },
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {
      console.warn(`Could not shield ${name} on globalThis:`, e);
    }
  };

  // Shield localStorage and sessionStorage
  shieldProperty('localStorage');
  shieldProperty('sessionStorage');

  // Shield window.ethereum using a clean, configurable target object
  // to avoid ES6 non-configurable Proxy invariant conflicts
  const makeSafeEthereumProxy = (realEth: any): any => {
    const fallbackEth = {
      isMetaMask: true,
      __isFallback: true,
      request: async (args: any) => {
        console.log('Shielded sandbox ethereum.request called:', args);
        return [];
      },
      on: () => {},
      removeListener: () => {},
      providers: []
    };

    const activeSource = realEth || fallbackEth;
    
    // We use a flat writable object as the Proxy target.
    // This perfectly prevents "Attempted to assign to readonly property" exceptions on the Proxy
    // because all fields on the target are fully configurable.
    const targetBuffer: Record<string, any> = {};
    try {
      const keys = Reflect.ownKeys(activeSource);
      for (const k of keys) {
        try {
          const desc = Reflect.getOwnPropertyDescriptor(activeSource, k);
          if (desc) {
            desc.configurable = true;
            if (desc.get) {
              const val = activeSource[k];
              Object.defineProperty(targetBuffer, k, {
                value: val,
                writable: true,
                configurable: true,
                enumerable: desc.enumerable !== undefined ? desc.enumerable : true
              });
            } else {
              desc.writable = true;
              Object.defineProperty(targetBuffer, k, desc);
            }
          }
        } catch (copyErr) {}
      }
    } catch (e) {}

    return new Proxy(targetBuffer, {
      get(target, prop) {
        if (prop === '__isShieldedProxy') return true;
        
        // Dynamic delegator fallback
        const sourceVal = activeSource[prop];
        const localVal = target[prop as string];
        const val = sourceVal !== undefined ? sourceVal : localVal;

        if (typeof val === 'function') {
          return val.bind(activeSource);
        }
        
        if (val && typeof val === 'object' && !val.__isShieldedProxy) {
          return makeSafeEthereumProxy(val);
        }
        return val;
      },
      set(target, prop, value) {
        target[prop as string] = value;
        try {
          activeSource[prop] = value;
        } catch (setErr) {
          console.warn(`Shield swallowed write to read-only property ${String(prop)}:`, setErr);
        }
        return true;
      },
      defineProperty(target, prop, descriptor) {
        const safeDesc = { ...descriptor };
        safeDesc.configurable = true;
        if (safeDesc.get) {
          safeDesc.set = safeDesc.set || (() => {});
        } else {
          safeDesc.writable = true;
        }
        try {
          Object.defineProperty(target, prop, safeDesc);
        } catch (e) {}
        try {
          Object.defineProperty(activeSource, prop, safeDesc);
        } catch (e) {}
        return true;
      },
      deleteProperty(target, prop) {
        delete target[prop as string];
        try {
          delete activeSource[prop];
        } catch (e) {}
        return true;
      },
      has(target, prop) {
        return prop in target || prop in activeSource;
      },
      ownKeys(target) {
        const keys = new Set([
          ...Reflect.ownKeys(target),
          ...Reflect.ownKeys(activeSource)
        ]);
        return Array.from(keys);
      },
      getOwnPropertyDescriptor(target, prop) {
        const sourceDesc = Reflect.getOwnPropertyDescriptor(activeSource, prop);
        const targetDesc = Reflect.getOwnPropertyDescriptor(target, prop);
        const desc = sourceDesc || targetDesc;
        if (desc) {
          desc.configurable = true; // Ensure always configurable to avoid invariant traps
          if (desc.get) {
            desc.set = desc.set || (() => {});
          } else {
            desc.writable = true;
          }
          return desc;
        }
        return undefined;
      }
    });
  };

  const shieldEthereum = () => {
    let originalEthereum: any = null;
    try {
      originalEthereum = (window as any).ethereum;
    } catch (e) {}

    const safeEth = makeSafeEthereumProxy(originalEthereum);
    let currentEth = safeEth;

    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        const desc = Object.getOwnPropertyDescriptor(Window.prototype, 'ethereum');
        if (!desc || desc.configurable) {
          Object.defineProperty(Window.prototype, 'ethereum', {
            get() { return currentEth; },
            set(v) { currentEth = v; },
            configurable: true,
            enumerable: true
          });
        }
      } catch (e) {}
    }

    try {
      const desc = Object.getOwnPropertyDescriptor(window, 'ethereum');
      if (!desc || desc.configurable) {
        Object.defineProperty(window, 'ethereum', {
          get() { return currentEth; },
          set(v) { currentEth = v; },
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {}
  };

  shieldEthereum();
}

