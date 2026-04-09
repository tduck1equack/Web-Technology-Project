import type { Metadata } from "next";
import localFont from "next/font/local";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthStateProvider } from "@/lib/providers/auth-state-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "EduTech Platform",
  description: "Modern educational technology platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthStateProvider>{children}</AuthStateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
