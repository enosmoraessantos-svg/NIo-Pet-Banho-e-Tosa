import { createClient } from '@supabase/supabase-js';

const SB_URL = "https://yczhjyxisqrvfxxgipop.supabase.co"; 
const SB_KEY = "sb_publishable_6SmMDIymguOi59WrVb1QQA_wSykUdUm";

// Inicialização conforme solicitado
export const supabaseClient = createClient(SB_URL, SB_KEY);
