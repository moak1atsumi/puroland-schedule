// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Head from "next/head";

export const metadata = {
  title: "サンリオピューロランドスケジュール",
  description: "サンリオピューロランドの予定を管理するアプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <Head>
        <meta name="theme-color" content="#FFF5C3" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <body>
        {children}
      </body>
    </html>
  );
}
