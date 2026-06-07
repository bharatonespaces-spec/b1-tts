#!/bin/sh
echo "Running Prisma migrations..."
npx --yes prisma migrate deploy --schema=/app/prisma/schema.prisma
echo "Starting Next.js..."
node server.js
