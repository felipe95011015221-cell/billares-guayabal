import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/config/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Club de Billares Guayabal · Billar en Medellín", template: "%s · Club de Billares Guayabal" },
  description:
    "Club de billar en Guayabal, Medellín. Carambola a tres bandas y pool. Reserva tu mesa en línea, conoce la escuela de billar, torneos y eventos.",
  applicationName: siteConfig.nombreCorto,
  keywords: [
    "billares en Medellín", "Club de Billares Guayabal", "Billares Guayabal", "club de billar Medellín", "billar tres bandas Medellín",
    "jugar pool en Medellín", "reservar mesa de billar Medellín", "clases de billar Medellín",
  ],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#111714", width: "device-width", initialScale: 1 };

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-dvh overflow-x-hidden">
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
