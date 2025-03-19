export const createBaseEvent = (eventType: string, eventData?: Record<string, any>) => {
  return {
    eventType,
    eventData,
    timeStamp: Date.now(),
    pageUrl: window.location.href,
  };
};
