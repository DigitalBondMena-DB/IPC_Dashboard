import { API_CONFIG } from '@/core/config/api.config';

export const USER_TYPE_CONFIG: Record<string, any> = {
  SUPER_ADMIN: {
    title: 'Super Admins',
    endpoint: API_CONFIG.ENDPOINTS.USERS_SUPER_ADMIN,
    entityLabel: 'Division',
    entityKey: 'division_id',
    entityEndpoint: API_CONFIG.ENDPOINTS.CATEGORIES,
    navPath: '/super-admin-users',
  },
  HEALTH_DIRECTORATE: {
    title: 'Health Directorate Users',
    endpoint: API_CONFIG.ENDPOINTS.USERS_HEALTH_DIRECTORATE,
    entityLabel: 'Health Directorate',
    entityKey: 'health_directorate_id',
    entityEndpoint: API_CONFIG.ENDPOINTS.HEALTH_DIRECTORATES,
    navPath: '/health-directorate-users',
  },
  HEALTH_DIVISION: {
    title: 'Health Division Users',
    endpoint: API_CONFIG.ENDPOINTS.USERS_HEALTH_DIVISION,
    entityLabel: 'Health Division',
    entityKey: 'health_division_id',
    entityEndpoint: API_CONFIG.ENDPOINTS.HEALTH_DIVISIONS,
    navPath: '/health-division-users',
  },
  HOSPITAL: {
    title: 'Hospital Users',
    endpoint: API_CONFIG.ENDPOINTS.USERS_HOSPITAL,
    entityLabel: 'Hospital',
    entityKey: 'hospital_id',
    entityEndpoint: API_CONFIG.ENDPOINTS.HOSPITALS,
    navPath: '/hospitals-users',
  },
  AUTHORITY: {
    title: 'Authority Users',
    endpoint: API_CONFIG.ENDPOINTS.USERS_AUTHORITY,
    entityLabel: 'Authority',
    entityKey: 'authority_id',
    entityEndpoint: API_CONFIG.ENDPOINTS.AUTHORITIES,
    navPath: '/authorities-users',
  },
  AUTHORITY_HOSPITAL: {
    title: "Authority's Hospital Users",
    endpoint: API_CONFIG.ENDPOINTS.USERS_AUTHORITY_HOSPITAL,
    entityLabel: 'Authority Hospital',
    entityKey: 'authority_hospital_id',
    entityEndpoint: API_CONFIG.ENDPOINTS.AUTHORITY_HOSPITALS,
    navPath: '/authorities-hospitals-users',
  },
};
