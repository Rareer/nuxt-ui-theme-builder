import { defineNuxtPlugin } from '#app';
import { useComponentUiConfigStore } from '@/store/componentUiConfig';

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default defineNuxtPlugin(() => {
  const store = useComponentUiConfigStore();
  const save = debounce(() => store.saveToLocalStorage(), 200);

  // Load immediately so initial render already has persisted state
  store.loadFromLocalStorage();
  // Subscribe immediately as well
  store.$subscribe(() => { save(); }, { detached: true });
});
