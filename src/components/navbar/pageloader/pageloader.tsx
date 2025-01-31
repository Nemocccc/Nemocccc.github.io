import React from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu"


const navItems = [
    { name: 'Blogs', href: '/blogs' },
    { name: 'Resume', href: '/resume' },
    // { name: 'Contact', href: '/contact' },
  ];


import {
    ChangePage
} from "@/store/states/PageState";
import { useDispatch } from "react-redux";


export default function PageSelector(){
    const disPatch = useDispatch();


    return navItems.map((item) =>(
        <NavigationMenuLink key={item.name} className="block px-4 py-2 text-sm text-gray-700 
                            hover:bg-gray-100 rounded-md transition-colors duration-200">
            <div onClick={() => {disPatch(ChangePage(item.name)); 
                document.getElementById('pages-display')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                {item.name}
            </div>
        </NavigationMenuLink>
    ));
}
