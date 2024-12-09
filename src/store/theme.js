import { create } from "zustand";

export const useTheme = create((set) => ({
  theme: "light",
  toggleTheme: () =>
    set(({ theme }) => ({ theme: theme === "light" ? "dark" : "light" })),
}));
