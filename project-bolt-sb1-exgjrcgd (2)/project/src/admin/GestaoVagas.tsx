import { useState, useEffect, useCallback } from 'react';
import { supabase, SlotConfig, DAYS_OF_WEEK } from '../lib/supabase';
import { Plus, Save, Trash2, Settings2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const SIZE_SERVICES = [
  { key: 'pequeno_medio', label: 'Pequeno/Médio', services: [
    { field: 'pequeno_medio_banho', label: 'Banho' },
    { field: 'pequeno_medio_banho_tosa', label: 'Banho + Tosa' },
    { field: 'pequeno_medio_banho_tosa_hig', label: 'Banho ou Banho+Tosa Higiênica' },
  ]},
  { key: 'grande_peludo', label: 'Grande Peludo', services: [
    { field: 'grande_peludo_banho', label: 'Banho' },
    { field: 'grande_peludo_banho_tosa', label: 'Banho + Tosa' },
    { field: 'grande_peludo_banho_tosa_hig', label: 'Banho ou Banho+Tosa Higiênica' },
  ]},
  { key: 'grande_pelo_curto', label: 'Grande Pelo Curto', services: [
    { field: 'grande_pelo_curto_banho', label: 'Banho' },
    { field: 'grande_pelo_curto_banho_tosa', label: 'Banho + Tosa' },
    { field: 'grande_pelo_curto_banho_tosa_hig', label: 'Banho ou Banho+Tosa Higiênica' },
  ]},
  { key: 'gato', label: 'Gato', services: [
    { field: 'gato_banho', label: 'Banho' },
  ]},
];


const defaultSlot: Omit<SlotConfig, 'id' | 'created_at' | 'updated_at'> = {
  day_of_week: 1,
  time_slot: '09:00',
  is_active: true,
  pequeno_medio_banho: 0,
  pequeno_medio_banho_tosa: 0,
  pequeno_medio_banho_tosa_hig: 0,
  grande_peludo_banho: 0,
  grande_peludo_banho_tosa: 0,
  grande_peludo_banho_tosa_hig: 0,
  grande_pelo_curto_banho: 0,
  grande_pelo_curto_banho_tosa: 0,
  grande_pelo_curto_banho_tosa_hig: 0,
  gato_banho: 0,
};

export default function GestaoVagas() {
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, number | boolean | string>>({});
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ ...defaultSlot });
  const [saving, setSaving] = useState(false);
  const [agendaReleaseDay, setAgendaReleaseDay] = useState(20);
  const [releaseSaving, setReleaseSaving] = useState(false);
  const [releaseError, setReleaseError] = useState('');
  const [slotError, setSlotError] = useState('');

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('slot_configs').select('*').order('day_of_week').order('time_slot');
    if (!error) setSlots((data as SlotConfig[]) || []);
    const { data: rd } = await supabase.from('agenda_releases').select('release_day').maybeSingle();
    if (rd) setAgendaReleaseDay(rd.release_day);
    setLoading(false);
  }, []);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const reloadSlots = async () => {
    const { data } = await supabase.from('slot_configs').select('*').order('day_of_week').order('time_slot');
    setSlots((data as SlotConfig[]) || []);
  };

  const grouped = DAYS_OF_WEEK.map((label, idx) => ({
    day: idx, label, slots: slots.filter(s => s.day_of_week === idx),
  }));

  const startEdit = (slot: SlotConfig) => {
    setEditingId(slot.id);
    setSlotError('');
    setEditForm({
      time_slot: slot.time_slot, is_active: slot.is_active,
      pequeno_medio_banho: slot.pequeno_medio_banho, pequeno_medio_banho_tosa: slot.pequeno_medio_banho_tosa,
      pequeno_medio_banho_tosa_hig: slot.pequeno_medio_banho_tosa_hig, grande_peludo_banho: slot.grande_peludo_banho,
      grande_peludo_banho_tosa: slot.grande_peludo_banho_tosa, grande_peludo_banho_tosa_hig: slot.grande_peludo_banho_tosa_hig,
      grande_pelo_curto_banho: slot.grande_pelo_curto_banho, grande_pelo_curto_banho_tosa: slot.grande_pelo_curto_banho_tosa,
      grande_pelo_curto_banho_tosa_hig: slot.grande_pelo_curto_banho_tosa_hig, gato_banho: slot.gato_banho,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true); setSlotError('');
    const { error } = await supabase.from('slot_configs').update({ ...editForm, updated_at: new Date().toISOString() }).eq('id', editingId);
    if (error) { setSlotError('Erro ao salvar: ' + error.message); } else { setEditingId(null); }
    setSaving(false);
    await reloadSlots();
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('Remover este horário?')) return;
    await supabase.from('slot_configs').delete().eq('id', id);
    await reloadSlots();
  };

  const addSlot = async (day: number) => {
    setSaving(true); setSlotError('');
    const { error } = await supabase.from('slot_configs').insert({ ...newSlot, day_of_week: day });
    if (error) { setSlotError('Erro ao adicionar horário: ' + error.message); }
    else { setAddingDay(null); setNewSlot({ ...defaultSlot }); }
    setSaving(false);
    await reloadSlots();
  };

  const saveReleaseDay = async () => {
    setReleaseSaving(true); setReleaseError('');
    const { data: existing, error: selErr } = await supabase.from('agenda_releases').select('id').maybeSingle();
    if (selErr) { setReleaseError('Erro ao buscar configuração: ' + selErr.message); setReleaseSaving(false); return; }
    if (existing) {
      const { error } = await supabase.from('agenda_releases').update({ release_day: agendaReleaseDay, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) { setReleaseError('Erro ao salvar: ' + error.message); setReleaseSaving(false); return; }
    } else {
      const { error } = await supabase.from('agenda_releases').insert({ release_day: agendaReleaseDay });
      if (error) { setReleaseError('Erro ao salvar: ' + error.message); setReleaseSaving(false); return; }
    }
    setReleaseSaving(false);
    alert('Configuração salva com sucesso!');
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <>
          {/* Agenda release config */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-800">Liberação de Agenda</h3>
            </div>
            {releaseError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{releaseError}</div>
            )}
            <div className="flex items-center gap-4">
              <div>
                <label className="label">Liberar agenda todo dia</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={28} className="input w-20" value={agendaReleaseDay}
                    onChange={e => setAgendaReleaseDay(parseInt(e.target.value) || 1)} />
                  <span className="text-sm text-gray-500">do mês para o mês seguinte</span>
                </div>
              </div>
              <button onClick={saveReleaseDay} disabled={releaseSaving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mt-5">
                <Save className="w-4 h-4" /> {releaseSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {slotError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{slotError}</div>
          )}

          {grouped.map(({ day, label, slots: daySlots }) => (
            <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-gray-800">{label}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {daySlots.length} horário{daySlots.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {expandedDay === day ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedDay === day && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {daySlots.length === 0 && <p className="text-sm text-gray-400">Nenhum horário configurado.</p>}

                  {daySlots.map(slot => (
                    <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                      {editingId === slot.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="label">Horário</label>
                              <input type="time" className="input w-32" value={editForm.time_slot as string}
                                onChange={e => setEditForm(f => ({ ...f, time_slot: e.target.value }))} />
                            </div>
                            <div>
                              <label className="label">Ativo?</label>
                              <select className="input w-24" value={editForm.is_active ? 'sim' : 'nao'}
                                onChange={e => setEditForm(f => ({ ...f, is_active: e.target.value === 'sim' }))}>
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                              </select>
                            </div>
                          </div>
                          {SIZE_SERVICES.map(group => (
                            <div key={group.key}>
                              <p className="text-sm font-semibold text-gray-700 mb-2">{group.label}</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {group.services.map(svc => (
                                  <div key={svc.field}>
                                    <label className="text-xs text-gray-500">{svc.label}</label>
                                    <input type="number" min={0} className="input"
                                      value={editForm[svc.field] as number}
                                      onChange={e => setEditForm(f => ({ ...f, [svc.field]: parseInt(e.target.value) || 0 }))} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <button onClick={saveEdit} disabled={saving}
                              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button onClick={() => { setEditingId(null); setSlotError(''); }}
                              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800">{slot.time_slot?.slice(0, 5)}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${slot.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {slot.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(slot)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                              <button onClick={() => deleteSlot(slot.id)} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> Remover
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                            {SIZE_SERVICES.map(group => group.services.map(svc => {
                              const val = slot[svc.field as keyof SlotConfig] as number;
                              return val > 0 ? (
                                <div key={svc.field} className="bg-gray-50 rounded px-2 py-1">
                                  <span className="text-gray-400">{group.label} — {svc.label}: </span>
                                  <strong>{val}</strong>
                                </div>
                              ) : null;
                            }))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {addingDay === day ? (
                    <div className="border border-dashed border-amber-300 rounded-lg p-4 space-y-3 bg-amber-50">
                      <h4 className="font-semibold text-amber-800 text-sm">Novo Horário</h4>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="label">Horário</label>
                          <input type="time" className="input w-32" value={newSlot.time_slot}
                            onChange={e => setNewSlot(s => ({ ...s, time_slot: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Ativo?</label>
                          <select className="input w-24" value={newSlot.is_active ? 'sim' : 'nao'}
                            onChange={e => setNewSlot(s => ({ ...s, is_active: e.target.value === 'sim' }))}>
                            <option value="sim">Sim</option>
                            <option value="nao">Não</option>
                          </select>
                        </div>
                      </div>
                      {SIZE_SERVICES.map(group => (
                        <div key={group.key}>
                          <p className="text-sm font-semibold text-gray-700 mb-2">{group.label}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {group.services.map(svc => (
                              <div key={svc.field}>
                                <label className="text-xs text-gray-500">{svc.label}</label>
                                <input type="number" min={0} className="input"
                                  value={newSlot[svc.field as keyof typeof newSlot] as number}
                                  onChange={e => setNewSlot(s => ({ ...s, [svc.field]: parseInt(e.target.value) || 0 }))} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => addSlot(day)} disabled={saving}
                          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Horário'}
                        </button>
                        <button onClick={() => { setAddingDay(null); setNewSlot({ ...defaultSlot }); setSlotError(''); }}
                          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingDay(day); setNewSlot({ ...defaultSlot }); }}
                      className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 font-medium border border-dashed border-amber-300 px-4 py-2 rounded-lg w-full justify-center hover:bg-amber-50 transition-colors">
                      <Plus className="w-4 h-4" /> Adicionar Horário
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
    </div>
  );
}
