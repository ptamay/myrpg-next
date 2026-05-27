import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import "./globals.css";

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
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof pdfjsLib !== 'undefined') {
                  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
              }
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
      </body>
    </html>
  );
}
