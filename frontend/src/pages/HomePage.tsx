import { HelmetProvider, Helmet } from "react-helmet-async";
import { Hero } from "@/components/home/Hero";
import { TechStack } from "@/components/home/TechStack";
import { Services } from "@/components/home/Services";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { CTA } from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>BlackMarlinBD — Global IT & AI Engineering Firm</title>
        <meta
          name="description"
          content="BlackMarlinBD builds AI, financial systems, cloud infrastructure, and enterprise applications for global companies."
        />
        <meta property="og:title" content="BlackMarlinBD — Global IT & AI Engineering Firm" />
        <meta property="og:type" content="website" />
      </Helmet>
      <main>
        <Hero />
        <TechStack />
        <Services />
        <FeaturedProjects />
        <CTA />
      </main>
    </>
  );
}
