/**
 * Sistema de autenticación del frontend
 * - El login se valida contra el backend (modelo Login: log_usua / log_clav)
 * - Emite JWT (access/refresh) y guarda la sesión en localStorage
 */

import type { AuthUsuarioDTO } from './api';

const AUTH_KEY = 'archivo_auth';
const USER_KEY = 'archivo_user';
const ACCESS_KEY = 'archivo_access';
const REFRESH_KEY = 'archivo_refresh';

export interface AuthUser {
  id: number;
  username: string;
  role: 'ADMIN' | 'CONSULTA';
}

/**
 * Guardar la sesión luego de un login exitoso contra el backend
 */
export function setSession(usuario: AuthUsuarioDTO, access: string, refresh: string): void {
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: usuario.id, username: usuario.log_usua, role: usuario.log_rol })
  );
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

/**
 * Verificar si el usuario tiene una sesión activa
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true' && !!localStorage.getItem(ACCESS_KEY);
}

/**
 * Obtener usuario actual
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Obtener el access token JWT vigente
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

/**
 * Verificar si el usuario logueado tiene rol ADMIN (acceso total)
 */
export function isAdmin(): boolean {
  return getCurrentUser()?.role === 'ADMIN';
}

/**
 * Logout: limpiar la sesión guardada
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
