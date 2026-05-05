import { useState, useEffect } from 'react';
import { supabase, SlotConfig, Block } from '../lib/supabase';
import { PawPrint, CheckCircle, AlertCircle } from 'lucide-react';
import Step1ClientInfo from './Step1ClientInfo';
import Step2ServiceSelect from './Step2ServiceSelect';
import Step3Schedule from './Step3Schedule';
import Step4Confirm from './Step4Confirm';

export interface PetData {
  name: string;
  species: 'cachorro' | 'gato';
  size: string;
  service_type: string;
  has_allergy: boolean;
  allergy_description: string;
  appointment_type: 'avulso' | 'pacote';
  package_type: string;
  premium_tosa_choice?: string;
  // For package sessions: array of { date, time } per session
  sessions?: { date: string; time: string }[];
}

export interface BookingData {
  client_name: string;
  client_whatsapp: string;
  address_street: string;
  address_number: string;
  num_pets: number;
  pets: PetData[];
  appointment_date: string;
  appointment_time: string;
}

const defaultPet: PetData = {
  name: '',
  species: 'cachorro',
  size: 'pequeno_medio',
  service_type: 'banho',
  has_allergy: false,
  allergy_description: '',
  appointment_type: 'avulso',
  package_type: 'avulso',
};

// How many sessions each package type has (required + optional)
export const PACKAGE_SESSION_COUNT: Record<string, number> = {
  basico: 2,
  basico_tosa: 2,
  premium: 4, // 4 required; 5th is optional and added separately
};

// Service per session for each package type
export const PACKAGE_SESSION_SERVICES: Record<string, string[]> = {
  basico: ['banho', 'banho_tosa_higienica'],
  basico_tosa: ['banho', 'banho_tosa'],
  // premium: first 3 are banho, 4th is the tosa choice (set later), 5th optional is banho
};

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>({
    client_name: '',
    client_whatsapp: '',
    address_street: '',
    address_number: '',
    num_pets: 1,
    pets: [{ ...defaultPet }],
    appointment_date: '',
    appointment_time: '',
  });
  const [slotConfigs, setSlotConfigs] = useState<SlotConfig[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [releaseDay, setReleaseDay] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  useEffect(() => {
    supabase.from('slot_configs').select('*').then(({ data: d }) => setSlotConfigs((d as SlotConfig[]) || []));
    supabase.from('blocks').select('*').eq('is_active', true).then(({ data: d }) => setBlocks((d as Block[]) || []));
    supabase.from('agenda_releases').select('release_day').maybeSingle().then(({ data: d }) => {
      if (d) setReleaseDay(d.release_day);
    });
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const periodoBlock = blocks.find(b => b.block_type === 'periodo' && b.period_start && b.period_end && today >= b.period_start && today <= b.period_end);
    if (periodoBlock) {
      setBlockMessage(
        periodoBlock.return_message ||
        `Estamos fechados. Motivo: ${periodoBlock.reason}. ${periodoBlock.period_end ? `Voltamos no dia ${periodoBlock.period_end}.` : ''}`
      );
    }
  }, [blocks]);

  const updatePet = (idx: number, field: keyof PetData, value: unknown | ((prev: unknown) => unknown)) => {
    setData(d => {
      const pets = [...d.pets];
      const resolved = typeof value === 'function'
        ? (value as (prev: unknown) => unknown)(pets[idx][field])
        : value;
      pets[idx] = { ...pets[idx], [field]: resolved };
      return { ...d, pets };
    });
  };

  const setNumPets = (n: number) => {
    setData(d => {
      const pets = Array.from({ length: n }, (_, i) => d.pets[i] || { ...defaultPet });
      return { ...d, num_pets: n, pets };
    });
  };

  // Determine if any pet needs multi-session scheduling
  const hasPackagePets = data.pets.some(p => p.appointment_type === 'pacote');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: client } = await supabase.from('clients').insert({
        name: data.client_name,
        whatsapp: data.client_whatsapp,
        address_street: data.address_street,
        address_number: data.address_number,
        address_neighborhood: 'Sol Nascente',
      }).select().single();

      for (const pet of data.pets) {
        const { data: petRow } = await supabase.from('pets').insert({
          client_id: client.id,
          name: pet.name,
          species: pet.species,
          size: pet.species === 'gato' ? null : pet.size,
          has_allergy: pet.has_allergy,
          allergy_description: pet.allergy_description,
        }).select().single();

        if (pet.appointment_type === 'avulso') {
          await supabase.from('appointments').insert({
            client_id: client.id,
            pet_id: petRow.id,
            package_id: null,
            appointment_type: 'avulso',
            service_type: pet.service_type,
            appointment_date: data.appointment_date,
            appointment_time: data.appointment_time,
            status: 'agendado',
            talked_to_client: false,
          });
        } else {
          // Package: create package record then one appointment per session
          const { data: pkg } = await supabase.from('packages').insert({
            client_id: client.id,
            pet_id: petRow.id,
            package_type: pet.package_type,
            status: 'ativo',
          }).select().single();

          const sessions = pet.sessions || [];
          const serviceList = getSessionServices(pet);

          for (let i = 0; i < sessions.length; i++) {
            const ses = sessions[i];
            if (!ses.date || !ses.time) continue;
            await supabase.from('appointments').insert({
              client_id: client.id,
              pet_id: petRow.id,
              package_id: pkg.id,
              appointment_type: 'pacote',
              service_type: serviceList[i] || 'banho',
              appointment_date: ses.date,
              appointment_time: ses.time,
              status: 'agendado',
              session_number: i + 1,
              talked_to_client: false,
            });
          }
        }
      }
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (blockMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Agendamento Indisponível</h2>
          <p className="text-gray-600">{blockMessage}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Agendado!</h2>
          <p className="text-gray-600 mb-4">
            Em breve nossa equipe vai entrar em contato. De imediato, mande foto do seu pet para adiantar o seu atendimento.
          </p>
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Resumo:</p>
            <p>{data.client_name} — {data.pets.map(p => p.name).join(', ')}</p>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setData({ client_name: '', client_whatsapp: '', address_street: '', address_number: '', num_pets: 1, pets: [{ ...defaultPet }], appointment_date: '', appointment_time: '' });
              setSubmitted(false);
            }}
            className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1, label: 'Dados Pessoais' },
    { n: 2, label: 'Pets e Serviços' },
    { n: 3, label: 'Data e Horário' },
    { n: 4, label: 'Confirmação' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Nilo Pet</h1>
            <p className="text-xs text-gray-500">Banho e Tosa</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s.n ? 'bg-amber-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-xs mt-1 font-medium hidden md:block ${step >= s.n ? 'text-amber-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mt-[-12px] md:mt-[-20px] transition-all ${step > s.n ? 'bg-amber-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-amber-500 px-6 py-4">
          <h2 className="font-bold text-white text-lg">{steps[step - 1].label}</h2>
          <p className="text-amber-100 text-sm">Etapa {step} de 4 — todos os campos são obrigatórios</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <Step1ClientInfo data={data} onChange={d => setData(d)} onNext={() => setStep(2)} setNumPets={setNumPets} />
          )}
          {step === 2 && (
            <Step2ServiceSelect data={data} updatePet={updatePet} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <Step3Schedule
              data={data}
              slotConfigs={slotConfigs}
              blocks={blocks}
              releaseDay={releaseDay}
              hasPackagePets={hasPackagePets}
              updatePet={updatePet}
              onChange={(date, time) => setData(d => ({ ...d, appointment_date: date, appointment_time: time }))}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4Confirm
              data={data}
              submitting={submitting}
              onSubmit={handleSubmit}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function getSessionServices(pet: PetData): string[] {
  if (pet.package_type === 'basico') return ['banho', 'banho_tosa_higienica'];
  if (pet.package_type === 'basico_tosa') return ['banho', 'banho_tosa'];
  if (pet.package_type === 'premium') {
    const tosa = pet.premium_tosa_choice || 'banho_tosa';
    const sessions = pet.sessions || [];
    const services = ['banho', 'banho', 'banho', tosa];
    if (sessions.length === 5) services.push('banho');
    return services;
  }
  return ['banho'];
}
