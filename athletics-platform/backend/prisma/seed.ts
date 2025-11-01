import { PrismaClient, UserRole, CompetitionStatus, CompetitionType, Gender, Category, Unit } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Usuń istniejące dane
  await prisma.result.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.athlete.deleteMany();
  await prisma.user.deleteMany();

  // Hasło dla wszystkich użytkowników testowych
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Utwórz użytkowników
  const admin = await prisma.user.create({
    data: {
      email: 'admin@athletics.pl',
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '+48123456789',
      role: UserRole.ADMIN,
      password: hashedPassword,
      isActive: true,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@athletics.pl',
      firstName: 'Anna',
      lastName: 'Nowak',
      phone: '+48987654321',
      role: UserRole.ORGANIZER,
      password: hashedPassword,
      isActive: true,
    },
  });

  const coach = await prisma.user.create({
    data: {
      email: 'coach@athletics.pl',
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      phone: '+48555666777',
      role: UserRole.COACH,
      password: hashedPassword,
      isActive: true,
    },
  });

  const athlete = await prisma.user.create({
    data: {
      email: 'athlete@athletics.pl',
      firstName: 'Maria',
      lastName: 'Kowalczyk',
      phone: '+48111222333',
      role: UserRole.ATHLETE,
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // Utwórz zawodników
  const athlete1 = await prisma.athlete.create({
    data: {
      firstName: 'Adam',
      lastName: 'Małysz',
      dateOfBirth: new Date('1995-05-15'),
      gender: Gender.MALE,
      category: Category.SENIOR,
      club: 'AZS Warszawa',
      nationality: 'POL',
      coachId: coach.id,
    },
  });

  const athlete2 = await prisma.athlete.create({
    data: {
      firstName: 'Justyna',
      lastName: 'Święty-Ersetic',
      dateOfBirth: new Date('1992-12-03'),
      gender: Gender.FEMALE,
      category: Category.SENIOR,
      club: 'AZS AWF Katowice',
      nationality: 'POL',
      coachId: coach.id,
    },
  });

  const athlete3 = await prisma.athlete.create({
    data: {
      firstName: 'Paweł',
      lastName: 'Fajdek',
      dateOfBirth: new Date('1989-06-04'),
      gender: Gender.MALE,
      category: Category.SENIOR,
      club: 'Agros Zamość',
      nationality: 'POL',
    },
  });

  const athlete4 = await prisma.athlete.create({
    data: {
      firstName: 'Ewa',
      lastName: 'Swoboda',
      dateOfBirth: new Date('1997-07-26'),
      gender: Gender.FEMALE,
      category: Category.SENIOR,
      club: 'AZS AWF Katowice',
      nationality: 'POL',
    },
  });

  console.log('✅ Athletes created');

  // Utwórz zawody
  const competition1 = await prisma.competition.create({
    data: {
      name: 'Mistrzostwa Polski Seniorów',
      description: 'Najważniejsze zawody lekkoatletyczne w Polsce dla kategorii seniorskiej',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-17'),
      location: 'Stadion Śląski, Chorzów',
      type: CompetitionType.OUTDOOR,
      status: CompetitionStatus.REGISTRATION_OPEN,
      isPublic: true,
      createdById: organizer.id,
      agentId: 'MP2024-001',
      liveResultsToken: 'live-mp2024-001',
      liveResultsEnabled: true,
    },
  });

  const competition2 = await prisma.competition.create({
    data: {
      name: 'Memoriał Kamili Skolimowskiej',
      description: 'Prestiżowy miting lekkoatletyczny w Chorzowie',
      startDate: new Date('2024-08-25'),
      endDate: new Date('2024-08-25'),
      location: 'Stadion Śląski, Chorzów',
      type: CompetitionType.OUTDOOR,
      status: CompetitionStatus.PUBLISHED,
      isPublic: true,
      createdById: organizer.id,
      agentId: 'MKS2024-001',
      liveResultsToken: 'live-mks2024-001',
      liveResultsEnabled: false,
    },
  });

  const competition3 = await prisma.competition.create({
    data: {
      name: 'Mistrzostwa Województwa Śląskiego',
      description: 'Zawody wojewódzkie dla wszystkich kategorii wiekowych',
      startDate: new Date('2024-06-20'),
      endDate: new Date('2024-06-22'),
      location: 'Stadion MOSiR, Katowice',
      type: CompetitionType.OUTDOOR,
      status: CompetitionStatus.COMPLETED,
      isPublic: true,
      createdById: organizer.id,
      agentId: 'MWS2024-001',
      liveResultsToken: 'live-mws2024-001',
      liveResultsEnabled: false,
    },
  });

  console.log('✅ Competitions created');

  // Utwórz konkurencje
  const event1 = await prisma.event.create({
    data: {
      name: 'Bieg 100m mężczyzn',
      type: 'TRACK',
      unit: Unit.TIME,
      category: Category.SENIOR,
      gender: Gender.MALE,
      competitionId: competition1.id,
      scheduledTime: new Date('2024-07-15T15:30:00'),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Bieg 400m kobiet',
      type: 'TRACK',
      unit: Unit.TIME,
      category: Category.SENIOR,
      gender: Gender.FEMALE,
      competitionId: competition1.id,
      scheduledTime: new Date('2024-07-15T16:15:00'),
    },
  });

  const event3 = await prisma.event.create({
    data: {
      name: 'Rzut młotem mężczyzn',
      type: 'FIELD',
      unit: Unit.DISTANCE,
      category: Category.SENIOR,
      gender: Gender.MALE,
      competitionId: competition1.id,
      scheduledTime: new Date('2024-07-16T14:00:00'),
    },
  });

  console.log('✅ Events created');

  // Utwórz rejestracje
  const registration1 = await prisma.registration.create({
    data: {
      userId: coach.id, // Trener rejestruje zawodnika
      athleteId: athlete1.id,
      competitionId: competition1.id,
      status: 'CONFIRMED',
      events: {
        create: [
          { eventId: event1.id },
        ],
      },
    },
  });

  const registration2 = await prisma.registration.create({
    data: {
      userId: coach.id, // Trener rejestruje zawodnika
      athleteId: athlete2.id,
      competitionId: competition1.id,
      status: 'CONFIRMED',
      events: {
        create: [
          { eventId: event2.id },
        ],
      },
    },
  });

  const registration3 = await prisma.registration.create({
    data: {
      userId: organizer.id, // Organizator rejestruje zawodnika
      athleteId: athlete3.id,
      competitionId: competition1.id,
      status: 'CONFIRMED',
      events: {
        create: [
          { eventId: event3.id },
        ],
      },
    },
  });

  console.log('✅ Registrations created');

  // Utwórz przykładowe wyniki dla zakończonych zawodów
  await prisma.result.create({
    data: {
      registrationId: registration1.id,
      athleteId: athlete1.id,
      eventId: event1.id,
      result: '10.25',
      position: 1,
      points: 1000,
      wind: '+1.2',
      isPersonalBest: true,
      isSeasonBest: true,
    },
  });

  await prisma.result.create({
    data: {
      registrationId: registration2.id,
      athleteId: athlete2.id,
      eventId: event2.id,
      result: '51.45',
      position: 1,
      points: 950,
      isPersonalBest: false,
      isSeasonBest: true,
    },
  });

  console.log('✅ Results created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📧 Test accounts:');
  console.log('Admin: admin@athletics.pl / password123');
  console.log('Organizer: organizer@athletics.pl / password123');
  console.log('Coach: coach@athletics.pl / password123');
  console.log('Athlete: athlete@athletics.pl / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });