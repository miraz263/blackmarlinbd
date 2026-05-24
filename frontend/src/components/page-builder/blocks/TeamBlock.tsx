import { motion } from "framer-motion";
import { Linkedin, Github, Mail } from "lucide-react";

interface Member { name: string; role: string; photo?: string; bio?: string; linkedin?: string; github?: string; email?: string; }

const GRADIENTS = [
  "from-purple-500 to-brand-500",
  "from-brand-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-pink-500",
];

export function TeamBlock({ content }: { content: Record<string, unknown> }) {
  const heading = content.heading as string | undefined;
  const members = (content.members as Member[] | undefined) ?? [];

  return (
    <div>
      {heading && <h2 className="text-3xl font-bold text-center mb-10">{heading}</h2>}
      {members.length === 0 ? (
        <div className="flex items-center justify-center h-32 rounded-2xl bg-muted border border-dashed border-border text-muted-foreground text-sm">
          No team members added yet
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member, i) => {
            const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border"
              >
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-20 h-20 rounded-2xl object-cover mb-4 ring-2 ring-brand-500/20" />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white font-bold text-xl mb-4`}>
                    {initials}
                  </div>
                )}
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-brand-400 mb-2">{member.role}</p>
                {member.bio && <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{member.bio}</p>}
                <div className="flex gap-2">
                  {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>}
                  {member.github   && <a href={member.github}   target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Github className="h-4 w-4" /></a>}
                  {member.email    && <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /></a>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
