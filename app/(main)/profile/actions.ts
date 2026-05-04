'use server'

import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { uploadFile } from '@/lib/storage'
import { geocodeCity } from '@/lib/geocoding'
import { updateProfile } from '@/lib/users/updateProfile'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  bio: z.string().max(1000, 'Bio is too long').optional(),
  city: z.string().max(100, 'City is too long').optional(),
  isDiscoverable: z.boolean(),
  instruments: z.array(z.string().min(1)),
  genres: z.array(z.string().min(1)),
})

export type UpdateProfileState = {
  errors?: Record<string, string[]>
  success?: boolean
}

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const user = await requireUser()

  let instruments: string[] = []
  let genres: string[] = []

  try {
    instruments = JSON.parse((formData.get('instrumentsJson') as string) || '[]')
    genres = JSON.parse((formData.get('genresJson') as string) || '[]')
  } catch {
    return { errors: { _form: ['Invalid form data — please try again'] } }
  }

  const validated = profileSchema.safeParse({
    name: formData.get('name'),
    bio: (formData.get('bio') as string) || undefined,
    city: (formData.get('city') as string) || undefined,
    isDiscoverable: formData.get('isDiscoverable') === 'true',
    instruments,
    genres,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { name, bio, city, isDiscoverable } = validated.data

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']

  let avatarUrl: string | null | undefined
  const avatarFile = formData.get('avatar') as File | null
  if (avatarFile && avatarFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(avatarFile.type)) {
      return { errors: { avatar: ['Please upload a JPEG, PNG, WebP, AVIF, or GIF file.'] } }
    }
    try {
      avatarUrl = await uploadFile(avatarFile, 'avatars')
    } catch {
      return { errors: { avatar: ['Failed to upload image — please try again'] } }
    }
  } else if (formData.get('removeAvatar') === 'true') {
    avatarUrl = null
  }

  let lat: number | undefined
  let lng: number | undefined
  if (city) {
    const coords = await geocodeCity(city)
    lat = coords.lat
    lng = coords.lng
  }

  await updateProfile({
    userId: user.id,
    name,
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    bio,
    city,
    lat,
    lng,
    isDiscoverable,
    instruments: validated.data.instruments,
    genres: validated.data.genres,
  })

  return { success: true }
}
