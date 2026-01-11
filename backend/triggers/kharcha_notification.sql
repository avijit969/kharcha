-- Enable the pg_net extension to make HTTP requests
create extension if not exists pg_net;

-- Create a function to handle the new kharcha insertion
create or replace function public.handle_new_kharcha()
returns trigger as $$
begin
  -- Make an HTTP POST request to your API endpoint
  -- Replace 'YOUR_API_ENDPOINT' with your actual API URL (e.g., Supabase Edge Function URL)
  perform net.http_post(
    url := 'https://your-api-domain.com/api/notifications/new-kharcha', 
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'kharcha_id', new.id,
      'name', new.name,
      'amount', new.amount,
      'khata_id', new.khata_id,
      'created_by', new.created_by
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger to fire after a new kharcha is inserted
create trigger on_kharcha_created
after insert on public.kharcha
for each row execute procedure public.handle_new_kharcha();
