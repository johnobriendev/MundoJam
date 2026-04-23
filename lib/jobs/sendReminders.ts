import { prisma } from '../prisma'

export async function sendReminders(): Promise<{ sent: number }> {
  // Stub: full implementation in Phase 11.
  // Will email all GOING RSVPs for occurrences happening within 24 hours.
  void prisma
  return { sent: 0 }
}
