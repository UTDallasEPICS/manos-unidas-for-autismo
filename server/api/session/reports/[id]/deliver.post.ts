import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.ADMIN] },
	async (event) => {
		const reportId = getRouterParam(event, "id");
		if (!reportId) {
			throw createError({
				statusCode: 400,
				statusMessage: "Missing report id.",
			});
		}

		const report = await prisma.therapyReport.findUnique({
			where: { id: reportId },
			select: { id: true, patientId: true, deliveredAt: true },
		});
		if (!report) {
			throw createError({
				statusCode: 404,
				statusMessage: "Report not found.",
			});
		}
		if (report.deliveredAt) {
			throw createError({
				statusCode: 400,
				statusMessage: "Report already delivered.",
			});
		}

		// Deliver to the primary guardian on file if the patient has one (a
		// minor), otherwise to the patient directly (an adult, self-registered).
		const guardianLink = await prisma.patientGuardian.findFirst({
			where: { patientId: report.patientId },
			orderBy: { primaryGuardian: "desc" },
			include: { Guardian: { include: { User: true } } },
		});

		let recipientEmail: string;
		let recipientName: string;
		if (guardianLink) {
			recipientEmail = guardianLink.Guardian.User.email;
			recipientName =
				guardianLink.Guardian.User.name ??
				guardianLink.Guardian.User.email;
		} else {
			const patient = await prisma.patient.findUnique({
				where: { id: report.patientId },
				include: { User: { include: { User: true } } },
			});
			if (!patient) {
				throw createError({
					statusCode: 404,
					statusMessage: "Patient not found.",
				});
			}
			recipientEmail = patient.User.User.email;
			recipientName = patient.User.User.name ?? patient.User.User.email;
		}

		try {
			await sendEmail({
				to: recipientEmail,
				subject: "New therapy report available",
				text: `Hello ${recipientName},\n\nA new therapy report is ready for review. Please contact the clinic to schedule a time to go over it.\n\n— Connected Care`,
			});
		} catch (err) {
			console.error(
				`Failed to send report-delivered email to ${recipientEmail}:`,
				err
			);
			throw createError({
				statusCode: 502,
				statusMessage:
					"Could not send the delivery notification email.",
			});
		}

		return await prisma.therapyReport.update({
			where: { id: reportId },
			data: {
				deliveredAt: new Date(),
				deliveredById: event.context.user!.id,
			},
		});
	}
);
