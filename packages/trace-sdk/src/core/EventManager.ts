export const createBaseEvent = (eventType: string, eventData?: Record<string, any>) => {
  return {
    eventType,
    ...eventData,
    timestamp: Date.now(),
    pageUrl: window.location.href,
    attempts: 0,
  };
};
