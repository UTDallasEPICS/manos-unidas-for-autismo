import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
	// only allow GET
	if (event.node.req.method !== "GET") {
		event.node.res.statusCode = 405;
		return { error: "Method Not Allowed" };
	}

	// fetch all users of type THERAPIST
	const therapists = await prisma.user.findMany({
		where: { type: "THERAPIST" },
		select: {
			id: true,
			fName: true,
			lName: true,
		},
		orderBy: { lName: "asc" },
	});

	// return an array of { id, fName, lName }
	return therapists;
});
