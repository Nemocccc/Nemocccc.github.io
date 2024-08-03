import Reacr from 'react';
import Head from 'next/head';

export default function Head_usr() {
    const name = "Nemo";
    const description = "Nemo's personal website";


    return (
      <Head>
        <title>{name}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.com/page" />
        <meta property="og:title" content="Your Page Title" />
        <meta property="og:description" content="A brief description of your page content." />
        <meta property="og:image" content="https://yourwebsite.com/image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://yourwebsite.com/page" />
        <meta name="twitter:title" content="Your Page Title" />
        <meta name="twitter:description" content="A brief description of your page content." />
        <meta name="twitter:image" content="https://yourwebsite.com/image.jpg" />
      </Head>
    )
}