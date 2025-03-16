import { mechanismType } from '../types';

export const getErrorKey = (event: ErrorEvent | Event) => {
  const isJsError = event instanceof ErrorEvent;
  if (!isJsError) return mechanismType.RESOURCE;
  return event.message === 'Script error.' ? 'cross-script' : mechanismType.JS;
};

export const getErrorUid = (input: string) => {
  return window.btoa(encodeURIComponent(input));
};
