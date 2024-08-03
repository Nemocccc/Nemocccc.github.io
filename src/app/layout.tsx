import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import Navbar from "@/components/navbar/Navbar"
// import Footer from "@/components/footer/Footer";
import Head from "@/components/Head/Head";
import React from "react";
import { ThemeProvider } from "../../context/themeContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nemo",
  description: "Nemo's personal website",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head />
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
