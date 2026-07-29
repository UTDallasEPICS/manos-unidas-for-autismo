import { useLocalePath } from "#imports";
import { authClient } from "~/utils/auth-client";

export function useLogout() {
	const localePath = useLocalePath();
	const { clear } = useAuthState();

	async function logout() {
		try {
			await authClient.signOut();
		} catch (err) {
			console.error("Sign out error:", err);
		}

		// Drop the cached session state so UI updates immediately.
		clear();

		await navigateTo(localePath("index"));
	}

	return { logout };
}
