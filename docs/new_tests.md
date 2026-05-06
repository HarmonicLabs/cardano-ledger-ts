# New / modified tests for `0.5.2`

## Summary: none persisted

**No new test files were created and no existing test files were modified** as part of the `0.5.2` bundle (Conway barrel re-export fix + `TxBody` guard fix).

Verification was performed via:
1. Static checks — `npx tsc --noEmit -p tsconfig.json` and `npm run build`.
2. The existing Jest suite — `npm test` (38 suites pass, no regressions; the one pre-existing failure is `src/eras/common/ledger/__tests__/TxWithdrawals.toData.test.ts`, an untracked file from the orphaned [V3_WITHDRAWAL_ENCODING_FIX.md](V3_WITHDRAWAL_ENCODING_FIX.md) workstream — unrelated to this release).
3. Inline runtime smoke tests via `node -e '...'` against the freshly built `dist/`. These are recorded below for reproducibility but are not committed as automated tests.

The fixes are import-path corrections — the bug surface is "did this name reach this module?" rather than "does this function compute the right value?" — so a single instantiation/`instanceof` round-trip is sufficient to prove closure. That said, automated regression coverage would be valuable; see "Suggested regression tests" at the bottom.

## Inline runtime verifications run (not persisted)

### 1. Conway cert classes resolve via the public barrel

Closes the gap from [CONWAY_CERTS_BARREL_EXPORT_FIX.md](CONWAY_CERTS_BARREL_EXPORT_FIX.md).

```bash
node -e '
const cl = require("./dist");
const names = [
    "ConwayCertRegistrationDeposit",
    "ConwayCertUnRegistrationDeposit",
    "ConwayCertStakeRegistrationDeleg",
    "ConwayCertVoteRegistrationDeleg",
    "ConwayCertStakeVoteRegistrationDeleg",
    "ConwayCertRegistrationDrep",
    "ConwayCertUnRegistrationDrep",
    "ConwayCertVoteDeleg",
    "ConwayCertStakeVoteDeleg",
    "ConwayCertAuthCommitteeHot",
    "ConwayCertResignCommitteeCold",
    "ConwayCertUpdateDrep",
    "ConwayMoveInstantRewardsCert",
];
for (const n of names) {
    const t = typeof cl[n];
    if (t !== "function") { console.error("FAIL:", n, "is", t); process.exit(1); }
}
console.log("OK — all 13 Conway* classes resolve to function");
'
```

**Expected:** `OK — all 13 Conway* classes resolve to function` (was 13× `undefined` before this release).

### 2. `instanceof` against a class reached via the barrel

```bash
node -e '
const cl = require("./dist");
const cert = cl.certificateFromCertificateLike({
    certType: 7,
    stakeCredential: { type: 1, hash: { toBuffer: () => new Uint8Array(28) } },
    deposit: 2_000_000n,
});
console.log("instanceof:", cert instanceof cl.ConwayCertRegistrationDeposit);
'
```

**Expected:** `instanceof: true` (was `TypeError: Right-hand side of instanceof is not callable` before this release, because the right-hand side was `undefined`).

### 3. Cross-check: legacy guard rejects, eras guard accepts, top-level resolves to eras

Closes the gap from [CONWAY_CERTS_TXBODY_FIX.md](CONWAY_CERTS_TXBODY_FIX.md). Demonstrates that `cl.isCertificate` correctly resolves to the eras (Conway-aware) guard via barrel order.

```bash
node -e '
const cl = require("./dist");
const legacyCert = require("./dist/ledger/certs/Certificate");
const erasCert   = require("./dist/eras/common/ledger/certs/Certificate");

const cert = cl.certificateFromCertificateLike({
    certType: 7,
    stakeCredential: { type: 1, hash: { toBuffer: () => new Uint8Array(28) } },
    deposit: 2_000_000n,
});

console.log("cert class:", cert.constructor.name);
console.log("legacy.isCertificate:", legacyCert.isCertificate(cert));
console.log("eras.isCertificate:  ", erasCert.isCertificate(cert));
console.log("top-level isCertificate:", cl.isCertificate(cert));
'
```

**Expected:**
```
cert class: ConwayCertRegistrationDeposit
legacy.isCertificate: false
eras.isCertificate:   true
top-level isCertificate: true
```

The legacy guard's `false` is preserved intentionally — that file is not modified in this release; it remains in place as legacy back-compat surface and the long-term unification is deferred to `0.6.0`/`0.7.0` per [CONWAY_CERTS_TXBODY_FIX.md "Long-term Solution"](CONWAY_CERTS_TXBODY_FIX.md).

### 4. `TxBody` constructor accepts a Conway cert (the buildooor blocker)

This is the test that closes the user-visible bug — before the [src/tx/body/TxBody.ts:9](src/tx/body/TxBody.ts#L9) import swap, this constructor would throw `Error: invalid 'certs' field` at [src/tx/body/TxBody.ts:233-235](src/tx/body/TxBody.ts#L233-L235).

```bash
node -e '
const cl = require("./dist");

const stakeCredential = new cl.Credential({
    type: cl.CredentialType.Script,
    hash: new cl.Hash28( "ab".repeat(28) ),
});
const cert = new cl.ConwayCertRegistrationDeposit({
    stakeCredential,
    deposit: 2_000_000n,
});
const addr = new cl.Address({
    network: "mainnet",
    paymentCreds: new cl.Credential({
        type: cl.CredentialType.KeyHash,
        hash: new cl.Hash28( "cd".repeat(28) ),
    }),
});
const fakeUtxoId = new cl.TxOutRef({
    id: new cl.Hash32( "11".repeat(32) ),
    index: 0,
});

const body = new cl.TxBody({
    inputs: [ new cl.TxIn({ utxoRef: fakeUtxoId, resolved: new cl.TxOut({ address: addr, value: cl.Value.lovelaces( 10_000_000n ) }) }) ],
    outputs: [ new cl.TxOut({ address: addr, value: cl.Value.lovelaces( 7_900_000n ) }) ],
    fee: 100_000n,
    certs: [ cert ],
});
console.log("TxBody constructed:", body !== undefined);
console.log("body.certs[0] class:", body.certs[0].constructor.name);
'
```

**Expected:**
```
TxBody constructed: true
body.certs[0] class: ConwayCertRegistrationDeposit
```

(Was: `Error: invalid 'certs' field` thrown from `new TxBody`.)

## Suggested regression tests (not added — out of scope for the bundled patch)

If the next person on this code wants to lock the fixes in via Jest, these would be the natural specs. They are *not* present in this release.

### `src/eras/conway/__tests__/conway.barrel.test.ts` (new file)

Asserts every `Conway*` cert class is reachable from the top-level barrel and is a constructable function.

```ts
import * as cl from "../../../index";

describe("Conway barrel re-export", () => {
    test.each([
        "ConwayCertRegistrationDeposit",
        "ConwayCertUnRegistrationDeposit",
        "ConwayCertStakeRegistrationDeleg",
        "ConwayCertVoteRegistrationDeleg",
        "ConwayCertStakeVoteRegistrationDeleg",
        "ConwayCertRegistrationDrep",
        "ConwayCertUnRegistrationDrep",
        "ConwayCertVoteDeleg",
        "ConwayCertStakeVoteDeleg",
        "ConwayCertAuthCommitteeHot",
        "ConwayCertResignCommitteeCold",
        "ConwayCertUpdateDrep",
        "ConwayMoveInstantRewardsCert",
    ])("%s is reachable as a function", (name) => {
        expect(typeof (cl as any)[name]).toBe("function");
    });
});
```

### `src/tx/body/__tests__/TxBody.conwayCerts.test.ts` (new file)

Asserts a `Conway*` cert built via the public API survives `TxBody` construction (regression for the legacy `isCertificate` import bug).

```ts
import {
    TxBody, TxIn, TxOut, TxOutRef, Address, Value,
    Credential, CredentialType, Hash28, Hash32,
    ConwayCertRegistrationDeposit,
    certificateFromCertificateLike,
    isCertificate,
} from "../../../index";

describe("TxBody accepts Conway-era certs", () => {
    const addr = new Address({
        network: "mainnet",
        paymentCreds: new Credential({
            type: CredentialType.KeyHash,
            hash: new Hash28( "cd".repeat(28) ),
        }),
    });

    test("isCertificate at the public barrel accepts ConwayCertRegistrationDeposit", () => {
        const cert = new ConwayCertRegistrationDeposit({
            stakeCredential: new Credential({
                type: CredentialType.Script,
                hash: new Hash28( "ab".repeat(28) ),
            }),
            deposit: 2_000_000n,
        });
        expect(isCertificate(cert)).toBe(true);
    });

    test("TxBody constructor does not throw 'invalid certs field' on a Conway cert", () => {
        const cert = certificateFromCertificateLike({
            certType: 7,
            stakeCredential: { type: 1, hash: { toBuffer: () => new Uint8Array(28) } },
            deposit: 2_000_000n,
        });
        expect(cert.constructor.name).toBe("ConwayCertRegistrationDeposit");

        expect(() => new TxBody({
            inputs: [ new TxIn({
                utxoRef: new TxOutRef({ id: new Hash32( "11".repeat(32) ), index: 0 }),
                resolved: new TxOut({ address: addr, value: Value.lovelaces( 10_000_000n ) }),
            }) ],
            outputs: [ new TxOut({ address: addr, value: Value.lovelaces( 7_900_000n ) }) ],
            fee: 100_000n,
            certs: [ cert ],
        })).not.toThrow();
    });
});
```

These two specs together would have caught both `0.5.2` bugs at CI time.
