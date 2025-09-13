export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  if (!user.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
