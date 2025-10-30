import { createContext } from "react";

export type UserContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextValue | undefined>(
  undefined
);
