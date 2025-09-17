"use client";
import { useState } from "react";

import { useTheme } from "contexts/ThemeContext";

import "../../styles/TopBar.css";
import { Sun, Moon, User } from "lucide-react";

const TopBar = ({ headerBackgroundEnabled, onToggleHeaderBackground }) => {
  const [showComingSoon, setShowComingSoon] = useState(null);

  const handleComingSoon = (feature) => {
    setShowComingSoon(feature);
    setTimeout(() => setShowComingSoon(null), 2000);
  };

  return (
    <div className={`top-bar`.trim()}>
      <ThemeToggleButton onComingSoon={() => handleComingSoon("theme")} />
      <HeaderBackgroundToggle
        enabled={headerBackgroundEnabled}
        onToggle={onToggleHeaderBackground}
      />
      <UserIcon onComingSoon={() => handleComingSoon("userPanel")} />

      {showComingSoon && (
        <div className="coming-soon-tooltip">
          <span>Coming Soon!</span>
        </div>
      )}
    </div>
  );
};

const ThemeToggleButton = ({ onComingSoon }) => {
  const { isDark } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      onClick={onComingSoon}
      title="Coming Soon"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const HeaderBackgroundToggle = ({ enabled, onToggle }) => {
  return (
    <div
      className={`toggle-switch ${enabled ? "active" : "inactive"}`}
      onClick={onToggle}
      title={enabled ? "Disable Header Background" : "Enable Header Background"}
    >
      <div className="toggle-switch-slider"></div>
    </div>
  );
};

const UserIcon = ({ onComingSoon }) => {
  return (
    <div className="user-icon" onClick={onComingSoon} title="Coming Soon">
      <User size={18} />
    </div>
  );
};

export default TopBar;
