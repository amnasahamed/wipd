import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata = {
  title: "Writer Integrity System",
  description: "Comprehensive platform for writer onboarding, work management, and content integrity verification",
  keywords: "writer management, content integrity, plagiarism detection, writing quality",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
