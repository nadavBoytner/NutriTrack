import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["hebrew", "latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "NutriTrack",
    template: "%s · NutriTrack",
  },
  description: "מעקב תזונה יומי",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${frankRuhlLibre.variable}`}>
      <body>
        <div aria-hidden="true" className="bg-glow bg-glow-1" />
        <div aria-hidden="true" className="bg-glow bg-glow-2" />
        <div aria-hidden="true" className="bg-glow bg-glow-3" />
        <div id="page-root">{children}</div>
      </body>
    </html>
  );
}
