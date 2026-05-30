import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { SystemDialogProvider } from "@/contexts/SystemDialogContext";
import { Inter } from "next/font/google";
import GlobalScripts from "@/components/GlobalScripts";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "RPG Tempo - Gerenciador do Mestre",
  description: "Gerenciador de campanhas de RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css" />
      </head>
      <body>
        <AuthProvider>
          <AppProvider>
            <SystemDialogProvider>
              {children}
            </SystemDialogProvider>
          </AppProvider>
        </AuthProvider>
        <GlobalScripts />
      </body>
    </html>
  );
}
