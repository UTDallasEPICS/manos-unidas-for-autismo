import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, customSession } from "better-auth/plugins";
import { sendEmail } from "./email";
import { computePermissions } from "./permissions";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "sqlite",
	}),
	session: {
		modelName: "AuthSession",
	},
	plugins: [
		emailOTP({
			overrideDefaultEmailVerification: true,
			disableSignUp: true,
			async sendVerificationOTP({ email, otp, type }) {
				if (type !== "sign-in") {
					console.warn(
						`Unexpected OTP type "${type}" requested for ${email}`
					);
					return;
				}

				// Only send a code to emails that already exist as users
				const existingUser = await prisma.user.findUnique({
					where: { email },
				});
				if (!existingUser) {
					throw new Error(
						"No account found with this email address."
					);
				}

				const subject = "Your sign-in code";
				const text = `Your sign-in code is: ${otp}\n\nThis code will expire shortly. If you didn't request this, you can ignore this email.`;

				console.log(`process.env.NODE_ENV`);

				if (process.env.NODE_ENV === "development") {
					console.log(`[DEV] OTP for ${email} (sign-in): ${otp}`);
					return;
				}

				try {
					await sendEmail({ to: email, subject, text });
				} catch (err) {
					console.error(`Failed to send OTP email to ${email}:`, err);
					throw err;
				}
			},
		}),
		// Attach our permission set + a whitelisted user to every session, so
		// roles travel with getSession()/useSession() on both server and client.
		// This is what makes a separate /api/me endpoint unnecessary.
		customSession(async ({ user, session }) => {
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				include: {
					NonEmployee: { include: { Children: true, Patient: true } },
				},
			});
			return {
				permissions: computePermissions(dbUser),
				user: {
					id: user.id,
					fName: dbUser?.fName ?? "",
					lName: dbUser?.lName ?? "",
					email: user.email,
					type: dbUser?.type ?? null,
				},
				session,
			};
		}),
	],
});
