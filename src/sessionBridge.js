// src/sessionBridge.js
import axios from './axiosConfig';

// Keys we want to mirror to cookies so Safari keeps them after close
const MIRRORED_KEYS = ['token', 'refreshToken', 'tokenExpiry', 'userInfo', 'tokenType'];

function setCookie(name, value, maxAgeDays = 30) {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = maxAgeDays * 24 * 60 * 60; // seconds
    const secure = window?.location?.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  } catch {}
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(
    new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)')
  );
  return m ? decodeURIComponent(m[1]) : null;
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch {}
}

function canUseLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const k = '__ls_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pull mirrored values from cookies back into localStorage on first load.
 * Also restores axios Authorization header.
 */
export function hydrateSessionFromCookies() {
  const lsOk = canUseLocalStorage();

  MIRRORED_KEYS.forEach((key) => {
    const cookieVal = getCookie(key);
    if (cookieVal && lsOk && !localStorage.getItem(key)) {
      localStorage.setItem(key, cookieVal);
    }
  });

  const token =
    (lsOk ? localStorage.getItem('token') : null) || getCookie('token');

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

/**
 * Monkey-patch localStorage to mirror writes/deletes to cookies.
 * Safe no-op on environments where localStorage is unavailable.
 */
function patchStorageMirroring() {
  if (!canUseLocalStorage()) return;
  if (window.localStorage.__patchedForMirroring) return;

  const ls = window.localStorage;
  const originalSetItem = ls.setItem.bind(ls);
  const originalRemoveItem = ls.removeItem.bind(ls);
  const originalClear = ls.clear.bind(ls);

  ls.setItem = (key, value) => {
    originalSetItem(key, value);
    if (MIRRORED_KEYS.includes(key)) {
      setCookie(key, value);
      if (key === 'token') {
        axios.defaults.headers.common['Authorization'] = `Bearer ${value}`;
      }
    }
  };

  ls.removeItem = (key) => {
    originalRemoveItem(key);
    if (MIRRORED_KEYS.includes(key)) {
      deleteCookie(key);
      if (key === 'token') delete axios.defaults.headers.common['Authorization'];
    }
  };

  ls.clear = () => {
    originalClear();
    MIRRORED_KEYS.forEach(deleteCookie);
    delete axios.defaults.headers.common['Authorization'];
  };

  ls.__patchedForMirroring = true;
}

/**
 * Call this once on app startup (client-side only).
 */
export function ensureSessionPersistence() {
  if (typeof window === 'undefined') return; // guard for SSR/build
  hydrateSessionFromCookies();
  patchStorageMirroring();
}

/**
 * Helper you can use on logout to wipe everything.
 */
export function wipeSessionEverywhere() {
  try {
    localStorage.clear();
  } catch {}
  MIRRORED_KEYS.forEach(deleteCookie);
  delete axios.defaults.headers.common['Authorization'];
}
