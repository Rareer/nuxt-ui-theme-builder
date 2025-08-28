import { defineNuxtPlugin } from '#app';
import nuxtUiDirective from '@/directives/nuxtUi';

export default defineNuxtPlugin((nuxtApp) => {
  // v-nuxt-ui
  nuxtApp.vueApp.directive('nuxt-ui', nuxtUiDirective);
});
