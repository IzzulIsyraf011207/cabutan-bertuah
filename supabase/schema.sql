-- Cabutan Bertuah: skema database Supabase
-- Projek: Cabutan Bertuah (scxpyfvdhcjalsedasel)

-- 1. Jadual peserta. Orang awam TIDAK boleh baca terus (IC & alamat ialah data peribadi).
create table public.peserta (
  id bigint generated always as identity primary key,
  nombor_bertuah text not null unique,
  nama text not null check (char_length(btrim(nama)) between 2 and 120),
  no_ic text not null unique check (no_ic ~ '^[0-9]{12}$'),
  no_telefon text not null check (no_telefon ~ '^\+?[0-9]{9,14}$'),
  alamat text not null check (char_length(btrim(alamat)) between 5 and 500),
  menang boolean not null default false,
  hadiah text,
  menang_pada timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.peserta is 'Senarai peserta cabutan bertuah dan nombor bertuah masing-masing.';

alter table public.peserta enable row level security;

-- 2. Senarai emel admin yang boleh lihat, cetak dan buat cabutan.
create table public.admin (
  email text primary key check (email = lower(email))
);

alter table public.admin enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Lapisan tambahan: orang awam tiada akses terus langsung; admin hanya baca & kemaskini.
revoke all on public.peserta, public.admin from anon;
revoke insert, delete, truncate on public.peserta, public.admin from authenticated;
revoke update on public.admin from authenticated;

create policy "Admin boleh lihat peserta"
  on public.peserta for select to authenticated
  using ((select public.is_admin()));

create policy "Admin boleh kemaskini pemenang"
  on public.peserta for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin boleh lihat senarai admin"
  on public.admin for select to authenticated
  using ((select public.is_admin()));

-- 3. Daftar peserta + jana nombor bertuah unik di server.
--    Orang awam hanya boleh guna fungsi ini (tidak boleh insert/baca jadual terus).
create or replace function public.daftar_peserta(
  p_nama text,
  p_no_ic text,
  p_no_telefon text,
  p_alamat text
)
returns table (nombor_bertuah text, nama text, created_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_ic text := regexp_replace(coalesce(p_no_ic, ''), '[^0-9]', '', 'g');
  v_tel text := regexp_replace(coalesce(p_no_telefon, ''), '[^0-9+]', '', 'g');
  v_nama text := regexp_replace(btrim(coalesce(p_nama, '')), '\s+', ' ', 'g');
  v_alamat text := btrim(coalesce(p_alamat, ''));
  v_jumlah bigint;
  v_min bigint := 1000;
  v_max bigint := 9999;
  v_nombor text;
  v_cubaan int := 0;
begin
  if char_length(v_nama) < 2 then
    raise exception 'NAMA_TIDAK_SAH' using errcode = 'P0001';
  end if;
  if v_ic !~ '^[0-9]{12}$' then
    raise exception 'IC_TIDAK_SAH' using errcode = 'P0001';
  end if;
  if v_tel !~ '^\+?[0-9]{9,14}$' then
    raise exception 'TELEFON_TIDAK_SAH' using errcode = 'P0001';
  end if;
  if char_length(v_alamat) < 5 then
    raise exception 'ALAMAT_TIDAK_SAH' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.peserta p where p.no_ic = v_ic) then
    raise exception 'IC_SUDAH_DAFTAR' using errcode = 'P0001';
  end if;

  -- Tiada had peserta: mula 4 digit, tambah 1 digit setiap kali julat 60% penuh
  -- (4 digit ~5,400 peserta, 5 digit ~54,000, 6 digit ~540,000, dan seterusnya).
  select count(*) into v_jumlah from public.peserta;
  while v_jumlah >= (v_max - v_min + 1) * 6 / 10 loop
    v_min := v_min * 10;
    v_max := v_max * 10 + 9;
  end loop;

  loop
    v_cubaan := v_cubaan + 1;
    v_nombor := (v_min + floor(random() * (v_max - v_min + 1))::bigint)::text;
    begin
      return query
        insert into public.peserta as p (nombor_bertuah, nama, no_ic, no_telefon, alamat)
        values (v_nombor, v_nama, v_ic, v_tel, v_alamat)
        returning p.nombor_bertuah, p.nama, p.created_at;
      return;
    exception when unique_violation then
      -- IC didaftar serentak oleh orang lain, atau nombor dah wujud: cuba nombor lain.
      if exists (select 1 from public.peserta p where p.no_ic = v_ic) then
        raise exception 'IC_SUDAH_DAFTAR' using errcode = 'P0001';
      end if;
      if v_cubaan >= 50 then
        -- Sangat jarang: naik satu digit dan cuba lagi daripada gagal.
        v_min := v_min * 10;
        v_max := v_max * 10 + 9;
        v_cubaan := 0;
      end if;
    end;
  end loop;
end;
$$;

revoke execute on function public.daftar_peserta(text, text, text, text) from public;
grant execute on function public.daftar_peserta(text, text, text, text) to anon, authenticated;

-- 4. Paparan senarai untuk dicetak / dieksport dari Supabase (ikut RLS pengguna).
create view public.senarai_cetak
with (security_invoker = true)
as
select
  p.nombor_bertuah as "Nombor Bertuah",
  p.nama as "Nama",
  substr(p.no_ic, 1, 6) || '-' || substr(p.no_ic, 7, 2) || '-' || substr(p.no_ic, 9, 4) as "No. IC",
  p.no_telefon as "No. Telefon",
  p.alamat as "Alamat",
  case when p.menang then 'MENANG' || coalesce(' - ' || p.hadiah, '') else '' end as "Status",
  to_char(p.created_at at time zone 'Asia/Kuala_Lumpur', 'DD/MM/YYYY HH24:MI') as "Tarikh Daftar"
from public.peserta p
order by char_length(p.nombor_bertuah), p.nombor_bertuah;

revoke all on public.senarai_cetak from anon;

-- 5. Admin pertama (tukar kepada emel admin anda, huruf kecil).
insert into public.admin (email) values ('emel-admin@contoh.com');

-- 6. Senarai untuk roda cabutan (awam, tanpa log masuk): nombor + nama sahaja.
--    IC, telefon dan alamat TIDAK didedahkan.
create or replace function public.senarai_roda()
returns table (nombor_bertuah text, nama text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.nombor_bertuah, p.nama
  from public.peserta p
  order by char_length(p.nombor_bertuah), p.nombor_bertuah;
$$;

revoke execute on function public.senarai_roda() from public;
grant execute on function public.senarai_roda() to anon, authenticated;

-- 7. Admin boleh padam peserta (pilih satu-satu atau semua) dari admin.html.
grant delete on public.peserta to authenticated;

create policy "Admin boleh padam peserta"
  on public.peserta for delete to authenticated
  using ((select public.is_admin()));
