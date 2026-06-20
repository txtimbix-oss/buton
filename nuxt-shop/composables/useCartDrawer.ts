export const useCartDrawer = () => {
  const isOpen = useState('cartDrawerOpen', () => false)
  return {
    isOpen,
    open:  () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}
