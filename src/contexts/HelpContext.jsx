import { createContext, useContext, useState } from 'react';

const HelpContext = createContext();

export function HelpProvider({ children }) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const openHelp = () => setIsHelpModalOpen(true);
  const closeHelp = () => setIsHelpModalOpen(false);

  return (
    <HelpContext.Provider value={{ isHelpModalOpen, openHelp, closeHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}
