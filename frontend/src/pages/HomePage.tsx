import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo/SEOHead";
import { Hero } from "@/components/home/Hero";
import { TechStack } from "@/components/home/TechStack";
import { Services } from "@/components/home/Services";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Partners } from "@/components/home/Partners";
import { CTA } from "@/components/home/CTA";
import { homepageQueryOptions } from "@/services/homepageService";

export default function HomePage() {
  // Prefetch the aggregate homepage data so all child components share the cache entry
  useQuery(homepageQueryOptions);

  return (
    <>
      <SEOHead
        pageKey="home"
        fallback={{
          title: "BlackMarlinBD — Global IT & AI Engineering Firm",
          description: "BlackMarlinBD builds AI, financial systems, cloud infrastructure, and enterprise applications for global companies.",
        }}
      />
      <main>
        <Hero />
        <TechStack />
        <Services />
        <FeaturedProjects />
        <Partners />
        <CTA />
      </main>
    </>
  );
}
