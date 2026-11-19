import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AccionesFlotantes } from "@/components/site/floating-actions";
import { BannerModo } from "@/components/site/banner-modo";
import { jsonLdNegocio } from "@/lib/seo";

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNegocio()) }} />
      <Header />
      <main id="contenido">{children}</main>
      <BannerModo />
      <Footer />
      <AccionesFlotantes />
    </>
  );
}
