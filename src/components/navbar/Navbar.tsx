import React from 'react';
import Link from 'next/link';
import Styles from './navbar.module.css';
import Image from "next/image";
import nemo from "../../../public/image/nemo.png"


const links = [
    {
        id: 1,
        title: 'Home',
        url: '/',
    },
    {
        id: 2,
        title: 'blog',
        url: '/blog',
    },
    {
        id: 3,
        title: 'tictactoe',
        url: '/tictactoe',
    },
    {
        id: 4,
        title: 'contact',
        url: '/contact',
    },
    {
        id: 5,
        title: 'about',
        url: '/about',
    }
]


const  Navbar = () => {
    return (
        <div className={Styles.container}>
            <Link href="/" className={Styles.logo}>
                <Image src={nemo} width={22} height={22} alt="nemo's favourite avatar" className={Styles.img}/>
                Nemo
            </Link>
            <div className={Styles.links}>
                {links.map((links) => (
                    <Link key={links.id} href={links.url} className={Styles.link}>
                        {links.title}
                    </Link>
                ))}
            </div>
        </div>
    )
}


export default Navbar;