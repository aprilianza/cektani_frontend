import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CekTani - Diagnosis Penyakit Tanaman",
  description: "Aplikasi untuk mendiagnosis penyakit tanaman secara akurat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-gray-50`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}