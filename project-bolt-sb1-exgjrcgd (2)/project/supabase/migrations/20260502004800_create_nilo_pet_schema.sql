
/*
  # Nilo Pet - Complete Schema

  1. New Tables
    - `clients` - Client information (name, address, whatsapp, etc.)
    - `pets` - Pet information linked to clients
    - `appointments` - All appointments (avulso and package)
    - `packages` - Package subscriptions
    - `package_sessions` - Individual sessions within a package
    - `slot_config` - Admin slot configuration per day/time
    - `slot_config_packages` - Package slot configuration
    - `blocks` - Blocked times/days
    - `admin_settings` - Admin settings (password recovery, etc.)

  2. Security
    - Enable RLS on all tables
    - Policies for anon (clients submitting bookings) and service_role (admin)
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  address_street text NOT NULL,
  address_number text NOT NULL,
  address_neighborhood text NOT NULL DEFAULT 'Sol Nascente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert clients"
  ON clients FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can select clients"
  ON clients FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL CHECK (species IN ('cachorro', 'gato')),
  size text CHECK (size IN ('pequeno_medio', 'grande_peludo', 'grande_pelo_curto')),
  has_allergy boolean DEFAULT false,
  allergy_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert pets"
  ON pets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can select pets"
  ON pets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage pets"
  ON pets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Packages subscriptions
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('basico', 'basico_tosa', 'premium')),
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'encerrado', 'cancelado')),
  payment_date date,
  package_value numeric(10,2),
  real_paid_value numeric(10,2),
  payment_method text CHECK (payment_method IN ('pix', 'credito', 'debito', 'dinheiro', 'qrcode_pix')),
  talked_to_client boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert packages"
  ON packages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can select packages"
  ON packages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage packages"
  ON packages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
  appointment_type text NOT NULL CHECK (appointment_type IN ('avulso', 'pacote')),
  service_type text NOT NULL CHECK (service_type IN ('banho', 'banho_tosa_higienica', 'banho_tosa')),
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
  -- Avulso payment fields
  pickup_fee numeric(10,2),
  service_value numeric(10,2),
  total numeric(10,2),
  total_discount numeric(10,2),
  payment_method text CHECK (payment_method IN ('pix', 'credito', 'debito', 'dinheiro', 'qrcode_pix')),
  talked_to_client boolean DEFAULT false,
  notes text DEFAULT '',
  -- Package session reference
  session_number integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert appointments"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can select appointments"
  ON appointments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Slot configuration per day+time
CREATE TABLE IF NOT EXISTS slot_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  time_slot time NOT NULL,
  is_active boolean DEFAULT true,
  -- Limits per size/service
  pequeno_medio_banho integer DEFAULT 0,
  pequeno_medio_banho_tosa integer DEFAULT 0,
  pequeno_medio_banho_tosa_hig integer DEFAULT 0,
  grande_peludo_banho integer DEFAULT 0,
  grande_peludo_banho_tosa integer DEFAULT 0,
  grande_peludo_banho_tosa_hig integer DEFAULT 0,
  grande_pelo_curto_banho integer DEFAULT 0,
  grande_pelo_curto_banho_tosa integer DEFAULT 0,
  grande_pelo_curto_banho_tosa_hig integer DEFAULT 0,
  gato_banho integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week, time_slot)
);

ALTER TABLE slot_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select slot_configs"
  ON slot_configs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage slot_configs"
  ON slot_configs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Package slot configuration (which days/times are available for each package type and session)
CREATE TABLE IF NOT EXISTS package_slot_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_type text NOT NULL CHECK (package_type IN ('basico', 'basico_tosa', 'premium')),
  session_number integer NOT NULL,
  service_type text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slot time NOT NULL,
  max_slots integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_type, session_number, service_type, day_of_week, time_slot)
);

ALTER TABLE package_slot_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select package_slot_configs"
  ON package_slot_configs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage package_slot_configs"
  ON package_slot_configs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Blocks table (blocked times or days)
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL CHECK (block_type IN ('horario', 'dia', 'periodo')),
  block_date date,
  block_time_start time,
  block_time_end time,
  period_start date,
  period_end date,
  reason text NOT NULL DEFAULT '',
  return_message text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select blocks"
  ON blocks FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage blocks"
  ON blocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select admin_settings"
  ON admin_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage admin_settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Agenda release config
CREATE TABLE IF NOT EXISTS agenda_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_day integer NOT NULL DEFAULT 20,
  months_ahead integer NOT NULL DEFAULT 1,
  last_released_month text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agenda_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select agenda_releases"
  ON agenda_releases FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can manage agenda_releases"
  ON agenda_releases FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES 
  ('admin_password', 'nilopet2026'),
  ('pet_recovery_name', 'Nilo'),
  ('pet_recovery_password', 'nilopet2026')
ON CONFLICT (key) DO NOTHING;

-- Insert default agenda release config
INSERT INTO agenda_releases (release_day, months_ahead) VALUES (20, 1)
ON CONFLICT DO NOTHING;
