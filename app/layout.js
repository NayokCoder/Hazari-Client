import { Geist, Geist_Mono } from "next/font/google";
import "../css/globals.css";
import { Header } from "@/components/header";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ToastProvider from "@/components/shared/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hazari - Card Game",
  description: "Play Hazari card game online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
