import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { seoService, seoKeys } from "@/services/seoService";
import type { SEOOverrides } from "@/types";

interface SEOHeadProps {
  /** Unique page identifier matching the backend SEOPage.page_key */
  pageKey: string;
  /**
   * Hard fallbacks rendered immediately (before the API responds) and used
   * whenever the CMS entry is missing or the field is blank.
   */
  fallback?: {
    title?: string;
    description?: string;
  };
  /**
   * Per-render overrides that always win over the CMS data.
   * Use for dynamic pages (service detail, blog post, project) where the
   * title/description/image come from the item's own data.
   */
  overrides?: SEOOverrides;
}

export function SEOHead({ pageKey, fallback = {}, overrides = {} }: SEOHeadProps) {
  const { data: seo } = useQuery({
    queryKey: seoKeys.page(pageKey),
    queryFn:  () =>
      seoService.getByKey(pageKey).then((r) => r.data).catch(() => null),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // Resolution order: overrides → CMS → fallback → ""
  const title       = overrides.title       ?? seo?.meta_title       ?? fallback.title       ?? "";
  const description = overrides.description ?? seo?.meta_description ?? fallback.description ?? "";
  const keywords    = seo?.keywords ?? "";
  const canonical   = overrides.canonical   ?? seo?.canonical_url    ?? "";
  const ogTitle     = overrides.title       ?? seo?.resolved_og_title ?? title;
  const ogDesc      = overrides.description ?? seo?.resolved_og_desc  ?? description;
  const ogImage     = overrides.ogImage !== undefined
    ? overrides.ogImage
    : seo?.og_image_url ?? null;
  const ogType      = overrides.ogType  ?? seo?.og_type       ?? "website";
  const twitterCard = seo?.twitter_card ?? "summary_large_image";
  const schemaJson  = overrides.schemaJson !== undefined
    ? overrides.schemaJson
    : seo?.schema_json ?? null;
  const noIndex     = overrides.noIndex ?? seo?.no_index ?? false;

  return (
    <Helmet>
      {title       && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords    && <meta name="keywords" content={keywords} />}
      {canonical   && <link rel="canonical" href={canonical} />}
      {noIndex     && <meta name="robots" content="noindex,nofollow" />}

      {/* ── Open Graph ─────────────────────────────────────────────── */}
      <meta property="og:type" content={ogType} />
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDesc  && <meta property="og:description" content={ogDesc} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* ── Twitter Card ────────────────────────────────────────────── */}
      <meta name="twitter:card" content={twitterCard} />
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDesc  && <meta name="twitter:description" content={ogDesc} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* ── JSON-LD ─────────────────────────────────────────────────── */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
}
