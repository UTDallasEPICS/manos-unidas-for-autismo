import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { error: "Method not allowed" };
	}

	try {
		const body = await readBody(event);

		// Extract session details
		const { type, time, comment, maxAttendance, therapistID } = body;

		// Checking for missing data
		if (!type || !time || !therapistID) {
			return { error: "Missing required fields" };
		}

		// Create session in the database
		const newSession = await prisma.session.create({
			data: {
				Type: type,
				Time: new Date(time),
				Comment: comment || null,
				MaxAttendance: maxAttendance || 1,
				TherapistID: therapistID,
			},
		});

		return { success: true, session: newSession };
	} catch (error) {
		// Fix for TypeScript 'unknown' error type
		if (error instanceof Error) {
			// Safely accessing the error's message
			return {
				error: "Failed to create session",
				details: error.message,
			};
		} else {
			// Fallback for unknown errors
			return { error: "An unexpected error occurred" };
		}
	}
});
