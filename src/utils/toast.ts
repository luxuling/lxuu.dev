export const TOAST_EVENT = 'app:toast';

export const showToast = (message: string) => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
};
