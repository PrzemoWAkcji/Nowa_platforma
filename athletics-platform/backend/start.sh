#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma db push --accept-data-loss --skip-generate

echo "🚀 Starting application..."
exec node dist/src/main
