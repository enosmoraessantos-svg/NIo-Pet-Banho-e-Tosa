import { BookingData } from './BookingFlow';
import { ChevronRight } from 'lucide-react';

interface Props {
  data: BookingData;
  onChange: (d: BookingData) => void;
  onNext: () => void;
  setNumPets: (n: number) => void;
}

export default function Step1ClientInfo({ data, onChange, onNext, setNumPets }: Props) {
  const set = (field: keyof BookingData, val: unknown) => onChange({ ...data, [field]: val });

  const phoneDigits = data.client_whatsapp.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 11;
  const valid = data.client_name.trim() && phoneValid && data.address_street.trim() && data.address_number.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nome Completo *</label>
        <input
          className="input"
          value={data.client_name}
          onChange={e => set('client_name', e.target.value)}
          placeholder="Seu nome completo"
          required
        />
      </div>

      <div>
        <label className="label">WhatsApp * <span className="text-xs font-normal text-gray-400">(somente números, 11 dígitos: DDD + número)</span></label>
        <input
          className={`input ${data.client_whatsapp && !phoneValid ? 'border-red-400 focus:border-red-500' : ''}`}
          value={data.client_whatsapp}
          onChange={e => set('client_whatsapp', e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="61999999999"
          maxLength={11}
          inputMode="numeric"
          required
        />
        {data.client_whatsapp && !phoneValid && (
          <p className="text-xs text-red-500 mt-1">Informe exatamente 11 dígitos (ex: 61999999999)</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label">Rua *</label>
          <input
            className="input"
            value={data.address_street}
            onChange={e => set('address_street', e.target.value)}
            placeholder="Nome da rua"
            required
          />
        </div>
        <div>
          <label className="label">Número *</label>
          <input
            className="input"
            value={data.address_number}
            onChange={e => set('address_number', e.target.value)}
            placeholder="Ex: 42"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Bairro</label>
        <input className="input bg-gray-50 text-gray-500 cursor-not-allowed" value="Sol Nascente" disabled />
      </div>

      <div>
        <label className="label">Quantos pets deseja agendar? *</label>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setNumPets(n)}
              className={`w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all ${
                data.num_pets === n
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-500 hover:border-amber-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-2"
      >
        Próximo <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  );
}
