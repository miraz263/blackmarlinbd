import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch {
      setError(t("auth.invalid_credentials"));
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In — BlackMarlinBD</title>
      </Helmet>

      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-950/30 via-background to-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold">BM</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold mb-2">{t("auth.welcome_back")}</h1>
            <p className="text-muted-foreground text-sm">{t("auth.signin_subtitle")}</p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("auth.email")}</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t("auth.password")}</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" variant="gradient" className="w-full" size="lg" loading={isSubmitting}>
                {t("auth.sign_in")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.no_account")}{" "}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                {t("auth.sign_up")}
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </>
  );
}
