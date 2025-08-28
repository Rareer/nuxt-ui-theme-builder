import { onMounted } from 'vue';
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

  onMounted(() => {
    store.loadFromLocalStorage();
    // subscribe to changes
    store.$subscribe(() => {
      save();
    }, { detached: true });
  });
});
