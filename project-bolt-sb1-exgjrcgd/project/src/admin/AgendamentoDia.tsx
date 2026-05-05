import { useState, useEffect } from 'react';
import { supabase, Appointment, SERVICE_LABELS, SIZE_LABELS, PACKAGE_LABELS, PAYMENT_LABELS, PaymentMethod } from '../lib/supabase';
import { Calendar, MessageCircle, Bell, MapPin, Pencil, Trash2, Phone } from 'lucide-react';
import AgendamentoGeral from './AgendamentoGeral';

interface AppRow extends Appointment {
  clients?: { name: string; whatsapp: string; address_street: string; address_number: string };
  pets?: { name: string; species: string; size: string | null; has_allergy: boolean; allergy_description: string };
  packages?: { id: string; package_type: string; package_value: number | null; real_paid_value: number | null; payment_method: string | null };
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function AgendamentoDia() {
  const [appointments, setAppointments] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDateTo, setSelectedDateTo] = useState('');
  const [filterTalked, setFilterTalked] = useState('');
  const [filterPaid, setFilterPaid] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadDay = async (date: string, dateTo: string) => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select(`*, clients(*), pets(*), packages(id, package_type, package_value, real_paid_value, payment_method)`)
      .neq('status', 'cancelado')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (dateTo) {
      query = query.gte('appointment_date', date).lte('appointment_date', dateTo);
    } else {
      query = query.eq('appointment_date', date);
    }

    const { data } = await query;
    setAppointments((data as AppRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadDay(selectedDate, selectedDateTo); }, [selectedDate, selectedDateTo]);

  const handleDelete = async (a: AppRow) => {
    if (!confirm('Deseja excluir este agendamento? O registro será removido de todas as abas.')) return;
    if (a.appointment_type === 'pacote' && a.package_id) {
      await supabase.from('appointments').delete().eq('package_id', a.package_id);
      await supabase.from('packages').delete().eq('id', a.package_id);
    } else {
      await supabase.from('appointments').delete().eq('id', a.id);
    }
    loadDay(selectedDate, selectedDateTo);
  };

  const whatsNumber = (a: AppRow) => `55${a.clients?.whatsapp?.replace(/\D/g, '')}`;

  const buildWhatsappMsg = (a: AppRow) => {
    const name = a.clients?.name || '';
    const pet = a.pets?.name || '';
    const time = a.appointment_time?.slice(0, 5);
    const service = SERVICE_LABELS[a.service_type as keyof typeof SERVICE_LABELS] || a.service_type;
    const isPackage = a.appointment_type === 'pacote';
    const value = isPackage
      ? a.packages?.real_paid_value ? `R$ ${a.packages.real_paid_value.toFixed(2)}` : ''
      : a.total_discount ? `R$ ${a.total_discount.toFixed(2)}` : a.total ? `R$ ${a.total.toFixed(2)}` : '';
    const addr = a.clients?.address_street && a.clients?.address_number
      ? `\nEndereço: ${a.clients.address_street}, ${a.clients.address_number}` : '';
    const allergyLine = a.pets?.has_allergy && a.pets.allergy_description
      ? `\nAlergia: ${a.pets.allergy_description}` : '';
    const payMethod = isPackage
      ? (a.packages?.payment_method ? `\nForma de pagamento: ${PAYMENT_LABELS[a.packages.payment_method as PaymentMethod]}` : '')
      : (a.payment_method ? `\nForma de pagamento: ${PAYMENT_LABELS[a.payment_method as PaymentMethod]}` : '');
    const msg = `Olá ${name}! Segue os dados do seu agendamento:\n\nPet: ${pet}\nData: ${fmtDate(a.appointment_date)}\nHorário: ${time}\nServiço: ${service}${value ? `\nValor: ${value}` : ''}${allergyLine}${addr}${payMethod}\n\nQual será a forma de pagamento?`;
    return `https://wa.me/${whatsNumber(a)}?text=${encodeURIComponent(msg)}`;
  };

  const buildReminderMsg = (a: AppRow) => {
    const name = a.clients?.name || '';
    const pet = a.pets?.name || '';
    const time = a.appointment_time?.slice(0, 5);
    const addr = a.clients?.address_street && a.clients?.address_number
      ? `\nEndereço: ${a.clients.address_street}, ${a.clients.address_number}` : '';
    const msg = `Olá ${name}! Passando para lembrar que você tem um agendamento conosco hoje.\n\nPet: ${pet}\nData: ${fmtDate(a.appointment_date)}\nHorário: ${time}${addr}\n\nEsperamos por vocês!`;
    return `https://wa.me/${whatsNumber(a)}?text=${encodeURIComponent(msg)}`;
  };

  const buildInitialMsg = (a: AppRow) => {
    const name = a.clients?.name || '';
    const date = fmtDate(a.appointment_date);
    const time = a.appointment_time?.slice(0, 5);
    const service = SERVICE_LABELS[a.service_type as keyof typeof SERVICE_LABELS] || a.service_type;
    const msg = `Oie ${name}! Vimos que você fez um agendamento conosco no dia ${date}, horário ${time}, serviço ${service}. Estamos aqui para confirmar e tirar qualquer dúvida!`;
    return `https://wa.me/${whatsNumber(a)}?text=${encodeURIComponent(msg)}`;
  };

  const filtered = appointments.filter(a => {
    if (filterTalked === 'sim' && !a.talked_to_client) return false;
    if (filterTalked === 'nao' && a.talked_to_client) return false;
    if (filterPaid === 'sim') {
      const paid = a.appointment_type === 'pacote'
        ? (a.packages?.real_paid_value != null && a.packages.real_paid_value > 0)
        : (a.total != null && a.total > 0);
      if (!paid) return false;
    }
    if (filterPaid === 'nao') {
      const paid = a.appointment_type === 'pacote'
        ? (a.packages?.real_paid_value != null && a.packages.real_paid_value > 0)
        : (a.total != null && a.total > 0);
      if (paid) return false;
    }
    return true;
  });

  if (editingId) {
    return (
      <div>
        <button onClick={() => { setEditingId(null); loadDay(selectedDate, selectedDateTo); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 font-medium">
          ← Voltar para Agendamento do Dia
        </button>
        <AgendamentoGeral initialEditId={editingId} onEditDone={() => { setEditingId(null); loadDay(selectedDate, selectedDateTo); }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <label className="font-semibold text-gray-700 text-sm">De:</label>
          <input type="date" className="input-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700 text-sm">Até:</label>
          <input type="date" className="input-sm" value={selectedDateTo} onChange={e => setSelectedDateTo(e.target.value)} />
          {selectedDateTo && (
            <button onClick={() => setSelectedDateTo('')} className="text-xs text-red-500 hover:text-red-700">Limpar</button>
          )}
        </div>
        <select className="input-sm" value={filterTalked} onChange={e => setFilterTalked(e.target.value)}>
          <option value="">Falou c/ cliente?</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
        <select className="input-sm" value={filterPaid} onChange={e => setFilterPaid(e.target.value)}>
          <option value="">Cliente pagou?</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
        {(filterTalked || filterPaid) && (
          <button onClick={() => { setFilterTalked(''); setFilterPaid(''); }} className="text-xs text-red-500 hover:text-red-700">Limpar filtros</button>
        )}
        <span className="text-sm text-gray-500 ml-auto">
          {filtered.length} agendamento{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum agendamento para este período.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a, idx) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl text-amber-700 font-bold text-base shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{a.appointment_time?.slice(0, 5)} — {a.clients?.name}</p>
                    <p className="text-xs text-gray-400">{fmtDate(a.appointment_date)}</p>
                    <p className="text-sm text-gray-500">
                      Pet: <strong>{a.pets?.name}</strong> •{' '}
                      {a.pets?.species === 'cachorro'
                        ? (SIZE_LABELS[a.pets.size as keyof typeof SIZE_LABELS] || a.pets.size)
                        : 'Gato'}
                    </p>
                    {(a.clients?.address_street || a.clients?.address_number) && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {[a.clients.address_street, a.clients.address_number].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.appointment_type === 'pacote' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {PACKAGE_LABELS[a.appointment_type]}
                    {a.appointment_type === 'pacote' && a.packages
                      ? ` — ${PACKAGE_LABELS[a.packages.package_type] || a.packages.package_type}`
                      : ''}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === 'agendado' ? 'bg-yellow-100 text-yellow-700' :
                    a.status === 'confirmado' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{a.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                <div><span className="text-xs text-gray-400 block">Serviço</span>{SERVICE_LABELS[a.service_type as keyof typeof SERVICE_LABELS]}</div>
                <div><span className="text-xs text-gray-400 block">WhatsApp</span>{a.clients?.whatsapp}</div>
                {a.appointment_type === 'avulso' && a.pickup_fee != null && (
                  <div><span className="text-xs text-gray-400 block">Taxa Leva/Traz</span>R$ {a.pickup_fee.toFixed(2)}</div>
                )}
                {a.appointment_type === 'avulso' && a.service_value != null && (
                  <div><span className="text-xs text-gray-400 block">Valor Serviço</span>R$ {a.service_value.toFixed(2)}</div>
                )}
                {a.appointment_type === 'avulso' && a.total != null && (
                  <div><span className="text-xs text-gray-400 block">Total</span>R$ {a.total.toFixed(2)}</div>
                )}
                {a.appointment_type === 'avulso' && a.total_discount != null && (
                  <div><span className="text-xs text-gray-400 block">Total c/ Desconto</span>R$ {a.total_discount.toFixed(2)}</div>
                )}
                {a.appointment_type === 'avulso' && a.payment_method && (
                  <div><span className="text-xs text-gray-400 block">Pagamento</span>{PAYMENT_LABELS[a.payment_method as PaymentMethod]}</div>
                )}
                {a.appointment_type === 'pacote' && a.session_number != null && (
                  <div><span className="text-xs text-gray-400 block">Sessão Nº</span>{a.session_number}</div>
                )}
                {a.appointment_type === 'pacote' && a.packages?.package_value != null && (
                  <div><span className="text-xs text-gray-400 block">Valor Pacote</span>R$ {a.packages.package_value.toFixed(2)}</div>
                )}
                {a.appointment_type === 'pacote' && a.packages?.real_paid_value != null && (
                  <div><span className="text-xs text-gray-400 block">Valor Pago</span>R$ {a.packages.real_paid_value.toFixed(2)}</div>
                )}
                {a.appointment_type === 'pacote' && a.packages?.payment_method && (
                  <div><span className="text-xs text-gray-400 block">Pagamento</span>{PAYMENT_LABELS[a.packages.payment_method as PaymentMethod]}</div>
                )}
                <div><span className="text-xs text-gray-400 block">Falou c/ cliente</span>{a.talked_to_client ? 'Sim' : 'Não'}</div>
              </div>

              {a.notes && (
                <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
                  <span className="font-semibold text-gray-500">Observação:</span> {a.notes}
                </p>
              )}

              {a.pets?.has_allergy && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 font-medium">
                  Alergia: {a.pets.allergy_description}
                </p>
              )}

              <div className="flex gap-3 pt-3 border-t border-gray-100 flex-wrap">
                <button onClick={() => setEditingId(a.id)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <Pencil className="w-3.5 h-3.5" /> Alterar
                </button>
                <button onClick={() => handleDelete(a)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
                <a href={buildInitialMsg(a)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-medium">
                  <Phone className="w-3.5 h-3.5" /> Conversa Inicial
                </a>
                <a href={buildWhatsappMsg(a)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium ml-auto">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Agendamento
                </a>
                <a href={buildReminderMsg(a)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 font-medium">
                  <Bell className="w-3.5 h-3.5" /> Lembrete
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
