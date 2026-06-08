import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, ChevronDown, LayoutDashboard, LogOut, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

// ─── Services mega-menu ───────────────────────────────────────────────────────

function ServicesMegaMenu() {
  const { t } = useTranslation();
  const categories = [
    { key: "nav.mega_industry_solutions",   href: "/services?category=industry-solutions" },
    { key: "nav.mega_products_platforms",   href: "/services?category=products-platforms" },
    { key: "nav.mega_research_innovation",  href: "/services?category=research-innovation" },
    { key: "nav.mega_alliances",            href: "/services?category=alliances" },
  ];
  const industries = [
    { key: "nav.mega_banking",          href: "/services/banking" },
    { key: "nav.mega_capital_markets",  href: "/services/capital-markets" },
    { key: "nav.mega_healthcare",       href: "/services/healthcare" },
    { key: "nav.mega_high_tech",        href: "/services/high-tech" },
    { key: "nav.mega_manufacturing",    href: "/services/manufacturing" },
    { key: "nav.mega_retail",           href: "/services/retail" },
    { key: "nav.mega_travel_logistics", href: "/services/travel-logistics" },
  ];
  return (
    <div className="grid grid-cols-2 gap-0">
      <div className="p-4 border-r border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1">
          {t("nav.mega_by_category")}
        </p>
        {categories.map((item) => (
          <Link key={item.key} to={item.href}
            className="block px-2 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            {t(item.key)}
          </Link>
        ))}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1">
          {t("nav.mega_industries")}
        </p>
        {industries.map((item) => (
          <Link key={item.key} to={item.href}
            className="block px-2 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            {t(item.key)}
          </Link>
        ))}
        <Link to="/services" className="mt-1 block px-2 py-1.5 text-sm rounded-lg text-brand-400 hover:text-brand-300 font-medium">
          {t("nav.mega_view_all")}
        </Link>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function UserMenu({ user, logout }: { user: { first_name?: string; email?: string; role?: string } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase();
  const canAccessDashboard = user?.role === "admin" || user?.role === "editor";

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity">
        {initial}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-semibold text-foreground truncate">{user?.first_name || user?.email}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Link to={canAccessDashboard ? "/dashboard" : "/my-account"} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <LayoutDashboard className="h-3.5 w-3.5" />
              {canAccessDashboard ? t("dashboard.overview") : t("nav.my_account")}
            </Link>
            {canAccessDashboard && (
              <Link to="/blog/write" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <PenLine className="h-3.5 w-3.5" /> {t("nav.write_post")}
              </Link>
            )}
            <button onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> {t("dashboard.sign_out")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();

  // Unified nav links — no separate Products concept
  const navLinks = [
    { label: t("nav.home"),     href: "/" },
    { label: t("nav.about"),    href: "/about" },
    { label: t("projects.our_work"), href: "/projects" },
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

  useEffect(() => {
    const handler = () => setActiveDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const linkCls = (href: string) =>
    cn(
      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      (href === "/" ? location.pathname === href : location.pathname.startsWith(href))
        ? "text-foreground bg-accent"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    );

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
            <Link to="/"      className={linkCls("/")}      >{t("nav.home")}</Link>
            <Link to="/about" className={linkCls("/about")}  >{t("nav.about")}</Link>

            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("services")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeDropdown === "services" || location.pathname.startsWith("/services")
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

            {/* Our Work + remaining links */}
            {navLinks.filter((l) => !["/" , "/about"].includes(l.href)).map((link) => (
              <Link key={link.href} to={link.href} className={linkCls(link.href)}>
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
              <UserMenu user={user} logout={logout} />
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium",
                    (link.href === "/" ? location.pathname === link.href : location.pathname.startsWith(link.href))
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/services" className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                {t("nav.services")}
              </Link>
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
