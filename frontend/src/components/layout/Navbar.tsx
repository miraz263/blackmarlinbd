import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/data/productCatalog";

// ─── Products mega-menu (category tabs + product grid) ─────────────────────────

function ProductsMegaMenu() {
  const [activeCategory, setActiveCategory] = useState(PRODUCT_CATEGORIES[0].slug);
  const cat = PRODUCT_CATEGORIES.find((c) => c.slug === activeCategory) ?? PRODUCT_CATEGORIES[0];
  const CatIcon = cat.icon;

  return (
    <div className="flex" style={{ minHeight: 360 }}>
      {/* Left — category list */}
      <div className="w-48 border-r border-border shrink-0 py-3 px-2 space-y-0.5 bg-card/50">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2 pb-1">
          Categories
        </p>
        {PRODUCT_CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.slug}
              onMouseEnter={() => setActiveCategory(c.slug)}
              onClick={() => setActiveCategory(c.slug)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all duration-100",
                activeCategory === c.slug
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{c.label}</span>
              <span className="ml-auto text-[10px] opacity-50">{c.products.length}</span>
            </button>
          );
        })}
        <div className="pt-2 px-1">
          <Link
            to="/products"
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
          >
            All Products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right — product grid */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CatIcon className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-semibold text-foreground">{cat.label}</span>
          <span className="text-[10px] text-muted-foreground">({cat.products.length} products)</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {cat.products.slice(0, 6).map((p) => {
            const PIcon = p.icon;
            return (
              <Link
                key={p.slug}
                to={`/products/${p.slug}`}
                className="group flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-accent transition-colors duration-150"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: p.iconColor + "22" }}
                >
                  <PIcon className="h-3.5 w-3.5" style={{ color: p.iconColor }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-foreground group-hover:text-brand-400 transition-colors truncate">
                      {p.name}
                    </span>
                    {p.isNew && (
                      <span className="px-1 py-0 rounded text-[9px] font-bold bg-brand-500/15 text-brand-400 shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">{p.tagline}</span>
                </div>
              </Link>
            );
          })}
        </div>
        {cat.products.length > 6 && (
          <Link
            to={`/products?category=${cat.slug}`}
            className="mt-2 flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-medium"
          >
            +{cat.products.length - 6} more in {cat.label} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Services mega-menu ────────────────────────────────────────────────────────

function ServicesMegaMenu() {
  return (
    <div className="grid grid-cols-2 gap-0">
      <div className="p-4 border-r border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1">
          By Category
        </p>
        {[
          { label: "Industry Solutions",    href: "/services" },
          { label: "Products & Platforms",  href: "/services" },
          { label: "Research & Innovation", href: "/services" },
          { label: "Alliances",             href: "/services" },
        ].map((item) => (
          <Link key={item.label} to={item.href} className="block px-2 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1">
          Industries
        </p>
        {[
          { label: "Banking",             href: "/services/banking" },
          { label: "Capital Markets",     href: "/services/capital-markets" },
          { label: "Healthcare",          href: "/services/healthcare" },
          { label: "High Tech",           href: "/services/high-tech" },
          { label: "Manufacturing",       href: "/services/manufacturing" },
          { label: "Retail",              href: "/services/retail" },
          { label: "Travel & Logistics",  href: "/services/travel-logistics" },
        ].map((item) => (
          <Link key={item.label} to={item.href} className="block px-2 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            {item.label}
          </Link>
        ))}
        <Link to="/services" className="mt-1 block px-2 py-1.5 text-sm rounded-lg text-brand-400 hover:text-brand-300 font-medium">
          View all industries →
        </Link>
      </div>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();

  const simpleLinks = [
    { label: t("nav.home"),     href: "/" },
    { label: t("nav.about"),    href: "/about" },
    { label: t("nav.projects"), href: "/projects" },
    { label: t("nav.blog"),     href: "/blog" },
    { label: t("nav.careers"),  href: "/careers" },
    { label: t("nav.contact"),  href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = () => setActiveDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-sm">BM</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">BlackMarlin</span>
              <span className="font-bold text-lg gradient-text">BD</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>

            {/* Home + About */}
            {["home", "about"].map((key) => {
              const link = simpleLinks.find((l) => l.label === t(`nav.${key}`))!;
              return (
                <Link
                  key={key}
                  to={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Products dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("products")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeDropdown === "products"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                Products
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", activeDropdown === "products" && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeDropdown === "products" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute top-full left-0 mt-2 w-[620px] glass dark:glass-dark rounded-2xl shadow-2xl border border-border overflow-hidden"
                    style={{ maxHeight: "80vh", overflowY: "auto" }}
                  >
                    <ProductsMegaMenu />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("services")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeDropdown === "services"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                {t("nav.services")}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", activeDropdown === "services" && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeDropdown === "services" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute top-full left-0 mt-2 w-[420px] glass dark:glass-dark rounded-2xl shadow-2xl border border-border overflow-hidden"
                  >
                    <ServicesMegaMenu />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simple links */}
            {simpleLinks.filter((l) => !["nav.home", "nav.about"].includes(
              Object.entries({ "nav.home": t("nav.home"), "nav.about": t("nav.about") })
                .find(([, v]) => v === l.label)?.[0] ?? ""
            )).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="flags" className="hidden lg:flex" />
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t("nav.login")}</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="gradient" size="sm">{t("services.get_started")}</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <Link to="/" className={cn("px-4 py-3 rounded-lg text-sm font-medium", location.pathname === "/" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                {t("nav.home")}
              </Link>
              <Link to="/about" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{t("nav.about")}</Link>
              <Link to="/products" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">Products</Link>
              <Link to="/services" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{t("nav.services")}</Link>
              <Link to="/projects" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{t("nav.projects")}</Link>
              <Link to="/blog" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{t("nav.blog")}</Link>
              <Link to="/careers" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{t("nav.careers")}</Link>
              <Link to="/contact" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{t("nav.contact")}</Link>
              <div className="mt-4 flex flex-col gap-2">
                <LanguageSwitcher variant="pills" />
                <Link to="/login"><Button variant="outline" className="w-full">{t("nav.login")}</Button></Link>
                <Link to="/contact"><Button variant="gradient" className="w-full">{t("services.get_started")}</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
