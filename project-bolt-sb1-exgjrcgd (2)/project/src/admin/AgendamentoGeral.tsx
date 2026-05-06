import { useState, useEffect, useCallback } from 'react';
import { supabase, Appointment, Package, SERVICE_LABELS, SIZE_LABELS, PACKAGE_LABELS, PAYMENT_LABELS, PaymentMethod } from '../lib/supabase';
import { Plus, Pencil, Trash2, Save, X, Filter, MessageCircle, Bell, Link, Phone, AlertTriangle, MapPin } from 'lucide-react';

const SESSION_COUNT: Record<string, number[]> = {
  basico: [1, 2],
  basico_tosa: [1, 2],
  premium: [1, 2, 3, 4, 5],
};

// Default service per session for each package type
const SESSION_DEFAULT_SERVICE: Record<string, Record<number, string>> = {
  basico: { 1: 'banho', 2: 'banho' },
  basico_tosa: { 1: 'banho', 2: 'banho_tosa_higienica' },
  premium: { 1: 'banho', 2: 'banho', 3: 'banho', 4: 'banho_tosa', 5: 'banho' },
};

interface SessionForm {
  session_number: number;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
}

const makeSession = (n: number, pkgType: string): SessionForm => ({
  session_number: n,
  appointment_date: '',
  appointment_time: '',
  service_type: SESSION_DEFAULT_SERVICE[pkgType]?.[n] || 'banho',
  status: 'agendado',
});

const emptyForm = {
  client_name: '',
  client_whatsapp: '',
  address_street: '',
  address_number: '',
  pet_name: '',
  pet_species: 'cachorro' as 'cachorro' | 'gato',
  pet_size: 'pequeno_medio' as string,
  has_allergy: false,
  allergy_description: '',
  appointment_type: 'avulso' as 'avulso' | 'pacote',
  service_type: 'banho' as string,
  appointment_date: '',
  appointment_time: '',
  status: 'agendado' as string,
  pickup_fee: '',
  service_value: '',
  total: '',
  total_discount: '',
  payment_method: '' as string,
  talked_to_client: false,
  notes: '',
  package_type: 'basico' as string,
  payment_date: '',
  package_value: '',
  real_paid_value: '',
  // link to existing package or create new
  package_link: 'new' as 'new' | string,
};

type FormData = typeof emptyForm;

interface AppRow extends Appointment {
  clients?: { name: string; whatsapp: string; address_street: string; address_number: string; address_neighborhood: string };
  pets?: { name: string; species: string; size: string | null; has_allergy: boolean; allergy_description: string };
  packages?: { id: string; package_type: string; payment_date: string | null; package_value: number | null; real_paid_value: number | null; payment_method: string | null; talked_to_client: boolean };
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

interface Props {
  initialEditId?: string;
  onEditDone?: () => void;
}

export default function AgendamentoGeral({ initialEditId, onEditDone }: Props = {}) {
  const [appointments, setAppointments] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>(initialEditId ? 'edit' : 'list');
  const [editId, setEditId] = useState<string | null>(initialEditId || null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [sessions, setSessions] = useState<SessionForm[]>([makeSession(1, 'basico'), makeSession(2, 'basico')]);
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [filterTalked, setFilterTalked] = useState('');
  const [saveError, setSaveError] = useState('');
  const [existingPackages, setExistingPackages] = useState<Package[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select(`*, clients(*), pets(*), packages(*)`)
      .neq('status', 'cancelado')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    setAppointments((data as AppRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // When initialEditId is set and data loads, open the edit form
  useEffect(() => {
    if (initialEditId && appointments.length > 0 && mode === 'edit' && editId) {
      const a = appointments.find(x => x.id === initialEditId);
      if (a) openEdit(a);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, initialEditId]);

  const filtered = appointments.filter(a => {
    if (filterDate && a.appointment_date < filterDate) return false;
    if (filterDateTo && a.appointment_date > filterDateTo) return false;
    if (filterTime && !a.appointment_time.startsWith(filterTime)) return false;
    if (filterTalked === 'sim' && !a.talked_to_client) return false;
    if (filterTalked === 'nao' && a.talked_to_client) return false;
    return true;
  });

  const setField = (key: keyof FormData, val: unknown) => {
    setForm(f => {
      const updated = { ...f, [key]: val };
      if (key === 'pickup_fee' || key === 'service_value') {
        const fee = parseFloat(key === 'pickup_fee' ? String(val) : f.pickup_fee) || 0;
        const svc = parseFloat(key === 'service_value' ? String(val) : f.service_value) || 0;
        updated.total = (fee + svc > 0) ? (fee + svc).toString() : '';
      }
      if (key === 'appointment_type') updated.package_link = 'new';
      if (key === 'package_type') {
        const pkgType = String(val);
        setSessions(SESSION_COUNT[pkgType].map(n => makeSession(n, pkgType)));
      }
      return updated;
    });
  };

  const updateSession = (idx: number, field: keyof SessionForm, val: string) => {
    setSessions(s => s.map((ses, i) => i === idx ? { ...ses, [field]: val } : ses));
  };

  const fetchClientPackages = useCallback(async (clientName: string) => {
    if (!clientName.trim()) { setExistingPackages([]); return; }
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', `%${clientName}%`);
    if (!clients || clients.length === 0) { setExistingPackages([]); return; }
    const clientIds = clients.map((c: { id: string }) => c.id);
    const { data } = await supabase
      .from('packages')
      .select('*, clients(*), pets(*)')
      .eq('status', 'ativo')
      .in('client_id', clientIds);
    setExistingPackages((data as Package[]) || []);
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setSessions(SESSION_COUNT['basico'].map(n => makeSession(n, 'basico')));
    setEditId(null);
    setSaveError('');
    setExistingPackages([]);
    setMode('add');
  };

  const openEdit = (a: AppRow) => {
    setSaveError('');
    setExistingPackages([]);
    const pkgType = a.packages?.package_type || 'basico';
    setForm({
      client_name: a.clients?.name || '',
      client_whatsapp: a.clients?.whatsapp || '',
      address_street: a.clients?.address_street || '',
      address_number: a.clients?.address_number || '',
      pet_name: a.pets?.name || '',
      pet_species: (a.pets?.species as 'cachorro' | 'gato') || 'cachorro',
      pet_size: a.pets?.size || 'pequeno_medio',
      has_allergy: a.pets?.has_allergy || false,
      allergy_description: a.pets?.allergy_description || '',
      appointment_type: a.appointment_type,
      service_type: a.service_type,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      status: a.status,
      pickup_fee: a.pickup_fee?.toString() || '',
      service_value: a.service_value?.toString() || '',
      total: a.total?.toString() || '',
      total_discount: a.total_discount?.toString() || '',
      payment_method: a.payment_method || '',
      talked_to_client: a.talked_to_client,
      notes: a.notes || '',
      package_type: pkgType,
      payment_date: a.packages?.payment_date || '',
      package_value: a.packages?.package_value?.toString() || '',
      real_paid_value: a.packages?.real_paid_value?.toString() || '',
      package_link: a.package_id || 'new',
    });
    // In edit mode, show single session with current appointment's data
    setSessions([{
      session_number: a.session_number || 1,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      service_type: a.service_type,
      status: a.status,
    }]);
    setEditId(a.id);
    setMode('edit');
  };

  const handleDelete = async (a: AppRow) => {
    if (!confirm('Deseja excluir este agendamento? O registro será removido de todas as abas.')) return;
    if (a.appointment_type === 'pacote' && a.package_id) {
      // delete all appointments for this package then the package itself
      await supabase.from('appointments').delete().eq('package_id', a.package_id);
      await supabase.from('packages').delete().eq('id', a.package_id);
    } else {
      await supabase.from('appointments').delete().eq('id', a.id);
    }
    load();
  };

  const handleSave = async () => {
    setSaveError('');
    if (!form.client_name.trim()) { setSaveError('Informe o nome do cliente.'); return; }
    if (!form.pet_name.trim()) { setSaveError('Informe o nome do pet.'); return; }

    if (form.appointment_type === 'avulso') {
      if (!form.appointment_date) { setSaveError('Informe a data do agendamento.'); return; }
      if (!form.appointment_time) { setSaveError('Informe o horário do agendamento.'); return; }
    } else {
      const missingSessions = sessions.filter(s => !s.appointment_date || !s.appointment_time);
      if (missingSessions.length > 0) {
        setSaveError(`Preencha data e horário para todas as sessões (${missingSessions.map(s => `Sessão ${s.session_number}`).join(', ')}).`);
        return;
      }
    }

    setSaving(true);
    try {
      let clientId: string;
      if (editId) {
        const a = appointments.find(x => x.id === editId)!;
        clientId = a.client_id;
        const { error } = await supabase.from('clients').update({
          name: form.client_name,
          whatsapp: form.client_whatsapp,
          address_street: form.address_street,
          address_number: form.address_number,
        }).eq('id', clientId);
        if (error) throw new Error('Erro ao atualizar cliente: ' + error.message);
      } else {
        const { data: c, error } = await supabase.from('clients').insert({
          name: form.client_name,
          whatsapp: form.client_whatsapp,
          address_street: form.address_street,
          address_number: form.address_number,
          address_neighborhood: 'Sol Nascente',
        }).select('id').single();
        if (error || !c) throw new Error('Erro ao criar cliente: ' + (error?.message || ''));
        clientId = c.id;
      }

      let petId: string;
      if (editId) {
        const a = appointments.find(x => x.id === editId)!;
        petId = a.pet_id;
        const { error } = await supabase.from('pets').update({
          name: form.pet_name,
          species: form.pet_species,
          size: form.pet_species === 'gato' ? null : form.pet_size,
          has_allergy: form.has_allergy,
          allergy_description: form.allergy_description,
        }).eq('id', petId);
        if (error) throw new Error('Erro ao atualizar pet: ' + error.message);
      } else {
        const { data: p, error } = await supabase.from('pets').insert({
          client_id: clientId,
          name: form.pet_name,
          species: form.pet_species,
          size: form.pet_species === 'gato' ? null : form.pet_size,
          has_allergy: form.has_allergy,
          allergy_description: form.allergy_description,
        }).select('id').single();
        if (error || !p) throw new Error('Erro ao criar pet: ' + (error?.message || ''));
        petId = p.id;
      }

      if (form.appointment_type === 'avulso') {
        const appData = {
          client_id: clientId,
          pet_id: petId,
          package_id: null,
          appointment_type: 'avulso',
          service_type: form.service_type,
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          status: form.status,
          pickup_fee: form.pickup_fee ? parseFloat(form.pickup_fee) : null,
          service_value: form.service_value ? parseFloat(form.service_value) : null,
          total: form.total ? parseFloat(form.total) : null,
          total_discount: form.total_discount ? parseFloat(form.total_discount) : null,
          payment_method: (form.payment_method as PaymentMethod) || null,
          talked_to_client: form.talked_to_client,
          notes: form.notes,
          session_number: null,
          updated_at: new Date().toISOString(),
        };
        if (editId) {
          const { error } = await supabase.from('appointments').update(appData).eq('id', editId);
          if (error) throw new Error('Erro ao atualizar agendamento: ' + error.message);
        } else {
          const { error } = await supabase.from('appointments').insert(appData);
          if (error) throw new Error('Erro ao criar agendamento: ' + error.message);
        }
      } else {
        // Package: create or update package record, then create one appointment per session
        const pkgData = {
          package_type: form.package_type,
          payment_date: form.payment_date || null,
          package_value: form.package_value ? parseFloat(form.package_value) : null,
          real_paid_value: form.real_paid_value ? parseFloat(form.real_paid_value) : null,
          payment_method: form.payment_method || null,
          talked_to_client: form.talked_to_client,
        };

        let packageId: string;

        if (editId) {
          // Edit single appointment
          const a = appointments.find(x => x.id === editId)!;
          packageId = a.package_id!;
          if (packageId) {
            const { error } = await supabase.from('packages')
              .update({ ...pkgData, updated_at: new Date().toISOString() })
              .eq('id', packageId);
            if (error) throw new Error('Erro ao atualizar pacote: ' + error.message);
          }
          const ses = sessions[0];
          const { error } = await supabase.from('appointments').update({
            service_type: ses.service_type,
            appointment_date: ses.appointment_date,
            appointment_time: ses.appointment_time,
            status: ses.status,
            session_number: ses.session_number,
            talked_to_client: form.talked_to_client,
            notes: form.notes,
            updated_at: new Date().toISOString(),
          }).eq('id', editId);
          if (error) throw new Error('Erro ao atualizar agendamento: ' + error.message);
        } else if (form.package_link !== 'new') {
          // Link to existing package
          packageId = form.package_link;
          const { error } = await supabase.from('packages')
            .update({ ...pkgData, updated_at: new Date().toISOString() })
            .eq('id', packageId);
          if (error) throw new Error('Erro ao atualizar pacote: ' + error.message);
          // Create new appointment sessions
          for (const ses of sessions) {
            const { error: ae } = await supabase.from('appointments').insert({
              client_id: clientId, pet_id: petId, package_id: packageId,
              appointment_type: 'pacote',
              service_type: ses.service_type,
              appointment_date: ses.appointment_date,
              appointment_time: ses.appointment_time,
              status: ses.status,
              session_number: ses.session_number,
              talked_to_client: form.talked_to_client,
              notes: form.notes,
              updated_at: new Date().toISOString(),
            });
            if (ae) throw new Error(`Erro ao criar sessão ${ses.session_number}: ` + ae.message);
          }
        } else {
          // New package
          const { data: pkg, error } = await supabase.from('packages')
            .insert({ client_id: clientId, pet_id: petId, ...pkgData })
            .select('id').single();
          if (error || !pkg) throw new Error('Erro ao criar pacote: ' + (error?.message || ''));
          packageId = pkg.id;
          // Create one appointment per session
          for (const ses of sessions) {
            const { error: ae } = await supabase.from('appointments').insert({
              client_id: clientId, pet_id: petId, package_id: packageId,
              appointment_type: 'pacote',
              service_type: ses.service_type,
              appointment_date: ses.appointment_date,
              appointment_time: ses.appointment_time,
              status: ses.status,
              session_number: ses.session_number,
              talked_to_client: form.talked_to_client,
              notes: form.notes,
              updated_at: new Date().toISOString(),
            });
            if (ae) throw new Error(`Erro ao criar sessão ${ses.session_number}: ` + ae.message);
          }
        }
      }

      setMode('list');
      onEditDone?.();
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const whatsNumber = (a: AppRow) => `55${a.clients?.whatsapp?.replace(/\D/g, '')}`;

  const buildWhatsappMsg = (a: AppRow) => {
    const name = a.clients?.name || '';
    const pet = a.pets?.name || '';
    const date = fmtDate(a.appointment_date);
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
    const msg = `Olá ${name}! Segue os dados do seu agendamento:\n\nPet: ${pet}\nData: ${date}\nHorário: ${time}\nServiço: ${service}${value ? `\nValor: ${value}` : ''}${allergyLine}${addr}${payMethod}\n\nQual será a forma de pagamento?`;
    return `https://wa.me/${whatsNumber(a)}?text=${encodeURIComponent(msg)}`;
  };

  const buildReminderMsg = (a: AppRow) => {
    const name = a.clients?.name || '';
    const pet = a.pets?.name || '';
    const date = fmtDate(a.appointment_date);
    const time = a.appointment_time?.slice(0, 5);
    const addr = a.clients?.address_street && a.clients?.address_number
      ? `\nEndereço: ${a.clients.address_street}, ${a.clients.address_number}` : '';
    const msg = `Olá ${name}! Passando para lembrar que você tem um agendamento conosco.\n\nPet: ${pet}\nData: ${date}\nHorário: ${time}${addr}\n\nEsperamos por vocês!`;
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

  const isOptionalSession = (pkgType: string, n: number) => pkgType === 'premium' && n === 5;

  if (mode === 'add' || mode === 'edit') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">{mode === 'add' ? 'Novo Agendamento' : 'Editar Agendamento'}</h3>
          <button onClick={() => { setMode('list'); onEditDone?.(); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        {saveError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{saveError}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Cliente */}
          <h4 className="font-semibold text-gray-700 border-b pb-2">Dados do Cliente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome do Cliente *</label>
              <input className="input" value={form.client_name}
                onChange={e => {
                  setField('client_name', e.target.value);
                  if (form.appointment_type === 'pacote') fetchClientPackages(e.target.value);
                }} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" value={form.client_whatsapp} onChange={e => setField('client_whatsapp', e.target.value)} />
            </div>
            <div>
              <label className="label">Rua</label>
              <input className="input" value={form.address_street} onChange={e => setField('address_street', e.target.value)} />
            </div>
            <div>
              <label className="label">Número</label>
              <input className="input" value={form.address_number} onChange={e => setField('address_number', e.target.value)} />
            </div>
          </div>

          {/* Pet */}
          <h4 className="font-semibold text-gray-700 border-b pb-2 pt-2">Dados do Pet</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome do Pet *</label>
              <input className="input" value={form.pet_name} onChange={e => setField('pet_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Espécie</label>
              <select className="input" value={form.pet_species} onChange={e => setField('pet_species', e.target.value)}>
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
              </select>
            </div>
            {form.pet_species === 'cachorro' && (
              <div>
                <label className="label">Porte</label>
                <select className="input" value={form.pet_size} onChange={e => setField('pet_size', e.target.value)}>
                  <option value="pequeno_medio">Pequeno/Médio</option>
                  <option value="grande_peludo">Grande Peludo</option>
                  <option value="grande_pelo_curto">Grande Pelo Curto</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Possui Alergia?</label>
              <select className="input" value={form.has_allergy ? 'sim' : 'nao'} onChange={e => setField('has_allergy', e.target.value === 'sim')}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {form.has_allergy && (
              <div className="md:col-span-2">
                <label className="label">Descrição da Alergia</label>
                <input className="input" value={form.allergy_description} onChange={e => setField('allergy_description', e.target.value)} />
              </div>
            )}
          </div>

          {/* Serviço */}
          <h4 className="font-semibold text-gray-700 border-b pb-2 pt-2">Serviço</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Atendimento</label>
              <select className="input" value={form.appointment_type}
                onChange={e => {
                  setField('appointment_type', e.target.value);
                  if (e.target.value === 'pacote') {
                    fetchClientPackages(form.client_name);
                    setSessions(SESSION_COUNT[form.package_type].map(n => makeSession(n, form.package_type)));
                  } else setExistingPackages([]);
                }}>
                <option value="avulso">Avulso</option>
                <option value="pacote">Pacote</option>
              </select>
            </div>
            {form.appointment_type === 'pacote' && (
              <div>
                <label className="label">Tipo de Pacote</label>
                <select className="input" value={form.package_type} onChange={e => setField('package_type', e.target.value)}>
                  <option value="basico">Básico (2 sessões)</option>
                  <option value="basico_tosa">Básico com Tosa (2 sessões)</option>
                  <option value="premium">Premium (4+1 sessões)</option>
                </select>
              </div>
            )}

            {/* Avulso: single date/time/service */}
            {form.appointment_type === 'avulso' && (
              <>
                <div>
                  <label className="label">Serviço</label>
                  <select className="input" value={form.service_type} onChange={e => setField('service_type', e.target.value)}>
                    <option value="banho">Banho</option>
                    <option value="banho_tosa_higienica">Banho + Tosa Higiênica</option>
                    <option value="banho_tosa">Banho + Tosa</option>
                  </select>
                </div>
                <div>
                  <label className="label">Data *</label>
                  <input type="date" className="input" value={form.appointment_date} onChange={e => setField('appointment_date', e.target.value)} />
                </div>
                <div>
                  <label className="label">Horário *</label>
                  <input type="time" className="input" value={form.appointment_time} onChange={e => setField('appointment_time', e.target.value)} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e => setField('status', e.target.value)}>
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Package sessions: one form block per session */}
          {form.appointment_type === 'pacote' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 border-b pb-2 pt-2">
                Sessões do Pacote
                <span className="text-xs text-gray-400 font-normal ml-2">
                  {form.package_type === 'premium'
                    ? '— 4 obrigatórias · Sessão 5 opcional (5ª semana)'
                    : '— 2 sessões obrigatórias'}
                </span>
              </h4>
              {sessions.map((ses, idx) => {
                const optional = isOptionalSession(form.package_type, ses.session_number);
                return (
                  <div key={ses.session_number}
                    className={`border rounded-xl p-4 space-y-3 ${optional ? 'border-dashed border-gray-300 bg-gray-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${optional ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                        Sessão {ses.session_number}{optional ? ' (opcional)' : ' *'}
                      </span>
                      {mode === 'add' && optional && (
                        <button type="button" onClick={() => setSessions(s => s.filter((_, i) => i !== idx))}
                          className="text-xs text-red-400 hover:text-red-600 ml-auto">Remover</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="label">Serviço *</label>
                        <select className="input" value={ses.service_type}
                          onChange={e => updateSession(idx, 'service_type', e.target.value)}>
                          <option value="banho">Banho</option>
                          <option value="banho_tosa_higienica">Banho + Tosa Higiênica</option>
                          <option value="banho_tosa">Banho + Tosa</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Data *</label>
                        <input type="date" className="input" value={ses.appointment_date}
                          onChange={e => updateSession(idx, 'appointment_date', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Horário *</label>
                        <input type="time" className="input" value={ses.appointment_time}
                          onChange={e => updateSession(idx, 'appointment_time', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Status</label>
                        <select className="input" value={ses.status}
                          onChange={e => updateSession(idx, 'status', e.target.value)}>
                          <option value="agendado">Agendado</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="concluido">Concluído</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Add optional session 5 for premium if removed */}
              {mode === 'add' && form.package_type === 'premium' && !sessions.some(s => s.session_number === 5) && (
                <button type="button"
                  onClick={() => setSessions(s => [...s, makeSession(5, 'premium')])}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 border border-dashed border-gray-300 px-4 py-2 rounded-xl w-full justify-center hover:border-amber-400 transition-colors">
                  <Plus className="w-4 h-4" /> Adicionar Sessão 5 (opcional)
                </button>
              )}
            </div>
          )}

          {/* Link to existing package */}
          {form.appointment_type === 'pacote' && existingPackages.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Vincular a Pacote Existente</p>
              </div>
              <p className="text-xs text-blue-600 mb-3">Este cliente já possui pacotes ativos. Você pode vincular esta sessão a um pacote existente ou criar um novo.</p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.package_link === 'new' ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white hover:border-blue-300'
                }`}>
                  <input type="radio" checked={form.package_link === 'new'} onChange={() => setField('package_link', 'new')} className="accent-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Criar novo pacote</span>
                </label>
                {existingPackages.map(pkg => (
                  <label key={pkg.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.package_link === pkg.id ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}>
                    <input type="radio" checked={form.package_link === pkg.id} onChange={() => {
                      setField('package_link', pkg.id);
                      setField('package_type', pkg.package_type);
                      if (pkg.payment_date) setField('payment_date', pkg.payment_date);
                      if (pkg.package_value) setField('package_value', String(pkg.package_value));
                      if (pkg.real_paid_value) setField('real_paid_value', String(pkg.real_paid_value));
                      if (pkg.payment_method) setField('payment_method', pkg.payment_method);
                    }} className="accent-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {PACKAGE_LABELS[pkg.package_type]} — {(pkg as unknown as {pets?: {name: string}}).pets?.name || 'Pet'}
                      </p>
                      {pkg.package_value && (
                        <p className="text-xs text-gray-500">Valor: R$ {pkg.package_value.toFixed(2)}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Pagamento Avulso */}
          {form.appointment_type === 'avulso' && (
            <>
              <h4 className="font-semibold text-gray-700 border-b pb-2 pt-2">Pagamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Taxa Leva e Traz (R$)</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.pickup_fee} onChange={e => setField('pickup_fee', e.target.value)} />
                </div>
                <div>
                  <label className="label">Valor do Serviço (R$)</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.service_value} onChange={e => setField('service_value', e.target.value)} />
                </div>
                <div>
                  <label className="label">Total (R$) <span className="text-xs text-gray-400 font-normal">— calculado automaticamente</span></label>
                  <input type="number" step="0.01" min="0" className="input bg-gray-50" value={form.total} onChange={e => setField('total', e.target.value)} />
                </div>
                <div>
                  <label className="label">Total com Desconto (R$)</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.total_discount} onChange={e => setField('total_discount', e.target.value)} />
                </div>
                <div>
                  <label className="label">Forma de Pagamento</label>
                  <select className="input" value={form.payment_method} onChange={e => setField('payment_method', e.target.value)}>
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
                  <select className="input" value={form.talked_to_client ? 'sim' : 'nao'} onChange={e => setField('talked_to_client', e.target.value === 'sim')}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Pagamento Pacote */}
          {form.appointment_type === 'pacote' && (
            <>
              <h4 className="font-semibold text-gray-700 border-b pb-2 pt-2">Dados do Pacote</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Data de Pagamento</label>
                  <input type="date" className="input" value={form.payment_date} onChange={e => setField('payment_date', e.target.value)} />
                </div>
                <div>
                  <label className="label">Valor do Pacote (R$)</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.package_value} onChange={e => setField('package_value', e.target.value)} />
                </div>
                <div>
                  <label className="label">Valor Real Pago (R$)</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.real_paid_value} onChange={e => setField('real_paid_value', e.target.value)} />
                </div>
                <div>
                  <label className="label">Forma de Pagamento</label>
                  <select className="input" value={form.payment_method} onChange={e => setField('payment_method', e.target.value)}>
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
                  <select className="input" value={form.talked_to_client ? 'sim' : 'nao'} onChange={e => setField('talked_to_client', e.target.value === 'sim')}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Observações</label>
            <textarea className="input h-20 resize-none" value={form.notes} onChange={e => setField('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => { setMode('list'); onEditDone?.(); }} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Incluir
        </button>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <input type="date" className="input-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} title="Data de" />
          <span className="text-xs text-gray-400">até</span>
          <input type="date" className="input-sm" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="Data até" />
          <input type="time" className="input-sm" value={filterTime} onChange={e => setFilterTime(e.target.value)} />
          <select className="input-sm" value={filterTalked} onChange={e => setFilterTalked(e.target.value)}>
            <option value="">Falou c/ cliente?</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {(filterDate || filterDateTo || filterTime || filterTalked) && (
            <button onClick={() => { setFilterDate(''); setFilterDateTo(''); setFilterTime(''); setFilterTalked(''); }} className="text-xs text-red-500 hover:text-red-700">Limpar</button>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block"></span> Avulso</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block"></span> Pacote</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Nenhum agendamento encontrado.</div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs border-collapse" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide">
                <th className="px-3 py-3 text-left">Cliente / Pet</th>
                <th className="px-3 py-3 text-left">Endereço</th>
                <th className="px-3 py-3 text-left">Data / Hora</th>
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
              {filtered.map(a => {
                const isPackage = a.appointment_type === 'pacote';
                const petSize = a.pets?.species === 'gato' ? 'Gato'
                  : (SIZE_LABELS[a.pets?.size as keyof typeof SIZE_LABELS] || a.pets?.size || '—');
                const infoAdicional = [
                  a.pets?.has_allergy ? `Alergia: ${a.pets.allergy_description}` : null,
                  a.notes || null,
                  isPackage && a.session_number ? `Sessão ${a.session_number}` : null,
                  a.talked_to_client ? 'Falou ✓' : null,
                ].filter(Boolean).join(' · ');
                const paymentInfo = isPackage
                  ? (a.packages?.payment_method ? PAYMENT_LABELS[a.packages.payment_method as PaymentMethod] : null)
                  : (a.payment_method ? PAYMENT_LABELS[a.payment_method as PaymentMethod] : null);
                const getValue = () => {
                  if (isPackage) return a.packages?.real_paid_value != null ? `R$ ${a.packages.real_paid_value.toFixed(2)}` : '—';
                  if (a.total_discount != null) return `R$ ${a.total_discount.toFixed(2)}`;
                  if (a.total != null) return `R$ ${a.total.toFixed(2)}`;
                  return '—';
                };
                const rowBg = isPackage ? 'bg-blue-50' : 'bg-green-50';
                const rowHover = isPackage ? 'hover:bg-blue-100/70' : 'hover:bg-green-100/70';

                return (
                  <tr key={a.id} className={`${rowBg} ${rowHover} border-b border-gray-200 transition-colors`}>
                    {/* Cliente / Pet */}
                    <td className="px-3 py-2.5 min-w-[130px]">
                      <p className="font-bold text-gray-800 leading-tight">
                        {a.clients?.name}
                        {a.pets?.name ? <span className="text-gray-500 font-normal"> / {a.pets.name}</span> : ''}
                      </p>
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

                    {/* Data / Hora */}
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-700">
                      <span className="block font-medium">{fmtDate(a.appointment_date)}</span>
                      <span className="text-gray-500">{a.appointment_time?.slice(0, 5)}</span>
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
                      <span className="font-semibold text-gray-800 block">{getValue()}</span>
                      {paymentInfo && <span className="text-gray-500 block">{paymentInfo}</span>}
                    </td>

                    {/* Telefone */}
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{a.clients?.whatsapp || '—'}</td>

                    {/* Ações */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2 flex-nowrap">
                        <button onClick={() => openEdit(a)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
