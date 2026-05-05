import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, AlertCircle, CheckCircle, ChevronLeft, X } from 'lucide-react';

interface Props {
  onBack: () => void;
}

interface AppResult {
  id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  clients: { name: string };
  pets: { name: string };
}

export default function CancelService({ onBack }: Props) {
  const [clientName, setClientName] = useState('');
  const [results, setResults] = useState<AppResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, appointment_type, clients(name), pets(name)')
      .ilike('clients.name', `%${clientName.trim()}%`)
      .eq('status', 'agendado')
      .order('appointment_date')
      .order('appointment_time');
    setResults(((data || []) as unknown as AppResult[]).filter(a => a.clients?.name));
    setSearched(true);
    setLoading(false);
  };

  const handleCancel = async (appt: AppResult) => {
    if (appt.appointment_type === 'pacote') return;
    if (!confirm(`Confirmar cancelamento para ${appt.clients.name} — ${appt.pets.name} em ${appt.appointment_date} às ${appt.appointment_time.slice(0, 5)}?`)) return;
    await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', appt.id);
    setCancelled(appt.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-gray-800 text-lg">Cancelar Serviço</h2>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          className="input flex-1"
          placeholder="Digite seu nome"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {searched && results.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum agendamento ativo encontrado.</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map(appt => {
          if (cancelled === appt.id) {
            return (
              <div key={appt.id} className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-800">Agendamento cancelado.</p>
                <p className="text-sm text-green-600 mt-1">Caso precise, faça um novo agendamento.</p>
              </div>
            );
          }

          if (appt.appointment_type === 'pacote') {
            return (
              <div key={appt.id} className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Pacote Ativo</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Caro cliente, se você tem pacote ativo e deseja mudar a data do seu agendamento, entre em contato com nossos atendentes para realizar a alteração.
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      {appt.clients.name} — {appt.pets.name} | {appt.appointment_date} às {appt.appointment_time.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={appt.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{appt.clients.name}</p>
                  <p className="text-sm text-gray-500">Pet: {appt.pets.name}</p>
                  <p className="text-sm text-gray-500">{appt.appointment_date} às {appt.appointment_time.slice(0, 5)}</p>
                </div>
                <button
                  onClick={() => handleCancel(appt)}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
