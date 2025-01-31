'use client';

import Image from 'next/image';
import Search from '@/components/search/search';
import React from 'react';



import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    // NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
  } from "@/components/ui/navigation-menu"
  
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Font Awesome React 组件
import { faBars } from "@fortawesome/free-solid-svg-icons"; // 汉堡菜单图标


import PageSelector from './pageloader/pageloader';


export default function navbar(){

    return (
        <div>
            <div className="flex flex-row justify-between xs:space-y-0 xs:space-x-1 xs:flex-col">
                <div>
                    <NavigationMenu className="mx-5 my-5">
                    <NavigationMenuList >
                        <NavigationMenuItem className="bg-transparent">
                        <NavigationMenuTrigger className="bg-transparent text-black">
                            <FontAwesomeIcon icon={faBars} size="lg" className="w-5 h-5" />
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="bg-transparent rounded-lg shadow-lg p-2">
                            {/* <NavigationMenuLink className="block px-4 py-2 text-sm text-gray-700 
                            hover:bg-gray-100 rounded-md transition-colors duration-200"> */}
                                <PageSelector />
                            {/* </NavigationMenuLink> */}
                        </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="xs:hidden">
                    <Search />
                </div>
                <div >
                    <Image src="/Image/favicon.ico" alt="Nemo" width={40} height={40} objectFit='cover' className="rounded-full mx-5 my-5" />
                </div>
            </div>
        </div>
    )
}