export class ShopFastRecReqDto
{
  nome: string | undefined
  citta: string | undefined;
  indirizzo: string | undefined;

    constructor(  
      nome: string,
      citta: string ,
      indirizzo: string) 
      {
        this.nome = nome,
        this.citta = citta,
        this.indirizzo = indirizzo
      }
}