Order of eras to respect:

1) Conway
2) Babbage
3) Alonzo
4) Mary
5) Allegra
6) Shelley
7) Byron (?)

- Copy class definiton from outside the `eras` directory.
- open the `cddl` of that era and look for the definition.
- check all the fileds are there, remove any fields that are NOT supposed to be there (new era fields)
- check `toCborObj` has correct encoding (IMPORTANT pay attention to CDDL)
- ensure `if( this.cborRef instanceof SubCborRef )` is present BEFORE on `toCborObj`.
- check `fromCborObj` has correct decoding (IMPORTANT pay attention to CDDL)

Repeat for all classes outside of `eras`.