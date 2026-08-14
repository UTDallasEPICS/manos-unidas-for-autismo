import type { AccessVal, SessionUser } from "~/types/permissions";

type AuthState = { user: SessionUser | null; permissions: AccessVal } | null;

// Seed the reactive auth state from the Better Auth session during SSR, with the
// request cookies forwarded (useRequestFetch). useState serialises the result
// into the payload, so the client hydrates without a second request and
// permission-gated UI renders correctly on first paint (no logged-out flash).
export default defineNuxtPlugin(async () => {
	const authState = useState<AuthState>("auth-state", () => null);
	if (import.meta.client) return;

	const fetchWithCookies = useRequestFetch();
	try {
		const data = await fetchWithCookies<{
			user?: SessionUser | null;
			permissions?: AccessVal;
		} | null>("/api/auth/get-session");
		authState.value = data?.user
			? { user: data.user, permissions: data.permissions ?? {} }
			: null;
	} catch {
		authState.value = null;
	}
});
