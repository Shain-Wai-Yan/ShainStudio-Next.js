'use client';

import { useEffect, useState } from 'react';
import { calculateAge } from '@/lib/calculateAge';

interface AgeDisplayProps {
  /** Server-rendered age, used for the first paint to avoid hydration mismatch. */
  initialAge: number;
  suffix: string;
}

export default function AgeDisplay({ initialAge, suffix }: AgeDisplayProps) {
  const [age, setAge] = useState(initialAge);

  // Recompute in the browser so the value reflects the current date for every
  // visitor, even if the page was statically built long ago.
  useEffect(() => {
    setAge(calculateAge());
  }, []);

  return (
    <>
      {age} {suffix}
    </>
  );
}
