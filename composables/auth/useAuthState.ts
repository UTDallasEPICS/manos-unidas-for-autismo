import type { AccessVal } from "~/types/permissions";

interface MeResponse {
	user: {
		id: string;
		fName: string;
		lName: string;
		email: string;
		type: string | null;
	} | null;
	permissions: AccessVal;
}

export function useAuthState() {
	const _meState = useState<MeResponse | null>("meState", () => null);
	const _meLoading = useState<boolean>("meLoading", () => false);
	const _meFetched = useState<boolean>("meFetched", () => false);

	const userId = computed(() => _meState.value?.user?.id ?? null);
	const access = computed(() => _meState.value?.permissions ?? null);
	const user = computed(() => _meState.value?.user ?? null);

	async function fetchMe() {
		if (_meFetched.value || _meLoading.value) return;
		_meLoading.value = true;
		try {
			const headers = useRequestHeaders(["cookie"]);
			const data = await $fetch<MeResponse>("/api/me", {
				headers,
			});
			_meState.value = data;
			if (data.user) {
				_meFetched.value = true;
			}
		} catch {
			_meState.value = null;
		} finally {
			_meLoading.value = false;
		}
	}

	function clearMe() {
		_meState.value = null;
		_meFetched.value = false;
	}

	return {
		userId,
		access,
		user,
		fetchMe,
		clearMe,
		isLoading: computed(() => _meLoading.value),
	};
}
