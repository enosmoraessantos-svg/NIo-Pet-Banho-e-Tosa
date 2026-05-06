import { useState, useEffect, Fragment } from 'react';
import { supabase, Appointment, SERVICE_LABELS, SIZE_LABELS, PACKAGE_LABELS, PAYMENT_LABELS, PaymentMethod } from '../lib/supabase';
import { Calendar, MessageCircle, Bell, MapPin, Pencil, Trash2, Phone, AlertTriangle } from 'lucide-react';
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

  const getValue = (a: AppRow) => {
    if (a.appointment_type === 'pacote') {
      return a.packages?.real_paid_value != null ? `R$ ${a.packages.real_paid_value.toFixed(2)}` : '—';
    }
    if (a.total_discount != null) return `R$ ${a.total_discount.toFixed(2)}`;
    if (a.total != null) return `R$ ${a.total.toFixed(2)}`;
    return '—';
  };

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
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

      {/* Legenda */}
      <div className="flex gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block"></span> Avulso</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block"></span> Pacote</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum agendamento para este período.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs border-collapse" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide">
                <th className="px-3 py-3 text-left w-6">#</th>
                <th className="px-3 py-3 text-left">Cliente / Pet</th>
                <th className="px-3 py-3 text-left">Endereço</th>
                <th className="px-3 py-3 text-left">Pacote</th>
                <th className="px-3 py-3 text-left">Serviço</th>
                <th className="px-3 py-3 text-left">Tamanho</th>
                <th className="px-3 py-3 text-left">Inf. Adicionais</th>
                <th className="px-3 py-3 text-left">Valor</th>
                <th className="px-3 py-3 text-left">Telefone</th>
                <th className="px-3 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const isPackage = a.appointment_type === 'pacote';
                const petSize = a.pets?.species === 'gato' ? 'Gato'
                  : (SIZE_LABELS[a.pets?.size as keyof typeof SIZE_LABELS] || a.pets?.size || '—');
                const infoAdicional = [
                  a.pets?.has_allergy ? `Alergia: ${a.pets.allergy_description}` : null,
                  a.notes || null,
                  isPackage && a.session_number ? `Sessão ${a.session_number}` : null,
                ].filter(Boolean).join(' · ');
                const paymentInfo = isPackage
                  ? (a.packages?.payment_method ? PAYMENT_LABELS[a.packages.payment_method as PaymentMethod] : null)
                  : (a.payment_method ? PAYMENT_LABELS[a.payment_method as PaymentMethod] : null);
                const rowBg = isPackage ? 'bg-blue-50' : 'bg-green-50';
                const rowHover = isPackage ? 'hover:bg-blue-100/70' : 'hover:bg-green-100/70';

                return (
                  <Fragment key={a.id}>
                    {/* Separador de data em modo range */}
                    {selectedDateTo && (idx === 0 || filtered[idx - 1]?.appointment_date !== a.appointment_date) && (
                      <tr>
                        <td colSpan={10} className="bg-gray-700 text-white text-xs font-semibold px-4 py-1.5">
                          {fmtDate(a.appointment_date)}
                        </td>
                      </tr>
                    )}

                    <tr className={`${rowBg} ${rowHover} border-b border-gray-200 transition-colors`}>
                      {/* # */}
                      <td className="px-3 py-2.5 text-center font-bold text-gray-400">{idx + 1}</td>

                      {/* Cliente / Pet */}
                      <td className="px-3 py-2.5 min-w-[130px]">
                        <p className="font-bold text-gray-800 leading-tight">
                          {a.clients?.name}
                          {a.pets?.name ? <span className="text-gray-500 font-normal"> / {a.pets.name}</span> : ''}
                        </p>
                        <p className="text-gray-500 mt-0.5">{a.appointment_time?.slice(0, 5)}</p>
                        {a.pets?.has_allergy && (
                          <AlertTriangle className="w-3 h-3 text-red-500 inline mt-0.5" title="Possui alergia" />
                        )}
                      </td>

                      {/* Endereço */}
                      <td className="px-3 py-2.5 min-w-[140px]">
                        {(a.clients?.address_street || a.clients?.address_number) ? (
                          <span className="flex items-start gap-1 text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                            {[a.clients.address_street, a.clients.address_number].filter(Boolean).join(', ')}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>

                      {/* Pacote */}
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          isPackage ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                        }`}>
                          {isPackage ? (PACKAGE_LABELS[a.packages?.package_type || ''] || 'Pacote') : 'Avulso'}
                        </span>
                      </td>

                      {/* Serviço */}
                      <td className="px-3 py-2.5 font-medium text-gray-700">
                        {SERVICE_LABELS[a.service_type as keyof typeof SERVICE_LABELS] || a.service_type}
                      </td>

                      {/* Tamanho */}
                      <td className="px-3 py-2.5 text-gray-700">{petSize}</td>

                      {/* Inf. Adicionais */}
                      <td className="px-3 py-2.5 max-w-[180px]">
                        {infoAdicional
                          ? <span className={`leading-snug ${a.pets?.has_allergy ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>{infoAdicional}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>

                      {/* Valor */}
                      <td className="px-3 py-2.5">
                        <span className="font-semibold text-gray-800 block">{getValue(a)}</span>
                        {paymentInfo && <span className="text-gray-500 block">{paymentInfo}</span>}
                      </td>

                      {/* Telefone */}
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{a.clients?.whatsapp || '—'}</td>

                      {/* Ações */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 flex-nowrap">
                          <button onClick={() => setEditingId(a.id)}
                            title="Alterar"
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(a)}
                            title="Excluir"
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <a href={buildInitialMsg(a)} target="_blank" rel="noopener noreferrer"
                            title="Conversa Inicial"
                            className="p-1.5 rounded-md text-teal-600 hover:bg-teal-100 hover:text-teal-800 transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a href={buildWhatsappMsg(a)} target="_blank" rel="noopener noreferrer"
                            title="WhatsApp Agendamento"
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-100 hover:text-green-800 transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <a href={buildReminderMsg(a)} target="_blank" rel="noopener noreferrer"
                            title="Lembrete"
                            className="p-1.5 rounded-md text-amber-600 hover:bg-amber-100 hover:text-amber-800 transition-colors">
                            <Bell className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
