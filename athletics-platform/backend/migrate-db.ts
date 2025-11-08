import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.uuanevlshccytwklhlrb:pomidorowa@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
    },
  },
});

const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:SDluxFlauODePPUMpBHKeDOAfwwBbMoc@interchange.proxy.rlwy.net:40079/railway',
    },
  },
});

async function migrate() {
  try {
    console.log('Fetching data from Supabase...\n');

    const users = await sourceDb.user.findMany();
    console.log(`Found ${users.length} users`);

    const competitions = await sourceDb.competition.findMany();
    console.log(`Found ${competitions.length} competitions`);

    const events = await sourceDb.event.findMany();
    console.log(`Found ${events.length} events`);

    const results = await sourceDb.result.findMany();
    console.log(`Found ${results.length} results`);

    const news = await sourceDb.news.findMany();
    console.log(`Found ${news.length} news`);

    console.log('\nMigrating to Railway...\n');

    for (const user of users) {
      await targetDb.user.upsert({
        where: { id: user.id },
        create: user,
        update: user,
      });
    }
    console.log(`✓ Migrated ${users.length} users`);

    for (const competition of competitions) {
      await targetDb.competition.upsert({
        where: { id: competition.id },
        create: competition,
        update: competition,
      });
    }
    console.log(`✓ Migrated ${competitions.length} competitions`);

    for (const event of events) {
      await targetDb.event.upsert({
        where: { id: event.id },
        create: event,
        update: event,
      });
    }
    console.log(`✓ Migrated ${events.length} events`);

    for (const result of results) {
      await targetDb.result.upsert({
        where: { id: result.id },
        create: result,
        update: result,
      });
    }
    console.log(`✓ Migrated ${results.length} results`);

    for (const newsItem of news) {
      await targetDb.news.upsert({
        where: { id: newsItem.id },
        create: newsItem,
        update: newsItem,
      });
    }
    console.log(`✓ Migrated ${news.length} news`);

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

migrate();
