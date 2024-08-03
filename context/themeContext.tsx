"use client"

import{ createContext, useState } from 'react' 
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer";

export const themeContext = createContext(
    {} as {
        mode : string;
        toggle : () => void;
    }
);

export const ThemeProvider = ({children} : { children : any }) => {
    const [mode , setMode] = useState("light")

    const toggle = () => {
        console.log("toggle")
        setMode((prev) => (prev === "light" ? "dark" : "light"))
    }

    return (
        <themeContext.Provider value={{mode, toggle}}>
          <div className={`container-${mode}`}>
            <Navbar />
            <div className={`theme-${mode}`}>
                {children}
            </div>
            <Footer />
          </div>
        </themeContext.Provider>
    )
}