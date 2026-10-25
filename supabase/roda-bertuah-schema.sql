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

-- 6. Nama pendek: roda hanya papar nama tanpa "BIN / BINTI / BT / BTE / B. / A/L / A/P" dan nama bapa.
create or replace function public.nama_pendek(p_nama text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(nullif(btrim(regexp_replace(
    p_nama,
    '\s+(BINTI|BINTE|BIN|BTE|BT\.?|B\.|B|A\s*/\s*L|A\s*/\s*P)(\s.*)?$',
    '', 'i')), ''), btrim(p_nama));
$$;

-- Nama bapa (perkataan pertama selepas BIN/BINTI), untuk bezakan nama pendek yang sama.
create or replace function public.nama_bapa(p_nama text)
returns text language sql immutable set search_path = '' as $$
  select (regexp_match(p_nama, '\s(?:BINTI|BINTE|BIN|BTE|BT\.?|B\.|B|A\s*/\s*L|A\s*/\s*P)\s+([^\s]+)', 'i'))[1];
$$;

alter table public.murid
  add column nama_pendek text generated always as (public.nama_pendek(nama)) stored;

-- Roda awam hanya terima nama pendek. Jika dua murid dalam kelas & jantina yang sama
-- ada nama pendek yang sama, nama bapa ditambah dalam kurungan, contoh "AHMAD (ALI)".
create or replace function public.senarai_roda()
returns table (id bigint, nama text, jantina text, kelas text)
language sql stable security definer set search_path = '' as $$
  select m.id,
    case when count(*) over (partition by m.jantina, m.kelas, upper(m.nama_pendek)) > 1
              and public.nama_bapa(m.nama) is not null
         then m.nama_pendek || ' (' || public.nama_bapa(m.nama) || ')'
         else m.nama_pendek end,
    m.jantina, m.kelas
  from public.murid m
  order by m.jantina, m.kelas, m.nama_pendek;
$$;
revoke execute on function public.senarai_roda() from public;
grant execute on function public.senarai_roda() to anon, authenticated;

-- 7. Upload Excel terus dari halaman roda, dilindungi kata laluan (upload pertama mencipta kata laluan).
create extension if not exists pgcrypto with schema extensions;

create table public.tetapan (
  kunci text primary key,
  nilai text not null
);
alter table public.tetapan enable row level security;
revoke all on public.tetapan from anon, authenticated;

-- Logik masuk nama (dikongsi oleh import_murid dan upload_nama). Tidak boleh dipanggil terus.
create or replace function public.masuk_murid(p_senarai jsonb)
returns table (ditambah int, diabaikan int)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_jumlah int;
  v_tambah int;
begin
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
revoke execute on function public.masuk_murid(jsonb) from public, anon, authenticated;

create or replace function public.import_murid(p_senarai jsonb)
returns table (ditambah int, diabaikan int)
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'BUKAN_ADMIN' using errcode = '42501';
  end if;
  return query select * from public.masuk_murid(p_senarai);
end;
$$;

create or replace function public.ada_kata_laluan()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.tetapan where kunci = 'kata_laluan_upload');
$$;
revoke execute on function public.ada_kata_laluan() from public;
grant execute on function public.ada_kata_laluan() to anon, authenticated;

create or replace function public.upload_nama(p_kata_laluan text, p_senarai jsonb, p_ganti boolean default false)
returns table (ditambah int, diabaikan int)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_hash text;
begin
  select nilai into v_hash from public.tetapan where kunci = 'kata_laluan_upload';
  if v_hash is null then
    if char_length(coalesce(p_kata_laluan, '')) < 4 then
      raise exception 'KATA_LALUAN_PENDEK' using errcode = 'P0001';
    end if;
    insert into public.tetapan (kunci, nilai)
    values ('kata_laluan_upload', extensions.crypt(p_kata_laluan, extensions.gen_salt('bf', 8)))
    on conflict (kunci) do nothing;
    select nilai into v_hash from public.tetapan where kunci = 'kata_laluan_upload';
  end if;
  if v_hash is distinct from extensions.crypt(coalesce(p_kata_laluan, ''), v_hash) then
    raise exception 'KATA_LALUAN_SALAH' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_senarai) is distinct from 'array' or jsonb_array_length(p_senarai) > 5000 then
    raise exception 'DATA_TIDAK_SAH' using errcode = 'P0001';
  end if;
  if p_ganti then
    delete from public.murid where true;
  end if;
  return query select * from public.masuk_murid(p_senarai);
end;
$$;
revoke execute on function public.upload_nama(text, jsonb, boolean) from public;
grant execute on function public.upload_nama(text, jsonb, boolean) to anon, authenticated;
