import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { pageBuilderService, pbKeys } from "@/services/pageBuilderService";

function Skeleton() {
  return (
    <div className="pt-20 space-y-4 container mx-auto px-4 py-16">
      <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      <div className="h-8 rounded-lg bg-muted w-2/3 animate-pulse" />
      <div className="h-4 rounded bg-muted w-full animate-pulse" />
      <div className="h-4 rounded bg-muted w-5/6 animate-pulse" />
    </div>
  );
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: pbKeys.detail(slug ?? ""),
    queryFn:  () => pageBuilderService.getPage(slug!).then((r) => r.data),
    enabled:  !!slug,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <>
      <Navbar />

      {isLoading && <Skeleton />}

      {(isError || (!isLoading && !page)) && (
        <main className="pt-28 pb-24 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Page not found</h1>
            <p className="text-muted-foreground mb-8">
              This page doesn't exist or hasn't been published.
            </p>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </main>
      )}

      {page && (
        <>
          <SEOHead
            pageKey={`page-${page.slug}`}
            fallback={{ title: page.title, description: page.description }}
          />
          <div className="pt-16">
            <PageRenderer page={page} />
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
