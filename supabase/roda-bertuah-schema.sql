-- Roda Bertuah: skema database Supabase
-- Projek: Roda Bertuah (pieguphzlymuajyzpnmx) — BERASINGAN daripada projek Cabutan Bertuah.

-- 1. Senarai nama untuk roda (nama, jantina, kelas sahaja).
create table public.murid (
  id bigint generated always as identity primary key,
  nama text not null check (char_length(btrim(nama)) between 1 and 160),
  jantina text not null check (jantina in ('L', 'P')),
  kelas text not null check (char_length(btrim(kelas)) between 1 and 60),
  created_at timestamptz not null default now()
);
create unique index murid_unik on public.murid (jantina, upper(kelas), upper(nama));
comment on table public.murid is 'Nama untuk roda bertuah, diasingkan ikut jantina dan kelas.';
alter table public.murid enable row level security;

-- 2. Senarai emel admin yang boleh import / padam nama.
create table public.admin (
  email text primary key check (email = lower(email))
);
alter table public.admin enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on public.murid, public.admin from anon;
revoke truncate on public.murid from authenticated;
revoke insert, update, delete, truncate on public.admin from authenticated;

create policy "Admin lihat murid" on public.murid for select to authenticated using ((select public.is_admin()));
create policy "Admin tambah murid" on public.murid for insert to authenticated with check ((select public.is_admin()));
create policy "Admin kemaskini murid" on public.murid for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin padam murid" on public.murid for delete to authenticated using ((select public.is_admin()));
create policy "Admin lihat senarai admin" on public.admin for select to authenticated using ((select public.is_admin()));

-- 3. Import dari Excel: tambah banyak nama sekali gus, nama berulang (jantina+kelas+nama sama) diabaikan.
create or replace function public.import_murid(p_senarai jsonb)
returns table (ditambah int, diabaikan int)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_jumlah int;
  v_tambah int;
begin
  if not public.is_admin() then
    raise exception 'BUKAN_ADMIN' using errcode = '42501';
  end if;
  select count(*) into v_jumlah from jsonb_array_elements(p_senarai);
  with baris as (
    select
      regexp_replace(btrim(e ->> 'nama'), '\s+', ' ', 'g') as nama,
      upper(left(btrim(e ->> 'jantina'), 1)) as jantina,
      regexp_replace(upper(btrim(e ->> 'kelas')), '\s+', ' ', 'g') as kelas
    from jsonb_array_elements(p_senarai) e
  ), masuk as (
    insert into public.murid (nama, jantina, kelas)
    select distinct on (b.jantina, b.kelas, upper(b.nama)) b.nama, b.jantina, b.kelas
    from baris b
    where coalesce(b.nama, '') <> '' and b.jantina in ('L', 'P') and coalesce(b.kelas, '') <> ''
    on conflict do nothing
    returning 1
  )
  select count(*) into v_tambah from masuk;
  return query select v_tambah, v_jumlah - v_tambah;
end;
$$;
revoke execute on function public.import_murid(jsonb) from public, anon;
grant execute on function public.import_murid(jsonb) to authenticated;

-- 4. Senarai untuk roda (awam, tanpa log masuk): nama, jantina, kelas sahaja.
create or replace function public.senarai_roda()
returns table (id bigint, nama text, jantina text, kelas text)
language sql stable security definer set search_path = '' as $$
  select m.id, m.nama, m.jantina, m.kelas
  from public.murid m
  order by m.jantina, m.kelas, m.nama;
$$;
revoke execute on function public.senarai_roda() from public;
grant execute on function public.senarai_roda() to anon, authenticated;

-- 5. Admin pertama.
insert into public.admin (email) values ('izzulmedia01@gmail.com');
