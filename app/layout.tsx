import "./globals.css";
import type { Metadata } from "next";
import "./Vazirmatn-font-face.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "دستیار هوشمند ایرانی",
  description: "چت بات هوشمند با پشتیبانی کامل از زبان فارسی",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-gray-50 dark:bg-gray-900 font-[Vazirmatn]">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
