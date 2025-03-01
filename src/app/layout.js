import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // Importando a Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Grooby - Marketplace de Anúncios",
  description: "Compre, venda e alugue no Reino Unido",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar /> {/* Navbar fixa em todas as páginas */}
        <main className="pt-20">{children}</main> {/* Ajuste de espaço para evitar sobreposição */}
      </body>
    </html>
  );
}
