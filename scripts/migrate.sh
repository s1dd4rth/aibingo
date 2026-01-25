#!/bin/bash
# This script should be run on Vercel to initialize the database

echo "Running Prisma migrations on production database..."
npx prisma migrate deploy

echo "Database migration complete!"
