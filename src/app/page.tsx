'use client';

import Image from "next/image";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Blogs from '@/app/blogs/blogs';
import Resume from '@/app/resume/GetResume';
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { BlogSidebar } from "@/components/SideBar/BlogSidebar"


import { store } from "@/store/index";
import {  useSelector, Provider } from "react-redux";


export default function Home() {
  const PageName = useSelector((state: { PageDis: { value: string } }) => state.PageDis.value);

  
  return (
    <Provider store={store}>
      <div>
        <div className="mx-2 my-2 p-2 rounded-md h-[calc(100svh-1rem)]
        relative bg-fixed bg-center bg-cover">
          <div className="absolute inset-0 flex flex-col justify-between
          text-white text-lg sm:text-xl lg:text-2xl z-20">
            <div>
              <Navbar />
            </div>
            <div className="text-center text-4xl font-bold 
            bg-gradient-to-r from-red-600 from-20% via-orange-500 via-50% to-pink-600 to-80% bg-clip-text text-transparent transition-all duration-300">
              welcome to my personal website
            </div>
            <div>
              <Footer />
            </div>
          </div>
          <Image 
          src="/Image/mount.jpg" 
          alt="背景图片" 
          layout="fill" 
          objectFit="cover"
          className="rounded-md z-10" />
        </div>
        <div id="pages-display" className="relative z-0 dark: bg-github-dark">
          {PageName === "Blogs" && 
          (
            <SidebarProvider className="light dark: text-white">
              <BlogSidebar />
              <main>
                <SidebarTrigger />
                  <Blogs />
              </main>
            </SidebarProvider>
          )}
          {PageName === "Resume" && <Resume />}
        </div>
      </div>
    </Provider>
  );
}
