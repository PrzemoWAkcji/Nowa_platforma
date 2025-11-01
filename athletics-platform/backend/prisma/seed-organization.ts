import { PrismaClient, Gender, Category, EventType, Unit, CompetitionType, CompetitionStatus, RegistrationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOrganizationData() {
  console.log('🌱 Seeding organization data...');

  // Najpierw utwórz użytkownika testowego
  const testUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'Test',
      password: 'hashedpassword',
      role: 'ADMIN',
    },
  });

  // Utwórz zawody testowe
  const competition = await prisma.competition.upsert({
    where: { id: 'test-competition-org' },
    update: {},
    create: {
      id: 'test-competition-org',
      name: 'Mistrzostwa Młodzików - Test Organizacji',
      description: 'Zawody testowe do sprawdzenia funkcjonalności organizacji',
      location: 'Stadion Testowy, Gdańsk',
      venue: 'Stadion Lekkoatletyczny',
      startDate: new Date('2025-05-16T09:00:00Z'),
      endDate: new Date('2025-05-16T16:00:00Z'),
      registrationStartDate: new Date('2025-04-01T00:00:00Z'),
      registrationEndDate: new Date('2025-05-10T23:59:59Z'),
      maxParticipants: 200,
      registrationFee: 50,
      type: CompetitionType.OUTDOOR,
      status: CompetitionStatus.REGISTRATION_OPEN,
      createdById: testUser.id,
    },
  });

  console.log('✅ Competition created:', competition.name);

  // Utwórz wydarzenia testowe
  const events = [
    // Konkurencje bieżne
    {
      id: 'event-60m-boys-u14',
      name: '60m',
      type: EventType.TRACK,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.TIME,
      distance: '60m',
      competitionId: competition.id,
    },
    {
      id: 'event-60m-girls-u14',
      name: '60m',
      type: EventType.TRACK,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.TIME,
      distance: '60m',
      competitionId: competition.id,
    },
    {
      id: 'event-300m-boys-u14',
      name: '300m',
      type: EventType.TRACK,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.TIME,
      distance: '300m',
      competitionId: competition.id,
    },
    {
      id: 'event-300m-girls-u14',
      name: '300m',
      type: EventType.TRACK,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.TIME,
      distance: '300m',
      competitionId: competition.id,
    },
    {
      id: 'event-600m-boys-u14',
      name: '600m',
      type: EventType.TRACK,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.TIME,
      distance: '600m',
      competitionId: competition.id,
    },
    {
      id: 'event-600m-girls-u14',
      name: '600m',
      type: EventType.TRACK,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.TIME,
      distance: '600m',
      competitionId: competition.id,
    },
    // Konkurencje techniczne
    {
      id: 'event-long-jump-boys-u14',
      name: 'Skok w dal',
      type: EventType.FIELD,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.DISTANCE,
      competitionId: competition.id,
    },
    {
      id: 'event-long-jump-girls-u14',
      name: 'Skok w dal',
      type: EventType.FIELD,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.DISTANCE,
      competitionId: competition.id,
    },
    {
      id: 'event-high-jump-boys-u14',
      name: 'Skok wzwyż',
      type: EventType.FIELD,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.HEIGHT,
      competitionId: competition.id,
    },
    {
      id: 'event-high-jump-girls-u14',
      name: 'Skok wzwyż',
      type: EventType.FIELD,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.HEIGHT,
      competitionId: competition.id,
    },
    {
      id: 'event-shot-put-boys-u14',
      name: 'Pchnięcie kulą',
      type: EventType.FIELD,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.DISTANCE,
      competitionId: competition.id,
    },
    {
      id: 'event-shot-put-girls-u14',
      name: 'Pchnięcie kulą',
      type: EventType.FIELD,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.DISTANCE,
      competitionId: competition.id,
    },
    // Wieloboje
    {
      id: 'event-triathlon-boys-u14',
      name: 'Trójbój (60m, w dal, kula)',
      type: EventType.COMBINED,
      gender: Gender.MALE,
      category: Category.U14,
      unit: Unit.POINTS,
      competitionId: competition.id,
    },
    {
      id: 'event-triathlon-girls-u14',
      name: 'Trójbój (60m, w dal, kula)',
      type: EventType.COMBINED,
      gender: Gender.FEMALE,
      category: Category.U14,
      unit: Unit.POINTS,
      competitionId: competition.id,
    },
  ];

  for (const eventData of events) {
    await prisma.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: eventData,
    });
  }

  console.log('✅ Events created:', events.length);

  // Utwórz przykładowych zawodników
  const athletes = [
    {
      id: 'athlete-1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      dateOfBirth: new Date('2010-03-15'),
      gender: Gender.MALE,
      category: Category.U14,
      nationality: 'POL',
      club: 'AZS Gdańsk',
    },
    {
      id: 'athlete-2',
      firstName: 'Anna',
      lastName: 'Nowak',
      dateOfBirth: new Date('2010-07-22'),
      gender: Gender.FEMALE,
      category: Category.U14,
      nationality: 'POL',
      club: 'Gedania Gdańsk',
    },
    {
      id: 'athlete-3',
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      dateOfBirth: new Date('2010-11-08'),
      gender: Gender.MALE,
      category: Category.U14,
      nationality: 'POL',
      club: 'Lechia Gdańsk',
    },
    {
      id: 'athlete-4',
      firstName: 'Maria',
      lastName: 'Wójcik',
      dateOfBirth: new Date('2010-05-30'),
      gender: Gender.FEMALE,
      category: Category.U14,
      nationality: 'POL',
      club: 'AZS Gdańsk',
    },
    {
      id: 'athlete-5',
      firstName: 'Tomasz',
      lastName: 'Kowalczyk',
      dateOfBirth: new Date('2010-09-12'),
      gender: Gender.MALE,
      category: Category.U14,
      nationality: 'POL',
      club: 'Gedania Gdańsk',
    },
  ];

  for (const athleteData of athletes) {
    await prisma.athlete.upsert({
      where: { id: athleteData.id },
      update: {},
      create: athleteData,
    });
  }

  console.log('✅ Athletes created:', athletes.length);

  // Utwórz rejestracje
  const registrations: any[] = [];
  for (let i = 0; i < athletes.length; i++) {
    const athlete = athletes[i];
    const registration = await prisma.registration.upsert({
      where: { id: `registration-${athlete.id}` },
      update: {},
      create: {
        id: `registration-${athlete.id}`,
        athleteId: athlete.id,
        competitionId: competition.id,
        userId: testUser.id,
        status: RegistrationStatus.CONFIRMED,
      },
    });
    registrations.push(registration);
  }

  console.log('✅ Registrations created:', registrations.length);

  // Utwórz rejestracje na wydarzenia
  for (const registration of registrations) {
    const athlete = athletes.find(a => a.id === registration.athleteId);
    if (!athlete) continue;

    // Zarejestruj na wydarzenia odpowiednie dla płci
    const athleteEvents = events.filter(e => 
      e.gender === athlete.gender && 
      e.category === athlete.category &&
      e.type !== 'COMBINED' // Na razie pomijamy wieloboje
    );

    for (const event of athleteEvents) {
      await prisma.registrationEvent.upsert({
        where: {
          registrationId_eventId: {
            registrationId: registration.id,
            eventId: event.id,
          },
        },
        update: {},
        create: {
          registrationId: registration.id,
          eventId: event.id,
          seedTime: Math.random() > 0.5 ? `${(Math.random() * 5 + 8).toFixed(2)}` : null,
        },
      });
    }
  }

  console.log('✅ Registration events created');

  console.log('🎉 Organization data seeded successfully!');
  console.log(`Competition ID: ${competition.id}`);
}

seedOrganizationData()
  .catch((e) => {
    console.error('❌ Error seeding organization data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });