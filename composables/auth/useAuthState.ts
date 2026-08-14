import type { AccessVal, SessionUser } from "~/types/permissions";

type AuthState = { user: SessionUser | null; permissions: AccessVal } | null;

/**
 * Reactive auth state, sourced from the Better Auth session (which carries our
 * custom `permissions` via the customSession plugin). Backed by Nuxt `useState`
 * so it is SSR-serialised and hydrated once; the `plugins/auth-session` plugin
 * seeds it during SSR with the request cookies.
 *
 * NOTE: these values drive UX only (nav links, conditional buttons). Real
 * authorization is enforced server-side. Never trust these for security.
 */
export function useAuthState() {
	const authState = useState<AuthState>("auth-state", () => null);

	const user = computed<SessionUser | null>(
		() => authState.value?.user ?? null
	);
	const userId = computed<string | null>(() => user.value?.id ?? null);
	const access = computed<AccessVal | null>(
		() => authState.value?.permissions ?? null
	);

	async function refresh() {
		try {
			const data = await $fetch<{
				user?: SessionUser | null;
				permissions?: AccessVal;
			} | null>("/api/auth/get-session");
			authState.value = data?.user
				? { user: data.user, permissions: data.permissions ?? {} }
				: null;
		} catch {
			authState.value = null;
		}
	}

	function clear() {
		authState.value = null;
	}

	return { user, userId, access, refresh, clear };
}
