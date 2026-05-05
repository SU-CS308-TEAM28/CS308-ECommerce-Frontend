import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';

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
        <AuthProvider>
          <AppHeader />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
