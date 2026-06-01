import { SEOHead } from "@/components/seo/SEOHead";
import { Hero } from "@/components/home/Hero";
import { TechStack } from "@/components/home/TechStack";
import { ProductSuites } from "@/components/home/ProductSuites";
import { Industries } from "@/components/home/Industries";
import { Services } from "@/components/home/Services";
import { CustomerSuccess } from "@/components/home/CustomerSuccess";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Partners } from "@/components/home/Partners";
import { CTA } from "@/components/home/CTA";
import { useHomepageQuery } from "@/hooks/useHomepageQuery";

export default function HomePage() {
  useHomepageQuery();

  return (
    <>
      <SEOHead
        pageKey="home"
        fallback={{
          title: "BlackMarlinBD — AI-Powered Enterprise Solutions for Financial Services, Healthcare & Government",
          description:
            "BlackMarlinBD builds enterprise software for capital markets, healthcare, government, and SMEs. FinTech Suite, Healthcare Suite, AI Suite, and Enterprise Suite.",
        }}
      />
      <main>
        <Hero />
        <TechStack />
        <ProductSuites />
        <Industries />
        <Services />
        <CustomerSuccess />
        <FeaturedProjects />
        <TrustSignals />
        <Partners />
        <CTA />
      </main>
    </>
  );
}
