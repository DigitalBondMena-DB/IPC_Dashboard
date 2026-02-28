export const API_CONFIG = {
  BASE_URL: 'https://ipc.mshmohm.com/api/admin/',
  ENDPOINTS: {
    LOGIN: 'login',
    HOME: 'home',
    CATEGORIES: 'categories',
    ENTITIES: {
      BASE: 'entities',
      TYPE: {
        HEALTH_DIRECTORATE: 'governorate',
        HEALTH_DIVISION: 'medical_area',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
        AUTHORITY_HOSPITAL: 'authority_hospital', // Assumed from the context
      },
    },
    USERS: {
      BASE: 'users',
      TYPE: {
        SUPER_ADMIN: 'super_admin',
        HEALTH_DIRECTORATE: 'governorate',
        HEALTH_DIVISION: 'medical_area',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
        AUTHORITY_HOSPITAL: 'authority_hospital',
      },
    },
  },
};
