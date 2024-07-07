export class Comuni {
  descComune : string;
  provincia : string;
  isinseribile :string;
  CodCatastale : string;
  
  constructor(
    descComune : string,
    provincia : string,
    isinseribile :string,
    CodCatastale : string) {
    this.descComune = descComune;
    this.provincia = provincia;
    this.isinseribile = isinseribile;
    this.CodCatastale = CodCatastale;
  }
}

export class Comuni_CAP {
  CodCatastale : string | undefined;
  CAP : string | undefined;
}