-- ENUMS
CREATE TYPE public.project_type AS ENUM ('landing_page','site_institucional','ecommerce','pagina_campanha','sistema_web','manutencao','outro');
CREATE TYPE public.project_status AS ENUM ('orcamento','aguardando_aprovacao','aguardando_informacoes','em_desenvolvimento','em_revisao','ajustes','pronto','publicado','concluido','cancelado');
CREATE TYPE public.production_status AS ENUM ('nao_iniciado','desenvolvimento','preview','em_producao');
CREATE TYPE public.financial_status AS ENUM ('nao_faturado','aguardando_pagamento','parcialmente_pago','pago','atrasado');
CREATE TYPE public.maintenance_type AS ENUM ('correcao_bug','alteracao_conteudo','alteracao_visual','alteracao_layout','integracao','configuracao_dominio','hospedagem','seo_tecnico','performance','atualizacao','outro');
CREATE TYPE public.maintenance_status AS ENUM ('solicitada','aguardando_informacoes','em_andamento','aguardando_aprovacao','concluida','cancelada');
CREATE TYPE public.payment_method AS ENUM ('pix','transferencia','dinheiro','cartao','boleto','outro');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CLIENTS
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  document TEXT,
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own clients" ON public.clients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX clients_user_idx ON public.clients(user_id);

-- SERVICES
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  category TEXT,
  default_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'projeto',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own services" ON public.services FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX services_user_idx ON public.services(user_id);

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type public.project_type NOT NULL DEFAULT 'landing_page',
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  contracted_at DATE,
  due_date DATE,
  delivered_at DATE,
  status public.project_status NOT NULL DEFAULT 'orcamento',
  production_status public.production_status NOT NULL DEFAULT 'nao_iniciado',
  financial_status public.financial_status NOT NULL DEFAULT 'nao_faturado',
  domain TEXT,
  production_url TEXT,
  preview_url TEXT,
  repository_url TEXT,
  hosting TEXT,
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects" ON public.projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX projects_user_idx ON public.projects(user_id);
CREATE INDEX projects_client_idx ON public.projects(client_id);

-- MAINTENANCE
CREATE TABLE public.maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type public.maintenance_type NOT NULL DEFAULT 'outro',
  description TEXT,
  requested_at DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_at DATE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.maintenance_status NOT NULL DEFAULT 'solicitada',
  financial_status public.financial_status NOT NULL DEFAULT 'nao_faturado',
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance TO authenticated;
GRANT ALL ON public.maintenance TO service_role;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own maintenance" ON public.maintenance FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER maintenance_updated_at BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX maintenance_user_idx ON public.maintenance(user_id);

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  maintenance_id UUID REFERENCES public.maintenance(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  paid_at DATE NOT NULL DEFAULT CURRENT_DATE,
  method public.payment_method NOT NULL DEFAULT 'pix',
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments" ON public.payments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX payments_user_idx ON public.payments(user_id);
CREATE INDEX payments_project_idx ON public.payments(project_id);

-- PROJECT HISTORY
CREATE TABLE public.project_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  maintenance_id UUID REFERENCES public.maintenance(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_history TO authenticated;
GRANT ALL ON public.project_history TO service_role;
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.project_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX history_project_idx ON public.project_history(project_id);

-- HISTORY TRIGGERS
CREATE OR REPLACE FUNCTION public.log_project_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_history (user_id, project_id, event, detail)
    VALUES (NEW.user_id, NEW.id, 'projeto_criado', NEW.name);
  ELSE
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.project_history (user_id, project_id, event, detail)
      VALUES (NEW.user_id, NEW.id, 'status_alterado', OLD.status::text || ' -> ' || NEW.status::text);
    END IF;
    IF NEW.production_status IS DISTINCT FROM OLD.production_status THEN
      INSERT INTO public.project_history (user_id, project_id, event, detail)
      VALUES (NEW.user_id, NEW.id, 'producao_alterada', OLD.production_status::text || ' -> ' || NEW.production_status::text);
    END IF;
    IF NEW.financial_status IS DISTINCT FROM OLD.financial_status THEN
      INSERT INTO public.project_history (user_id, project_id, event, detail)
      VALUES (NEW.user_id, NEW.id, 'financeiro_alterado', OLD.financial_status::text || ' -> ' || NEW.financial_status::text);
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER projects_history_ins AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_event();
CREATE TRIGGER projects_history_upd AFTER UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_event();

CREATE OR REPLACE FUNCTION public.log_payment_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.project_history (user_id, project_id, maintenance_id, event, detail)
  VALUES (NEW.user_id, NEW.project_id, NEW.maintenance_id, 'pagamento_registrado', to_char(NEW.amount, 'FM999999990.00'));
  RETURN NEW;
END; $$;
CREATE TRIGGER payments_history_ins AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.log_payment_event();

-- DEMO DATA (per authenticated user, on demand)
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  c1 UUID; c2 UUID; s1 UUID; s2 UUID; p1 UUID; p2 UUID; p3 UUID; m1 UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.clients WHERE user_id = uid AND is_demo) THEN RETURN; END IF;

  INSERT INTO public.clients (user_id, name, contact_name, email, phone, whatsapp, notes, is_demo)
  VALUES (uid, 'Agência Exemplo', 'Marina Souza', 'contato@agenciaexemplo.com.br', '(11) 4002-8922', '(11) 99999-0001', 'Cliente de demonstração', true)
  RETURNING id INTO c1;
  INSERT INTO public.clients (user_id, name, contact_name, email, whatsapp, notes, is_demo)
  VALUES (uid, 'Clínica Vita', 'Dr. Paulo Lima', 'contato@clinicavita.com.br', '(11) 98888-0002', 'Cliente de demonstração', true)
  RETURNING id INTO c2;

  INSERT INTO public.services (user_id, name, category, default_price, unit, description, is_demo)
  VALUES (uid, 'Landing Page', 'Criação', 200.00, 'projeto', 'Página única de conversão', true) RETURNING id INTO s1;
  INSERT INTO public.services (user_id, name, category, default_price, unit, description, is_demo)
  VALUES (uid, 'Manutenção simples', 'Manutenção', 100.00, 'hora', 'Ajustes rápidos em sites existentes', true) RETURNING id INTO s2;
  INSERT INTO public.services (user_id, name, category, default_price, unit, description, is_demo)
  VALUES (uid, 'Site Institucional', 'Criação', 500.00, 'projeto', 'Site com múltiplas páginas', true);

  INSERT INTO public.projects (user_id, client_id, service_id, name, type, description, amount, contracted_at, due_date, status, production_status, financial_status, is_demo)
  VALUES (uid, c2, s1, 'Landing Page Clínica X', 'landing_page', 'Página de captação de pacientes', 200.00, CURRENT_DATE - 20, CURRENT_DATE + 5, 'em_revisao', 'preview', 'pago', true) RETURNING id INTO p1;
  INSERT INTO public.projects (user_id, client_id, service_id, name, type, description, amount, contracted_at, due_date, status, production_status, financial_status, is_demo)
  VALUES (uid, c1, s1, 'Landing Page Empresa Y', 'landing_page', 'Campanha de lançamento', 200.00, CURRENT_DATE - 12, CURRENT_DATE + 12, 'publicado', 'em_producao', 'aguardando_pagamento', true) RETURNING id INTO p2;
  INSERT INTO public.projects (user_id, client_id, name, type, description, amount, contracted_at, due_date, status, production_status, financial_status, is_demo)
  VALUES (uid, c1, 'Site Institucional Z', 'site_institucional', 'Site com 5 páginas', 500.00, CURRENT_DATE - 40, CURRENT_DATE - 3, 'ajustes', 'preview', 'parcialmente_pago', true) RETURNING id INTO p3;

  INSERT INTO public.payments (user_id, project_id, amount, paid_at, method, notes, is_demo)
  VALUES (uid, p1, 200.00, CURRENT_DATE - 10, 'pix', 'Pagamento integral', true),
         (uid, p3, 250.00, CURRENT_DATE - 30, 'transferencia', 'Entrada 50%', true);

  INSERT INTO public.maintenance (user_id, client_id, project_id, service_id, title, type, description, requested_at, due_date, amount, status, financial_status, is_demo)
  VALUES (uid, c1, p3, s2, 'Correção de formulário', 'correcao_bug', 'Formulário de contato não enviava e-mails', CURRENT_DATE - 5, CURRENT_DATE + 2, 100.00, 'em_andamento', 'aguardando_pagamento', true) RETURNING id INTO m1;
END; $$;
REVOKE ALL ON FUNCTION public.seed_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;

CREATE OR REPLACE FUNCTION public.clear_demo_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  DELETE FROM public.payments WHERE user_id = uid AND is_demo;
  DELETE FROM public.maintenance WHERE user_id = uid AND is_demo;
  DELETE FROM public.projects WHERE user_id = uid AND is_demo;
  DELETE FROM public.services WHERE user_id = uid AND is_demo;
  DELETE FROM public.clients WHERE user_id = uid AND is_demo;
END; $$;
REVOKE ALL ON FUNCTION public.clear_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_demo_data() TO authenticated;