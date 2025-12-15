'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Persona = 'higher-ed' | 'nonprofit';

type PersonaContextValue = {
  persona: Persona;
  setPersona: (p: Persona) => void;
};

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>('higher-ed');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('persona') : null;
    if (stored === 'higher-ed' || stored === 'nonprofit') {
      setPersonaState(stored);
    }
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('persona', p);
    }
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}



