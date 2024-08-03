// 'use client';
import React from 'react';
import Styles from './footer.module.css';
import Link from 'next/link';
import { url } from 'inspector';
import Image from 'next/image';

const  Footer = () => {
    // console.log('hello,Footer')


    const contact = [
        {
            id: 1,
            title: 'github',
            url: 'https://github.com/Nemocccc',
            img: '/image/github_logo.png'
        },
    ]


    return (
        <div className={Styles.container}>
            <div className={Styles.leftcontent}>
                @2024 Nemo.
            </div>
            <div className={Styles.rightcontent}>
                {contact.map((contact) => (
                    <Link key={contact.id} href={contact.url} className={Styles.link}>
                        <div className={Styles.img}>
                          <Image src={contact.img} layout="fill" alt={contact.title} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Footer