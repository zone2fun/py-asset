
// A simple mock authentication service
// In a real app, integrate this with Firebase Auth

const AUTH_KEY = 'phayao_asset_auth';

export const login = (username: string, pass: string): boolean => {
  if (username === 'admin' && pass === '1234') {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};
