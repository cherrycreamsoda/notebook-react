import React from "react";

import { useState } from "react";
import { Sun, Moon, User } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/TopBar.css";

const TopBar = () => {
  const [showComingSoon, setShowComingSoon] = useState(null);

  const handleComingSoon = (feature) => {
    setShowComingSoon(feature);
    setTimeout(() => setShowComingSoon(null), 2000);
  };

  return (
    <div className="top-bar">
      <ThemeToggleButton onComingSoon={() => handleComingSoon("theme")} />
      <ColorSwitchToggle onComingSoon={() => handleComingSoon("colorSwitch")} />
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

const ColorSwitchToggle = ({ onComingSoon }) => {
  return (
    <div
      className="toggle-switch active"
      onClick={onComingSoon}
      title="Coming Soon"
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
