import { PrismaClient, SkillLevel, RecurrenceType, RsvpStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const USERS = [
  {
    name: 'Marco Rivera',
    email: 'marco@demo.com',
    city: 'Mexico City',
    lat: 19.4326,
    lng: -99.1332,
    bio: 'Bassist and composer. Loves latin jazz and funk.',
    skillLevel: SkillLevel.ADVANCED,
    instruments: ['Bass', 'Upright Bass'],
    genres: ['Jazz', 'Funk', 'Latin'],
  },
  {
    name: 'Sofia Chen',
    email: 'sofia@demo.com',
    city: 'Barcelona',
    lat: 41.3851,
    lng: 2.1734,
    bio: 'Pianist and singer-songwriter exploring flamenco fusion.',
    skillLevel: SkillLevel.INTERMEDIATE,
    instruments: ['Piano', 'Keyboard', 'Voice'],
    genres: ['Flamenco', 'Pop', 'Jazz'],
  },
  {
    name: 'Luca Bianchi',
    email: 'luca@demo.com',
    city: 'Rome',
    lat: 41.9028,
    lng: 12.4964,
    bio: 'Drummer with 10 years of live performance experience.',
    skillLevel: SkillLevel.ADVANCED,
    instruments: ['Drums', 'Percussion'],
    genres: ['Rock', 'Jazz', 'Blues'],
  },
  {
    name: 'Amara Osei',
    email: 'amara@demo.com',
    city: 'Accra',
    lat: 5.6037,
    lng: -0.187,
    bio: 'Guitarist and producer. Afrobeats and highlife are my roots.',
    skillLevel: SkillLevel.INTERMEDIATE,
    instruments: ['Guitar', 'Electric Guitar'],
    genres: ['Afrobeats', 'Highlife', 'Funk'],
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki@demo.com',
    city: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    bio: 'Saxophonist and occasional composer. City jazz is my thing.',
    skillLevel: SkillLevel.ADVANCED,
    instruments: ['Saxophone', 'Flute'],
    genres: ['Jazz', 'Bossa Nova', 'Fusion'],
  },
  {
    name: 'Elena Popescu',
    email: 'elena@demo.com',
    city: 'Bucharest',
    lat: 44.4268,
    lng: 26.1025,
    bio: 'Fiddler who loves traditional music and crossover experiments.',
    skillLevel: SkillLevel.BEGINNER,
    instruments: ['Violin', 'Fiddle'],
    genres: ['Folk', 'Classical', 'World'],
  },
]

const JAMS = [
  {
    hostIndex: 0, // Marco
    title: 'Sunday Jazz & Funk Jam',
    description:
      'Casual weekly jam in the heart of Roma Norte. All groove-lovers welcome — bring your axe and your ears. We usually run 3 hours with a short break.',
    address: 'Calle Orizaba 101, Roma Norte',
    city: 'Mexico City',
    country: 'Mexico',
    lat: 19.4195,
    lng: -99.1583,
    recurrenceType: RecurrenceType.WEEKLY,
    genres: ['Jazz', 'Funk', 'Latin'],
    instrumentsNeeded: ['Drums', 'Trumpet', 'Voice'],
    equipment: [
      { item: 'PA System', notes: 'Mackie 12-channel mixer + mains' },
      { item: 'Drum Kit', notes: 'Pearl kit, bring own cymbals' },
    ],
    occurrenceDates: [
      daysFromNow(-14),
      daysFromNow(-7),
      daysFromNow(0),
      daysFromNow(7),
      daysFromNow(14),
    ],
  },
  {
    hostIndex: 1, // Sofia
    title: 'Flamenco Fusion Session',
    description:
      'Monthly gathering for flamenco and jazz musicians to experiment. Expect palmas, improvisation, and a lot of duende. Hosted at a private studio in Gràcia.',
    address: 'Carrer de Verdi 55, Gràcia',
    city: 'Barcelona',
    country: 'Spain',
    lat: 41.4036,
    lng: 2.1577,
    recurrenceType: RecurrenceType.MONTHLY,
    genres: ['Flamenco', 'Jazz', 'World'],
    instrumentsNeeded: ['Guitar', 'Cajon', 'Trumpet'],
    equipment: [{ item: 'Keyboard', notes: 'Yamaha CP88 available' }],
    occurrenceDates: [daysFromNow(-30), daysFromNow(0), daysFromNow(30)],
  },
  {
    hostIndex: 2, // Luca
    title: 'Blues & Rock Open Jam',
    description:
      'Drop-in jam every two weeks at a local rehearsal studio near Trastevere. 12-bar blues to start, then open format. Beginners encouraged.',
    address: 'Via della Lungaretta 34, Trastevere',
    city: 'Rome',
    country: 'Italy',
    lat: 41.8896,
    lng: 12.4686,
    recurrenceType: RecurrenceType.WEEKLY,
    genres: ['Blues', 'Rock', 'Jazz'],
    instrumentsNeeded: ['Guitar', 'Bass', 'Voice'],
    equipment: [
      { item: 'Backline', notes: 'Fender Twin + Marshall JCM800 available' },
      { item: 'Drum Kit', notes: 'Tama kit, full setup' },
    ],
    occurrenceDates: [daysFromNow(-10), daysFromNow(4), daysFromNow(18)],
  },
  {
    hostIndex: 3, // Amara
    title: 'Afrobeats & Highlife Groove',
    description:
      'One-time special session bringing together Accra musicians for an afternoon of highlife, afrobeats, and freestyle. Outdoor courtyard, sound system provided.',
    address: '12 Oxford St, Osu',
    city: 'Accra',
    country: 'Ghana',
    lat: 5.5558,
    lng: -0.1969,
    recurrenceType: RecurrenceType.ONE_TIME,
    genres: ['Afrobeats', 'Highlife', 'Funk'],
    instrumentsNeeded: ['Drums', 'Keyboard', 'Saxophone'],
    equipment: [{ item: 'Sound System', notes: 'Full outdoor PA' }],
    occurrenceDates: [daysFromNow(10)],
  },
  {
    hostIndex: 4, // Yuki
    title: 'Tokyo Late-Night Jazz Session',
    description:
      'Weekly late-night jazz jam in Shimokitazawa. Starts at 21:00, runs until we run out of ideas. Standards, originals, and free improv all welcome.',
    address: '2-12-13 Kitazawa, Shimokitazawa',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6614,
    lng: 139.6677,
    recurrenceType: RecurrenceType.WEEKLY,
    genres: ['Jazz', 'Fusion', 'Bossa Nova'],
    instrumentsNeeded: ['Piano', 'Bass', 'Drums'],
    equipment: [
      { item: 'Upright Bass', notes: 'Available to borrow' },
      { item: 'Piano', notes: 'Kawai upright in tune' },
    ],
    occurrenceDates: [
      daysFromNow(-7),
      daysFromNow(0),
      daysFromNow(7),
      daysFromNow(14),
    ],
  },
]

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(19, 0, 0, 0)
  return d
}

function endTime(start: Date): Date {
  return new Date(start.getTime() + 3 * 60 * 60 * 1000)
}

const COMMENTS = [
  'Great session last time, looking forward to this one!',
  'Will there be a bass amp available?',
  'Can beginners join or is this more advanced?',
  'Love the vibe here, see you all there.',
  'I might be 15 min late — save me a spot!',
  'Do I need to bring my own gear?',
  'First time coming, super excited!',
  'Anyone want to carpool from the city centre?',
]

async function main() {
  const password = await bcrypt.hash('demo1234', 12)

  console.log('Creating users...')
  const createdUsers = []
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password,
        name: u.name,
        city: u.city,
        lat: u.lat,
        lng: u.lng,
        bio: u.bio,
        skillLevel: u.skillLevel,
        isDiscoverable: true,
        instruments: {
          create: u.instruments.map((instrument) => ({ instrument })),
        },
        genres: {
          create: u.genres.map((genre) => ({ genre })),
        },
      },
    })
    createdUsers.push(user)
    console.log(`  Created user: ${user.email}`)
  }

  console.log('Creating jams...')
  for (const j of JAMS) {
    const host = createdUsers[j.hostIndex]
    const jam = await prisma.jam.create({
      data: {
        title: j.title,
        description: j.description,
        address: j.address,
        city: j.city,
        country: j.country,
        lat: j.lat,
        lng: j.lng,
        recurrenceType: j.recurrenceType,
        startDate: j.occurrenceDates[0],
        endTime: endTime(j.occurrenceDates[0]),
        endDate:
          j.occurrenceDates.length > 1
            ? j.occurrenceDates[j.occurrenceDates.length - 1]
            : undefined,
        status: 'APPROVED',
        hostId: host.id,
        genres: { create: j.genres.map((genre) => ({ genre })) },
        instrumentsNeeded: {
          create: j.instrumentsNeeded.map((instrument) => ({ instrument })),
        },
        equipment: { create: j.equipment },
        occurrences: {
          create: j.occurrenceDates.map((date) => ({ date })),
        },
      },
      include: { occurrences: true },
    })
    console.log(`  Created jam: "${jam.title}" (${jam.occurrences.length} occurrences)`)

    // Add RSVPs and comments to occurrences
    for (const occ of jam.occurrences) {
      const nonHostUsers = createdUsers.filter((u) => u.id !== host.id)
      const rsvpUsers = nonHostUsers.slice(0, 3)
      for (const u of rsvpUsers) {
        await prisma.rsvp.upsert({
          where: { userId_occurrenceId: { userId: u.id, occurrenceId: occ.id } },
          update: {},
          create: {
            userId: u.id,
            occurrenceId: occ.id,
            status: Math.random() > 0.3 ? RsvpStatus.GOING : RsvpStatus.INTERESTED,
          },
        })
      }

      // Add 1-2 comments per occurrence
      const commentCount = Math.floor(Math.random() * 2) + 1
      for (let i = 0; i < commentCount; i++) {
        const commenter = nonHostUsers[i % nonHostUsers.length]
        await prisma.comment.create({
          data: {
            userId: commenter.id,
            occurrenceId: occ.id,
            body: COMMENTS[(jam.title.length + i) % COMMENTS.length],
          },
        })
      }
    }
  }

  console.log('\nDemo data created. All users share password: demo1234')
  console.log('Users:')
  USERS.forEach((u) => console.log(`  ${u.email}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
