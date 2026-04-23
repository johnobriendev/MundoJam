import { prisma } from '../prisma'

export async function generateOccurrences(): Promise<{ created: number }> {
  // Stub: full implementation in Phase 6.
  // Will generate JamOccurrence rows for all APPROVED jams up to end of next calendar month.
  void prisma
  return { created: 0 }
}
