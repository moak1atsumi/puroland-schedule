// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Head from "next/head";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

export const metadata = {
  title: "サンリオピューロランドスケジュール",
  description: "サンリオピューロランドの予定を管理するアプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFF5C3" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
