// src/sessionBridge.js
import axios from './axiosConfig';

// Keys to mirror to cookies so Safari keeps them after close
const MIRRORED_KEYS = ['token', 'refreshToken', 'tokenExpiry', 'userInfo', 'tokenType'];

// Default persistence window (days). Adjust if you want shorter/longer.
const DEFAULT_DAYS = 30;

// --- utils --------------------------------------------------------

function daysFromNow(days) {
  const d = new Date();
  d.setTime(d.getTime() + Math.max(1, days) * 24 * 60 * 60 * 1000);
  return d;
}

function setCookie(name, value, maxAgeDays = DEFAULT_DAYS) {
  if (typeof document === 'undefined') return;
  try {
    const secure = window?.location?.protocol === 'https:' ? '; Secure' : '';
    const maxAgeSec = Math.max(1, Math.floor(maxAgeDays * 24 * 60 * 60)); // seconds
    const expires = daysFromNow(maxAgeDays).toUTCString();
    // Use BOTH Max-Age and Expires for old Safari quirks
    document.cookie =
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ` +
      `Path=/; SameSite=Lax${secure}; Max-Age=${maxAgeSec}; Expires=${expires}`;
  } catch {}
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
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

// --- core ---------------------------------------------------------

/**
 * Pull mirrored values from cookies back into localStorage on first load
 * and set axios Authorization header.
 */
export function hydrateSessionFromCookies() {
  const lsOk = canUseLocalStorage();

  MIRRORED_KEYS.forEach((key) => {
    const cookieVal = getCookie(key);
    if (cookieVal && lsOk && !localStorage.getItem(key)) {
      localStorage.setItem(key, cookieVal);
    }
  });

  const token = (lsOk ? localStorage.getItem('token') : null) || getCookie('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

/**
 * Refresh (slide) cookie expirations so they persist between restarts
 * while the session is valid.
 */
function refreshMirroredCookies() {
  // Prefer tokenExpiry if present to decide the remaining lifetime
  let days = DEFAULT_DAYS;

  try {
    const exp = (canUseLocalStorage() && localStorage.getItem('tokenExpiry')) || getCookie('tokenExpiry');
    if (exp) {
      const expMs = isNaN(exp) ? Date.parse(exp) : Number(exp);
      if (!isNaN(expMs)) {
        const msLeft = expMs - Date.now();
        if (msLeft > 0) {
          days = Math.max(1, msLeft / (24 * 60 * 60 * 1000));
        } else {
          // Token already expired -> don't refresh cookies
          return;
        }
      }
    }
  } catch {
    // fall back to DEFAULT_DAYS
  }

  MIRRORED_KEYS.forEach((k) => {
    const val = (canUseLocalStorage() && localStorage.getItem(k)) || getCookie(k);
    if (val != null) setCookie(k, val, days);
  });
}

/**
 * Monkey-patch localStorage to mirror writes/deletes to cookies.
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
      if (key === 'token') axios.defaults.headers.common['Authorization'] = `Bearer ${value}`;
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
 * Keep cookies fresh across tabs and page visibility changes.
 */
function attachLivenessHandlers() {
  // Refresh when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshMirroredCookies();
    }
  });

  // Light periodic refresh (1/min) while a tab is open
  let timer = setInterval(refreshMirroredCookies, 60 * 1000);
  window.addEventListener('beforeunload', () => clearInterval(timer));

  // Cross-tab sync: when other tab changes storage, rehydrate and refresh
  window.addEventListener('storage', (e) => {
    if (e && MIRRORED_KEYS.includes(e.key)) {
      hydrateSessionFromCookies();
      refreshMirroredCookies();
    }
  });
}

/** Call this once on app startup (client-side only). */
export function ensureSessionPersistence() {
  if (typeof window === 'undefined') return;
  hydrateSessionFromCookies();    // load token -> axios header
  patchStorageMirroring();        // mirror LS <-> cookie
  refreshMirroredCookies();       // set long-lived cookies right away
  attachLivenessHandlers();       // keep them fresh while user is active
}

/** Helper to wipe everything on logout. */
export function wipeSessionEverywhere() {
  try {
    localStorage.clear();
  } catch {}
  MIRRORED_KEYS.forEach(deleteCookie);
  delete axios.defaults.headers.common['Authorization'];
}
