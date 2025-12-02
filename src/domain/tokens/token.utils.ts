export function calculateExpiresAt(
  createdAt: Date,
  expiresInMinutes: number,
): Date {
  return new Date(createdAt.getTime() + expiresInMinutes * 60_000);
}