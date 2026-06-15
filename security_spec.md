# Karma AI Security Specification (Attribute-Based Access Control)

## 1. Data Invariants
- **Identity Integrity**: Users can only register and update their own `/profiles/{address}` directory, matching their authenticated Firebase Auth user ID or EVM wallet address.
- **State Transition Constraints**: Modifying score records, streak clocks, and credit limits requires strict verification. Key updates cannot bypass the standard schema validators.
- **Challenge Isolation**: Challenges saved under `/challenges/{address}` can only be read or written by the specific signing client to prevent MITM challenge reuse injections.
- **Immortality of Critical Fields**: Fields like `address` and `connectedAt` cannot be modified after initial user profile write.

## 2. The "Dirty Dozen" Penetration Attack Payloads
The following payloads describe 12 malicious requests attempting to exploit potential update gaps or spoof identifiers:

1. **Self-Assigned Reputation Maximization (State Elevation)**:
   Attempting to update a user's own profile to set `karmaScore` to `10000` (exceeding rating range block).
2. **Identity Impersonation (Owner Hijack)**:
   Attempting to write or update another user's profile at `/profiles/0xOtherUserAddress` using a different login credentials token.
3. **Ghost Parameter Injection (Shadow Write)**:
   Injecting a rogue parameter `isAdmin: true` into a standard user profile document.
4. **Invalid Character Poisoning (XSS/ID Injection)**:
   Creating an address collection record with an ID that has invalid characters like `<script>` or exceeds standard sizing constraints.
5. **Unauthorized Challenge Hijack**:
   Attempting to read another user's auth challenge from `/challenges/0xOtherAddress` to complete a replay signature.
6. **Chronological Time Spoofing (Temporal Integrity Breach)**:
   Setting `connectedAt` to a future timestamp instead of standard `request.time`.
7. **Streak Counter Escalation (Privilege Claim)**:
   Sending a payload trying to increment `streak` directly from `0` to `999` day indices.
8. **Negative Rating Corruption (Underflow Attack)**:
   Forcing the client to write a `karmaScore` of `-500` to bypass limits.
9. **Null Key Validation Escape**:
   Omitting the mandatory `username` or `address` fields in a create profile request.
10. **Type Mismatch Sabotage**:
    Writing `hideWallet` as a string (`"yes"`) instead of a boolean value to break client rendering.
11. **Rogue Challenge Creation**:
    Forging a session challenge entry under a target victim's address directly using direct Firestore client writes.
12. **Double Claim Airdrop Trick**:
    Attempting to rapid-fire clear and modify `lastClaimedAt` fields bypassing backend rate-locks.

## 3. Fortress Guard Rules Test File

Below is a draft of `firestore.rules.test.ts` showing how the unit testing library would assert these permissions:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Karma AI Firestore Rules Unit Tests', () => {
  let testEnv: any;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0296823173',
      firestore: {
        host: 'localhost',
        port: 8080,
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('rejects identity hijacking blocks', async () => {
    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthenticatedDb.doc('profiles/0x123').set({
      address: '0x123',
      username: 'hacker'
    }));
  });
});
```
