const ACCESS_TOKEN_KEY = "accessToken";

export const tokenService = {
  getToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setToken: (token: string | null): void => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },
  clearToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
