import { useEffect } from 'react';

export default function useOnWindowEnter(
  handler: () => void,
  extraDeps: React.DependencyList = []
) {
  useEffect(() => {
    const enterHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handler();
      }
    };

    // Use a 100ms delay to avoid getting the event immediately when
    // transitioning from previous UI. It's also often a good idea anyway to
    // discard input when new UI hasn't displayed for long enough for the user
    // to react to it.
    const timerId = setTimeout(() => {
      window.addEventListener('keydown', enterHandler);
    }, 100);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('keydown', enterHandler);
    };
  }, [handler, ...extraDeps]);
}
