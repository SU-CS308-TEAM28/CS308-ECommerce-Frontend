import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '../components/SearchBar';
import NavLinks from '../components/NavLinks';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TeknoCS',
  description: 'E-commerce homepage',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ margin: 0, backgroundColor: '#ffffff', color: '#111827' }}
      >
        <header style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: '170px 1fr 48px',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <a href="/" style={{ width: '170px', height: '60px', position: 'relative', display: 'block' }}>
              <Image
                src="/MainLogo.png"
                alt="TeknoCS Logo"
                fill
                sizes="170px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </a>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translateX(-40px)' }}>
              <SearchBar />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Link href="/profile" style={{ fontSize: '24px', color: '#111827', textDecoration: 'none' }}>
                👤
              </Link>
            </div>
          </div>
        </header>

        <nav style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
          <NavLinks />
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
