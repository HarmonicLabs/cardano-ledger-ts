import { TxBody } from "../TxBody";
import { Tx } from "../../Tx";
import { TxWitnessSet } from "../../TxWitnessSet/TxWitnessSet";
import { UTxO } from "../output/UTxO";
import { TxOut } from "../output/TxOut";
import { Address } from "../../../eras/common/ledger/Address";
import { StakeAddress } from "../../../eras/common/ledger/StakeAddress";
import { Value } from "../../../eras/common/ledger/Value/Value";
import { StakeValidatorHash } from "../../../credentials/StakeCredentials";
import { VotingProcedures } from "../../../governance/VotingProcedures";
import { ProposalProcedure } from "../../../governance/ProposalProcedure";
import { GovActionInfo } from "../../../governance/GovAction/GovActionInfo";
import { VoterKind } from "../../../governance/Voter";
import { Vote } from "../../../governance/Vote";

// Body fields 19 to 22 are encoded, so they must also come back from fromCbor.
describe("TxBody Conway fields 19-22", () => {
    const addr = Address.fromString(
        "addr_test1qqetxfc069tpemq25f954mrg2rxsr9jgvqe78hvyn9zuxxdvaqvlg96unszfywdfrjwq0m8zp0m7wjza0n2pfeep5h7qw62gd8"
    );
    const utxo = new UTxO({
        utxoRef: { id: "aa".repeat(32), index: 0 },
        resolved: { address: addr, value: Value.lovelaces(10_000_000) },
    });
    const base = {
        inputs: [utxo] as [UTxO],
        outputs: [new TxOut({ address: addr, value: Value.lovelaces(9_000_000) })],
        fee: 200_000,
    };
    const anchor = { url: "https://example.com/anchor.json", anchorDataHash: "cd".repeat(32) };

    const votingProcedures = new VotingProcedures([{
        voter: { kind: VoterKind.DRepKeyHash, hash: "ef".repeat(28) },
        votes: [{ govActionId: { id: "bb".repeat(32), index: 1 }, vote: { vote: Vote.Yes } }],
    }]);
    const proposal = new ProposalProcedure({
        deposit: 100_000_000_000,
        rewardAccount: new StakeAddress({
            network: "testnet",
            type: "script",
            credentials: new StakeValidatorHash("ab".repeat(28)),
        }),
        govAction: new GovActionInfo(),
        anchor,
    });

    function roundTrip(body: TxBody): TxBody {
        return TxBody.fromCbor(body.toCbor());
    }

    test("donation (22) survives a CBOR round-trip", () => {
        const reparsed = roundTrip(new TxBody({ ...base, donation: 1_000_000 }));
        expect(reparsed.donation).toBe(BigInt(1_000_000));
    });

    test("currentTreasuryValue (21) survives a CBOR round-trip", () => {
        const reparsed = roundTrip(new TxBody({ ...base, currentTreasuryValue: BigInt(5_000_000_000) }));
        expect(reparsed.currentTreasuryValue).toBe(BigInt(5_000_000_000));
    });

    test("votingProcedures (19) survives a CBOR round-trip", () => {
        const body = new TxBody({ ...base, votingProcedures });
        const reparsed = roundTrip(body);
        expect(reparsed.votingProcedures).toBeInstanceOf(VotingProcedures);
        expect(reparsed.votingProcedures!.toCbor().toString())
            .toEqual(body.votingProcedures!.toCbor().toString());
    });

    test("proposalProcedures (20) survives a CBOR round-trip", () => {
        const body = new TxBody({ ...base, proposalProcedures: [proposal] });
        const reparsed = roundTrip(body);
        expect(reparsed.proposalProcedures).toHaveLength(1);
        expect(reparsed.proposalProcedures![0]).toBeInstanceOf(ProposalProcedure);
        expect(reparsed.proposalProcedures![0].toCbor().toString())
            .toEqual(proposal.toCbor().toString());
    });

    test("Tx.fromCbor keeps all four fields", () => {
        const body = new TxBody({
            ...base,
            votingProcedures,
            proposalProcedures: [proposal],
            currentTreasuryValue: BigInt(5_000_000_000),
            donation: 1_000_000,
        });
        const tx = Tx.fromCbor(new Tx({ body, witnesses: new TxWitnessSet({}) }).toCbor());
        expect(tx.body.votingProcedures).toBeDefined();
        expect(tx.body.proposalProcedures).toHaveLength(1);
        expect(tx.body.currentTreasuryValue).toBe(BigInt(5_000_000_000));
        expect(tx.body.donation).toBe(BigInt(1_000_000));
    });

    test("absent fields stay undefined", () => {
        const reparsed = roundTrip(new TxBody({ ...base }));
        expect(reparsed.votingProcedures).toBeUndefined();
        expect(reparsed.proposalProcedures).toBeUndefined();
        expect(reparsed.currentTreasuryValue).toBeUndefined();
        expect(reparsed.donation).toBeUndefined();
    });
});
