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
          configurable: true
        });
      }
    } catch (e) {
      console.warn('Could not patch Storage.prototype.length getter:', e);
    }
  };

  // Patch Storage.prototype so direct Storage calls are protected
  patchStoragePrototype();

  const shieldProperty = (name: 'localStorage' | 'sessionStorage') => {
    const fallbackStore = createInMemoryStorage();
    let originalInstance: any = null;

    try {
      originalInstance = window[name];
      if (originalInstance) {
        originalInstance.setItem('__sandbox_test_write', '1');
        originalInstance.removeItem('__sandbox_test_write');
      }
    } catch (err) {
      originalInstance = null;
    }

    const activeInstance = originalInstance || fallbackStore;
    let currentValue = activeInstance;

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
      Object.assign(targetBuffer, activeSource);
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
        try {
          Object.defineProperty(target, prop, descriptor);
        } catch (e) {}
        try {
          Object.defineProperty(activeSource, prop, descriptor);
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

