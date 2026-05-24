import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Revisa tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos para TypeScript (basados en nuestro nuevo esquema)
export type Service = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  image_url: string | null;
  deposit_amount: number;
  mercadopago_link: string | null;
  category: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  dni: string;
  role: 'admin' | 'client';
};

export type Appointment = {
  id: string;
  client_id: string;
  service_id: string;
  start_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  notes: string;
};

export type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  cbu: string;
  alias: string;
  cuit_cuil: string;
  is_active: boolean;
};
