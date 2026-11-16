import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getNavigation } from "@/lib/strapi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Arkam Ventures",
  description: "Early-stage venture capital firm",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const navigation = await getNavigation();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} h-full antialiased bg-white`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#171717] w-full overflow-x-clip">
        {navigation === null ? (
          <div
            className="flex-1 flex items-center justify-center min-h-screen w-full"
            style={{ fontFamily: 'var(--font-rubik), Rubik, sans-serif' }}
          >
            <div className="flex flex-col items-center text-center px-6 max-w-[480px]">
              <div className="w-[64px] h-[64px] rounded-full bg-red-50 flex items-center justify-center mb-[24px]">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="12" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M14 8v7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="14" cy="20" r="1.5" fill="#ef4444"/>
                </svg>
              </div>
              <h1 className="text-[24px] font-[500] text-[#1E1A1A] mb-[10px]">
                Something went wrong
              </h1>
              <p className="text-[15px] text-[#1E1A1A]/60 leading-[1.6]">
                We&#39;re unable to connect to the server right now. Please try again later.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Navbar data={navigation} />
            <main className="flex-1 w-full bg-white">{children}</main>
          </>
        )}
      </body>
    </html>
  );
}
