import { useState, useEffect } from 'react';
import { supabase, SlotConfig, Block } from '../lib/supabase';
import { BookingData, PetData, getSessionServices } from './BookingFlow';
import { ChevronRight, ChevronLeft, CalendarDays, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: BookingData;
  slotConfigs: SlotConfig[];
  blocks: Block[];
  releaseDay: number;
  hasPackagePets: boolean;
  updatePet: (idx: number, field: keyof PetData, value: unknown | ((prev: unknown) => unknown)) => void;
  onChange: (date: string, time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  banho: 'Banho',
  banho_tosa_higienica: 'Banho + Tosa Higiênica',
  banho_tosa: 'Banho + Tosa',
};

function getAvailableDates(releaseDay: number): string[] {
  const result: string[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Determine the max date we can show
  // If today >= releaseDay: show current month + next month entirely
  // If today < releaseDay: show only current month
  const currentDay = today.getDate();
  let maxDate: Date;

  if (currentDay >= releaseDay) {
    // Can show next month — go to end of next month
    const nextMonthYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
    const nextMonth = (today.getMonth() + 1) % 12;
    // Last day of next month
    maxDate = new Date(nextMonthYear, nextMonth + 1, 0);
  } else {
    // Only current month
    maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  const cur = new Date(today);
  while (cur <= maxDate) {
    result.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function isDayBlocked(date: string, blocks: Block[]): boolean {
  return blocks.some(b => {
    if (b.block_type === 'dia' && b.block_date === date) return true;
    if (b.block_type === 'periodo' && b.period_start && b.period_end) {
      return date >= b.period_start && date <= b.period_end;
    }
    return false;
  });
}

function isTimeBlocked(date: string, time: string, blocks: Block[]): boolean {
  return blocks.some(b => {
    if (b.block_type === 'horario' && b.block_date === date && b.block_time_start && b.block_time_end) {
      return time >= b.block_time_start && time <= b.block_time_end;
    }
    return false;
  });
}

function isPastTime(date: string, time: string): boolean {
  const slotDt = new Date(`${date}T${time}`);
  return slotDt <= new Date();
}

// Returns the slot_configs field to use for capacity counting.
// If the service is 'banho' but the admin only configured banho_tosa_hig (not banho separately),
// the banho sessions should consume the banho_tosa_hig capacity bucket.
function getSlotField(size: string, service: string, species: string, slots: SlotConfig[] = []): keyof SlotConfig {
  if (species === 'gato') return 'gato_banho';

  if (service === 'banho_tosa') return `${size}_banho_tosa` as keyof SlotConfig;
  if (service === 'banho_tosa_higienica') return `${size}_banho_tosa_hig` as keyof SlotConfig;

  // service === 'banho': prefer banho field, but fall back to banho_tosa_hig if banho has no capacity
  const banhoField = `${size}_banho` as keyof SlotConfig;
  const tosaHigField = `${size}_banho_tosa_hig` as keyof SlotConfig;
  const hasBanhoSlot = slots.some(s => s.is_active && (s[banhoField] as number) > 0);
  if (hasBanhoSlot) return banhoField;
  // fallback: use banho_tosa_hig bucket (admin set "banho ou banho+tosa hig" slots)
  return tosaHigField;
}

function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

interface SlotPickerProps {
  label: string;
  selectedDate: string;
  selectedTime: string;
  slotField: keyof SlotConfig;
  allDates: string[];
  slotConfigs: SlotConfig[];
  blocks: Block[];
  usedSlots: Record<string, number>;
  // e.g. "2026-05" — when set, only dates in this year-month are shown
  restrictToMonth?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

function SlotPicker({ label, selectedDate: selectedDateProp, selectedTime: selectedTimeProp, slotField, allDates, slotConfigs, blocks, usedSlots, restrictToMonth, onDateChange, onTimeChange }: SlotPickerProps) {
  const [localDate, setLocalDate] = useState(selectedDateProp);
  const [localTime, setLocalTime] = useState(selectedTimeProp);

  // Sync if parent resets (e.g. month change clears sessions)
  useEffect(() => { setLocalDate(selectedDateProp); }, [selectedDateProp]);
  useEffect(() => { setLocalTime(selectedTimeProp); }, [selectedTimeProp]);

  const availableDates = allDates.filter(date => {
    if (restrictToMonth && !date.startsWith(restrictToMonth)) return false;
    if (isDayBlocked(date, blocks)) return false;
    const dow = new Date(date + 'T00:00:00').getDay();
    return slotConfigs.some(s => s.day_of_week === dow && s.is_active && (s[slotField] as number) > 0);
  });

  const getTimesForDate = (date: string) => {
    if (!date) return [];
    const dow = new Date(date + 'T00:00:00').getDay();
    return slotConfigs
      .filter(s => s.day_of_week === dow && s.is_active)
      .map(s => {
        const time = s.time_slot?.slice(0, 5) || '';
        const capacity = (s[slotField] as number) || 0;
        const used = usedSlots[`${date}_${time}_${slotField}`] || 0;
        const blocked = isTimeBlocked(date, s.time_slot || '', blocks) || isPastTime(date, s.time_slot || '');
        return { time, capacity, used, blocked, available: !blocked && capacity > 0 && used < capacity };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const times = getTimesForDate(localDate);

  const handleDateClick = (date: string) => {
    setLocalDate(date);
    setLocalTime('');
    onDateChange(date);
    onTimeChange('');
  };

  const handleTimeClick = (time: string) => {
    setLocalTime(time);
    onTimeChange(time);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div>
        <p className="text-xs text-gray-500 mb-2">Selecione a data *</p>
        {availableDates.length === 0 ? (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">Nenhuma data disponível.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {availableDates.map(date => (
              <button
                key={date}
                type="button"
                onClick={() => handleDateClick(date)}
                className={`py-1.5 px-1 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                  localDate === date
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-600 hover:border-amber-300'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        )}
      </div>
      {localDate && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Selecione o horário *</p>
          {times.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">Nenhum horário disponível para esta data.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {times.map(({ time, available, used, capacity, blocked }) => (
                <button
                  key={time}
                  type="button"
                  disabled={!available}
                  onClick={() => available && handleTimeClick(time)}
                  className={`py-2 px-1 rounded-lg border-2 text-xs font-semibold transition-all ${
                    localTime === time
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : available
                      ? 'border-gray-200 text-gray-700 hover:border-amber-400'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  <span className="block">{time}</span>
                  {capacity > 0 && (
                    <span className="text-xs font-normal opacity-70 block">
                      {blocked ? 'Bloq.' : available ? `${capacity - used}v` : 'Lotado'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Step3Schedule({ data, slotConfigs, blocks, releaseDay, updatePet, onChange, onNext, onBack }: Props) {
  // For avulso: single date/time
  const [selectedDate, setSelectedDate] = useState(data.appointment_date || '');
  const [selectedTime, setSelectedTime] = useState(data.appointment_time || '');
  // Track used slot counts keyed by "date_time"
  const [usedSlots, setUsedSlots] = useState<Record<string, number>>({});
  // Per-pet reference month for same-month enforcement (keyed by petIdx)
  // Updated immediately when session 0's date is picked, so session 2+ can render right away
  const [refMonths, setRefMonths] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    data.pets.forEach((pet, i) => {
      const s0date = pet.sessions?.[0]?.date;
      if (s0date) init[i] = s0date.slice(0, 7);
    });
    return init;
  });

  const allDates = getAvailableDates(releaseDay);

  const firstPet = data.pets[0];
  const petSize = firstPet?.size || 'pequeno_medio';
  const petSpecies = firstPet?.species || 'cachorro';
  const serviceType = firstPet?.service_type || 'banho';
  const slotField = getSlotField(petSize, serviceType, petSpecies, slotConfigs);

  // Load used slots for date range, keyed by "date_time_slotField" so each
  // service bucket (banho, banho_tosa, banho_tosa_hig, gato_banho) is counted independently.
  useEffect(() => {
    if (allDates.length === 0 || slotConfigs.length === 0) return;
    const from = allDates[0];
    const to = allDates[allDates.length - 1];
    supabase
      .from('appointments')
      .select('appointment_date, appointment_time, service_type, pets(species, size)')
      .gte('appointment_date', from)
      .lte('appointment_date', to)
      .neq('status', 'cancelado')
      .then(({ data: appts }) => {
        const counts: Record<string, number> = {};
        (appts || []).forEach((a: Record<string, unknown>) => {
          const pet = a.pets as { species?: string; size?: string } | null;
          const species = pet?.species || 'cachorro';
          const size = pet?.size || 'pequeno_medio';
          const service = String(a.service_type || 'banho');
          const field = getSlotField(size, service, species, slotConfigs);
          const time = String(a.appointment_time || '').slice(0, 5);
          const key = `${a.appointment_date}_${time}_${field}`;
          counts[key] = (counts[key] || 0) + 1;
        });
        setUsedSlots(counts);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDates.length, releaseDay, slotConfigs.length]);

  const avulsoDates = allDates.filter(date => {
    if (isDayBlocked(date, blocks)) return false;
    const dow = new Date(date + 'T00:00:00').getDay();
    return slotConfigs.some(s => s.day_of_week === dow && s.is_active && (s[slotField] as number) > 0);
  });

  const getAvulsoTimes = (date: string) => {
    if (!date) return [];
    const dow = new Date(date + 'T00:00:00').getDay();
    return slotConfigs
      .filter(s => s.day_of_week === dow && s.is_active)
      .map(s => {
        const time = s.time_slot?.slice(0, 5) || '';
        const capacity = (s[slotField] as number) || 0;
        const used = usedSlots[`${date}_${time}_${slotField}`] || 0;
        const blocked = isTimeBlocked(date, s.time_slot || '', blocks) || isPastTime(date, s.time_slot || '');
        return { time, capacity, used, blocked, available: !blocked && capacity > 0 && used < capacity };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const avulsoTimes = getAvulsoTimes(selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate avulso pets
    const avulsoPets = data.pets.filter(p => p.appointment_type === 'avulso');
    if (avulsoPets.length > 0 && (!selectedDate || !selectedTime)) return;

    // Validate package pets
    for (const pet of data.pets.filter(p => p.appointment_type === 'pacote')) {
      const sessions = pet.sessions || [];
      const required = getRequiredSessionCount(pet.package_type);
      for (let i = 0; i < required; i++) {
        if (!sessions[i]?.date || !sessions[i]?.time) return;
      }
    }

    onNext();
  };

  const isValid = () => {
    const avulsoPets = data.pets.filter(p => p.appointment_type === 'avulso');
    if (avulsoPets.length > 0 && (!selectedDate || !selectedTime)) return false;

    for (const pet of data.pets.filter(p => p.appointment_type === 'pacote')) {
      const sessions = pet.sessions || [];
      const required = getRequiredSessionCount(pet.package_type);
      for (let i = 0; i < required; i++) {
        if (!sessions[i]?.date || !sessions[i]?.time) return false;
      }
      // All sessions must be in the same month as session 0
      if (sessions[0]?.date) {
        const month = sessions[0].date.slice(0, 7);
        for (let i = 1; i < sessions.length; i++) {
          if (sessions[i]?.date && !sessions[i].date.startsWith(month)) return false;
        }
      }
    }
    return true;
  };

  const getRequiredSessionCount = (packageType: string) => {
    if (packageType === 'basico' || packageType === 'basico_tosa') return 2;
    if (packageType === 'premium') return 4;
    return 1;
  };

  const updateSession = (petIdx: number, sesIdx: number, field: 'date' | 'time', value: string) => {
    if (sesIdx === 0 && field === 'date') {
      const newMonth = value.slice(0, 7);
      setRefMonths(prev => ({ ...prev, [petIdx]: newMonth }));
    }

    // Use functional updater so concurrent calls always read the latest sessions array
    updatePet(petIdx, 'sessions', (prev: unknown) => {
      const sessions = [...((prev as { date: string; time: string }[] | undefined) || [])];
      if (!sessions[sesIdx]) sessions[sesIdx] = { date: '', time: '' };
      sessions[sesIdx] = { ...sessions[sesIdx], [field]: value };

      // If session 0's date changes, clear sessions in a different month
      if (sesIdx === 0 && field === 'date') {
        const newMonth = value.slice(0, 7);
        for (let i = 1; i < sessions.length; i++) {
          if (sessions[i]?.date && !sessions[i].date.startsWith(newMonth)) {
            sessions[i] = { date: '', time: '' };
          }
        }
      }
      return sessions;
    });
  };

  const addOptionalSession = (petIdx: number) => {
    updatePet(petIdx, 'sessions', (prev: unknown) => {
      const sessions = [...((prev as { date: string; time: string }[] | undefined) || [])];
      sessions.push({ date: '', time: '' });
      return sessions;
    });
  };

  const removeOptionalSession = (petIdx: number) => {
    updatePet(petIdx, 'sessions', (prev: unknown) => {
      const sessions = [...((prev as { date: string; time: string }[] | undefined) || [])];
      sessions.pop();
      return sessions;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avulso pets: single date/time */}
      {data.pets.some(p => p.appointment_type === 'avulso') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            <p className="font-semibold text-gray-700 text-sm">Data e horário do atendimento avulso</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Selecione a data *</p>
            {avulsoDates.length === 0 ? (
              <p className="text-gray-500 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                Nenhuma data disponível no momento.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                {avulsoDates.map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => { setSelectedDate(date); setSelectedTime(''); onChange(date, ''); }}
                    className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                      selectedDate === date
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedDate && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Selecione o horário *</p>
              {avulsoTimes.length === 0 ? (
                <p className="text-gray-500 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                  Nenhum horário disponível para este dia.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {avulsoTimes.map(({ time, available, used, capacity, blocked }) => (
                    <button
                      key={time}
                      type="button"
                      disabled={!available}
                      onClick={() => { if (available) { setSelectedTime(time); onChange(selectedDate, time); } }}
                      className={`py-2.5 px-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        selectedTime === time
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : available
                          ? 'border-gray-200 text-gray-700 hover:border-amber-400'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <span className="block">{time}</span>
                      {capacity > 0 && (
                        <span className="text-xs font-normal opacity-70">
                          {blocked ? 'Bloq.' : available ? `${capacity - used} vaga${capacity - used !== 1 ? 's' : ''}` : 'Lotado'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Package pets: one SlotPicker per session */}
      {data.pets.map((pet, petIdx) => {
        if (pet.appointment_type !== 'pacote') return null;
        const sessions = pet.sessions || [];
        const required = getRequiredSessionCount(pet.package_type);
        const serviceList = getSessionServices(pet);
        const hasOptional = pet.package_type === 'premium';
        const hasOptionalSession = sessions.length === 5;

        // Ensure sessions array is initialized
        const sessionsInit = Array.from({ length: Math.max(required, sessions.length) }, (_, i) => sessions[i] || { date: '', time: '' });

        // Reference month is kept in local state so it updates immediately on session 0 date pick
        const refMonth = refMonths[petIdx];

        return (
          <div key={petIdx} className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              <p className="font-semibold text-gray-700 text-sm">
                {pet.name ? `${pet.name} — ` : ''}Sessões do pacote
              </p>
            </div>
            {refMonth && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Todas as sessões devem ser agendadas no mesmo mês. Mês de referência: <strong>{new Date(refMonth + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
              </p>
            )}
            {sessionsInit.map((ses, sesIdx) => {
              const isOptional = sesIdx >= required;
              const sesService = serviceList[sesIdx] || 'banho';
              const sesSlotField = getSlotField(pet.size, sesService, pet.species, slotConfigs);
              // Sessions after the first are restricted to the reference month
              const restrict = sesIdx > 0 ? refMonth : undefined;

              return (
                <div key={sesIdx} className={`rounded-xl border-2 p-1 ${isOptional ? 'border-dashed border-gray-300' : 'border-amber-200'}`}>
                  <div className="flex items-center justify-between px-3 pt-2 pb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOptional ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                      Sessão {sesIdx + 1}{isOptional ? ' (opcional)' : ' *'} — {SERVICE_LABELS[sesService] || sesService}
                    </span>
                    {isOptional && (
                      <button type="button" onClick={() => removeOptionalSession(petIdx)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    )}
                  </div>
                  {sesIdx > 0 && !refMonth ? (
                    <p className="text-xs text-gray-400 px-4 py-3">Escolha a data da Sessão 1 primeiro.</p>
                  ) : (
                    <SlotPicker
                      label=""
                      selectedDate={ses.date}
                      selectedTime={ses.time}
                      slotField={sesSlotField}
                      allDates={allDates}
                      slotConfigs={slotConfigs}
                      blocks={blocks}
                      usedSlots={usedSlots}
                      restrictToMonth={restrict}
                      onDateChange={v => updateSession(petIdx, sesIdx, 'date', v)}
                      onTimeChange={v => updateSession(petIdx, sesIdx, 'time', v)}
                    />
                  )}
                </div>
              );
            })}

            {hasOptional && !hasOptionalSession && (
              <button
                type="button"
                onClick={() => addOptionalSession(petIdx)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 border border-dashed border-gray-300 px-4 py-2 rounded-xl w-full justify-center hover:border-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar 5ª sessão (opcional — banho)
              </button>
            )}
          </div>
        );
      })}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 border border-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
        <button
          type="submit"
          disabled={!isValid()}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Próximo <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
