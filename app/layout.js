import "../styles/index.css";

import React from "react";
import { ThemeProvider } from "../contexts/ThemeContext";

export const metadata = {
  title: "Notebook",
  description: "Next.js notebook app by Hamza Zain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
