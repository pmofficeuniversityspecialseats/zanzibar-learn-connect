import heroAsset from "@/assets/IMG-20260916-WA0087.jpg.asset.json";
import meetingAsset from "@/assets/IMG-20260626-WA0134.jpg.asset.json";
import portraitAsset from "@/assets/IMG-20260708-WA0003.jpg.asset.json";
import chamberAsset from "@/assets/IMG-20260708-WA0006.jpg.asset.json";
import conversationAsset from "@/assets/IMG-20260709-WA0013.jpg.asset.json";
import eventAsset from "@/assets/IMG-20260906-WA0058.jpg.asset.json";
import summitAsset from "@/assets/IMG-20260916-WA0112.jpg.asset.json";
import logoAsset from "@/assets/T401773497848223.png.asset.json";

export const assets = {
  logo: logoAsset.url,
  hero: heroAsset.url,
  meeting: meetingAsset.url,
  portrait: portraitAsset.url,
  chamber: chamberAsset.url,
  conversation: conversationAsset.url,
  event: eventAsset.url,
  summit: summitAsset.url,
};

export const navItems = [
  { to: "/", sw: "Mwanzo", en: "Home" },
  { to: "/kuhusu", sw: "Kuhusu Ofisi", en: "About" },
  { to: "/mbunge", sw: "Mbunge", en: "MP" },
  { to: "/majukumu", sw: "Kazi na Majukumu", en: "Functions" },
  { to: "/habari", sw: "Habari", en: "News" },
  { to: "/miradi", sw: "Miradi na Shughuli", en: "Projects" },
  { to: "/nyaraka", sw: "Nyaraka", en: "Documents" },
  { to: "/elimu", sw: "Elimu na Fursa", en: "Education" },
  { to: "/mawasiliano", sw: "Mawasiliano", en: "Contact" },
] as const;

export const quickLinks = [
  { title: "Tuma Maoni", href: "/shiriki", icon: "MessageSquare" },
  { title: "Wasilisha Hoja", href: "/shiriki", icon: "FileQuestion" },
  { title: "Nyaraka", href: "/nyaraka", icon: "Files" },
  { title: "Habari na Matukio", href: "/habari", icon: "Newspaper" },
  { title: "Fursa", href: "/fursa", icon: "GraduationCap" },
  { title: "Wasiliana Nasi", href: "/mawasiliano", icon: "Phone" },
];

export const newsItems = [
  {
    title: "Ushiriki katika Tanzania Green Summit 2026",
    date: "16 Septemba 2026",
    category: "Matukio",
    summary: "Ushiriki katika majadiliano ya maendeleo endelevu, ubunifu na nafasi ya vijana katika uchumi wa kijani.",
    image: assets.summit,
  },
  {
    title: "Mazungumzo ya ushirikiano kuhusu maendeleo ya vijana",
    date: "9 Julai 2026",
    category: "Mikutano",
    summary: "Majadiliano ya wadau kuhusu elimu, ujuzi na mazingira bora kwa maendeleo ya wanafunzi.",
    image: assets.conversation,
  },
  {
    title: "Ushirikishwaji wa wadau katika shughuli za kijamii",
    date: "6 Septemba 2026",
    category: "Ziara",
    summary: "Kushirikiana na taasisi na viongozi katika juhudi zinazowagusa vijana na jamii.",
    image: assets.event,
  },
];

export const responsibilityItems = [
  ["Uwakilishi", "Kuwasilisha na kufuatilia masuala ya wanafunzi kupitia njia rasmi za uwakilishi."],
  ["Mawasiliano ya kitaasisi", "Kuwezesha mawasiliano kati ya wanafunzi, taasisi za elimu na mamlaka husika."],
  ["Kusikiliza hoja", "Kupokea maoni, changamoto na mapendekezo na kuyafanyia ufuatiliaji kwa taratibu husika."],
  ["Ushirikishwaji wa vijana", "Kukuza ushiriki wa vijana katika mijadala ya elimu, ubunifu na maendeleo."],
  ["Uhamasishaji wa fursa", "Kusambaza taarifa zilizothibitishwa kuhusu elimu, utafiti, kazi na ujasiriamali."],
  ["Ushirikiano", "Kujenga mawasiliano yenye tija na wadau wa elimu ya juu kwa maslahi ya wanafunzi."],
];

export const opportunities = [
  { title: "Scholarships", sw: "Ufadhili wa Masomo", description: "Taarifa za ufadhili zitawekwa baada ya kuthibitishwa na taasisi inayotoa.", deadline: "Inasubiri tangazo rasmi" },
  { title: "Internships", sw: "Mafunzo kwa Vitendo", description: "Nafasi za mafunzo kwa wanafunzi na wahitimu zitaorodheshwa hapa.", deadline: "Inasubiri tangazo rasmi" },
  { title: "Research", sw: "Fursa za Utafiti", description: "Mialiko ya utafiti, ruzuku na ushirikiano wa kitaaluma kutoka vyanzo rasmi.", deadline: "Inasubiri tangazo rasmi" },
  { title: "Innovation", sw: "Ubunifu na Ujasiriamali", description: "Programu zinazowezesha mawazo ya vijana, teknolojia na biashara changa.", deadline: "Inasubiri tangazo rasmi" },
];