// authUtils.ts - 封装认证相关的工具函数

// Token storage keys
const TOKEN_KEY = 'token';

// Cookie utility functions
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, hours: number = 1): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Strict;`;
};

const removeCookie = (name: string): void => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const cache = {};
// Authentication utility functions
export const authUtils = {
  // Get token from localStorage first, then from cookie
  getToken(): string | null {
    // First check localStorage
    let token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;

    // Then check cookie
    token = getCookie(TOKEN_KEY);
    if (token) {
      // Also store in localStorage for efficient access
      localStorage.setItem(TOKEN_KEY, token);
    }

    return token;
  },

  // Store token in both localStorage and cookie
  setToken(token: string, hours: number = 1): void {
    // Remove any existing token first to ensure clean state
    this.removeToken();

    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);

    // Store in cookie
    setCookie(TOKEN_KEY, token, hours);
  },

  setTokenKey(key: string): void {
    localStorage.setItem('tokenKey', key);
  },

  getTokenKey(): string | null {
    return localStorage.getItem('tokenKey');
  },
  removeTokenKey(): void {
    localStorage.removeItem('tokenKey');
  },
  // Remove token from both localStorage and cookie
  removeToken(): void {
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY);

    // Remove from cookie
    removeCookie(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
  clear() {
    this.removeToken();
    this.removeTokenKey();
  }
};