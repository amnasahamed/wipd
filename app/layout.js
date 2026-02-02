import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Writer Integrity System",
  description: "Comprehensive platform for writer onboarding, work management, and content integrity verification",
  keywords: "writer management, content integrity, plagiarism detection, writing quality",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
