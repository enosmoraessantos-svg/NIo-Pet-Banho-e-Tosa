import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, FileSpreadsheet } from 'lucide-react';

type Period = 'dia' | 'semana' | 'mes';

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const header = keys.join(';');
  const body = rows.map(row =>
    keys.map(k => {
      const val = row[k];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(';') || str.includes('\n') ? `"${str}"` : str;
    }).join(';')
  ).join('\n');
  return `${header}\n${body}`;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDateRange(period: Period, ref: string): { start: string; end: string } {
  const d = new Date(ref + 'T00:00:00');
  if (period === 'dia') {
    return { start: ref, end: ref };
  }
  if (period === 'semana') {
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    };
  }
  // mes
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function ExportarRelatorio() {
  const [period, setPeriod] = useState<Period>('mes');
  const [refDate, setRefDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const { start, end } = getDateRange(period, refDate);

    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_type,
        service_type,
        appointment_date,
        appointment_time,
        status,
        pickup_fee,
        service_value,
        total,
        total_discount,
        payment_method,
        talked_to_client,
        session_number,
        notes,
        clients(name, whatsapp, address_street, address_number, address_neighborhood),
        pets(name, species, size, has_allergy, allergy_description),
        packages(package_type, payment_date, package_value, real_paid_value)
      `)
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .neq('status', 'cancelado')
      .order('appointment_date')
      .order('appointment_time');

    const rows = (data || []).map((a: Record<string, unknown>) => {
      const c = a.clients as Record<string, unknown> | null;
      const p = a.pets as Record<string, unknown> | null;
      const pkg = a.packages as Record<string, unknown> | null;
      return {
        'Data': a.appointment_date,
        'Horário': String(a.appointment_time || '').slice(0, 5),
        'Cliente': c?.name || '',
        'WhatsApp': c?.whatsapp || '',
        'Rua': c?.address_street || '',
        'Número': c?.address_number || '',
        'Bairro': c?.address_neighborhood || '',
        'Pet': p?.name || '',
        'Espécie': p?.species || '',
        'Porte': p?.size || '',
        'Alergia': p?.has_allergy ? 'Sim' : 'Não',
        'Desc. Alergia': p?.allergy_description || '',
        'Tipo Atendimento': a.appointment_type,
        'Pacote': pkg?.package_type || '',
        'Serviço': a.service_type,
        'Status': a.status,
        'Sessão Nº': a.session_number || '',
        'Taxa Leva/Traz': a.pickup_fee || '',
        'Valor Serviço': a.service_value || '',
        'Total': a.total || '',
        'Total c/ Desconto': a.total_discount || '',
        'Data Pgto Pacote': pkg?.payment_date || '',
        'Valor Pacote': pkg?.package_value || '',
        'Valor Real Pago': pkg?.real_paid_value || '',
        'Forma Pagamento': a.payment_method || '',
        'Falou c/ Cliente': a.talked_to_client ? 'Sim' : 'Não',
        'Observações': a.notes || '',
      };
    });

    setPreview(rows);
    setLoading(false);
    return { rows, start, end };
  };

  const handleExport = async () => {
    const { rows, start, end } = await fetchData();
    if (rows.length === 0) { alert('Nenhum dado encontrado para o período selecionado.'); return; }
    const csv = toCSV(rows);
    const periodLabel = period === 'dia' ? `dia-${start}` : period === 'semana' ? `semana-${start}-${end}` : `mes-${start.slice(0, 7)}`;
    downloadCSV(csv, `nilo-pet-agendamentos-${periodLabel}.csv`);
  };

  const periodLabel = {
    dia: 'do dia',
    semana: 'da semana',
    mes: 'do mês',
  }[period];

  const range = getDateRange(period, refDate);

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-amber-500" />
          <h3 className="font-bold text-gray-800">Exportar para Excel/CSV</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Período</label>
            <div className="flex gap-3">
              {(['dia', 'semana', 'mes'] as Period[]).map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="period"
                    value={p}
                    checked={period === p}
                    onChange={() => setPeriod(p)}
                    className="accent-amber-500"
                  />
                  <span className="text-sm capitalize">{p === 'mes' ? 'Mês' : p === 'dia' ? 'Dia' : 'Semana'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Data de Referência</label>
            <input
              type="date"
              className="input"
              value={refDate}
              onChange={e => setRefDate(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Exportando dados <strong>{periodLabel}</strong>: {range.start} a {range.end}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Carregando...' : 'Exportar CSV'}
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Pré-visualizar
          </button>
        </div>

        {preview.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">{preview.length} registro{preview.length !== 1 ? 's' : ''} encontrado{preview.length !== 1 ? 's' : ''}</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="text-xs w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).slice(0, 8).map(k => (
                      <th key={k} className="px-3 py-2 text-left text-gray-600 font-semibold whitespace-nowrap">{k}</th>
                    ))}
                    <th className="px-3 py-2 text-gray-400">...</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      {Object.values(row).slice(0, 8).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-gray-600 whitespace-nowrap">{String(v || '')}</td>
                      ))}
                      <td className="px-3 py-2 text-gray-300">...</td>
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr className="border-t border-gray-100">
                      <td colSpan={9} className="px-3 py-2 text-center text-gray-400">+ {preview.length - 5} registros adicionais no arquivo exportado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
