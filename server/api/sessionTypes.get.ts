import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
	const types = await prisma.sessionType.findMany({
		select: { id: true, name: true },
	});

	return types;
});
