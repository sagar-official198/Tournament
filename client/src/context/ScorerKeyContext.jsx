import { createContext, useContext } from 'react';

export const ScorerKeyContext = createContext('');
export const useScorerKey = () => useContext(ScorerKeyContext);
