import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { WipeLocalIgSecrets } from "@/lib/accounts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kadr — сторіс зі своїм характером",
  description:
    "Тестовий редактор Instagram Stories: стікери, шаблони, експорт PNG.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-table font-sans text-bone antialiased">
        <WipeLocalIgSecrets />
        {children}
      </body>
    </html>
  );
}
