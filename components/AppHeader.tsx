"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './SearchBar';
import NavLinks from './NavLinks';

export default function AppHeader() {
  const pathname = usePathname();
  
  // Disable header and nav on login and register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return null;
  }

  return (
    <>
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
          <Link href="/" style={{ width: '170px', height: '60px', position: 'relative', display: 'block' }}>
            <Image
              src="/MainLogo.png"
              alt="TeknoCS Logo"
              fill
              sizes="170px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>

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
    </>
  );
}
