const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FREE_VOICES = [
  { providerVoiceId: "en-US-AriaNeural", name: "Aria (Female)" },
  { providerVoiceId: "en-US-GuyNeural", name: "Guy (Male)" },
  { providerVoiceId: "en-GB-SoniaNeural", name: "Sonia (Female, UK)" },
  { providerVoiceId: "en-GB-RyanNeural", name: "Ryan (Male, UK)" },
  { providerVoiceId: "hi-IN-SwaraNeural", name: "Swara (Female, Hindi)" },
  { providerVoiceId: "hi-IN-MadhurNeural", name: "Madhur (Male, Hindi)" },
];

async function main() {
  await prisma.voice.deleteMany(); // Wipe old ElevenLabs voices
  for (const v of FREE_VOICES) {
    await prisma.voice.create({ data: v });
  }
  console.log('Seeded Edge TTS voices.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
