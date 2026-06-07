import { prisma } from "./db"
import { User, Voice, GeneratedAudio, Template } from "@prisma/client"

export const TemplateService = {
  async getTemplates() {
    return prisma.template.findMany({ orderBy: { createdAt: "asc" } })
  },
  async createTemplate(data: Omit<Template, "id" | "createdAt">) {
    return prisma.template.create({ data })
  }
}

export const UserService = {
  async createUser(data: Omit<User, "id" | "createdAt">) {
    return prisma.user.create({ data })
  },
  async getUser(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },
  async updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt">>) {
    return prisma.user.update({ where: { id }, data })
  },
  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } })
  }
}

export const VoiceService = {
  async createVoice(data: Omit<Voice, "id" | "createdAt">) {
    return prisma.voice.create({ data })
  },
  async getVoices() {
    return prisma.voice.findMany({ orderBy: { createdAt: "desc" } })
  },
  async getVoice(id: string) {
    return prisma.voice.findUnique({ where: { id } })
  },
  async updateVoice(id: string, data: Partial<Omit<Voice, "id" | "createdAt">>) {
    return prisma.voice.update({ where: { id }, data })
  },
  async deleteVoice(id: string) {
    return prisma.voice.delete({ where: { id } })
  }
}

export const AudioService = {
  async createAudio(data: Omit<GeneratedAudio, "id" | "createdAt">) {
    return prisma.generatedAudio.create({ data })
  },
  async getAudios() {
    return prisma.generatedAudio.findMany({ orderBy: { createdAt: "desc" } })
  },
  async getAudio(id: string) {
    return prisma.generatedAudio.findUnique({ where: { id } })
  },
  async updateAudio(id: string, data: Partial<Omit<GeneratedAudio, "id" | "createdAt">>) {
    return prisma.generatedAudio.update({ where: { id }, data })
  },
  async deleteAudio(id: string) {
    return prisma.generatedAudio.delete({ where: { id } })
  }
}
