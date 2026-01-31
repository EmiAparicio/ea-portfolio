'use client';

import React, { useState } from 'react';
import SeedlingsPoll, {
  CATEGORIES,
  SUBCATEGORIES,
  CATEGORY_TYPES,
  TYPES_PER_SUB,
  STEPS_PER_CAT,
  TOTAL_STEPS,
} from '@project/components/SeedlingsPoll';
import { db } from '@project/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function SeedlingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load submission status
  React.useEffect(() => {
    const status = localStorage.getItem('seedlings-poll-submitted');
    if (status === 'true') {
      setHasSubmitted(true);
    }
  }, []);

  const handleComplete = async (results: Record<number, string[]>) => {
    if (hasSubmitted) return;
    setIsSubmitting(true);
    try {
      // Format results as requested: "Agua-Corrupto-AireFighter-1": "Me gusta"
      const formattedResults: Record<string, string> = {};

      // Iterate through ALL possible steps (96) to ensure 192 entries
      for (let step = 0; step < TOTAL_STEPS; step++) {
        const catIdx = Math.floor(step / STEPS_PER_CAT);
        const stepInCat = step % STEPS_PER_CAT;
        const subIdx = Math.floor(stepInCat / TYPES_PER_SUB);
        const typeIdx = stepInCat % TYPES_PER_SUB;

        const category = CATEGORIES[catIdx];
        const subcategory = SUBCATEGORIES[subIdx];
        const type = CATEGORY_TYPES[category][typeIdx];

        const prefix = `${category}-${subcategory}-${type.replace(/\s+/g, '')}`;

        // Use votes from results if they exist, otherwise default to "Me gusta"
        const votes = results[step] || ['Me gusta', 'Me gusta'];

        formattedResults[`${prefix}-1`] = votes[0];
        formattedResults[`${prefix}-2`] = votes[1];
      }

      await addDoc(collection(db, 'encuestas'), {
        results: formattedResults,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Persist submission status
      localStorage.setItem('seedlings-poll-submitted', 'true');
      setHasSubmitted(true);
      setSubmitted(true);
      localStorage.removeItem('seedlings-poll-state');
    } catch (error) {
      console.error('Error submitting results:', error);
      alert(
        'Hubo un error al enviar los resultados. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-[1000] min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <div className="py-12">
        {submitted ? (
          <div className="animate-in fade-in zoom-in flex min-h-[60vh] flex-col items-center justify-center p-8 text-center duration-500">
            <h2 className="mb-4 text-4xl font-bold text-black">
              ¡Enviado con éxito!
            </h2>
            <p className="max-w-md font-medium text-black opacity-60">
              Tus respuestas han sido registradas. ¡Muchas gracias por
              participar!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-8 rounded-full border border-black px-6 py-2 text-sm font-bold transition-all hover:bg-black hover:text-white"
            >
              Revisar personajes
            </button>
          </div>
        ) : (
          <>
            {isSubmitting && (
              <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent" />
                  <p className="text-sm font-bold tracking-widest text-black uppercase">
                    Enviando respuestas...
                  </p>
                </div>
              </div>
            )}
            <SeedlingsPoll
              onComplete={handleComplete}
              isSubmitting={isSubmitting}
              hasSubmitted={hasSubmitted}
            />
          </>
        )}
      </div>
    </div>
  );
}
