const PATH_REGEX = /\[(\d+)\]|\.?([^[.\]]+)/g;

function toPath(input) {
  if (Array.isArray(input)) return input;
  if (typeof input !== 'string') return [input];
  const parts = [];
  input.replace(PATH_REGEX, (_, index, name) => {
    if (index !== undefined) {
      parts.push(Number(index));
    } else if (name) {
      parts.push(name);
    }
    return '';
  });
  return parts;
}

export default function get(obj, path, defaultValue) {
  if (obj == null) return defaultValue;
  const parts = toPath(path);
  let current = obj;
  for (const key of parts) {
    if (current == null) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}
