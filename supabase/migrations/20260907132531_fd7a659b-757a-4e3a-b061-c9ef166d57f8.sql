REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_project_event() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_payment_event() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seed_demo_data() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.clear_demo_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_demo_data() TO authenticated;