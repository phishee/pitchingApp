'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserInfo } from '@/models';

interface AthleteSelectionState {
  selectedAthletes: UserInfo[];
}

interface AthleteSelectionContextType {
  state: AthleteSelectionState;
  setSelectedAthletes: (athletes: UserInfo[]) => void;
  clearSelection: () => void;
  toggleAthlete: (athlete: UserInfo) => void;
}

const AthleteSelectionContext = createContext<AthleteSelectionContextType | undefined>(undefined);

export function AthleteSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedAthletes, setSelectedAthletes] = useState<UserInfo[]>([]);

  const clearSelection = () => setSelectedAthletes([]);
  
  const toggleAthlete = (athlete: UserInfo) => {
    setSelectedAthletes(prev => {
      const exists = prev.some(a => a.userId === athlete.userId);
      if (exists) {
        return prev.filter(a => a.userId !== athlete.userId);
      } else {
        return [...prev, athlete];
      }
    });
  };

  return (
    <AthleteSelectionContext.Provider value={{
      state: { selectedAthletes },
      setSelectedAthletes,
      clearSelection,
      toggleAthlete
    }}>
      {children}
    </AthleteSelectionContext.Provider>
  );
}

export const useAthleteSelection = () => {
  const context = useContext(AthleteSelectionContext);
  if (!context) {
    throw new Error('useAthleteSelection must be used within AthleteSelectionProvider');
  }
  return context;
};


