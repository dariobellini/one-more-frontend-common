export enum ShopVisibilityStatus {
    Active = 1,        // IsActive = 1
    InValidation = 2,  // IsActive = 0 e ci sono record in AdminCheck... e NON ci sono in ShopAdminChecks
    Inactive = 3       // IsActive = 0 e non rispetta la condizione di InValidation (es: rifiutata o disattivata)
  }