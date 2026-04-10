import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Users, Globe2, Award, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const values = [
  { title: "Engineering Excellence", description: "We write clean, tested, and maintainable code that stands the test of time." },
  { title: "Client Obsession", description: "Every decision we make starts with the question: how does this serve our client?" },
  { title: "Radical Transparency", description: "No surprises, no hidden fees. We communicate openly at every stage." },
  { title: "Continuous Innovation", description: "We invest 20% of our time in R&D to stay ahead of what's next." },
];

const stats = [
  { icon: Code2, value: "1M+", label: "Lines of Production Code" },
  { icon: Globe2, value: "25+", label: "Countries Served" },
  { icon: Users, value: "120+", label: "Engineers Worldwide" },
  { icon: Award, value: "15+", label: "Industry Awards" },
];

const team = [
  { name: "Arif Rahman", role: "CEO & Co-Founder", bg: "from-purple-500 to-brand-500" },
  { name: "Sarah Chen", role: "CTO", bg: "from-cyan-500 to-blue-500" },
  { name: "Marcus Johnson", role: "Head of AI", bg: "from-green-500 to-emerald-500" },
  { name: "Priya Patel", role: "Head of Engineering", bg: "from-orange-500 to-red-500" },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us — BlackMarlinBD</title>
        <meta name="description" content="Learn about BlackMarlinBD's mission, team, and values." />
      </Helmet>

      <main className="pt-20">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/30 via-background to-background" />
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-6">
                Our Story
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                Engineering the <span className="gradient-text">Digital Future</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Founded in 2018, BlackMarlinBD started as a three-person team in Dhaka with a single
                mission: build world-class technology for global enterprises. Today, we're a 120+
                engineer firm trusted by Fortune 500 companies across five continents.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y border-border bg-accent/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 mb-3">
                    <Icon className="h-6 w-6 text-brand-400" />
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Our <span className="gradient-text">Core Values</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                These aren't just words on a wall — they're the principles that guide every line of
                code we write.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-accent/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Leadership <span className="gradient-text">Team</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.bg} mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold`}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="font-semibold text-sm">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4">Want to join our team?</h2>
            <p className="text-muted-foreground mb-8">We're always looking for exceptional engineers.</p>
            <Link to="/careers">
              <Button variant="gradient" size="lg">View Open Positions</Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
