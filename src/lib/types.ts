import type { User, Voice, GeneratedAudio } from "@prisma/client"

export type { User, Voice, GeneratedAudio }

export type CreateUserInput = Omit<User, "id" | "createdAt">
export type UpdateUserInput = Partial<CreateUserInput>

export type CreateVoiceInput = Omit<Voice, "id" | "createdAt">
export type UpdateVoiceInput = Partial<CreateVoiceInput>

export type CreateAudioInput = Omit<GeneratedAudio, "id" | "createdAt">
export type UpdateAudioInput = Partial<CreateAudioInput>
