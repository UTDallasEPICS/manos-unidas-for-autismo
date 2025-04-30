import { prisma } from "@/server/db";

export default defineEventHandler(async () => {
	try {
		const therapists = await prisma.user.findMany({
			where: {
				type: "THERAPIST",
			},
			select: {
				id: true,
				fName: true,
				lName: true,
			},
		});

		return therapists;
	} catch (error) {
		console.error("Failed to fetch therapists:", error);
		return [];
	}
});
