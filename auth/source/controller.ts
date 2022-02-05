import { user, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default {
    findByEmail: async (email: string) => {
        try {
            return await prisma.user.findUnique({ where: { email: email } })
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    },
    findById: async (id: number) => {
        try {
            return await prisma.user.findFirst({ where: { id: id } })
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    },
    createNew: async (data: object) => {
        try {
            return await prisma.user.create({ data: (<user>data) });
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    },
    deleteOne: async (id: number) => {
        try {
            return await prisma.user.delete({ where: { id: id } })
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    },
}
