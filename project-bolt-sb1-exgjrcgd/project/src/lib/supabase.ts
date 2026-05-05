import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'public' },
});

export type ServiceType = 'banho' | 'banho_tosa_higienica' | 'banho_tosa';
export type SpeciesType = 'cachorro' | 'gato';
export type SizeType = 'pequeno_medio' | 'grande_peludo' | 'grande_pelo_curto';
export type PackageType = 'avulso' | 'basico' | 'basico_tosa' | 'premium';
export type AppointmentStatus = 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro' | 'qrcode_pix';
export type BlockType = 'horario' | 'dia' | 'periodo';

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  created_at: string;
}

export interface Pet {
  id: string;
  client_id: string;
  name: string;
  species: SpeciesType;
  size: SizeType | null;
  has_allergy: boolean;
  allergy_description: string;
  created_at: string;
}

export interface Package {
  id: string;
  client_id: string;
  pet_id: string;
  package_type: 'basico' | 'basico_tosa' | 'premium';
  status: 'ativo' | 'encerrado' | 'cancelado';
  payment_date: string | null;
  package_value: number | null;
  real_paid_value: number | null;
  payment_method: PaymentMethod | null;
  talked_to_client: boolean;
  created_at: string;
  updated_at: string;
  clients?: Client;
  pets?: Pet;
}

export interface Appointment {
  id: string;
  client_id: string;
  pet_id: string;
  package_id: string | null;
  appointment_type: 'avulso' | 'pacote';
  service_type: ServiceType;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  pickup_fee: number | null;
  service_value: number | null;
  total: number | null;
  total_discount: number | null;
  payment_method: PaymentMethod | null;
  talked_to_client: boolean;
  notes: string;
  session_number: number | null;
  created_at: string;
  updated_at: string;
  clients?: Client;
  pets?: Pet;
  packages?: Package;
}

export interface SlotConfig {
  id: string;
  day_of_week: number;
  time_slot: string;
  is_active: boolean;
  pequeno_medio_banho: number;
  pequeno_medio_banho_tosa: number;
  pequeno_medio_banho_tosa_hig: number;
  grande_peludo_banho: number;
  grande_peludo_banho_tosa: number;
  grande_peludo_banho_tosa_hig: number;
  grande_pelo_curto_banho: number;
  grande_pelo_curto_banho_tosa: number;
  grande_pelo_curto_banho_tosa_hig: number;
  gato_banho: number;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  block_type: BlockType;
  block_date: string | null;
  block_time_start: string | null;
  block_time_end: string | null;
  period_start: string | null;
  period_end: string | null;
  reason: string;
  return_message: string;
  is_active: boolean;
  created_at: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  banho: 'Banho',
  banho_tosa_higienica: 'Banho + Tosa Higiênica',
  banho_tosa: 'Banho + Tosa',
};

export const SIZE_LABELS: Record<SizeType, string> = {
  pequeno_medio: 'Pequeno/Médio',
  grande_peludo: 'Grande Peludo',
  grande_pelo_curto: 'Grande Pelo Curto',
};

export const PACKAGE_LABELS: Record<string, string> = {
  avulso: 'Avulso',
  basico: 'Básico',
  basico_tosa: 'Básico com Tosa',
  premium: 'Premium',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  credito: 'Crédito',
  debito: 'Débito',
  dinheiro: 'Dinheiro',
  qrcode_pix: 'QR Code PIX',
};

export const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
