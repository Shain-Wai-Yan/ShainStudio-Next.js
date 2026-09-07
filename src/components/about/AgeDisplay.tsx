'use client';

import { useSyncExternalStore } from 'react';
import { calculateAge } from '@/lib/calculateAge';

interface AgeDisplayProps {
  /** Server-rendered age, used for the first paint to avoid hydration mismatch. */
  initialAge: number;
  suffix: string;
}

const subscribe = () => () => {};

export default function AgeDisplay({ initialAge, suffix }: AgeDisplayProps) {
  const age = useSyncExternalStore(subscribe, calculateAge, () => initialAge);

  return (
    <>
      {age} {suffix}
    </>
  );
}
