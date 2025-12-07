import { create } from 'zustand';

interface SISStore {
  selectedTermId: string | null;
  selectedTermCode: string | null;
  selectedSubject: string | null;
  setSelectedTerm: (termId: string | null, termCode: string | null) => void;
  setSelectedSubject: (subject: string | null) => void;
}

export const useSISStore = create<SISStore>((set) => ({
  selectedTermId: null,
  selectedTermCode: null,
  selectedSubject: null,
  setSelectedTerm: (termId, termCode) =>
    set({ selectedTermId: termId, selectedTermCode: termCode }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
}));






