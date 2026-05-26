import type { Metadata } from "next";
import { Abril_Fatface, Nunito_Sans } from "next/font/google";
import "./globals.css";

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CallNotes — Vos appels structurés. Vos actions générées. En 60 secondes.",
  description:
    "Transcription, résumé et extraction automatique d'actions depuis vos appels discovery et qualification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${abrilFatface.variable} ${nunitoSans.variable}`}>
      <body
        style={{
          background: "#fdf4ff",
          fontFamily: "var(--font-body)",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
