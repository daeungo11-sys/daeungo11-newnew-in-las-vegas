export default function maxBy(array, iteratee) {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  const getter = typeof iteratee === 'function' ? iteratee : (item) => item?.[iteratee];
  let maxItem = array[0];
  let maxValue = getter(maxItem);
  for (let i = 1; i < array.length; i += 1) {
    const value = getter(array[i]);
    if (value > maxValue) {
      maxValue = value;
      maxItem = array[i];
    }
  }
  return maxItem;
}
