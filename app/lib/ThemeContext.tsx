"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
dark: false,
toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
const [dark, setDark] = useState(false);

useEffect(() => {
if (dark) {
document.documentElement.classList.add("dark");
} else {
document.documentElement.classList.remove("dark");
}
}, [dark]);

const toggleTheme = () => {
setDark(!dark);
};

return (
<ThemeContext.Provider value={{ dark, toggleTheme }}>
{children}
</ThemeContext.Provider>
);
}

export const useTheme = () => useContext(ThemeContext);

