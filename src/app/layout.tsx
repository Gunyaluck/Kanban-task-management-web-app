import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanban Task Management App",
  description: "A full-stack kanban app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}