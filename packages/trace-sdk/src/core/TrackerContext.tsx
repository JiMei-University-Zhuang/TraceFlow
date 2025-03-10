//将tracker实例集成到react的上下文中
import React, { createContext, useContext } from 'react';
import { Tracker } from './Tracker';

const TrackerContext = createContext<Tracker | null>(null);

export const TrackerProvider: React.FC<{
  tracker: Tracker;
  children: React.ReactNode;
}> = ({ tracker, children }) => {
  return <TrackerContext.Provider value={tracker}>{children}</TrackerContext.Provider>;
};

export const useTracker = () => {
  const tracker = useContext(TrackerContext);
  if (!tracker) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return tracker;
};
