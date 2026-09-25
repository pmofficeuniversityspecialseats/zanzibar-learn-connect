ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id text;
CREATE UNIQUE INDEX IF NOT EXISTS content_items_external_id_key ON public.content_items(external_id);
CREATE INDEX IF NOT EXISTS content_items_kind_status_idx ON public.content_items(kind, status, published_at DESC);

DROP POLICY IF EXISTS "Public reads published content" ON public.content_items;
CREATE POLICY "Public reads published content" ON public.content_items FOR SELECT TO anon, authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  public_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video','document')),
  mime_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads media" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage media" ON public.media_assets FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.slider_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_sw text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  caption_sw text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  link_url text,
  duration_seconds integer NOT NULL DEFAULT 6 CHECK (duration_seconds BETWEEN 2 AND 60),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.slider_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.slider_items TO authenticated;
GRANT ALL ON public.slider_items TO service_role;
ALTER TABLE public.slider_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active slides" ON public.slider_items FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage slides" ON public.slider_items FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.important_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_sw text NOT NULL,
  title_en text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.important_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.important_links TO authenticated;
GRANT ALL ON public.important_links TO service_role;
ALTER TABLE public.important_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active links" ON public.important_links FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "Admins manage links" ON public.important_links FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active socials" ON public.social_links FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "Admins manage socials" ON public.social_links FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('page_view','content_view','download')),
  path text NOT NULL DEFAULT '/',
  content_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone records events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (char_length(path) <= 300);
CREATE POLICY "Staff read events" ON public.analytics_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX analytics_events_created_idx ON public.analytics_events(created_at DESC);

CREATE TRIGGER media_audit AFTER INSERT OR UPDATE OR DELETE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
CREATE TRIGGER slider_audit AFTER INSERT OR UPDATE OR DELETE ON public.slider_items FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
CREATE TRIGGER links_audit AFTER INSERT OR UPDATE OR DELETE ON public.important_links FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
CREATE TRIGGER socials_audit AFTER INSERT OR UPDATE OR DELETE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();

INSERT INTO public.important_links (title_sw, title_en, url, sort_order) VALUES
 ('Bunge la Tanzania','Parliament of Tanzania','https://www.parliament.go.tz',1),
 ('Wizara ya Elimu, Sayansi na Teknolojia','Ministry of Education','https://www.moe.go.tz',2),
 ('Jamhuri ya Muungano wa Tanzania','United Republic of Tanzania','https://www.tanzania.go.tz',3),
 ('IPU – Inter-Parliamentary Union','IPU – Inter-Parliamentary Union','https://www.ipu.org',4);
INSERT INTO public.social_links (platform, url, sort_order) VALUES
 ('instagram','https://www.instagram.com/ofisi.mbungevyuovikuu_zanzibar',1),
 ('tiktok','https://www.tiktok.com/@ofisimbungevyuovi',2),
 ('youtube','https://youtube.com/@ofisi.mbungevyuovikuu.zanzibar',3),
 ('facebook','https://www.facebook.com/share/1ByU6vSWrS/',4),
 ('threads','https://www.threads.com/@ofisi.mbungevyuovikuu_zanzibar',5);
INSERT INTO public.site_settings (key, value) VALUES
 ('general', '{"site_name_sw":"Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar","site_name_en":"Office of the MP for Colleges and Universities Zanzibar","email":"","phone":"","address":"","hours_sw":"Jumatatu – Ijumaa: 2:00 Asubuhi – 9:30 Mchana","hours_en":"Monday – Friday: 8:00 AM – 3:30 PM","seo_description":"Tovuti rasmi ya Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar."}'::jsonb),
 ('homepage', '{"show_slider":true,"show_news":true,"show_documents":true,"show_events":true,"show_announcements":true,"show_links":true,"show_social":true,"slide_duration":6,"feed_mode":"both"}'::jsonb),
 ('youtube', '{"channel_id":"UCw0xQK4XR4KSsKARMN-Qbrw","last_sync":null}'::jsonb);