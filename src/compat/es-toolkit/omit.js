export default function omit(obj, keys) {
  if (obj == null) return {};
  const keySet = new Set(Array.isArray(keys) ? keys : [keys]);
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!keySet.has(key)) {
      result[key] = value;
    }
  }
  return result;
}
