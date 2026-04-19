'use client';

import { useEffect, useState } from 'react';

const ROLES = [
  'Digital Marketer',
  'Vibe Coder',
  'Systems Architect',
  'Creative Storyteller',
  'SEO Engineer',
];

const TYPING_SPEED = 80;
const DELETING_SPEED = 45;
const PAUSE_AFTER_TYPE = 1800;
const PAUSE_AFTER_DELETE = 400;

export default function HeroTypewriter() {
  const [displayed, setDisplayed] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const current = ROLES[roleIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < current.length) {
          setDisplayed(current.slice(0, displayed.length + 1));
        } else {
          setIsPaused(true);
          setTimeout(() => {
            setIsDeleting(true);
            setIsPaused(false);
          }, PAUSE_AFTER_TYPE);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(current.slice(0, displayed.length - 1));
        } else {
          setIsPaused(true);
          setTimeout(() => {
            setIsDeleting(false);
            setRoleIndex((prev) => (prev + 1) % ROLES.length);
            setIsPaused(false);
          }, PAUSE_AFTER_DELETE);
        }
      }
    }, isDeleting ? DELETING_SPEED : TYPING_SPEED);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, isPaused, roleIndex]);

  return (
    <span
      className="hero-typewriter"
      aria-label={`Role: ${ROLES[roleIndex]}`}
    >
      <span className="hero-typewriter__text">{displayed}</span>
      <span className="hero-typewriter__cursor" aria-hidden="true">|</span>
    </span>
  );
}
