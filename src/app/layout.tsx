import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patente Airside – Quiz ADC",
  description: "Preparati all'esame di abilitazione alla guida in Airside (ADC-A) – FCO/CIA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
