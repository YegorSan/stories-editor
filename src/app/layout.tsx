import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { WipeLocalIgSecrets } from "@/lib/accounts";
import { PostHogProvider } from "@/lib/analytics";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kadr — сторіс зі своїм характером",
  description:
    "Редактор Instagram Stories: стікери, шаблони, експорт PNG. Kadr Pro — усі паки через Monobank.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#1b1a17",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-table font-sans text-bone antialiased">
        <SessionProvider>
          <PostHogProvider>
            <WipeLocalIgSecrets />
            {children}
          </PostHogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
