import React from "react";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("apple-notes-theme");
    const initialTheme = savedTheme ? savedTheme === "dark" : true;
    setIsDark(initialTheme);

    document.documentElement.setAttribute(
      "data-theme",
      initialTheme ? "dark" : "light"
    );
    document.body.style.backgroundColor = initialTheme ? "#1c1c1e" : "#ffffff";
    document.body.style.color = initialTheme ? "#ffffff" : "#000000";
  }, []);

  useEffect(() => {
    localStorage.setItem("apple-notes-theme", isDark ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    document.body.style.backgroundColor = isDark ? "#1c1c1e" : "#ffffff";
    document.body.style.color = isDark ? "#ffffff" : "#000000";
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
