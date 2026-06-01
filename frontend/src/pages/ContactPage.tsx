import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactsApi } from "@/services/api/contacts";
import { useTranslation } from "@/hooks/useTranslation";
import type { ContactFormData } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  budget: z.string().optional(),
});

const services = [
  { value: "ai_ml", label: "AI & Machine Learning" },
  { value: "financial", label: "Financial Systems" },
  { value: "cloud", label: "Cloud & DevOps" },
  { value: "web_mobile", label: "Web & Mobile" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "other", label: "Other" },
];

const budgets = [
  "$5k – $20k",
  "$20k – $50k",
  "$50k – $100k",
  "$100k – $500k",
  "$500k+",
];

const CONTACT_INFO_KEYS = [
  { icon: Mail,   labelKey: "contact.info_email",   value: "hello@blackmarlinbd.com" },
  { icon: Phone,  labelKey: "contact.info_phone",   value: "+1 (555) 000-0000" },
  { icon: MapPin, labelKey: "contact.info_offices", value: "Dhaka · New York · London" },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ContactFormData) => {
    await contactsApi.submit(data);
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead
        pageKey="contact"
        fallback={{
          title: "Contact Us — BlackMarlinBD",
          description: "Get in touch with BlackMarlinBD to discuss your project.",
        }}
      />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">{t("contact.title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              {CONTACT_INFO_KEYS.map(({ icon: Icon, labelKey, value }) => (
                <motion.div
                  key={labelKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t(labelKey)}</div>
                    <div className="font-medium text-foreground">{value}</div>
                  </div>
                </motion.div>
              ))}

              {/* Response time */}
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-sm text-brand-400 font-medium">{t("contact.response_time")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("contact.response_desc")}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full py-20 text-center"
                >
                  <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{t("contact.sent_title")}</h2>
                  <p className="text-muted-foreground">
                    {t("contact.sent_desc")}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 p-8 rounded-2xl bg-card border border-border"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t("contact.full_name")} *</label>
                      <input
                        {...register("name")}
                        placeholder="John Smith"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t("contact.email")} *</label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="john@company.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t("contact.phone")}</label>
                      <input
                        {...register("phone")}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t("contact.company")}</label>
                      <input
                        {...register("company")}
                        placeholder="Acme Corp"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Service */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t("contact.service")} *</label>
                      <select
                        {...register("service")}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">{t("contact.select_service")}</option>
                        {services.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t("contact.budget")}</label>
                      <select
                        {...register("budget")}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">{t("contact.select_range")}</option>
                        {budgets.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("contact.subject")} *</label>
                    <input
                      {...register("subject")}
                      placeholder="Brief description of your project"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("contact.message")} *</label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      placeholder="Tell us about your requirements, timeline, and any specific technical needs..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                  </div>

                  <Button type="submit" variant="gradient" size="lg" loading={isSubmitting} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    {t("contact.send")}
                  </Button>
                </motion.form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
