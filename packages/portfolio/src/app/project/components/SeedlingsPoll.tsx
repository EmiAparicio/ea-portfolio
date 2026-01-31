'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Russo_One } from 'next/font/google';

const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin'],
});

const CATEGORIES = [
  'Agua',
  'Aire',
  'Artificial',
  'Eléctrico',
  'Espiritual',
  'Fuego',
  'Mineral',
  'Vida',
];
const SUBCATEGORIES = ['Corrupto', 'Puro'];
const CATEGORY_TYPES: Record<string, string[]> = {
  Agua: [
    'Aire Fighter',
    'Artificial Tank',
    'Eléctrico Fighter',
    'Espiritual Tank',
    'Fuego Controller',
    'Mineral Controller',
  ],
  Aire: [
    'Agua Controller',
    'Artificial Controller',
    'Eléctrico Tank',
    'Espiritual Fighter',
    'Fuego Fighter',
    'Vida Tank',
  ],
  Artificial: [
    'Agua Tank',
    'Aire Tank',
    'Eléctrico Controller',
    'Fuego Controller',
    'Mineral Fighter',
    'Vida Fighter',
  ],
  Eléctrico: [
    'Agua Fighter',
    'Aire Fighter',
    'Artificial Controller',
    'Espiritual Controller',
    'Mineral Tank',
    'Vida Tank',
  ],
  Espiritual: [
    'Agua Controller',
    'Aire Tank',
    'Artificial Tank',
    'Fuego Fighter',
    'Mineral Fighter',
    'Vida Controller',
  ],
  Fuego: [
    'Aire Controller',
    'Artificial Fighter',
    'Eléctrico Tank',
    'Espiritual Fighter',
    'Mineral Tank',
    'Vida Controller',
  ],
  Mineral: [
    'Agua Fighter',
    'Aire Controller',
    'Eléctrico Controller',
    'Espiritual Tank',
    'Fuego Tank',
    'Vida Fighter',
  ],
  Vida: [
    'Agua Tank',
    'Artificial Fighter',
    'Eléctrico Fighter',
    'Espiritual Controller',
    'Fuego Tank',
    'Mineral Controller',
  ],
};

const TYPES_PER_SUB = 6;
const STEPS_PER_CAT = SUBCATEGORIES.length * TYPES_PER_SUB;
const TOTAL_STEPS = CATEGORIES.length * STEPS_PER_CAT; // 96 steps

// Helper to generate image paths and info for keys
const getStepInfo = (step: number) => {
  const catIdx = Math.floor(step / STEPS_PER_CAT);
  const stepInCat = step % STEPS_PER_CAT;
  const subIdx = Math.floor(stepInCat / TYPES_PER_SUB);
  const typeIdx = stepInCat % TYPES_PER_SUB;

  const category = CATEGORIES[catIdx];
  const subcategory = SUBCATEGORIES[subIdx];
  const type = CATEGORY_TYPES[category][typeIdx];

  const basePath = `/seedlings/${category}/${subcategory}/${type}`;

  // Hardcoded fixes for specific .jpeg files
  const getExt = (base: string, num: number) => {
    if (base === '/seedlings/Fuego/Puro/Artificial Fighter' && num === 1)
      return 'jpeg';
    if (base === '/seedlings/Fuego/Puro/Espiritual Fighter') return 'jpeg';
    return 'png';
  };

  return {
    paths: [
      `${basePath}/1.${getExt(basePath, 1)}`,
      `${basePath}/2.${getExt(basePath, 2)}`,
    ],
    category,
    subcategory,
    type,
  };
};

type Vote = 'Me gusta' | 'No me gusta' | 'Borra esta basura';

export default function SeedlingsPoll({
  onComplete,
  isSubmitting,
}: {
  onComplete?: (results: Record<number, Vote[]>) => void;
  isSubmitting?: boolean;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [votes, setVotes] = useState<Record<number, Vote[]>>({});
  const [isMounted, setIsMounted] = useState(false);

  // Hydration fix for localStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('seedlings-poll-state');
    if (saved) {
      try {
        const { step, votes: savedVotes } = JSON.parse(saved);
        setCurrentStep(step);
        setVotes(savedVotes);
      } catch (e) {
        console.error('Error parsing saved state', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(
      'seedlings-poll-state',
      JSON.stringify({
        step: currentStep,
        votes,
      })
    );
  }, [currentStep, votes, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, currentStep]);

  const handleVote = (imgIdx: number, value: Vote) => {
    setVotes((prev) => {
      const currentVotes = [...(prev[currentStep] || ['Me gusta', 'Me gusta'])];
      currentVotes[imgIdx] = value;
      return { ...prev, [currentStep]: currentVotes };
    });
  };

  const currentStepVotes = votes[currentStep] || ['Me gusta', 'Me gusta'];

  const next = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const { paths: images } = getStepInfo(currentStep);

  const [inputValue, setInputValue] = useState((currentStep + 1).toString());

  // Sync input value when currentStep changes
  useEffect(() => {
    setInputValue((currentStep + 1).toString());
  }, [currentStep]);

  if (!isMounted) return null;

  return (
    <div className="mobile-forced-landscape">
      <div className="mobile-content-wrapper mx-auto flex h-full max-w-6xl flex-col justify-between px-4 py-0.5 md:py-8">
        {/* Header - Minimalist on mobile */}
        <div className="mb-0 flex items-center justify-between md:mb-8">
          <div className="flex items-center gap-2 overflow-hidden">
            <h1
              className={`${russoOne.className} hidden shrink-0 text-2xl leading-none tracking-tighter text-black uppercase md:block`}
            >
              Seedlings Poll
            </h1>
            <p className="truncate text-[7px] font-medium text-black opacity-50 md:text-sm">
              <span className="mr-1 font-bold uppercase md:hidden">Poll:</span>
              No juzgues calidad, juzga al personaje.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentStep === TOTAL_STEPS - 1 && (
              <button
                id="submit-results-btn"
                disabled={isSubmitting}
                onClick={() => onComplete?.(votes)}
                className="rounded-full bg-black px-2 py-0.5 text-[8px] font-bold text-white md:text-sm"
              >
                {isSubmitting ? '...' : 'Enviar'}
              </button>
            )}
            <div className="flex items-center gap-1">
              <span className="hidden font-mono text-[10px] font-bold tracking-widest text-black uppercase opacity-40 md:block">
                Progreso
              </span>
              <div className="flex items-center gap-0.5">
                <input
                  type="text"
                  value={inputValue}
                  onBlur={() => setInputValue((currentStep + 1).toString())}
                  onChange={(e) => {
                    const valString = e.target.value;
                    setInputValue(valString);
                    const val = parseInt(valString);
                    if (!isNaN(val) && val >= 1 && val <= TOTAL_STEPS) {
                      setCurrentStep(val - 1);
                    }
                  }}
                  className={`${russoOne.className} w-5 border-none bg-transparent p-0 text-right text-[9px] text-black focus:ring-0 focus:outline-none md:w-12 md:text-xl`}
                />
                <div
                  className={`${russoOne.className} text-[9px] leading-none text-black md:text-xl`}
                >
                  / {TOTAL_STEPS}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex min-h-0 flex-1 items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="grid w-full grid-cols-2 gap-2 md:gap-8"
            >
              {images.map((src, idx) => (
                <div key={idx} className="flex min-w-0 flex-col gap-2 md:gap-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-black/10 bg-zinc-50 shadow-lg md:rounded-2xl md:shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Option ${idx + 1}`}
                      className="h-full w-full object-cover select-none"
                      loading="eager"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:gap-2">
                    <div className="flex gap-1 md:gap-2">
                      {(['Me gusta', 'No me gusta'] as Vote[]).map((val) => (
                        <button
                          key={val}
                          onClick={() => handleVote(idx, val)}
                          className={`flex-1 rounded-lg border px-1 py-1 text-[9px] font-bold transition-all md:rounded-xl md:py-4 md:text-sm ${
                            currentStepVotes[idx] === val
                              ? 'border-black bg-black text-white shadow-lg'
                              : 'border-black/5 bg-zinc-50 text-black/50 hover:border-black/20'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                      <button
                        onClick={() => handleVote(idx, 'Borra esta basura')}
                        className={`flex-1 rounded-lg border px-1 py-1 text-[8px] font-bold tracking-tight uppercase transition-all md:hidden ${
                          currentStepVotes[idx] === 'Borra esta basura'
                            ? 'border-red-600 bg-red-600 text-white shadow-md'
                            : 'border-black/5 bg-zinc-100/50 text-zinc-400'
                        }`}
                      >
                        Basura
                      </button>
                    </div>
                    {/* Desktop only full text basura button */}
                    <button
                      onClick={() => handleVote(idx, 'Borra esta basura')}
                      className={`hidden w-full rounded-xl border px-2 py-3 text-xs font-bold tracking-tight uppercase transition-all md:block ${
                        currentStepVotes[idx] === 'Borra esta basura'
                          ? 'border-red-600 bg-red-600 text-white shadow-md'
                          : 'border-black/5 bg-zinc-100/50 text-zinc-400 hover:border-red-200 hover:text-red-400'
                      }`}
                    >
                      Borra esta basura
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-0 flex items-center justify-between border-t border-black/5 pt-0.5 md:mt-12 md:pt-4">
          <button
            onClick={back}
            disabled={currentStep === 0}
            className="rounded-lg px-1 py-0.5 text-[9px] font-bold text-black transition-opacity hover:bg-black/5 active:scale-95 disabled:opacity-0 md:px-6 md:py-3 md:text-sm"
          >
            &larr; Atrás
          </button>

          {currentStep < TOTAL_STEPS - 1 && (
            <button
              onClick={next}
              className="rounded-full bg-black px-5 py-1 text-[9px] font-bold text-white shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95 md:px-10 md:py-4 md:text-base"
            >
              Siguiente &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
