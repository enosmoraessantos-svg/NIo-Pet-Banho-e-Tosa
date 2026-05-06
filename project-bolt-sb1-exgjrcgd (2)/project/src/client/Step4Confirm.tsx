import { BookingData, getSessionServices } from './BookingFlow';
import { ChevronLeft, CheckCircle } from 'lucide-react';

const SERVICE_LABELS: Record<string, string> = {
  banho: 'Banho',
  banho_tosa_higienica: 'Banho + Tosa Higiênica',
  banho_tosa: 'Banho + Tosa',
};
const SIZE_LABELS: Record<string, string> = {
  pequeno_medio: 'Pequeno/Médio',
  grande_peludo: 'Grande Peludo',
  grande_pelo_curto: 'Grande Pelo Curto',
};
const PACKAGE_LABELS: Record<string, string> = {
  avulso: 'Avulso',
  basico: 'Pacote Básico',
  basico_tosa: 'Pacote Básico com Tosa',
  premium: 'Pacote Premium',
};

function fmtDate(iso: string) {
  if (!iso) return '-';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

interface Props {
  data: BookingData;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export default function Step4Confirm({ data, submitting, onSubmit, onBack }: Props) {
  const hasAvulso = data.pets.some(p => p.appointment_type === 'avulso');

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Confira os dados abaixo antes de confirmar. Se estiver tudo certo, clique em <strong>Confirmar Agendamento</strong>.
      </p>

      {/* Client data */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-3">Dados do Cliente</h4>
        <Row label="Nome" value={data.client_name} />
        <Row label="WhatsApp" value={data.client_whatsapp} />
        <Row label="Endereço" value={`${data.address_street}, ${data.address_number} — Sol Nascente`} />
      </div>

      {/* Pets */}
      {data.pets.map((pet, idx) => {
        const serviceList = pet.appointment_type === 'pacote' ? getSessionServices(pet) : [];
        const sessions = pet.sessions || [];

        return (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-3">
              Pet {idx + 1}: {pet.name}
            </h4>
            <Row label="Tipo de Atendimento" value={PACKAGE_LABELS[pet.package_type] || pet.package_type} />
            <Row label="Espécie" value={pet.species === 'cachorro' ? 'Cachorro' : 'Gato'} />
            {pet.species === 'cachorro' && <Row label="Porte" value={SIZE_LABELS[pet.size] || pet.size} />}
            {pet.appointment_type === 'avulso' && (
              <Row label="Serviço" value={SERVICE_LABELS[pet.service_type] || pet.service_type} />
            )}
            <Row label="Alergia" value={pet.has_allergy ? `Sim — ${pet.allergy_description}` : 'Não'} />

            {/* Package sessions summary */}
            {pet.appointment_type === 'pacote' && sessions.length > 0 && (
              <div className="pt-2 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sessões agendadas</p>
                {sessions.map((ses, si) => (
                  ses.date && ses.time ? (
                    <div key={si} className="flex gap-2 text-xs text-gray-700 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                      <span className="font-semibold text-amber-700 min-w-[60px]">Sessão {si + 1}{si >= (pet.package_type === 'premium' ? 4 : 2) ? ' (opt.)' : ''}</span>
                      <span>{fmtDate(ses.date)}</span>
                      <span>{ses.time}</span>
                      <span className="text-gray-500">{SERVICE_LABELS[serviceList[si]] || ''}</span>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Avulso schedule */}
      {hasAvulso && data.appointment_date && (
        <div className="bg-amber-50 rounded-xl p-4 space-y-2">
          <h4 className="font-bold text-gray-800 text-sm border-b border-amber-200 pb-2 mb-3">Agendamento Avulso</h4>
          <Row label="Data" value={new Date(data.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} />
          <Row label="Horário" value={data.appointment_time} />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 border border-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 min-w-[120px] shrink-0">{label}:</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
