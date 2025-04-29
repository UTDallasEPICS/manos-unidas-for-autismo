import { getCookie } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
	const userId = getCookie(event, "userId");
	if (!userId)
		throw createError({
			statusCode: 401,
			statusMessage: "Not authenticated",
		});

	// Only pull from user table
	const u = await prisma.user.findUnique({
		where: { id: Number(userId) },
	});
	if (!u)
		throw createError({ statusCode: 404, statusMessage: "User not found" });

	return {
		id: u.id,
		fName: u.fName,
		mInit: u.mInit,
		lName: u.lName,
		email: u.email,
		phone: u.phone,
		whatsApp: u.whatsApp,
		contactPref: u.contactPref,
		type: u.type,
		age: u.age ?? null,
		gender: u.gender ?? "",
	};
});
