import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* TOP NAVIGATION BAR */}
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f8f8f8",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "20px" }}>
              <span style={{ cursor: "pointer" }}>Campaigns</span>
              <span style={{ cursor: "pointer" }}>FAQ</span>
            </div>

            <div style={{ fontWeight: 600 }}>Nethouse</div>

            <div style={{ display: "flex", gap: "20px" }}>
              <span style={{ cursor: "pointer" }}>Gift Guide</span>
            </div>
          </div>
        </div>

        {/* MAIN HEADER */}
        <header
          style={{
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <div style={{ fontSize: "15px", color: "#666" }}>
              Homepage Header
            </div>
          </div>
        </header>

        {/* CATEGORY NAVIGATION BAR */}
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
              gap: "28px",
              flexWrap: "wrap",
              fontSize: "16px",
              fontWeight: 500,
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