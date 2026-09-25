# Maboresho Makubwa: Website + Mfumo wa Usimamizi (CMS)

## 1. Marekebisho ya Haraka
- Kuondoa "Ofisi Rasmi" kwenye kichwa; kubaki "Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar".
- Baada ya "Jamhuri ya Muungano wa Tanzania" kuweka "Ofisi ya Mbunge Viti Maalumu Vyuo na Vyuo Vikuu Zanzibar".
- Saa za kazi: Jumatatu–Ijumaa, 2:00 asubuhi – 9:30 mchana.
- Kukupa mamlaka ya msimamizi mkuu (pmoffice.universityspecialseats@gmail.com).
- Kurekebisha fomu ya kuingia ili nenosiri lisionekane tena kwenye anwani ya kivinjari.

## 2. Lugha Mbili Zinazofanya Kazi Kweli
- Kubofya SW/EN kubadilisha menyu, vitufe, vichwa, fomu, ujumbe wa mfumo na maudhui makuu.
- Chaguo la lugha kuhifadhiwa kwa mtumiaji.
- Habari, nyaraka, matukio na fursa kuonyesha toleo la lugha iliyochaguliwa (Kiswahili kikitumika pale Kiingereza hakijawekwa).

## 3. Ukurasa wa Mwanzo Unaobadilika
- Slider kubwa inayozunguka yenyewe: habari, picha na video zilizowekwa alama "Featured".
- Msimamizi anachagua muda wa kila slide, mpangilio, na active/inactive.
- Sehemu za mwanzo (habari mpya, nyaraka, matukio, matangazo, viungo muhimu, mitandao ya kijamii) kuwashwa/kuzimwa kutoka dashibodi.
- Mpangilio: Habari → Taarifa rasmi → Nyaraka → Matukio → Shiriki Nasi → Viungo Muhimu → Mitandao.

## 4. Dashibodi ya Msimamizi
- **Muhtasari:** jumla ya habari, zilizochapishwa, rasimu, nyaraka, media, featured, shughuli za karibuni, upakiaji wa haraka.
- **Habari/Matukio/Fursa/Matangazo:** kuunda, kuhariri, kufuta, rasimu, kuchapisha/kuondoa, kupanga tarehe ya kuchapisha, featured, kategoria, tagi, mahali, mwandishi, picha nyingi, video, mhariri wa maandishi (bold, vichwa, orodha, viungo), hakikisho kabla ya kuchapisha, utafutaji, vichujio na kurasa.
- **Media:** kupakia picha/video/nyaraka nyingi kwa wakati mmoja zikionyesha maendeleo, hakikisho, kubadili jina, kufuta, kutafuta, kuchuja kwa aina, featured.
- **Nyaraka:** kichwa, maelezo (SW/EN), kategoria (Ripoti, Barua Rasmi, Taarifa, Hotuba, Machapisho, Sera, Fomu, Nyinginezo), tarehe, faili, hali ya kuchapishwa, kupakua.
- **Viungo Muhimu:** Bunge la Tanzania, Wizara ya Elimu, Jamhuri ya Muungano wa Tanzania, IPU — kuongeza, kuhariri, kufuta, kupanga, kuwasha/kuzima.
- **Mitandao ya Kijamii:** Instagram, TikTok, YouTube, Facebook, Threads (viungo ulivyotoa) — vinavyoweza kubadilishwa.
- **Mawasilisho ya Umma:** kusoma na kubadili hali (mpya/inashughulikiwa/imefungwa).
- **Mipangilio:** jina la tovuti, mawasiliano, barua pepe, simu, anwani, saa za kazi, lugha, slider, SEO, chanzo cha habari (Manual / Social Feed / Zote).
- **Watumiaji na Majukumu:** admin, mhariri, mkaguzi.
- **Takwimu:** kutazamwa kwa kurasa, habari zinazosomwa zaidi, nyaraka zinazopakuliwa zaidi — bila kuhifadhi taarifa binafsi za wageni.
- **Kumbukumbu ya shughuli** kwa kila mabadiliko.
- Dashibodi itafanya kazi vizuri kwenye simu pia.

## 5. Habari Kutoka Mitandao ya Kijamii
- **YouTube:** video mpya za chaneli ya ofisi zitaletwa zenyewe kupitia feed rasmi ya umma, kisha kuonekana kama habari (kila saa au msimamizi akibofya "Sasisha").
- **Instagram, Facebook, Threads, TikTok:** hizi hazina njia rasmi ya bure ya kuleta machapisho bila akaunti ya developer na token kutoka Meta/TikTok. Zitawekwa kama viungo na sehemu ya "Tufuate", na mfumo utaandaliwa kupokea token baadaye. Hakutakuwa na scraping.
- Feed ikishindwa, tovuti itaendelea kufanya kazi na habari za kupakiwa kwa mkono.

## 6. Utafutaji wa Tovuti Nzima
- Kitufe cha utafutaji kwenye kichwa kinafungua ukurasa wa matokeo yaliyopangwa: Habari, Nyaraka, Matukio, Matangazo, Machapisho, pamoja na vichujio.

## 7. Majaribio Kabla ya Kukamilisha
Kuingia kama admin, kuunda/kuhariri/kufuta/kuchapisha habari, kupakia picha, video na nyaraka, slider, featured, utafutaji, SW/EN, viungo vya mitandao na viungo muhimu, simu na kompyuta, ulinzi wa ruhusa na makosa.

## Maelezo ya Kiufundi
- Jedwali jipya: site_settings, media_assets, slider_items, important_links, social_links, content_media, page_views, document_downloads; kupanua content_items (tags, author, location, is_featured, scheduled publish, video_url, gallery). Kila jedwali lina RLS + GRANT, na ukaguzi wa has_role().
- Hifadhi: bucket ya umma "site-media" (picha ≤10MB, video ≤100MB, PDF/DOCX ≤25MB) yenye ruhusa za kupakia kwa editor/admin pekee.
- Uchapishaji wa ratiba: sera ya kusoma inahitaji `published_at <= now()`.
- YouTube: server route inayosoma RSS ya chaneli na kuhifadhi kwenye content_items (source='youtube'), ikiitwa na pg_cron kila saa.
- Lugha: kamusi ya tafsiri + localStorage; maudhui ya DB kutumia sehemu za _sw/_en.
- Mhariri wa maandishi: TipTap; HTML husafishwa kabla ya kuonyeshwa.
