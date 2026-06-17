import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golf Bets Webapp",
  description: "Golf Bets Webapp",
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
