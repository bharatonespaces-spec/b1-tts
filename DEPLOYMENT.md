# b1 TTS Deployment Guide

b1 TTS is a Next.js 15 application utilizing SQLite and local filesystem storage for downloaded ElevenLabs audio files.

## Architecture Considerations for Production

Because b1 TTS stores `GeneratedAudio` locally inside `public/audio` and uses a local `dev.db` SQLite database, **Serverless environments (like Vercel) will lose data** upon every new deployment or cold start since they have ephemeral filesystems.

**Recommended Approach:** Deploy using Docker on a VPS (like DigitalOcean, AWS EC2, or Hetzner) or use Railway with a persistent volume.

---

## Option 1: Docker Compose (Recommended)

This is the easiest way to run the application securely on a standard Virtual Private Server (VPS) while preserving your database and generated MP3 files.

1. **Clone the repository** to your server.
2. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```
3. **Edit `.env`** and insert your `JWT_SECRET` and `ELEVENLABS_API_KEY`.
4. **Start the containers**:
   ```bash
   docker-compose up -d --build
   ```

The application will be accessible on `http://<your-server-ip>:3000`. We recommend placing a reverse proxy like Nginx or Traefik in front of the container to serve traffic over HTTPS.

---

## Option 2: Railway Deployment

Railway supports persistent volumes, making it a great PaaS option for b1 TTS.

1. Create a new project in [Railway](https://railway.app/).
2. Link your GitHub repository.
3. Add the following **Environment Variables** in Railway:
   - `JWT_SECRET`
   - `ELEVENLABS_API_KEY`
4. **Add Persistent Volumes**:
   - Go to your service settings in Railway -> **Volumes**.
   - Add a volume mounted at `/app/prisma`
   - Add a volume mounted at `/app/public/audio`
5. Railway will automatically detect the `Dockerfile` and build/deploy the application.

---

## Option 3: Vercel (Requires Code Modification)

Vercel is a Serverless platform. If you deploy b1 TTS to Vercel "as-is", your database will reset frequently, and your generated MP3s will disappear.

To deploy properly on Vercel, you must make two architectural changes:
1. **Migrate from SQLite to Postgres:** Update `prisma/schema.prisma` to use Postgres, and connect it to Vercel Postgres or Supabase.
2. **Migrate from Local File System to Cloud Storage:** Modify `/api/generate/route.ts` to upload the ElevenLabs ArrayBuffer to an S3 bucket or Vercel Blob instead of `fs.writeFile`.

If you make those changes, deployment is as simple as:
1. Import the project in Vercel.
2. Add your environment variables.
3. Click **Deploy**.
