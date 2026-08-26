import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Status } from "@prisma/client";
import { AccessPermission } from "~/types/permissions";

/*
 * Intake submission: turns a reviewed Request into a Patient (+ NonEmployee,
 * guardians, diagnoses, medical record, sponsorships, therapy note), atomically.
 *
 * Guardian model ([[guardian-access-model]]): a guardian IS a login-capable
 * User, deduped by email, linked via the explicit PatientGuardian join — so one
 * guardian can cover multiple siblings and a patient can have multiple guardians.
 * A MINOR patient's own User is a shadow record with a synthetic unique
 * email/phone (the real contact belongs to the guardian), which is what keeps
 * the User.email/phone @unique constraints from colliding with the guardian.
 */

const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);

const INSURANCE = [
	"SENASA_CONTRIBUTIVO",
	"SENASA_SUBSIDIADO",
	"ARS_HUMANO",
	"MAPFRE",
	"LA_MONUMENTAL",
	"ARS_UNIVERSAL",
	"ARS_META_SALUD",
	"ARS_PLAN_SALUD_BANCO_CENTRAL",
	"RENACER",
	"OTRO",
] as const;

const guardianSchema = z.object({
	name: z.string().optional().default(""),
	relationship: z.string().optional().default(""),
	idNumber: z.string().optional().default(""),
	nss: z.string().optional().default(""),
	phone: z.string().optional().default(""),
	email: z.string().optional().default(""),
	streetName: z.string().optional().default(""),
	streetNum: z.string().optional().default(""),
	buildingNum: z.string().optional().default(""),
	postCode: z.string().optional().default(""),
});

const submitSchema = z.object({
	request: z.object({
		id: z.coerce.number().int().positive(),
		isAdult: z.boolean().optional().default(false),
	}),
	patient: z.object({
		firstName: z.string().min(1),
		middleName: z.string().optional().default(""),
		lastName: z.string().min(1),
		dateOfBirth: z.string().optional().default(""),
		age: z.coerce.number().int().nonnegative().optional(),
		sex: z.preprocess(
			emptyToUndef,
			z.enum(["MALE", "FEMALE", "OTHER"]).optional()
		),
		nationality: z.string().optional().default(""),
		nationalId: z.string().optional().default(""),
		nss: z.string().optional().default(""),
		phoneNumber: z.string().optional().default(""),
		email: z.string().optional().default(""),
		healthInsurance: z.preprocess(
			emptyToUndef,
			z.enum(INSURANCE).optional()
		),
		status: z.preprocess(
			(v) => (v === "" || v == null ? "ACTIVE" : v),
			z.enum(["ACTIVE", "WITHDRAWN", "DROPPED_OUT"])
		),
	}),
	guardians: z.array(guardianSchema).optional().default([]),
	intake: z
		.object({
			interviewDate: z.string().optional().default(""),
			evaluationDate: z.string().optional().default(""),
			therapyStartDate: z.string().optional().default(""),
		})
		.optional()
		.default({}),
	medical: z
		.object({
			diagnosis: z.string().optional().default(""),
			medications: z.string().optional().default(""),
			allergies: z.string().optional().default(""),
			dietaryRestrictions: z.string().optional().default(""),
		})
		.optional()
		.default({}),
	developmental: z.record(z.string(), z.string()).optional().default({}),
	services: z
		.object({
			therapies: z.array(z.string()).optional().default([]),
			complementaryServices: z.array(z.string()).optional().default([]),
			workshops: z.array(z.string()).optional().default([]),
		})
		.optional()
		.default({}),
	sponsorships: z
		.array(
			z.object({
				sponsorName: z.string().optional().default(""),
				amount: z.coerce.number().optional(),
				startDate: z.string().optional().default(""),
				endDate: z.string().optional().default(""),
				newDate: z.string().optional().default(""),
			})
		)
		.optional()
		.default([]),
	clinicalNotes: z
		.object({
			therapistName: z.string().optional().default(""),
			noteDate: z.string().optional().default(""),
			therapistNotes: z.string().optional().default(""),
		})
		.optional()
		.default({}),
});

/** parseInt that returns null (never NaN) for missing/non-numeric input. */
function toIntOrNull(v: unknown): number | null {
	if (v === null || v === undefined || v === "") return null;
	const n = parseInt(String(v), 10);
	return Number.isNaN(n) ? null : n;
}

const toDate = (v: string) => (v ? new Date(v) : null);
const splitName = (full: string) => {
	const parts = full.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return { fName: "Guardian", lName: "" };
	if (parts.length === 1) return { fName: parts[0], lName: "" };
	return { fName: parts[0], lName: parts.slice(1).join(" ") };
};

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const body = await validateBody(event, submitSchema);
		const requestId = body.request.id;

		const request = await prisma.request.findUnique({
			where: { id: requestId },
		});
		if (!request) {
			throw createError({
				statusCode: 404,
				statusMessage: "Request not found",
			});
		}
		if (request.status !== Status.PROCESSING) {
			throw createError({
				statusCode: 409,
				statusMessage: "This request has already been processed.",
			});
		}

		const p = body.patient;
		const isAdult = body.request.isAdult;

		// Patient User contact fields. A minor doesn't log in and the real
		// contact belongs to the guardian, so give the minor a synthetic unique
		// email/phone to satisfy the @unique constraints without colliding.
		const patientEmail =
			isAdult && p.email
				? p.email
				: `patient-${randomUUID()}@intake.local`;
		const patientPhone =
			isAdult && p.phoneNumber ? p.phoneNumber : `intake-${randomUUID()}`;

		const patientPostCode = toIntOrNull(request.postCode) ?? 0;

		const patientId = await prisma.$transaction(async (tx) => {
			// FK: NonEmployee.postCode references PostCodeCity — upsert so an
			// unknown postcode from the public request form never blocks inserts.
			await tx.postCodeCity.upsert({
				where: { postCode: patientPostCode },
				create: { postCode: patientPostCode, city: "" },
				update: {},
			});

			const patientUser = await tx.user.create({
				data: {
					fName: p.firstName,
					mInit: p.middleName || null,
					lName: p.lastName,
					name: [p.firstName, p.middleName, p.lastName]
						.filter(Boolean)
						.join(" "),
					email: patientEmail,
					emailVerified: false,
					phone: patientPhone,
				},
			});

			await tx.nonEmployee.create({
				data: {
					id: patientUser.id,
					identification: p.nationalId || null,
					dob: toDate(p.dateOfBirth),
					gender: p.sex ?? null,
					nationality: p.nationality || null,
					nss: p.nss || null,
					streetName: request.streetName,
					streetNum: toIntOrNull(request.streetNum) ?? 0,
					buildingNum: toIntOrNull(request.buildingNum),
					postCode: patientPostCode,
				},
			});

			const patient = await tx.patient.create({
				data: {
					id: patientUser.id,
					// Patient.identification is @unique NOT NULL; fall back to a
					// synthetic value when a national ID isn't provided.
					identification: p.nationalId || randomUUID(),
					ageAtRegistration: p.age ?? null,
					diagnosed: request.diagnosed,
					initialInterviewDate: toDate(body.intake.interviewDate),
					programEvalDate: toDate(body.intake.evaluationDate),
					therapyStartDate: toDate(body.intake.therapyStartDate),
					insurance: body.patient.healthInsurance ?? null,
					status: body.patient.status,
				},
			});

			if (body.medical.diagnosis) {
				await tx.diagnosis.create({
					data: {
						name: body.medical.diagnosis,
						patientId: patient.id,
					},
				});
			}

			// Medications/allergies/diet + the developmental-history section have
			// no dedicated columns yet, so persist them as JSON on MedicalRecord.
			const hasMedical =
				body.medical.medications ||
				body.medical.allergies ||
				body.medical.dietaryRestrictions ||
				Object.values(body.developmental).some(Boolean);
			if (hasMedical) {
				await tx.medicalRecord.create({
					data: {
						patientId: patient.id,
						data: JSON.stringify({
							medications: body.medical.medications || null,
							allergies: body.medical.allergies || null,
							dietaryRestrictions:
								body.medical.dietaryRestrictions || null,
							developmental: body.developmental,
						}),
					},
				});
			}

			for (const s of body.sponsorships) {
				if (s.sponsorName && s.startDate) {
					await tx.sponsorship.create({
						data: {
							patientId: patient.id,
							sponsorName: s.sponsorName,
							amount: s.amount ?? null,
							startDate: new Date(s.startDate),
							endDate: toDate(s.endDate),
							newDate: toDate(s.newDate),
						},
					});
				}
			}

			if (body.clinicalNotes.therapistNotes) {
				const intakeNote = await tx.therapyNote.create({
					data: {
						patientId: patient.id,
						goalsAchieved: "",
						progressNotes: body.clinicalNotes.therapistNotes,
						progressNotesDate: toDate(body.clinicalNotes.noteDate),
						nextSessionObjectives: "",
						generalObservations: "",
					},
				});
				if (body.services.therapies.length > 0) {
					await tx.therapyNoteType.createMany({
						data: body.services.therapies.map((therapyType) => ({
							therapyNoteId: intakeNote.id,
							therapyType,
						})),
					});
				}
			}

			// Guardians (minors only): dedupe by email so siblings share one
			// login; each unlinked guardian gets a synthetic email/phone.
			if (!isAdult) {
				for (const [index, g] of body.guardians.entries()) {
					if (!g.name) continue;

					const gEmail =
						g.email.trim() ||
						`guardian-${randomUUID()}@intake.local`;
					const gPhone = g.phone.trim() || `guardian-${randomUUID()}`;

					let guardianUser = await tx.user.findUnique({
						where: { email: gEmail },
					});
					if (!guardianUser) {
						const { fName, lName } = splitName(g.name);
						guardianUser = await tx.user.create({
							data: {
								fName,
								lName,
								name: g.name,
								email: gEmail,
								emailVerified: false,
								phone: gPhone,
							},
						});
					}

					const gPostCode = toIntOrNull(g.postCode);
					if (gPostCode !== null) {
						await tx.postCodeCity.upsert({
							where: { postCode: gPostCode },
							create: { postCode: gPostCode, city: "" },
							update: {},
						});
					}

					await tx.nonEmployee.upsert({
						where: { id: guardianUser.id },
						create: {
							id: guardianUser.id,
							identification: g.idNumber || null,
							nss: g.nss || null,
							streetName: g.streetName || request.streetName,
							streetNum:
								toIntOrNull(g.streetNum) ??
								toIntOrNull(request.streetNum) ??
								0,
							buildingNum: toIntOrNull(g.buildingNum),
							postCode: gPostCode ?? patientPostCode,
						},
						update: {},
					});

					await tx.patientGuardian.upsert({
						where: {
							patientId_guardianId: {
								patientId: patient.id,
								guardianId: guardianUser.id,
							},
						},
						create: {
							patientId: patient.id,
							guardianId: guardianUser.id,
							relationship: g.relationship || "Parent/Guardian",
							primaryGuardian: index === 0,
						},
						update: {
							relationship: g.relationship || "Parent/Guardian",
						},
					});
				}
			}

			await tx.request.update({
				where: { id: requestId },
				data: { status: Status.SCHEDULING },
			});

			await tx.intakeDraft.deleteMany({ where: { requestId } });

			return patient.id;
		});

		return { success: true, patientId };
	}
);
