export const passwordRequirements = [
  { label: 'Të paktën 12 karaktere', matches: (value: string) => value.length >= 12 },
  { label: 'Shkronjë e madhe (A–Z)', matches: (value: string) => /[A-Z]/.test(value) },
  { label: 'Shkronjë e vogël (a–z)', matches: (value: string) => /[a-z]/.test(value) },
  { label: 'Një numër (0–9)', matches: (value: string) => /[0-9]/.test(value) },
  { label: 'Një simbol (!, @, #…)', matches: (value: string) => /[^a-zA-Z0-9]/.test(value) },
];

export function getEmailError(value: string): string {
  const email = value.trim();
  if (!email) return 'Shkruani adresën e emailit.';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Shkruani një email të vlefshëm, p.sh. emri@shembull.com.';
  return '';
}

export function getPasswordError(value: string, requirePolicy: boolean): string {
  if (!value) return 'Shkruani fjalëkalimin.';
  if (value.length > 128) return 'Fjalëkalimi mund të ketë deri në 128 karaktere.';
  if (requirePolicy && passwordRequirements.some(rule => !rule.matches(value))) return 'Plotësoni kërkesat e fjalëkalimit më poshtë.';
  return '';
}
