import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import InstallPrompt from "@/components/install-prompt"; // ⬅️ new client component

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "ABIC Realty Accounting System",
  description: "Professional accounting management system",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon512_maskable.png",
    apple: "/icon512_rounded.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <InstallPrompt /> {/* 👈 Floating button injected here */}
        </ThemeProvider>
      </body>
    </html>
  );
}
