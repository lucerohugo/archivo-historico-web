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
 * Verificar si un token JWT ya venció (o vence en los próximos `marginSeconds`).
 * Solo evita mostrar el panel con una sesión vieja: la validación real la hace el backend.
 */
export function isTokenExpired(token: string, marginSeconds = 0): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now() + marginSeconds * 1000;
  } catch {
    return true;
  }
}

/**
 * Verificar si el usuario tiene una sesión activa: access vigente, o refresh vigente
 * para renovarlo (la renovación la hace lib/api.ts en la próxima llamada)
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  const vigente = (!!access && !isTokenExpired(access)) || (!!refresh && !isTokenExpired(refresh));
  if (localStorage.getItem(AUTH_KEY) !== 'true' || !vigente) {
    logout();
    return false;
  }
  return true;
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
 * Obtener el refresh token (sirve para renovar el access sin volver a loguearse)
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

/**
 * Guardar los tokens nuevos luego de renovar la sesión
 */
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
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

/**
 * Sesión rechazada por el backend (token vencido, usuario desactivado):
 * limpiar y mandar al login
 */
export function handleUnauthorized(): void {
  if (typeof window === 'undefined') return;
  logout();
  window.location.replace('/login');
}
