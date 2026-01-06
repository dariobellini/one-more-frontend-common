export const CACHE_CONFIG = {
  MAX_SIZE_MB: 100,
  DEFAULT_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 giorni
  
  CATEGORIES: {
    API_CACHE: 'api-cache',
    USER_IMAGES: 'user-images',
    PRODUCT_IMAGES: 'product-images',
    SETTINGS: 'settings',
    DOCUMENTS: 'documents'
  },
  
  TTL_PRESETS: {
    SHORT: 5 * 60 * 1000,      // 5 minuti
    MEDIUM: 60 * 60 * 1000,    // 1 ora
    LONG: 24 * 60 * 60 * 1000, // 1 giorno
    WEEK: 7 * 24 * 60 * 60 * 1000,
    NEVER: 0
  }
};