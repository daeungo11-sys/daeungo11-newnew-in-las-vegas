export default function sumBy(array, iteratee) {
  if (!Array.isArray(array)) return 0;
  const getter = typeof iteratee === 'function' ? iteratee : (item) => item?.[iteratee];
  return array.reduce((sum, item) => sum + (Number(getter(item)) || 0), 0);
}
