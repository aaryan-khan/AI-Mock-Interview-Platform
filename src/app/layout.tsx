import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bodyFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-body",
  display: "swap",
});

const headingFont = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewAI — Student Mock Interview",
  description: "A student-friendly AI mock interview platform with Gemini evaluation, voice input, camera practice, and interview history.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
