CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND (role = _role OR role = 'super_admin')) $$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin','editor')) $$;
INSERT INTO public.user_roles(user_id, role) VALUES ('2567284d-22c1-421c-ac2f-bb07dfe2151b','super_admin') ON CONFLICT (user_id, role) DO NOTHING;