import { PrismaClient, RecordLevel, Gender, Unit, Category, RecordType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRecords() {
  console.log('🏆 Seeding records...');

  // Przykładowe rekordy
  const sampleRecords = [
    {
      type: RecordType.WORLD,
      level: RecordLevel.SENIOR,
      eventName: '100m',
      discipline: 'TRACK',
      gender: Gender.MALE,
      category: Category.SENIOR,
      result: '9.58',
      resultValue: 9.58,
      unit: Unit.TIME,
      wind: '+0.9',
      athleteName: 'Usain Bolt',
      nationality: 'JAM',
      competitionName: 'World Championships',
      location: 'Berlin, Germany',
      date: new Date('2009-08-16'),
      isRatified: true,
      ratifiedBy: 'World Athletics',
    },
    {
      type: RecordType.WORLD,
      level: RecordLevel.SENIOR,
      eventName: '100m',
      discipline: 'TRACK',
      gender: Gender.FEMALE,
      category: Category.SENIOR,
      result: '10.49',
      resultValue: 10.49,
      unit: Unit.TIME,
      wind: '+0.0',
      athleteName: 'Florence Griffith-Joyner',
      nationality: 'USA',
      competitionName: 'US Olympic Trials',
      location: 'Indianapolis, USA',
      date: new Date('1988-07-16'),
      isRatified: true,
      ratifiedBy: 'World Athletics',
    },
    {
      type: RecordType.NATIONAL,
      level: RecordLevel.SENIOR,
      eventName: '100m',
      discipline: 'TRACK',
      gender: Gender.MALE,
      category: Category.SENIOR,
      result: '10.00',
      resultValue: 10.00,
      unit: Unit.TIME,
      wind: '+1.3',
      athleteName: 'Marian Woronin',
      nationality: 'POL',
      competitionName: 'Memorial Kusocińskiego',
      location: 'Warsaw, Poland',
      date: new Date('1984-06-09'),
      isRatified: true,
      ratifiedBy: 'PZLA',
    },
    {
      type: RecordType.WORLD,
      level: RecordLevel.SENIOR,
      eventName: 'Shot Put',
      discipline: 'FIELD',
      gender: Gender.MALE,
      category: Category.SENIOR,
      result: '23.37m',
      resultValue: 23.37,
      unit: Unit.DISTANCE,
      athleteName: 'Randy Barnes',
      nationality: 'USA',
      competitionName: 'UCLA',
      location: 'Los Angeles, USA',
      date: new Date('1990-05-20'),
      isRatified: true,
      ratifiedBy: 'World Athletics',
    },
  ];

  // Dodaj rekordy do bazy danych
  for (const recordData of sampleRecords) {
    try {
      await prisma.record.create({
        data: recordData,
      });
      console.log(`✅ Added record: ${recordData.eventName} ${recordData.gender} - ${recordData.result} (${recordData.athleteName})`);
    } catch (error) {
      console.error(`❌ Failed to add record: ${recordData.eventName} ${recordData.gender}`, error.message);
    }
  }

  console.log(`🏆 Seeded ${sampleRecords.length} records successfully!`);
}

export default seedRecords;

// Uruchom seed jeśli plik jest wykonywany bezpośrednio
if (require.main === module) {
  seedRecords()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}