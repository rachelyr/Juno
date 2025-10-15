import type { Metadata } from "next";
import {Inter} from 'next/font/google';
import "./globals.css";
import DashboardWrap from "./dashboardWrap";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Juno",
  description: "A Project Management Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardWrap>{children}</DashboardWrap>
      </body>
    </html>
  );
}
