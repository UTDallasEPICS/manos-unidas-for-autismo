import { AccessPermission as AP } from "~/types/permissions";

type Route = {
	to?: string;
	path?: string;
	params?: {
		id: string;
	};
	label: string;
};

export function useUserLinks() {
	const { userId, access } = useAuthState();

	const userLinks = computed(() => {
		const legalRoutes: Route[] = [];
		const val = access.value;

		if (!userId.value) {
			legalRoutes.push({ path: "/login", label: "Login" });
			legalRoutes.push({ path: "/requestForm", label: "Request Form" });
		}

		// protect against undefined access throwind error
		if (!val) {
			return legalRoutes;
		}
		// add relevant links
		if (val[AP.USER]) {
			legalRoutes.push({ to: "admin-scheduleView", label: "Schedule" });
		}
		if (val[AP.PATIENT]) {
			if (userId.value)
				legalRoutes.push({
					to: "myProfile-id",
					params: { id: userId.value },
					label: "Profile",
				});
		}
		if (val[AP.PARENT]) {
			legalRoutes.push({ to: "childSearch", label: "Children" });
		}
		if (val[AP.STAFF]) {
			legalRoutes.push({
				to: "patient-patientSearch",
				label: "Patients",
			});
		}
		if (val[AP.USER_SERVICE]) {
			legalRoutes.push({
				to: "patient-viewContactForms",
				label: "Review Forms",
			});
			legalRoutes.push({
				to: "userService-assignNeuroSpecialist",
				label: "Assign Specialist",
			});
		}

		if (val[AP.ADMIN]) {
			legalRoutes.push({
				to: "admin-employeeSearch",
				label: "Employees",
			});
		}

		if (val[AP.EVALUATOR]) {
			legalRoutes.push({
				to: "dashboard-evaluatorDashboard",
				label: "Evaluators",
			});
		}
		return legalRoutes;
	});

	return { userLinks };
}
