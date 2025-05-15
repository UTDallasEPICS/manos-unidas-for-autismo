import type { Prisma } from "@prisma/client";
import { PrismaClient, UserType } from "@prisma/client";
import { AccessPermission } from "~/permissions";

const prisma = new PrismaClient();

type UserInfo = Prisma.UserGetPayload<{
	include: { NonEmployee: { include: { Children: true; Patient: true } } };
}>;
declare module "h3" {
	interface H3EventContext {
		prisma: PrismaClient;
		permissions: { [id: string]: boolean };
		user: UserInfo;
	}
}

export default defineEventHandler(async (event) => {
	event.context.prisma = prisma;
	event.context.permissions = {};
	event.context.permissions[AccessPermission.PUBLIC] = true;
	const cookies = parseCookies(event);
	if (cookies && cookies.userId) {
		const userId: string = cookies.userId;
		const user = await event.context.prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				NonEmployee: {
					include: {
						Children: true,
						Patient: true,
					},
				},
			},
		});

		if (user) {
			event.context.user = user;
			event.context.permissions[AccessPermission.USER] = true;
			if (user.type === UserType.THERAPIST) {
				event.context.permissions[AccessPermission.THERAPIST] = true;
			}
			if (user.type === UserType.USER_SERVICE) {
				event.context.permissions[AccessPermission.USER_SERVICE] = true;
			}
			if (user.type === UserType.ADMIN) {
				event.context.permissions[AccessPermission.ADMIN] = true;
			}
			if (user.NonEmployee?.Children.length) {
				event.context.permissions[AccessPermission.PARENT] = true;
			}
			if (user.NonEmployee?.Patient) {
				event.context.permissions[AccessPermission.PATIENT] = true;
			}
		}
	}
});
