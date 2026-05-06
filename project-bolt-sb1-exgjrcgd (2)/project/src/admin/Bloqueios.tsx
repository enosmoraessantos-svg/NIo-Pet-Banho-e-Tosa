import { useState, useEffect, useCallback } from 'react';
import { supabase, Block, BlockType } from '../lib/supabase';
import { Plus, Unlock, Lock, AlertTriangle } from 'lucide-react';

const blockTypeLabels: Record<BlockType, string> = {
  horario: 'Horário específico',
  dia: 'Dia inteiro',
  periodo: 'Período',
};

const emptyForm = {
  block_type: 'horario' as BlockType,
  block_date: '',
  block_time_start: '',
  block_time_end: '',
  period_start: '',
  period_end: '',
  reason: '',
  return_message: '',
};

export default function Bloqueios() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blocks')
      .select('*')
      .order('created_at', { ascending: false });
    setBlocks((data as Block[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setField = (key: keyof typeof emptyForm, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.reason) { alert('Informe o motivo.'); return; }
    if (form.block_type === 'horario' && (!form.block_date || !form.block_time_start || !form.block_time_end)) {
      alert('Preencha data, horário início e término.');
      return;
    }
    if (form.block_type === 'dia' && !form.block_date) {
      alert('Informe a data.');
      return;
    }
    if (form.block_type === 'periodo' && (!form.period_start || !form.period_end)) {
      alert('Informe o período.');
      return;
    }
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('blocks').insert({
      block_type: form.block_type,
      block_date: form.block_type !== 'periodo' ? form.block_date || null : null,
      block_time_start: form.block_type === 'horario' ? form.block_time_start || null : null,
      block_time_end: form.block_type === 'horario' ? form.block_time_end || null : null,
      period_start: form.block_type === 'periodo' ? form.period_start || null : null,
      period_end: form.block_type === 'periodo' ? form.period_end || null : null,
      reason: form.reason,
      return_message: form.return_message,
      is_active: true,
    });
    setSaving(false);
    if (error) {
      setSaveError('Erro ao salvar bloqueio: ' + error.message);
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const handleUnblock = async (id: string) => {
    await supabase.from('blocks').update({ is_active: false }).eq('id', id);
    load();
  };

  const activeBlocks = blocks.filter(b => b.is_active);
  const inactiveBlocks = blocks.filter(b => !b.is_active);

  const renderBlock = (b: Block) => (
    <div key={b.id} className={`bg-white rounded-xl border p-4 shadow-sm ${b.is_active ? 'border-red-200' : 'border-gray-200 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${b.is_active ? 'bg-red-100' : 'bg-gray-100'}`}>
            {b.is_active ? <Lock className="w-4 h-4 text-red-600" /> : <Unlock className="w-4 h-4 text-gray-500" />}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{blockTypeLabels[b.block_type]}</p>
            {b.block_type === 'horario' && (
              <p className="text-sm text-gray-600">
                {b.block_date} das {b.block_time_start?.slice(0, 5)} até {b.block_time_end?.slice(0, 5)}
              </p>
            )}
            {b.block_type === 'dia' && (
              <p className="text-sm text-gray-600">Dia {b.block_date}</p>
            )}
            {b.block_type === 'periodo' && (
              <p className="text-sm text-gray-600">
                De {b.period_start} até {b.period_end}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Motivo: {b.reason}</p>
            {b.return_message && (
              <p className="text-xs text-amber-600 mt-0.5">Mensagem ao cliente: {b.return_message}</p>
            )}
          </div>
        </div>
        {b.is_active && (
          <button
            onClick={() => handleUnblock(b.id)}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            <Unlock className="w-3.5 h-3.5" /> Desbloquear
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
      >
        <Plus className="w-4 h-4" /> Novo Bloqueio
      </button>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Criar Bloqueio</h3>
          {saveError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{saveError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="label">Tipo de Bloqueio</label>
              <div className="flex gap-3 flex-wrap">
                {(['horario', 'dia', 'periodo'] as BlockType[]).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="block_type"
                      value={t}
                      checked={form.block_type === t}
                      onChange={() => setField('block_type', t)}
                      className="accent-amber-500"
                    />
                    <span className="text-sm">{blockTypeLabels[t]}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.block_type === 'horario' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Data</label>
                  <input type="date" className="input" value={form.block_date} onChange={e => setField('block_date', e.target.value)} />
                </div>
                <div>
                  <label className="label">Horário Início</label>
                  <input type="time" className="input" value={form.block_time_start} onChange={e => setField('block_time_start', e.target.value)} />
                </div>
                <div>
                  <label className="label">Horário Término</label>
                  <input type="time" className="input" value={form.block_time_end} onChange={e => setField('block_time_end', e.target.value)} />
                </div>
              </div>
            )}

            {form.block_type === 'dia' && (
              <div>
                <label className="label">Data</label>
                <input type="date" className="input" value={form.block_date} onChange={e => setField('block_date', e.target.value)} />
              </div>
            )}

            {form.block_type === 'periodo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Data Início</label>
                  <input type="date" className="input" value={form.period_start} onChange={e => setField('period_start', e.target.value)} />
                </div>
                <div>
                  <label className="label">Data Fim</label>
                  <input type="date" className="input" value={form.period_end} onChange={e => setField('period_end', e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <label className="label">Motivo</label>
              <input type="text" className="input" value={form.reason} onChange={e => setField('reason', e.target.value)} placeholder="Ex: Feriado, manutenção..." />
            </div>

            <div>
              <label className="label">Mensagem para o Cliente (opcional)</label>
              <input
                type="text"
                className="input"
                value={form.return_message}
                onChange={e => setField('return_message', e.target.value)}
                placeholder="Ex: Estamos fechados por motivo X e voltamos no dia..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
                <Lock className="w-4 h-4" /> {saving ? 'Bloqueando...' : 'Bloquear'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          {activeBlocks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-semibold text-gray-700 text-sm">Bloqueios Ativos</h3>
              </div>
              <div className="space-y-3">
                {activeBlocks.map(renderBlock)}
              </div>
            </div>
          )}

          {inactiveBlocks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-400 text-sm mb-3">Histórico de Bloqueios</h3>
              <div className="space-y-3">
                {inactiveBlocks.map(renderBlock)}
              </div>
            </div>
          )}

          {blocks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Unlock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum bloqueio registrado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
