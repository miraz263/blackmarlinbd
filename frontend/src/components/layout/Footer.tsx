import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/services/api/auth";
import { siteService, siteKeys } from "@/services/siteService";

// Inline SVG brand icons — lucide-react dropped brand logos in recent versions
const IconGithub = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
  </svg>
);
const IconLinkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const IconTwitterX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconFacebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);
const IconYoutube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Services: [
    { label: "AI & Machine Learning", href: "/services#ai-ml" },
    { label: "Financial Systems", href: "/services#financial" },
    { label: "Cloud & DevOps", href: "/services#cloud" },
    { label: "Web & Mobile", href: "/services#web-mobile" },
    { label: "Cybersecurity", href: "/services#security" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: site } = useQuery({
    queryKey: siteKeys.settings,
    queryFn: () => siteService.getSettings().then((r) => r.data),
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  const { data: footer } = useQuery({
    queryKey: siteKeys.footer,
    queryFn: () => siteService.getFooter().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail("");
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // ── Derived display values (fall back to defaults until API responds) ──────
  const companyName = site?.company_name ?? "BlackMarlinBD";
  const aboutText =
    footer?.footer_about ??
    "Building the digital future through cutting-edge AI, cloud, and enterprise systems. Trusted by global leaders across finance, tech, and beyond.";
  const copyrightText =
    footer?.copyright_text ?? `${companyName}. All rights reserved.`;
  const newsletterEnabled = footer?.newsletter_enabled ?? true;

  const contactItems = [
    { icon: Mail, text: site?.email || "hello@blackmarlinbd.com", href: `mailto:${site?.email || "hello@blackmarlinbd.com"}` },
    { icon: Phone, text: site?.phone || "+1 (555) 000-0000", href: site?.phone ? `tel:${site.phone}` : undefined },
    { icon: MapPin, text: site?.address || "Dhaka, Bangladesh · New York, USA", href: undefined },
  ];

  const socialLinks = [
    site?.linkedin && { icon: IconLinkedin, href: site.linkedin, label: "LinkedIn" },
    site?.twitter && { icon: IconTwitterX, href: site.twitter, label: "Twitter / X" },
    site?.facebook && { icon: IconFacebook, href: site.facebook, label: "Facebook" },
    site?.youtube && { icon: IconYoutube, href: site.youtube, label: "YouTube" },
    site?.instagram && { icon: IconInstagram, href: site.instagram, label: "Instagram" },
  ].filter(Boolean) as { icon: React.ElementType; href: string; label: string }[];

  // Fallback socials shown while the API hasn't responded yet
  const displaySocials =
    socialLinks.length > 0
      ? socialLinks
      : [
          { icon: IconGithub, href: "https://github.com/blackmarlinbd", label: "GitHub" },
          { icon: IconLinkedin, href: "https://linkedin.com/company/blackmarlinbd", label: "LinkedIn" },
          { icon: IconTwitterX, href: "https://twitter.com/blackmarlinbd", label: "Twitter / X" },
        ];

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-950/20 dark:to-brand-950/40 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {footer?.footer_logo_url ? (
                <img
                  src={footer.footer_logo_url}
                  alt={companyName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">BM</span>
                </div>
              )}
              <span className="font-bold text-xl">
                {companyName.replace("BD", "")}<span className="gradient-text">BD</span>
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              {aboutText}
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              {contactItems.map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-brand-400 flex-shrink-0" />
                  {href ? (
                    <a href={href} className="hover:text-brand-400 transition-colors">
                      {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 flex-wrap">
              {displaySocials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-brand-400 hover:border-brand-400 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-brand-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        {newsletterEnabled && (
          <div className="mt-12 p-6 rounded-2xl glass dark:glass-dark border border-border">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Stay in the loop</h3>
                <p className="text-sm text-muted-foreground">
                  Get the latest insights on AI, cloud, and tech delivered to your inbox.
                </p>
              </div>
              {subscribed ? (
                <p className="text-brand-400 font-medium text-sm">✓ Subscribed! Thank you.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <Button type="submit" variant="gradient" size="sm" loading={loading}>
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {copyrightText}
          </p>
          <p className="text-xs text-muted-foreground">Built with ❤️ for a better digital world</p>
        </div>
      </div>
    </footer>
  );
}
