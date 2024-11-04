import { TxBody } from "../body/TxBody";

test("mutexo 0", () => {

    const str = 
    "a300d9010281825820fa8b8effda36dc959a297850e721fcfcbac71dc47215044694bb17a8429900e4185e018182581d60da0eb5ed7611482ec5089b69d870e0c56c1c45180256112398e0835b1b00000002540be400021a00030d40";

    let body!: TxBody;

    expect(() => {
        body = TxBody.fromCbor(str);
    }).not.toThrow();

});


test.only("mutexo 1", () => {

    const str = 
    "a500d90102818258200bf42c67fbe0d46c7863ec92a5a38ec3c3eb8f1ab07a5d5b2b5dc5e13378745f00018182583900dc4e0450b6f6ba30356c73869b169027208dbe4c302f2945df77e8e6d3da97b15218a767ae358f93f8108a5b5e696f912acaf9c008a636521b00000002361a7a32021a0002e035031a03cb2f5104d90102828a03581c164c16b9c584ab4dec1c38b156bfdf9df43fbe852660e340321ea44f5820b7a72bb0aa9a9cd8e7fea1e460b459fe4011ccfac806662124cc262605b22d671a3b9aca001a0a21fe80d81e82011832581de0d3da97b15218a767ae358f93f8108a5b5e696f912acaf9c008a63652d9010281581cd3da97b15218a767ae358f93f8108a5b5e696f912acaf9c008a636528184001917704451ae9c81f682783368747470733a2f2f7a6574657469632e746563682f7a657465746963312d707265766965772f706f6f6c6d6574612e6a736f6e5820252def075a18aad00b288a077cc41a4f3bd34487ef1a9f6e731285563d39396083028200581cd3da97b15218a767ae358f93f8108a5b5e696f912acaf9c008a63652581c164c16b9c584ab4dec1c38b156bfdf9df43fbe852660e340321ea44f";

    let body!: TxBody;

    expect(() => {
        body = TxBody.fromCbor(str);
    }).not.toThrow();
    
});