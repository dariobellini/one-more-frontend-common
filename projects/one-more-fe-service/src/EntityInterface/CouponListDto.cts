export class CouponListDto {
    id : number;
    idPromo : number ;
    idSoggetto : number ;
    idAttivita: number ;
    titoloPromo: string ;
    displayName:string ;
    descPromo:string ;
    dataDal: Date ;
    dataAl:Date ;
    nome:string = '';
    indirizzo:string ;
    citta:string ;
    civico:string ;
    cap:string ;
    latitudine:number ;
    longitudine:number ;
    idStatus:number ;
    

    constructor(    id : number,
    idPromo : number ,
    idSoggetto : number ,
    idAttivita: number ,
    titoloPromo: string ,
    displayName:string ,
    descPromo:string ,
    dataDal: Date ,
    dataAl:Date ,
    nome:string = '',
    indirizzo:string ,
    citta:string ,
    civico:string ,
    cap:string ,
    latitudine:number ,
    longitudine:number ,
    idStatus:number) 
    {
      this.id = id;
      this.idPromo = idPromo;
      this.idSoggetto = idSoggetto;
      this.idAttivita = idAttivita;
      this.titoloPromo = titoloPromo;
      this.displayName = displayName;
      this.descPromo = descPromo;
      this.dataDal = dataDal;
      this.dataAl = dataAl;
      this.nome = nome;
      this.indirizzo = indirizzo;
      this.citta = citta;
      this.civico = civico;
      this.cap = cap;
      this.latitudine = latitudine;
      this.longitudine = longitudine;
      this.idStatus = idStatus;  
    }
}