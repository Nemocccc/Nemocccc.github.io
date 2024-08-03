import Image from 'next/image'
import styles from './page.module.css'
import avatar from '../../public/image/nemo.png'
import Link from 'next/link'
import Button from '@/components/Button/Button'


export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.imgContainer}>
        <Image src={avatar} alt='nemo' fill={true} />
      </div>
      <div className={styles.textbox}>
        <h1 className={styles.title} >
          it should not be like this.
        </h1>
        <p className={styles.description}>
          some description of me.
        </p>
        <Button text="view my blogs" url='/blog' />
      </div>
    </main>
  );
}
