-- ========================================================
-- SCRIPT SQL SUPABASE: TABEL TEKNISI & TRANSAKSI PART
-- Salin dan Jalankan di Dashboard Supabase -> SQL Editor
-- ========================================================

-- 1. TABEL UTAMA TEKNISI (User Login & Realtime Settings)
CREATE TABLE IF NOT EXISTS public.users_teknisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    password TEXT NOT NULL,
    use_password BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL TRANSAKSI PART (Data Scan Gudang dari Aplikasi Teknisi)
CREATE TABLE IF NOT EXISTS public.transaksi_part (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id TEXT,
    teknisi_nik TEXT NOT NULL,
    nama_teknisi TEXT NOT NULL,
    no_gudang TEXT NOT NULL,
    qty INTEGER DEFAULT 1,
    use_password BOOLEAN DEFAULT TRUE,
    password TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ekstensi kolom jika tabel sudah ada sebelumnya
ALTER TABLE public.transaksi_part ADD COLUMN IF NOT EXISTS unit_id TEXT;
ALTER TABLE public.transaksi_part ADD COLUMN IF NOT EXISTS process_mode TEXT DEFAULT 'STAFPART';

-- 3. TABEL PENGATURAN APLIKASI (Realtime App Settings: Show/Hide Transfer Stok)
CREATE TABLE IF NOT EXISTS public.app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AKTIFKAN SUPABASE REALTIME UNTUK KETIGA TABEL
ALTER PUBLICATION supabase_realtime ADD TABLE users_teknisi;
ALTER PUBLICATION supabase_realtime ADD TABLE transaksi_part;
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;

-- 5. ATUR PERMISSION ROW LEVEL SECURITY (RLS) SUPABASE
ALTER TABLE public.users_teknisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_part ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Bebas untuk Aplikasi Client & Extension (Anon / Publishable Key)
CREATE POLICY "Akses Bebas users_teknisi" ON public.users_teknisi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Bebas transaksi_part" ON public.transaksi_part FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Bebas app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- 6. TAMBAHKAN DATA AWAL SETTINGS & USER DUMMY
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('show_transfer_stok', 'true')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.users_teknisi (nik, nama, password, use_password)
VALUES ('TEK-8829', 'Budi Santoso', 'pass1234', true)
ON CONFLICT (nik) DO NOTHING;

INSERT INTO public.users_teknisi (nik, nama, password, use_password)
VALUES ('ADMIN', 'Administrator', '000', true)
ON CONFLICT (nik) DO NOTHING;
