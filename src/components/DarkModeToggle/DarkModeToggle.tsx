'use client'

import React, { useContext } from "react";
import styles from "@/components/DarkModeToggle/DarkModeToggle.module.css";
import { themeContext } from "../../../context/themeContext";


const DarkModeToggle = () => {
  const value = useContext(themeContext);

  if (!value) {
    throw new Error("DarkModeToggle must be used within a ThemeProvider");
  }

  const { mode, toggle } = value;

  return (
    <div className={styles.container} onClick={toggle}>
      <div className={styles.icon} >
        🌙
      </div>
      <div className={styles.icon} >
        ☀
      </div>
      <div 
        className={styles.ball} 
        style={mode === "light" ? {left:"2px"} : {right:"2px"}}
      />
    </div>
  );
};

export default DarkModeToggle;