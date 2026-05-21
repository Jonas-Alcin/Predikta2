import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Predikta | Premium Sports Betting Predictions",
  description: "Advanced AI-driven sports predictions and top bets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-background text-textMain min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
