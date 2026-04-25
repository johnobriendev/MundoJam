import { z } from 'zod'

export type JamFormState = {
  errors?: Record<string, string[]>
  message?: string
}

const equipmentItemSchema = z.object({
  item: z.string().min(1),
  notes: z.string().optional(),
})

export const jamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  recurrenceType: z.enum(['ONE_TIME', 'WEEKLY', 'MONTHLY'], {
    error: 'Select a recurrence type',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endTime: z.string().optional(),
  endDate: z.string().optional(),
  genres: z.array(z.string().min(1)).min(1, 'Select at least one genre'),
  instruments: z.array(z.string().min(1)),
  equipment: z.array(equipmentItemSchema),
  resubmittedFromId: z.string().optional(),
})
