import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQLLM",
  description: "Analytical SQL reasoning assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-moria-900 text-moria-300 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
