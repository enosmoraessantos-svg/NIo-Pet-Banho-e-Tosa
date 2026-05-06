import { useState, useEffect, useCallback } from 'react';
import { supabase, Package, PACKAGE_LABELS, PAYMENT_LABELS, PaymentMethod } from '../lib/supabase';
import { Pencil, Save, X, MessageCircle, RefreshCw, Package as PackageIcon, Filter, Trash2, ChevronDown, ChevronUp, Phone } from 'lucide-react';

function fmtDate(iso: string | null): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

interface AppointmentRow {
  id: string;
  session_number: number | null;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
}

interface PackageRow extends Package {
  clients?: { id: string; name: string; whatsapp: string; address_street: string; address_number: string };
  pets?: { id: string; name: string; species: string };
  appointments?: AppointmentRow[];
}

interface SessionEdit {
  id: string;
  session_number: number | null;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
}

const SERVICE_LABELS: Record<string, string> = {
  banho: 'Banho',
  banho_tosa_higienica: 'Banho + Tosa Higiênica',
  banho_tosa: 'Banho + Tosa',
};

export default function Pacotes() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPackage, setEditPackage] = useState({
    package_type: 'basico' as string,
    payment_date: '',
    package_value: '',
    real_paid_value: '',
    payment_method: '' as string,
    talked_to_client: false,
    status: 'ativo' as string,
    // client & pet fields
    client_name: '',
    client_whatsapp: '',
    address_street: '',
    address_number: '',
    pet_name: '',
  });
  const [editSessions, setEditSessions] = useState<SessionEdit[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [filterPago, setFilterPago] = useState('');
  const [filterTalked, setFilterTalked] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('packages')
      .select(`*, clients(id, name, whatsapp, address_street, address_number), pets(id, name, species), appointments(id, session_number, appointment_date, appointment_time, service_type, status)`)
      .order('created_at', { ascending: false });
    setPackages((data as PackageRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p: PackageRow) => {
    setSaveError('');
    setEditId(p.id);
    setEditPackage({
      package_type: p.package_type,
      payment_date: p.payment_date || '',
      package_value: p.package_value?.toString() || '',
      real_paid_value: p.real_paid_value?.toString() || '',
      payment_method: p.payment_method || '',
      talked_to_client: p.talked_to_client,
      status: p.status,
      client_name: p.clients?.name || '',
      client_whatsapp: p.clients?.whatsapp || '',
      address_street: p.clients?.address_street || '',
      address_number: p.clients?.address_number || '',
      pet_name: p.pets?.name || '',
    });
    const sorted = [...(p.appointments || [])].sort(
      (a, b) => (a.session_number || 0) - (b.session_number || 0)
    );
    setEditSessions(sorted.map(ap => ({
      id: ap.id,
      session_number: ap.session_number,
      appointment_date: ap.appointment_date,
      appointment_time: ap.appointment_time?.slice(0, 5) || '',
      service_type: ap.service_type,
      status: ap.status,
    })));
    setExpandedId(p.id);
  };

  const updateSession = (idx: number, field: keyof SessionEdit, value: string) => {
    setEditSessions(s => s.map((ses, i) => i === idx ? { ...ses, [field]: value } : ses));
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaveError('');
    setSaving(true);
    try {
      const pkg = packages.find(p => p.id === editId);
      if (!pkg) throw new Error('Pacote não encontrado.');

      // Update client
      if (pkg.clients?.id) {
        const { error } = await supabase.from('clients').update({
          name: editPackage.client_name,
          whatsapp: editPackage.client_whatsapp,
          address_street: editPackage.address_street,
          address_number: editPackage.address_number,
        }).eq('id', pkg.clients.id);
        if (error) throw new Error('Erro ao salvar cliente: ' + error.message);
      }

      // Update pet name
      if (pkg.pets?.id) {
        const { error } = await supabase.from('pets').update({
          name: editPackage.pet_name,
        }).eq('id', pkg.pets.id);
        if (error) throw new Error('Erro ao salvar pet: ' + error.message);
      }

      // Update package
      const { error: pkgErr } = await supabase.from('packages').update({
        package_type: editPackage.package_type,
        payment_date: editPackage.payment_date || null,
        package_value: editPackage.package_value ? parseFloat(editPackage.package_value) : null,
        real_paid_value: editPackage.real_paid_value ? parseFloat(editPackage.real_paid_value) : null,
        payment_method: editPackage.payment_method || null,
        talked_to_client: editPackage.talked_to_client,
        status: editPackage.status,
        updated_at: new Date().toISOString(),
      }).eq('id', editId);
      if (pkgErr) throw new Error('Erro ao salvar pacote: ' + pkgErr.message);

      // Update each session
      for (const ses of editSessions) {
        const { error: apErr } = await supabase.from('appointments').update({
          service_type: ses.service_type,
          appointment_date: ses.appointment_date,
          appointment_time: ses.appointment_time,
          status: ses.status,
          talked_to_client: editPackage.talked_to_client,
          updated_at: new Date().toISOString(),
        }).eq('id', ses.id);
        if (apErr) throw new Error(`Erro ao salvar sessão ${ses.session_number}: ` + apErr.message);
      }

      setEditId(null);
      load();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: PackageRow) => {
    if (!confirm(`Excluir pacote de ${p.clients?.name} (${p.pets?.name})? Todos os agendamentos vinculados também serão excluídos.`)) return;
    await supabase.from('appointments').delete().eq('package_id', p.id);
    await supabase.from('packages').delete().eq('id', p.id);
    load();
  };

  const whatsNumber = (p: PackageRow) => `55${p.clients?.whatsapp?.replace(/\D/g, '')}`;

  const buildChargeMsg = (p: PackageRow) => {
    const name = p.clients?.name || '';
    const pet = p.pets?.name || '';
    const value = p.package_value ? `R$ ${p.package_value.toFixed(2)}` : '';
    const msg = `Olá ${name}! Informamos que o pacote do seu pet deve ser pago dia 20 de cada mês.\n\nPet: ${pet}${value ? `\nValor do pacote: ${value}` : ''}\n\nQualquer dúvida, estamos à disposição!`;
    return `https://wa.me/${whatsNumber(p)}?text=${encodeURIComponent(msg)}`;
  };

  const buildRenewalMsg = (p: PackageRow) => {
    const name = p.clients?.name || '';
    const msg = `Caro cliente ${name}, informamos que o pacote do seu pet, no qual você tinha conosco, encerrou. Para renovar seu pacote, entre no nosso link de agendamento para fazer a renovação. Ficamos no aguardo!`;
    return `https://wa.me/${whatsNumber(p)}?text=${encodeURIComponent(msg)}`;
  };

  const buildInitialMsg = (p: PackageRow) => {
    const name = p.clients?.name || '';
    const sorted = [...(p.appointments || [])].sort((a, b) => (a.session_number || 0) - (b.session_number || 0));
    const sessionsText = sorted.map(ap => {
      const s = ap.session_number != null ? `Sessão ${ap.session_number}` : 'Sessão';
      const d = fmtDate(ap.appointment_date);
      const t = ap.appointment_time?.slice(0, 5);
      const svc = SERVICE_LABELS[ap.service_type] || ap.service_type;
      return `${s}: ${d} às ${t} — ${svc}`;
    }).join('\n');
    const msg = `Oie ${name}! Vimos que você fez um agendamento de pacote conosco. Seguem as datas e serviços:\n\n${sessionsText}\n\nEstamos aqui para confirmar e tirar qualquer dúvida!`;
    return `https://wa.me/${whatsNumber(p)}?text=${encodeURIComponent(msg)}`;
  };

  const statusColor = (status: string) => {
    if (status === 'ativo') return 'bg-green-100 text-green-700';
    if (status === 'encerrado') return 'bg-gray-100 text-gray-600';
    return 'bg-red-100 text-red-700';
  };

  const filtered = packages.filter(p => {
    if (filterPago === 'sim' && !(p.real_paid_value != null && p.real_paid_value > 0)) return false;
    if (filterPago === 'nao' && (p.real_paid_value != null && p.real_paid_value > 0)) return false;
    if (filterTalked === 'sim' && !p.talked_to_client) return false;
    if (filterTalked === 'nao' && p.talked_to_client) return false;
    if (filterDateFrom && p.payment_date && p.payment_date < filterDateFrom) return false;
    if (filterDateTo && p.payment_date && p.payment_date > filterDateTo) return false;
    return true;
  });

  const hasFilters = filterPago || filterTalked || filterDateFrom || filterDateTo;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="input-sm" value={filterPago} onChange={e => setFilterPago(e.target.value)}>
            <option value="">Pacote pago?</option>
            <option value="sim">Sim (pago)</option>
            <option value="nao">Não (pendente)</option>
          </select>
          <select className="input-sm" value={filterTalked} onChange={e => setFilterTalked(e.target.value)}>
            <option value="">Falou c/ cliente?</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          <input type="date" className="input-sm" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="Data pagamento de" />
          <input type="date" className="input-sm" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="Data pagamento até" />
          {hasFilters && (
            <button onClick={() => { setFilterPago(''); setFilterTalked(''); setFilterDateFrom(''); setFilterDateTo(''); }} className="text-xs text-red-500 hover:text-red-700">Limpar</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum pacote encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-800">{p.clients?.name}</p>
                  <p className="text-sm text-gray-500">Pet: {p.pets?.name}</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                    {PACKAGE_LABELS[p.package_type] || p.package_type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>
              </div>

              {editId === p.id ? (
                <div className="border-t border-gray-100 pt-4 space-y-5">
                  {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{saveError}</div>
                  )}

                  {/* Client & Pet */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cliente e Pet</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Nome do Cliente</label>
                        <input className="input" value={editPackage.client_name} onChange={e => setEditPackage(f => ({ ...f, client_name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">WhatsApp</label>
                        <input className="input" value={editPackage.client_whatsapp} onChange={e => setEditPackage(f => ({ ...f, client_whatsapp: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Rua</label>
                        <input className="input" value={editPackage.address_street} onChange={e => setEditPackage(f => ({ ...f, address_street: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Número</label>
                        <input className="input" value={editPackage.address_number} onChange={e => setEditPackage(f => ({ ...f, address_number: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Nome do Pet</label>
                        <input className="input" value={editPackage.pet_name} onChange={e => setEditPackage(f => ({ ...f, pet_name: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* Package data */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dados do Pacote</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Tipo de Pacote</label>
                        <select className="input" value={editPackage.package_type} onChange={e => setEditPackage(f => ({ ...f, package_type: e.target.value }))}>
                          <option value="basico">Básico (2 sessões)</option>
                          <option value="basico_tosa">Básico com Tosa (2 sessões)</option>
                          <option value="premium">Premium (4+1 sessões)</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Status</label>
                        <select className="input" value={editPackage.status} onChange={e => setEditPackage(f => ({ ...f, status: e.target.value }))}>
                          <option value="ativo">Ativo</option>
                          <option value="encerrado">Encerrado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Data de Pagamento</label>
                        <input type="date" className="input" value={editPackage.payment_date} onChange={e => setEditPackage(f => ({ ...f, payment_date: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Valor do Pacote (R$)</label>
                        <input type="number" step="0.01" min="0" className="input" value={editPackage.package_value} onChange={e => setEditPackage(f => ({ ...f, package_value: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Valor Real Pago (R$)</label>
                        <input type="number" step="0.01" min="0" className="input" value={editPackage.real_paid_value} onChange={e => setEditPackage(f => ({ ...f, real_paid_value: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Forma de Pagamento</label>
                        <select className="input" value={editPackage.payment_method} onChange={e => setEditPackage(f => ({ ...f, payment_method: e.target.value }))}>
                          <option value="">Selecione</option>
                          <option value="pix">PIX</option>
                          <option value="credito">Crédito</option>
                          <option value="debito">Débito</option>
                          <option value="dinheiro">Dinheiro</option>
                          <option value="qrcode_pix">QR Code PIX</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Falou com Cliente?</label>
                        <select className="input" value={editPackage.talked_to_client ? 'sim' : 'nao'} onChange={e => setEditPackage(f => ({ ...f, talked_to_client: e.target.value === 'sim' }))}>
                          <option value="nao">Não</option>
                          <option value="sim">Sim</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sessions */}
                  {editSessions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sessões</h4>
                      <div className="space-y-3">
                        {editSessions.map((ses, idx) => (
                          <div key={ses.id} className="border border-amber-200 bg-amber-50 rounded-xl p-3">
                            <span className="text-xs font-semibold text-amber-700 mb-2 block">
                              Sessão {ses.session_number ?? idx + 1}
                            </span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="label">Serviço</label>
                                <select className="input" value={ses.service_type} onChange={e => updateSession(idx, 'service_type', e.target.value)}>
                                  <option value="banho">Banho</option>
                                  <option value="banho_tosa_higienica">Banho + Tosa Higiênica</option>
                                  <option value="banho_tosa">Banho + Tosa</option>
                                </select>
                              </div>
                              <div>
                                <label className="label">Data</label>
                                <input type="date" className="input" value={ses.appointment_date} onChange={e => updateSession(idx, 'appointment_date', e.target.value)} />
                              </div>
                              <div>
                                <label className="label">Horário</label>
                                <input type="time" className="input" value={ses.appointment_time} onChange={e => updateSession(idx, 'appointment_time', e.target.value)} />
                              </div>
                              <div>
                                <label className="label">Status</label>
                                <select className="input" value={ses.status} onChange={e => updateSession(idx, 'status', e.target.value)}>
                                  <option value="agendado">Agendado</option>
                                  <option value="confirmado">Confirmado</option>
                                  <option value="concluido">Concluído</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
                      <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button onClick={() => { setEditId(null); setSaveError(''); }} className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors flex items-center gap-1">
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                    <div><span className="text-xs text-gray-400 block">Data Pagamento</span>{fmtDate(p.payment_date)}</div>
                    <div><span className="text-xs text-gray-400 block">Valor Pacote</span>{p.package_value != null ? `R$ ${p.package_value.toFixed(2)}` : '-'}</div>
                    <div><span className="text-xs text-gray-400 block">Valor Pago</span>{p.real_paid_value != null ? `R$ ${p.real_paid_value.toFixed(2)}` : '-'}</div>
                    <div><span className="text-xs text-gray-400 block">Pagamento</span>{p.payment_method ? PAYMENT_LABELS[p.payment_method as PaymentMethod] : '-'}</div>
                    <div><span className="text-xs text-gray-400 block">Falou c/ Cliente</span>{p.talked_to_client ? 'Sim' : 'Não'}</div>
                  </div>

                  {p.appointments && p.appointments.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {p.appointments.length} sessão(ões)
                      </button>
                      {expandedId === p.id && (
                        <div className="mt-2 space-y-1.5">
                          {[...p.appointments]
                            .sort((a, b) => (a.session_number || 0) - (b.session_number || 0))
                            .map(ap => (
                              <div key={ap.id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 flex flex-wrap gap-3">
                                {ap.session_number != null && (
                                  <span className="font-semibold text-amber-700">Sessão {ap.session_number}</span>
                                )}
                                <span>{fmtDate(ap.appointment_date)}</span>
                                <span>{ap.appointment_time?.slice(0, 5)}</span>
                                <span>{SERVICE_LABELS[ap.service_type] || ap.service_type}</span>
                                <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                                  ap.status === 'agendado' ? 'bg-yellow-100 text-yellow-700' :
                                  ap.status === 'confirmado' ? 'bg-blue-100 text-blue-700' :
                                  ap.status === 'concluido' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-500'
                                }`}>{ap.status}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                    <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button onClick={() => handleDelete(p)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium">
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                    <a href={buildInitialMsg(p)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-medium">
                      <Phone className="w-3.5 h-3.5" /> Conversa Inicial
                    </a>
                    <a href={buildChargeMsg(p)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium ml-auto">
                      <MessageCircle className="w-3.5 h-3.5" /> Cobrança
                    </a>
                    <a href={buildRenewalMsg(p)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 font-medium">
                      <RefreshCw className="w-3.5 h-3.5" /> Renovação
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
