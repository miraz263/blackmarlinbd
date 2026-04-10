import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authApi } from "@/services/api/auth";

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

const socials = [
  { icon: Github, href: "https://github.com/blackmarlinbd", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/company/blackmarlinbd", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/blackmarlinbd", label: "Twitter" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-950/20 dark:to-brand-950/40 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">BM</span>
              </div>
              <span className="font-bold text-xl">
                BlackMarlin<span className="gradient-text">BD</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Building the digital future through cutting-edge AI, cloud, and enterprise systems.
              Trusted by global leaders across finance, tech, and beyond.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              {[
                { icon: Mail, text: "hello@blackmarlinbd.com" },
                { icon: Phone, text: "+1 (555) 000-0000" },
                { icon: MapPin, text: "Dhaka, Bangladesh · New York, USA" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-brand-400 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
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
        <div className="mt-12 p-6 rounded-2xl glass dark:glass-dark border border-border">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Stay in the loop</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest insights on AI, cloud, and tech delivered to your inbox.
              </p>
            </div>
            {subscribed ? (
              <p className="text-brand-400 font-medium text-sm">
                ✓ Subscribed! Thank you.
              </p>
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

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BlackMarlinBD. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for a better digital world
          </p>
        </div>
      </div>
    </footer>
  );
}
