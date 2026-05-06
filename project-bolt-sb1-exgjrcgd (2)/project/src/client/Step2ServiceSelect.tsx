import { useState, useEffect } from 'react';
import { BookingData, PetData } from './BookingFlow';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { supabase, SlotConfig } from '../lib/supabase';

interface Props {
  data: BookingData;
  updatePet: (idx: number, field: keyof PetData, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

const PACKAGE_OPTIONS = [
  { value: 'avulso', label: 'Avulso', desc: 'Serviço único sem vínculo' },
  { value: 'basico', label: 'Pacote Básico', desc: '1 banho + 1 banho e tosa higiênica por mês' },
  { value: 'basico_tosa', label: 'Pacote Básico com Tosa', desc: '1 banho + 1 banho e tosa por mês' },
  { value: 'premium', label: 'Pacote Premium', desc: '3 banhos + 1 banho e tosa ou tosa higiênica por mês' },
];

const SIZE_OPTIONS = [
  { value: 'pequeno_medio', label: 'Pequeno / Médio' },
  { value: 'grande_peludo', label: 'Grande Peludo' },
  { value: 'grande_pelo_curto', label: 'Grande Pelo Curto' },
];

// Determines what service options are available for this pet based on slot config
// Returns a list of "service option objects" to display
// Special: if only banho_tosa_hig is configured (no separate banho), group them as one combined button
interface ServiceOption {
  // 'single' = one clear service; 'combo' = "Banho ou Banho+Tosa Higiênica" grouped button
  type: 'single' | 'combo';
  label: string;
  // For single: the service value to store
  service?: string;
  // For combo: the slot field used for capacity counting is banho_tosa_hig;
  // sub-options let client pick what they actually want on the day
  subOptions?: { value: string; label: string }[];
  slotField: string; // the slot_configs field that gets its capacity consumed
}

function getServiceOptions(slots: SlotConfig[], size: string, species: string): ServiceOption[] {
  if (species === 'gato') {
    return [{ type: 'single', label: 'Banho', service: 'banho', slotField: 'gato_banho' }];
  }

  if (!slots.length) {
    return [
      { type: 'single', label: 'Banho', service: 'banho', slotField: `${size}_banho` },
      { type: 'combo', label: 'Banho ou Banho + Tosa Higiênica', slotField: `${size}_banho_tosa_hig`, subOptions: [
        { value: 'banho', label: 'Banho' },
        { value: 'banho_tosa_higienica', label: 'Banho + Tosa Higiênica' },
      ]},
      { type: 'single', label: 'Banho + Tosa', service: 'banho_tosa', slotField: `${size}_banho_tosa` },
    ];
  }

  const hasBanho = slots.some(s => s.is_active && (s[`${size}_banho` as keyof SlotConfig] as number) > 0);
  const hasTosaHig = slots.some(s => s.is_active && (s[`${size}_banho_tosa_hig` as keyof SlotConfig] as number) > 0);
  const hasTosa = slots.some(s => s.is_active && (s[`${size}_banho_tosa` as keyof SlotConfig] as number) > 0);

  const options: ServiceOption[] = [];

  if (hasBanho) {
    options.push({ type: 'single', label: 'Banho', service: 'banho', slotField: `${size}_banho` });
  }

  if (hasTosaHig) {
    options.push({
      type: 'combo',
      label: 'Banho ou Banho + Tosa Higiênica',
      slotField: `${size}_banho_tosa_hig`,
      subOptions: [
        { value: 'banho', label: 'Banho' },
        { value: 'banho_tosa_higienica', label: 'Banho + Tosa Higiênica' },
      ],
    });
  }

  if (hasTosa) {
    options.push({ type: 'single', label: 'Banho + Tosa', service: 'banho_tosa', slotField: `${size}_banho_tosa` });
  }

  if (options.length === 0) {
    options.push({ type: 'single', label: 'Banho', service: 'banho', slotField: `${size}_banho` });
  }

  return options;
}

export default function Step2ServiceSelect({ data, updatePet, onNext, onBack }: Props) {
  const [slotConfigs, setSlotConfigs] = useState<SlotConfig[]>([]);
  // Track which pet has expanded the combo sub-choice
  const [comboOpen, setComboOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    supabase.from('slot_configs').select('*').eq('is_active', true).then(({ data: d }) => {
      setSlotConfigs((d as SlotConfig[]) || []);
    });
  }, []);

  const valid = data.pets.every(p => {
    if (!p.name.trim()) return false;
    if (!p.species) return false;
    if (p.species === 'cachorro' && !p.size) return false;
    if (!p.appointment_type) return false;
    if (p.appointment_type === 'avulso') {
      // must have a selected service and it must not be empty
      if (!p.service_type) return false;
      // if combo was selected: service_type can be banho or banho_tosa_higienica — both valid
    }
    if (p.package_type === 'premium' && !(p as unknown as Record<string, unknown>)['premium_tosa_choice']) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {data.pets.map((pet, idx) => {
        const serviceOptions = getServiceOptions(slotConfigs, pet.size, pet.species);
        const premiumChoice = (pet as unknown as Record<string, unknown>)['premium_tosa_choice'] as string | undefined;

        // Determine which service option is currently "selected" for avulso
        const selectedOptionIdx = serviceOptions.findIndex(opt => {
          if (opt.type === 'single') return pet.service_type === opt.service;
          // combo: selected if service_type is one of its sub-options
          return opt.subOptions?.some(s => s.value === pet.service_type);
        });

        // For the selected combo option: which sub-option is picked
        const selectedCombo = serviceOptions.find(
          (opt, i) => i === selectedOptionIdx && opt.type === 'combo'
        );

        return (
          <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
            <h3 className="font-bold text-gray-800 text-sm">
              Pet {idx + 1}{pet.name ? ` — ${pet.name}` : ''}
            </h3>

            {/* Tipo de Atendimento */}
            <div>
              <label className="label">Tipo de Serviço *</label>
              {pet.species === 'gato' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                  Gatos só podem ser agendados como serviço avulso.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PACKAGE_OPTIONS.filter(opt => pet.species !== 'gato' || opt.value === 'avulso').map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      pet.package_type === opt.value
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`apt_type_${idx}`}
                      value={opt.value}
                      checked={pet.package_type === opt.value}
                      onChange={() => {
                        updatePet(idx, 'appointment_type', opt.value === 'avulso' ? 'avulso' : 'pacote');
                        updatePet(idx, 'package_type', opt.value);
                        if (opt.value !== 'premium') {
                          updatePet(idx, 'premium_tosa_choice' as keyof PetData, undefined);
                        }
                        if (opt.value === 'avulso') {
                          // auto-select first available service
                          const opts = getServiceOptions(slotConfigs, pet.size, pet.species);
                          const first = opts[0];
                          if (first?.type === 'single') {
                            updatePet(idx, 'service_type', first.service!);
                          } else {
                            // combo: don't auto-select sub-option, let user choose
                            updatePet(idx, 'service_type', '');
                          }
                          setComboOpen(c => ({ ...c, [idx]: false }));
                        }
                      }}
                      className="mt-0.5 accent-amber-500"
                      required
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Premium tosa choice */}
            {pet.package_type === 'premium' && (
              <div>
                <label className="label">Sessão de tosa do Pacote Premium *</label>
                <p className="text-xs text-gray-500 mb-2">
                  Escolha o tipo de tosa obrigatória (1 vez por mês). As 3 sessões de banho são automáticas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { value: 'banho_tosa', label: 'Banho + Tosa', desc: 'Tosa completa' },
                    { value: 'banho_tosa_higienica', label: 'Banho + Tosa Higiênica', desc: 'Tosa higiênica' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        premiumChoice === opt.value
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`premium_tosa_${idx}`}
                        value={opt.value}
                        checked={premiumChoice === opt.value}
                        onChange={() => {
                          updatePet(idx, 'service_type', opt.value);
                          updatePet(idx, 'premium_tosa_choice' as keyof PetData, opt.value);
                        }}
                        className="mt-0.5 accent-amber-500"
                        required
                      />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome do Pet *</label>
                <input
                  className="input"
                  value={pet.name}
                  onChange={e => updatePet(idx, 'name', e.target.value)}
                  placeholder="Nome do pet"
                  required
                />
              </div>

              <div>
                <label className="label">Espécie *</label>
                <div className="flex gap-3">
                  {[{ v: 'cachorro', l: 'Cachorro' }, { v: 'gato', l: 'Gato' }].map(s => (
                    <label key={s.v} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                      pet.species === s.v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}>
                      <input type="radio" name={`species_${idx}`} value={s.v} checked={pet.species === s.v}
                        onChange={() => {
                          updatePet(idx, 'species', s.v);
                          if (s.v === 'gato') {
                            updatePet(idx, 'service_type', 'banho');
                            updatePet(idx, 'appointment_type', 'avulso');
                            updatePet(idx, 'package_type', 'avulso');
                          }
                        }}
                        className="sr-only" required />
                      {s.l}
                    </label>
                  ))}
                </div>
              </div>

              {pet.species === 'cachorro' && (
                <div>
                  <label className="label">Porte *</label>
                  <select className="input" value={pet.size} onChange={e => updatePet(idx, 'size', e.target.value)} required>
                    {SIZE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              )}

              {/* Serviço: only for avulso */}
              {pet.appointment_type === 'avulso' && (
                <div className={pet.species === 'cachorro' ? '' : 'sm:col-span-2'}>
                  <label className="label">Serviço *</label>
                  {serviceOptions.length === 1 && serviceOptions[0].type === 'single' ? (
                    // Only one option: show as non-interactive selected badge
                    <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-amber-500 bg-amber-50">
                      <span className="text-sm font-semibold text-amber-800">{serviceOptions[0].label}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {serviceOptions.map((opt, oi) => {
                        const isSelected = oi === selectedOptionIdx;
                        if (opt.type === 'single') {
                          return (
                            <label
                              key={oi}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`service_${idx}`}
                                checked={isSelected}
                                onChange={() => {
                                  updatePet(idx, 'service_type', opt.service!);
                                  setComboOpen(c => ({ ...c, [idx]: false }));
                                }}
                                className="accent-amber-500"
                              />
                              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                            </label>
                          );
                        }

                        // Combo button
                        const isComboOpen = isSelected || comboOpen[idx];
                        return (
                          <div key={oi} className={`rounded-lg border-2 transition-all ${isSelected ? 'border-amber-500' : 'border-gray-200 hover:border-amber-300'}`}>
                            <button
                              type="button"
                              onClick={() => {
                                // Select this combo option group
                                if (!isSelected) {
                                  updatePet(idx, 'service_type', '');
                                }
                                setComboOpen(c => ({ ...c, [idx]: !c[idx] }));
                              }}
                              className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all ${isSelected ? 'bg-amber-50' : 'bg-white'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`text-sm font-medium ${isSelected ? 'text-amber-800' : 'text-gray-800'}`}>{opt.label}</span>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isComboOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isComboOpen && (
                              <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-2 bg-white rounded-b-lg">
                                <p className="text-xs text-gray-500 mb-1">Qual serviço você quer hoje?</p>
                                {opt.subOptions?.map(sub => (
                                  <label
                                    key={sub.value}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                      pet.service_type === sub.value
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-gray-200 bg-white hover:border-amber-300'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`service_sub_${idx}`}
                                      checked={pet.service_type === sub.value}
                                      onChange={() => {
                                        updatePet(idx, 'service_type', sub.value);
                                        // Mark the combo as selected by ensuring service_type is set
                                      }}
                                      className="accent-amber-500"
                                    />
                                    <span className="text-sm font-medium text-gray-800">{sub.label}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Show selected combo sub-choice confirmation */}
                  {selectedCombo && pet.service_type && (
                    <p className="text-xs text-amber-700 mt-1.5 font-medium">
                      Selecionado: {selectedCombo.subOptions?.find(s => s.value === pet.service_type)?.label}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="label">Possui Alergia? *</label>
                <div className="flex gap-3">
                  {[{ v: false, l: 'Não' }, { v: true, l: 'Sim' }].map(a => (
                    <label key={String(a.v)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                      pet.has_allergy === a.v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}>
                      <input type="radio" name={`allergy_${idx}`} checked={pet.has_allergy === a.v}
                        onChange={() => updatePet(idx, 'has_allergy', a.v)}
                        className="sr-only" />
                      {a.l}
                    </label>
                  ))}
                </div>
              </div>

              {pet.has_allergy && (
                <div className="sm:col-span-2">
                  <label className="label">Descrição da Alergia *</label>
                  <input
                    className="input"
                    value={pet.allergy_description}
                    onChange={e => updatePet(idx, 'allergy_description', e.target.value)}
                    placeholder="Descreva a alergia do pet"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 border border-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
        <button type="submit" disabled={!valid} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
          Próximo <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
