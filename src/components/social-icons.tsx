import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import type { IconType } from "react-icons";

const icons: Record<string, [IconType, string]> = {
  instagram: [FaInstagram, "Instagram"], tiktok: [FaTiktok, "TikTok"], youtube: [FaYoutube, "YouTube"], facebook: [FaFacebookF, "Facebook"],
  threads: [SiThreads, "Threads"], x: [FaXTwitter, "X"], linkedin: [FaLinkedinIn, "LinkedIn"], whatsapp: [FaWhatsapp, "WhatsApp"],
};

export function SocialIcons({ items, variant = "default" }: { items: { id: string; platform: string; url: string }[]; variant?: "default" | "footer" }) {
  const cls = variant === "footer"
    ? "border-footer-foreground/30 text-footer-foreground hover:bg-footer-foreground hover:text-footer"
    : "border-border bg-background text-primary hover:bg-primary hover:text-primary-foreground";
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((s) => {
        const [Icon, label] = icons[s.platform] ?? [FaInstagram, s.platform];
        return <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={`grid size-11 place-items-center border transition-colors ${cls}`}><Icon className="size-5" /></a></li>;
      })}
    </ul>
  );
}

export const platformLabel = (p: string) => icons[p]?.[1] ?? p;
