CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'reviewer');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.submission_status AS ENUM ('new', 'in_review', 'closed');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  job_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE INDEX user_roles_user_id_idx ON public.user_roles(user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('news','event','project','document','opportunity','announcement','page')),
  slug text NOT NULL UNIQUE,
  title_sw text NOT NULL,
  title_en text NOT NULL,
  summary_sw text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  body_sw text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  image_url text,
  document_url text,
  organization text,
  location text,
  deadline date,
  event_date timestamptz,
  file_size text,
  project_status text CHECK (project_status IS NULL OR project_status IN ('planned','ongoing','completed')),
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX content_items_public_idx ON public.content_items(kind, status, published_at DESC);
CREATE POLICY "Public reads published content" ON public.content_items FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Editors manage content" ON public.content_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TABLE public.public_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  submission_type text NOT NULL CHECK (submission_type IN ('issue','feedback','challenge','information','contact')),
  full_name text NOT NULL,
  email text,
  phone text,
  institution text,
  subject text NOT NULL,
  message text NOT NULL,
  attachment_path text,
  consent boolean NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'new',
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.public_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.public_submissions TO authenticated;
GRANT ALL ON public.public_submissions TO service_role;
ALTER TABLE public.public_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public submits messages" ON public.public_submissions FOR INSERT TO anon, authenticated WITH CHECK (consent = true AND status = 'new' AND internal_notes IS NULL);
CREATE POLICY "Reviewers read submissions" ON public.public_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Reviewers update submissions" ON public.public_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));

CREATE TABLE public.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX audit_logs_created_idx ON public.audit_logs(created_at DESC);
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.capture_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id)::text, CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END, CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END);
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER content_items_audit AFTER INSERT OR UPDATE OR DELETE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
CREATE TRIGGER submissions_audit AFTER UPDATE OR DELETE ON public.public_submissions FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
CREATE TRIGGER roles_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();