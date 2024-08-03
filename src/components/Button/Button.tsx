import React from 'react';
import Link from 'next/link';
import styles from '/@components/Button/Button.module.css';

export default function Button({ text, url} : {text: string, url: string}) {
    return (
        <button className={styles.container}>
            <Link href={url} className={styles.link}>
                {text}
            </Link>
        </button>
    )

}