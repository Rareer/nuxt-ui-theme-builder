export function useThemeConfig() {
  const isOpen = useState<boolean>('theme-config-open', () => false)

  const open = () => { isOpen.value = true }
  const close = () => { isOpen.value = false }
  const toggle = () => { isOpen.value = !isOpen.value }

  return { isOpen, open, close, toggle }
}
