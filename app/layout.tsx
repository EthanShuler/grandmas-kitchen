import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { HeartIcon } from 'lucide-react';
import Navbar from '@/components/header';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Grandma's Kitchen",
  description: "Rogensack family recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <Navbar />
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>

              <footer className="w-full flex flex-wrap items-center justify-center border-t mx-auto text-center text-xs gap-2 md:gap-8 py-8 md:py-16 px-4">
                <p className="mb-2 md:mb-0">
                  Built with love for Grandma Pat and the cousins 
                </p>
                <HeartIcon color="red" fill="pink" className="mx-1 md:mx-0" />
                <p className="mb-2 md:mb-0">
                  By Abby and Ethan
                </p>
                <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0">
                  <ThemeSwitcher />
                </div>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
