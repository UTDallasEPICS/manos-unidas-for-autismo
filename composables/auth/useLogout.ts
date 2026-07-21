import { useLocalePath } from "#imports";

export function useLogout() {
	const { clearMe } = useAuthState();
	const localePath = useLocalePath();

	async function logout() {
		// Sign out of better-auth session
		try {
			await authClient.signOut();
		} catch (err) {
			console.error("Sign out error:", err);
		}

		// Clear cached permissions state
		clearMe();

		await navigateTo(localePath("index"));
	}

	return { logout };
}
