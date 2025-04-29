import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
	// Fetch every user without pulling in nonEmployee
	const all = await prisma.user.findMany();

	return all.map((u) => ({
		id: u.id,
		name: `${u.fName}${u.mInit ? ` ${u.mInit}.` : ""} ${u.lName}`,
		type: u.type ?? "",
		// if you’ve added age & gender columns directly to user:
		age: u.age ?? null,
		gender: u.gender ?? "",
	}));
});
