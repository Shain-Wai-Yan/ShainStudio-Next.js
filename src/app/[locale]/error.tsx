'use client';

export default function PageError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center" role="alert">
      <h1 className="text-2xl font-semibold">This page is temporarily unavailable</h1>
      <p className="mt-4">Please try again in a moment.</p>
      <button onClick={reset} className="mt-6 rounded-lg border px-5 py-3 font-medium">
        Try again
      </button>
    </div>
  );
}
