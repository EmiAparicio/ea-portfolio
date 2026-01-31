'use client';

import React, { useState } from 'react';
import SeedlingsPoll from '@project/components/SeedlingsPoll';
import { db } from '@project/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function SeedlingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleComplete = async (results: Record<number, string[]>) => {
    setIsSubmitting(true);
    try {
      // Format results as requested: "Agua-Corrupto-AireFighter-1": "Me gusta"
      const formattedResults: Record<string, string> = {};

      Object.entries(results).forEach(([stepStr, votes]) => {
        const step = parseInt(stepStr);
        // We need the helper here too or a way to get the info
        // Let's import the arrays or move the logic to a shared place if needed,
        // but for now, we can replicate the math since it's simple
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
        const TYPES = [
          'Aire Fighter',
          'Artificial Tank',
          'Eléctrico Fighter',
          'Espiritual Tank',
          'Fuego Controller',
          'Mineral Controller',
        ];

        const catIdx = Math.floor(step / (SUBCATEGORIES.length * TYPES.length));
        const subIdx = Math.floor(
          (step % (SUBCATEGORIES.length * TYPES.length)) / TYPES.length
        );
        const typeIdx = step % TYPES.length;

        const prefix = `${CATEGORIES[catIdx]}-${SUBCATEGORIES[subIdx]}-${TYPES[typeIdx].replace(/\s+/g, '')}`;
        formattedResults[`${prefix}-1`] = votes[0];
        formattedResults[`${prefix}-2`] = votes[1];
      });

      await addDoc(collection(db, 'encuestas'), {
        results: formattedResults,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
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
            />
          </>
        )}
      </div>
    </div>
  );
}
