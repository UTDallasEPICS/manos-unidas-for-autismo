import { PrismaClient, SessionType } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
	// get all the type ids
	const types: SessionType[] = await prisma.sessionType.findMany();
	return types;
});
