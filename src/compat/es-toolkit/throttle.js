export default function throttle(fn, wait = 0) {
  let lastTime = 0;
  let timeout = null;
  let lastArgs = null;

  const invoke = (time) => {
    lastTime = time;
    fn(...(lastArgs || []));
    lastArgs = null;
  };

  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      invoke(now);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        invoke(Date.now());
      }, remaining);
    }
  };
}
