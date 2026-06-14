import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sameva — Your private space to reflect, vent, grieve, and grow",
  description: "A privacy-first AI wellbeing platform. No accounts required. No chat history stored. Your data stays yours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: "#060511" }}>
      <body
        className={inter.className}
        style={{ background: "#060511", overflowX: "hidden", minHeight: "100vh" }}
      >
        {children}
      </body>
    </html>
  );
}