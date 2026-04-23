import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import NavbarWrapper from "@/components/navbar-wrapper";
import NotificationProvider from "@/components/NotificationProvider";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Project management made simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Suspense>
          <NavbarWrapper />
        </Suspense>
        <NotificationProvider />
        {children}
      </body>
    </html>
  );
}
