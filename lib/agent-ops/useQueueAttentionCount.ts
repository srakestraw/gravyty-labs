'use client';

import * as React from 'react';

export function useQueueAttentionCount(): number {
  // TODO: Replace with real data; mock for now
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // Simulate async load
    setTimeout(() => {
      setCount(7); // mock value
    }, 0);
  }, []);

  return count;
}

