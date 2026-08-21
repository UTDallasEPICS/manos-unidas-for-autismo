import { z } from "zod";
import { ContactType, UserType, Prisma } from "@prisma/client";
import { AccessPermission } from "~/types/permissions";

// Create a staff (employee) account. ADMIN-only. Creates a `User` with a real
// `UserType`, and for therapists connects one or more `Specialization`s
// (connectOrCreate by unique name, so a brand-new specialization is created on
// the fly). The user can then sign in via the email-OTP flow (the account must
// exist for an OTP to be issued — see server/utils/auth.ts).
//
// PATIENT/PARENT are NOT UserTypes (they're relationship-derived), so this
// endpoint only mints employee roles.
const trimmed = z.string().trim();

const schema = z.object({
	fName: trimmed.min(1),
	mInit: trimmed.max(1).optional(),
	lName: trimmed.min(1),
	email: trimmed.email(),
	phone: trimmed.min(1),
	whatsApp: trimmed.optional(),
	contactPref: z.nativeEnum(ContactType).default(ContactType.EMAIL),
	type: z.nativeEnum(UserType),
	// Specialization names; only applied when type === THERAPIST.
	specializations: z.array(trimmed.min(1)).optional().default([]),
});

export default defineAuthedHandler(
	{ access: AccessPermission.ADMIN },
	async (event) => {
		const data = await validateBody(event, schema);

		const specNames =
			data.type === UserType.THERAPIST
				? [
						...new Set(
							data.specializations
								.map((s) => s.trim())
								.filter(Boolean)
						),
					]
				: [];

		try {
			return await prisma.user.create({
				data: {
					fName: data.fName,
					mInit: data.mInit || undefined,
					lName: data.lName,
					name: `${data.fName} ${data.lName}`.trim(),
					email: data.email,
					phone: data.phone,
					whatsApp: data.whatsApp || undefined,
					contactPref: data.contactPref,
					type: data.type,
					...(specNames.length
						? {
								Specializations: {
									connectOrCreate: specNames.map((name) => ({
										where: { name },
										create: { name },
									})),
								},
							}
						: {}),
				},
				select: {
					id: true,
					fName: true,
					lName: true,
					email: true,
					type: true,
				},
			});
		} catch (e) {
			// Friendly 409 on a unique-field collision (email/phone/whatsApp)
			// instead of the generic uniqueness 400 from handlePrismaError.
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002"
			) {
				const target = e.meta?.target;
				const fields = Array.isArray(target)
					? target.join(",")
					: String(target ?? "");
				const field = /email/i.test(fields)
					? "email"
					: /whatsApp/i.test(fields)
						? "WhatsApp number"
						: /phone/i.test(fields)
							? "phone number"
							: "value";
				throw createError({
					statusCode: 409,
					statusMessage: `An account with this ${field} already exists.`,
				});
			}
			handlePrismaError(e);
		}
	}
);
