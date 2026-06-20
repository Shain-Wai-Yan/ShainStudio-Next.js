// Birthday: June 20, 2002 (month is 0-indexed, so 5 = June).
const BIRTH_DATE = new Date(2002, 5, 20);

export function calculateAge(reference: Date = new Date()): number {
  let age = reference.getFullYear() - BIRTH_DATE.getFullYear();
  const hasBirthdayOccurred =
    reference.getMonth() > BIRTH_DATE.getMonth() ||
    (reference.getMonth() === BIRTH_DATE.getMonth() &&
      reference.getDate() >= BIRTH_DATE.getDate());
  if (!hasBirthdayOccurred) age--;
  return age;
}
