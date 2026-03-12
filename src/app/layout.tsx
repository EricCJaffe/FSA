import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BusinessOS — Property Intelligence",
  description: "Family-office financial intelligence platform — Property Portfolio module",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
