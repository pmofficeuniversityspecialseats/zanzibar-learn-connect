import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "sw" | "en";

/** Swahili phrase -> English. Any Swahili string passed to tr() is translated when EN is active. */
const phrases: Record<string, string> = {
  // Navigation & shell
  "Mwanzo": "Home", "Kuhusu Ofisi": "About the Office", "Mbunge": "MP Profile", "Kazi na Majukumu": "Functions",
  "Habari": "News", "Miradi na Shughuli": "Projects", "Nyaraka": "Documents", "Elimu na Fursa": "Education & Opportunities",
  "Mawasiliano": "Contact", "Shiriki Nasi": "Get Involved", "Menyu Kuu": "Main Menu", "Kurasa na huduma za ofisi": "Office pages and services",
  "Tafuta": "Search", "Fungua menyu": "Open menu", "Ruka hadi maudhui": "Skip to content", "Chagua lugha": "Choose language",
  "OFISI": "OFFICE", "TAARIFA": "INFORMATION", "WANAFUNZI": "STUDENTS", "LINKS MUHIMU": "IMPORTANT LINKS",
  "Matukio": "Events", "Hotuba": "Speeches", "Fursa": "Opportunities", "Elimu": "Education", "Ubunifu": "Innovation", "Utafiti": "Research",
  "Sera ya Faragha": "Privacy Policy", "Ufikivu": "Accessibility", "Ramani ya Tovuti": "Sitemap", "Tufuate": "Follow Us",
  "Saa za Kazi": "Office Hours", "Mitandao Rasmi ya Kijamii": "Official Social Media",
  "Jukwaa rasmi la uwakilishi, mawasiliano na ufuatiliaji wa masuala ya wanafunzi na elimu ya juu Zanzibar.": "The official platform for representation, communication and follow-up on student and higher-education matters in Zanzibar.",
  // Home
  "Jamhuri ya Muungano wa Tanzania": "United Republic of Tanzania",
  "Ofisi ya Mbunge Viti Maalumu Vyuo na Vyuo Vikuu Zanzibar": "Office of the Special Seats MP for Colleges and Universities Zanzibar",
  "OFISI YA MBUNGE VYUO NA VYUO VIKUU ZANZIBAR": "OFFICE OF THE MP FOR COLLEGES AND UNIVERSITIES ZANZIBAR",
  "Ofisi rasmi ya uwakilishi, mawasiliano na ufuatiliaji wa masuala yanayohusu wanafunzi wa vyuo na vyuo vikuu Zanzibar.": "The official office for representation, communication and follow-up on matters affecting college and university students in Zanzibar.",
  "Wasiliana Nasi": "Contact Us", "Tuma Maoni": "Send Feedback", "Wasilisha Hoja": "Submit an Issue", "Habari na Matukio": "News & Events",
  "Huduma za haraka": "Quick services", "Habari Mpya": "Latest News", "Habari zote": "All news", "Soma zaidi": "Read more",
  "Uwakilishi wenye kusikiliza na kufuatilia": "Representation that listens and follows up",
  "Ofisi ni jukwaa la kitaasisi la kupokea hoja, kuimarisha mawasiliano na kufuatilia masuala yanayohusu wanafunzi na taasisi za elimu ya juu Zanzibar.": "The office is an institutional platform to receive issues, strengthen communication and follow up on matters affecting students and higher-education institutions in Zanzibar.",
  "Dhamira": "Mission", "Maono": "Vision", "Taarifa Rasmi": "Official Information",
  "Kuimarisha uwakilishi, ushirikishwaji na upatikanaji wa taarifa kwa wanafunzi.": "To strengthen representation, engagement and access to information for students.",
  "Jamii ya elimu ya juu inayosikilizwa, kushirikishwa na kuunganishwa na fursa.": "A higher-education community that is heard, engaged and connected to opportunities.",
  "Soma zaidi kuhusu ofisi": "Read more about the office", "Nyaraka Mpya": "Latest Documents", "Nyaraka zote": "All documents",
  "Matukio Yajayo": "Upcoming Events", "Matukio yote": "All events", "Matangazo": "Announcements",
  "Sauti yako ni muhimu": "Your voice matters",
  "Wasilisha hoja, maoni au changamoto yako kupitia njia rasmi. Kila ujumbe hupokelewa na kufuatiliwa kwa mujibu wa taratibu husika.": "Submit your issue, feedback or challenge through official channels. Every message is received and followed up according to the relevant procedures.",
  "Viungo Muhimu": "Important Links", "Hakuna maudhui bado.": "No content yet.", "Pakua": "Download", "Tazama": "View",
  "Taarifa za shughuli za ofisi, mikutano na ushirikishwaji wa wadau.": "Updates on office activities, meetings and stakeholder engagement.",
  // Page heroes
  "Wanafunzi Kwanza": "Students First", "Elimu ya Juu na Wanafunzi": "Higher Education & Students",
  "Kitovu cha taarifa, ushirikishwaji na fursa kwa wanafunzi, wahitimu na taasisi za elimu ya juu Zanzibar.": "A hub of information, engagement and opportunities for students, graduates and higher-education institutions in Zanzibar.",
  "Elimu na Maendeleo": "Education & Development",
  "Fursa za ufadhili, mafunzo, utafiti, ubunifu, ujasiriamali na kazi zitakazothibitishwa na taasisi husika.": "Scholarships, internships, research, innovation, entrepreneurship and career opportunities verified by the relevant institutions.",
  "Taarifa kwa Umma": "Public Information",
  "Habari, taarifa, matukio, ziara, mikutano, hotuba na taarifa kwa vyombo vya habari.": "News, statements, events, visits, meetings, speeches and press releases.",
  "Ofisi": "Office",
  "Jukwaa la kitaasisi kwa uwakilishi, mawasiliano, ushirikishwaji na ufuatiliaji wa masuala ya wanafunzi na elimu ya juu Zanzibar.": "An institutional platform for representation, communication, engagement and follow-up on student and higher-education matters in Zanzibar.",
  "Uwajibikaji": "Accountability",
  "Maeneo ya kazi ya ofisi yamewasilishwa kwa kutofautisha uwakilishi wa kibunge na usaidizi wa mawasiliano unaofanywa na ofisi.": "The office's areas of work, distinguishing parliamentary representation from the communication support provided by the office.",
  "Ratiba": "Schedule", "Ratiba na kumbukumbu za mikutano, ziara na shughuli rasmi.": "Schedule and records of meetings, visits and official activities.",
  "Tumia njia rasmi kuwasiliana na ofisi kuhusu masuala ya wanafunzi na elimu ya juu.": "Use official channels to contact the office about student and higher-education matters.",
  "Wasifu Rasmi": "Official Profile", "Mbunge wa Vyuo na Vyuo Vikuu Zanzibar": "MP for Colleges and Universities Zanzibar",
  "Uongozi wa kitaaluma, afya ya umma, teknolojia ya taarifa za afya na utumishi wa umma.": "Academic leadership, public health, health informatics and public service.",
  "Utekelezaji": "Implementation",
  "Shughuli za elimu, vijana, ubunifu, utafiti, maendeleo ya wanafunzi na ushirikishwaji wa jamii.": "Activities in education, youth, innovation, research, student development and community engagement.",
  "Maktaba ya Kidijitali": "Digital Library",
  "Tafuta nyaraka kwa kichwa, aina na mwaka. Hakikisho na upakuaji utawezeshwa kwa kila nyaraka rasmi.": "Search documents by title, category and year, then view or download.",
  "Sera": "Policy", "Taarifa za faragha na matumizi ya tovuti.": "Privacy and website use information.",
  "Ujumbe Umepokelewa": "Message Received", "Asante kwa kuwasiliana na ofisi.": "Thank you for contacting the office.",
  "Ushirikishwaji wa Umma": "Public Engagement",
  "Tuma hoja, wasilisha maoni au changamoto, omba taarifa, au wasiliana na ofisi kupitia fomu rasmi.": "Submit an issue, feedback or challenge, request information, or contact the office through the official form.",
  "Kazi Yetu": "Our Work", "Tazama yote": "View all", "Historia ya Ofisi": "History of the Office",
  "Ofisi huwezesha uwakilishi na ushirikishwaji; haina mamlaka ya kiutendaji isipokuwa pale yanapotolewa rasmi na sheria au taratibu husika.": "The office facilitates representation and engagement; it holds no executive powers except where formally granted by law or procedure.",
  "Fursa kwa wanafunzi na vijana": "Opportunities for students and youth", "Tazama fursa": "View opportunities",
  // Search & lists
  "Utafutaji": "Search", "Tafuta kwenye tovuti": "Search the website", "Tafuta habari, nyaraka, matukio...": "Search news, documents, events...",
  "Aina zote": "All types", "Miaka yote": "All years", "Kategoria zote": "All categories", "Matokeo": "Results",
  "Hakuna matokeo yaliyopatikana.": "No results found.", "Iliyotangulia": "Previous", "Inayofuata": "Next",
  "Shiriki": "Share", "Habari Zinazohusiana": "Related News", "Rudi kwenye habari": "Back to news", "Nakili kiungo": "Copy link",
  "Mwisho wa maombi": "Application deadline", "Omba sasa": "Apply now", "Mahali": "Location", "Tangazo": "Announcement",
  "Chapisho": "Publication", "Tukio": "Event", "Nyaraka ": "Document", "Video mpya ya YouTube": "New YouTube video",
  "Anwani ya Ofisi": "Office Address", "Namba ya Simu": "Phone Number", "Barua Pepe ya Ofisi": "Office Email",
  "Inasubiri uthibitisho": "Pending verification", "Tuma ujumbe rasmi": "Send an official message", "Fungua fomu": "Open form",
};

export function translate(language: Language, text: string) {
  return language === "en" ? phrases[text] ?? text : text;
}

type Ctx = { language: Language; setLanguage: (value: Language) => void; tr: (text: string) => string; pick: (sw?: string | null, en?: string | null) => string };
const LanguageContext = createContext<Ctx>({ language: "sw", setLanguage: () => undefined, tr: (t) => t, pick: (sw) => sw ?? "" });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>("sw");
  useEffect(() => {
    const saved = window.localStorage.getItem("site-language");
    if (saved === "en" || saved === "sw") setLang(saved);
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const setLanguage = useCallback((value: Language) => { setLang(value); window.localStorage.setItem("site-language", value); }, []);
  const tr = useCallback((text: string) => translate(language, text), [language]);
  const pick = useCallback((sw?: string | null, en?: string | null) => (language === "en" && en ? en : sw || en || ""), [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, tr, pick }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
