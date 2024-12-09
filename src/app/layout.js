import localFont from "next/font/local";
import Header from "@/components/header";
import Main from "@/components/main";
import "./globals.css";
import Footer from "@/components/footer";

export const metadata = {
  title: "El comparatron",
  description: "Creado para comparar",
};

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={`antialiased h-auto min-h-screen w-auto`}>
        {children}
      </body>
    </html>
  );
}
