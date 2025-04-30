// server/api/users/index.get.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
	const patientUsers = await prisma.user.findMany({
		where: {
			NonEmployee: {
				// only keep NonEmployees which themselves have a Patient record
				Patient: { isNot: null },
			},
		},
		include: {
			NonEmployee: {
				include: {
					Patient: true,
				},
			},
		},
	});

	return patientUsers.map((u) => {
		const ne = u.NonEmployee!;
		// build full name
		const name = [u.fName, u.mInit ? `${u.mInit}.` : null, u.lName]
			.filter(Boolean)
			.join(" ");
		// compute age from dob
		const age = ne.dob
			? Math.floor(
					(Date.now() - ne.dob.getTime()) / 1000 / 60 / 60 / 24 / 365
				)
			: null;
		return {
			id: u.id,
			name,
			type: u.type ?? "",
			age,
			gender: ne.gender,
		};
	});
});
