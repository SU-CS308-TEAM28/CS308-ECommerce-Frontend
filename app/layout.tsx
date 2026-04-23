import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import SearchBar from "../components/SearchBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CS308 E-Commerce",
  description: "E-commerce homepage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ margin: 0, backgroundColor: "#ffffff", color: "#111827" }}
      >
        <header
          style={{
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
          }}
        ><div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "170px 1fr 48px",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            width: "170px",
            height: "60px",
            position: "relative",
          }}
        >
          <Image
            src="/MainLogo.png"
            alt="Main Logo"
            fill
            sizes="170px"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: "translateX(-40px)",
          }}
        >
          <SearchBar />
        </div>
      
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            style={{
              border: "none",
              backgroundColor: "transparent",
              fontSize: "24px",
              cursor: "pointer",
              color: "#111827",
              padding: 0,
            }}
          >
            👤
          </button>
        </div>
      </div>

          
        </header>

        <nav
          style={{
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "18px 24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "28px",
              flexWrap: "wrap",
              fontSize: "16px",
              fontWeight: 500,
              color: "#111827",
            }}
          >
            <span style={{ cursor: "pointer" }}>Electronics</span>
            <span style={{ cursor: "pointer" }}>Computers</span>
            <span style={{ cursor: "pointer" }}>Accessories</span>
            <span style={{ cursor: "pointer" }}>Home & Living</span>
            <span style={{ cursor: "pointer" }}>Smart Devices</span>
            <span style={{ cursor: "pointer" }}>Brands</span>
            <span style={{ cursor: "pointer" }}>Blog</span>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}