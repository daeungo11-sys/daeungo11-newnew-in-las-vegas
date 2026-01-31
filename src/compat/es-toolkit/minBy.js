export default function minBy(array, iteratee) {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  const getter = typeof iteratee === 'function' ? iteratee : (item) => item?.[iteratee];
  let minItem = array[0];
  let minValue = getter(minItem);
  for (let i = 1; i < array.length; i += 1) {
    const value = getter(array[i]);
    if (value < minValue) {
      minValue = value;
      minItem = array[i];
    }
  }
  return minItem;
}
