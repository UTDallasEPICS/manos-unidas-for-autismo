import type { Prisma } from "@prisma/client";
import { UserType } from "@prisma/client";
import { AccessPermission } from "~/types/permissions";
import { auth } from "~/server/utils/auth";

type UserInfo = Prisma.UserGetPayload<{
	include: { NonEmployee: { include: { Children: true; Patient: true } } };
}>;
declare module "h3" {
	interface H3EventContext {
		permissions: { [id: string]: boolean };
		user: UserInfo;
	}
}

export default defineEventHandler(async (event) => {
	event.context.permissions = {};
	event.context.permissions[AccessPermission.PUBLIC] = true;

	const session = await auth.api.getSession({
		headers: event.headers,
	});

	if (session?.user) {
		const user = await prisma.user.findUnique({
			where: {
				id: session.user.id,
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
				event.context.permissions[AccessPermission.STAFF] = true;
			}
			if (user.type === UserType.USER_SERVICE) {
				event.context.permissions[AccessPermission.USER_SERVICE] = true;
				event.context.permissions[AccessPermission.STAFF] = true;
			}
			if (user.type === UserType.ADMIN) {
				event.context.permissions[AccessPermission.ADMIN] = true;
				event.context.permissions[AccessPermission.STAFF] = true;
				event.context.permissions[AccessPermission.USER_SERVICE] = true;
			}
			if (user.NonEmployee?.Children.length) {
				event.context.permissions[AccessPermission.PARENT] = true;
			}
			if (user.NonEmployee?.Patient) {
				event.context.permissions[AccessPermission.PATIENT] = true;
			}
			if (user.type === UserType.EVALUATOR) {
				event.context.permissions[AccessPermission.EVALUATOR] = true;
				event.context.permissions[AccessPermission.STAFF] = true;
			}
		}
	}
});
