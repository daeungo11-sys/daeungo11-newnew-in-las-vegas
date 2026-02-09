export default function range(start, end, step = 1) {
  let from = start;
  let to = end;
  if (to === undefined) {
    to = from;
    from = 0;
  }
  const result = [];
  if (step === 0) return result;
  const increasing = step > 0;
  if (increasing) {
    for (let i = from; i < to; i += step) {
      result.push(i);
    }
  } else {
    for (let i = from; i > to; i += step) {
      result.push(i);
    }
  }
  return result;
}
