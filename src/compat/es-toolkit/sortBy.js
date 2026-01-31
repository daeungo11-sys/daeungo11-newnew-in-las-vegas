export default function sortBy(array, iteratee) {
  if (!Array.isArray(array)) return [];
  const getter = typeof iteratee === 'function' ? iteratee : (item) => item?.[iteratee];
  return [...array].sort((a, b) => {
    const valueA = getter(a);
    const valueB = getter(b);
    if (valueA === valueB) return 0;
    return valueA > valueB ? 1 : -1;
  });
}
