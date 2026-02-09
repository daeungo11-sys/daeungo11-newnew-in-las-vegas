export default function uniqBy(array, iteratee) {
  if (!Array.isArray(array)) return [];
  const getter = typeof iteratee === 'function' ? iteratee : (item) => item?.[iteratee];
  const seen = new Set();
  const result = [];
  for (const item of array) {
    const key = getter(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}
