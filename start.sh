#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "Starting Next.js..."
node server.js
