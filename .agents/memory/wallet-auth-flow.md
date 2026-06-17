---
name: Wallet auth flow
description: Sign-in flow design decisions for Karma AI wallet connection
---

# Wallet Authentication Flow

## Rule
Every time a user manually clicks "Connect Wallet" and goes through the modal, a fresh `personal_sign` challenge is required — no bypass for returning users.

**Why:** User requirement: "sign again on each sign in." The old welcome_back step was calling `launchScan` with a stale/empty signature, skipping the wallet popup entirely.

**How to apply:** ProfileModal.tsx — `connectBrowserWallet()` always fetches a new challenge from `/api/auth/challenge` and calls `personal_sign` before advancing to the setup step.

## Session Persistence (separate from sign-in)
Page refresh restores `karma_user_session` from localStorage without re-signing. This is intentional — it is NOT a "sign-in", it is session resumption. Only manual Connect Wallet actions require a signature.

## Username Memory
After signing, the registry (`karma_profiles_registry` in localStorage, keyed by lowercase address) is checked. If a previous entry exists, the username is pre-filled in the setup step with a "Welcome back" banner. The user can still edit it. Signature was already collected before this step.

## Registry persistence
After `launchScan` completes, the address→username mapping is written back to `karma_profiles_registry` so the next sign-in can pre-fill it.
