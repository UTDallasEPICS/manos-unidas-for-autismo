<!-- Read-only patient profile, grouped into the clinic's field categories
     (identification, intake/tracking, insurance, family, sponsorship, clinical).
     Reads the raw /api/profile/patient shape directly. Role-gated: therapists
     see a clinical subset (no contact/address/payment); phone/WhatsApp are only
     present in the payload for ADMIN/IT/self (enforced server-side, #302). -->
<script setup lang="ts">
interface RawUser {
	fName?: string;
	mInit?: string;
	lName?: string;
	email?: string;
	phone?: string;
	whatsApp?: string;
	contactPref?: string;
}
interface RawPostCodeCity {
	city?: string;
}
interface RawNonEmployee {
	dob?: string;
	gender?: string;
	nationality?: string;
	nss?: string;
	identification?: string;
	streetName?: string;
	streetNum?: number;
	buildingNum?: number;
	postCode?: number;
	PostCodeCity?: RawPostCodeCity;
}
interface RawGuardianLink {
	relationship?: string;
	Guardian?: { User?: { fName?: string; lName?: string; email?: string } };
}
interface RawPatient {
	identification?: string;
	diagnosed?: boolean;
	status?: string;
	insurance?: string;
	initialInterviewDate?: string;
	programEvalDate?: string;
	therapyStartDate?: string;
	Diagnoses?: { name: string }[];
	MedicalRecords?: { data: string }[];
	Sponsor?: { name?: string } | null;
	Sponsorships?: { sponsorName?: string; amount?: number | null }[];
	Support?: { type: string }[];
	Guardians?: RawGuardianLink[];
}

const props = defineProps<{
	profile: RawUser;
	nonEmployee: RawNonEmployee;
	patient: RawPatient;
	paid: boolean;
}>();

const { t } = useI18n();
const { can } = useAccess();

// Therapists see the clinical subset only — no contact info, address, or payment.
const showContact = computed(() => !can("THERAPIST"));

function fmtDate(d?: string): string | null {
	if (!d) return null;
	const dt = new Date(d);
	return isNaN(dt.getTime()) ? null : dt.toLocaleDateString();
}
function ageFromDob(dob?: string): number | null {
	if (!dob) return null;
	const d = new Date(dob);
	if (isNaN(d.getTime())) return null;
	const now = new Date();
	let a = now.getFullYear() - d.getFullYear();
	const m = now.getMonth() - d.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
	return a >= 0 ? a : null;
}
const humanize = (v?: string) =>
	v
		? v
				.replace(/_/g, " ")
				.toLowerCase()
				.replace(/^\w/, (c) => c.toUpperCase())
		: "";

const fullName = computed(() =>
	[props.profile?.fName, props.profile?.mInit, props.profile?.lName]
		.filter(Boolean)
		.join(" ")
);

const medical = computed(() => {
	const recs = props.patient?.MedicalRecords ?? [];
	const last = recs[recs.length - 1];
	const empty = { medications: "", allergies: "", dietaryRestrictions: "" };
	if (!last?.data) return empty;
	try {
		const p = JSON.parse(last.data);
		return {
			medications: p.medications ?? "",
			allergies: p.allergies ?? "",
			dietaryRestrictions: p.dietaryRestrictions ?? "",
		};
	} catch {
		return empty;
	}
});

const diagnosesText = computed(() =>
	(props.patient?.Diagnoses ?? []).map((d) => d.name).join(", ")
);

const guardians = computed(() =>
	(props.patient?.Guardians ?? []).map((g) => ({
		name: [g.Guardian?.User?.fName, g.Guardian?.User?.lName]
			.filter(Boolean)
			.join(" "),
		email: g.Guardian?.User?.email ?? "",
		relationship: g.relationship ?? "",
	}))
);

const sponsored = computed(
	() =>
		!!props.patient?.Sponsor ||
		(props.patient?.Sponsorships?.length ?? 0) > 0
);
const sponsorName = computed(
	() =>
		props.patient?.Sponsor?.name ||
		props.patient?.Sponsorships?.[0]?.sponsorName ||
		""
);
const sponsorAmount = computed(() => {
	const a = props.patient?.Sponsorships?.[0]?.amount;
	return a != null ? String(a) : "";
});
const supportLabels = computed(() =>
	(props.patient?.Support ?? []).map((s) => {
		const map: Record<string, string> = {
			TRANSPORTATION: t("profile.supportTransportation"),
			FOOD: t("profile.supportFood"),
			DOMESTIC_HELP: t("profile.supportDomesticHelp"),
			OTHER: t("profile.supportOther"),
		};
		return map[s.type] ?? humanize(s.type);
	})
);

const statusText = computed(() => {
	const s = props.patient?.status;
	if (!s) return "";
	const key = `profile.status_${s}`;
	const tr = t(key);
	return tr === key ? humanize(s) : tr;
});

const address = computed(() => {
	const ne = props.nonEmployee ?? {};
	const line = [ne.streetNum, ne.streetName].filter(Boolean).join(" ");
	const bld = ne.buildingNum ? `, ${ne.buildingNum}` : "";
	const city = [ne.PostCodeCity?.city, ne.postCode].filter(Boolean).join(" ");
	const full = `${line}${bld}${city ? ` — ${city}` : ""}`.trim();
	return full.replace(/^—\s*/, "");
});

// Field rows per category (label + value; falsy shows as "—").
const identificationFields = computed(() => {
	const rows = [
		{ label: t("profile.fullName"), value: fullName.value },
		{ label: t("profile.dob"), value: fmtDate(props.nonEmployee?.dob) },
		{
			label: t("profile.age"),
			value:
				ageFromDob(props.nonEmployee?.dob) != null
					? String(ageFromDob(props.nonEmployee?.dob))
					: "",
		},
		{ label: t("profile.sex"), value: props.nonEmployee?.gender },
		{
			label: t("profile.nationality"),
			value: props.nonEmployee?.nationality,
		},
		{
			label: t("profile.identification"),
			value:
				props.nonEmployee?.identification ||
				props.patient?.identification,
		},
	];
	if (props.profile?.phone)
		rows.push({ label: t("profile.phone"), value: props.profile.phone });
	if (props.profile?.whatsApp)
		rows.push({
			label: t("profile.whatsApp"),
			value: props.profile.whatsApp,
		});
	return rows;
});

const intakeFields = computed(() => {
	const rows = [
		{
			label: t("profile.initialInterviewDate"),
			value: fmtDate(props.patient?.initialInterviewDate),
		},
		{
			label: t("profile.programEvalDate"),
			value: fmtDate(props.patient?.programEvalDate),
		},
		{
			label: t("profile.therapyStartDate"),
			value: fmtDate(props.patient?.therapyStartDate),
		},
		{ label: t("profile.status"), value: statusText.value },
	];
	if (showContact.value)
		rows.push({
			label: t("profile.allSessionsPaid"),
			value: props.paid ? t("common.yes") : t("common.no"),
		});
	return rows;
});

const insuranceFields = computed(() => [
	{ label: t("profile.nss"), value: props.nonEmployee?.nss },
	{
		label: t("profile.insurance"),
		value: humanize(props.patient?.insurance),
	},
]);
</script>

<template>
	<div class="flex flex-col gap-4">
		<!-- 1. Identification -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">
					{{ t("profile.catIdentification") }}
				</h2>
			</template>
			<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
				<div v-for="f in identificationFields" :key="f.label">
					<dt class="text-muted">{{ f.label }}</dt>
					<dd class="text-default">{{ f.value || "—" }}</dd>
				</div>
			</dl>
		</UCard>

		<!-- 2. Intake & institutional tracking -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">
					{{ t("profile.catIntake") }}
				</h2>
			</template>
			<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
				<div v-for="f in intakeFields" :key="f.label">
					<dt class="text-muted">{{ f.label }}</dt>
					<dd class="text-default">{{ f.value || "—" }}</dd>
				</div>
			</dl>
		</UCard>

		<!-- 3. Medical insurance -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">
					{{ t("profile.catInsurance") }}
				</h2>
			</template>
			<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
				<div v-for="f in insuranceFields" :key="f.label">
					<dt class="text-muted">{{ f.label }}</dt>
					<dd class="text-default">{{ f.value || "—" }}</dd>
				</div>
			</dl>
		</UCard>

		<!-- 4. Family & support -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">
					{{ t("profile.catFamily") }}
				</h2>
			</template>
			<div class="flex flex-col gap-4 text-sm">
				<div v-if="!guardians.length" class="text-muted">—</div>
				<div
					v-for="(g, i) in guardians"
					:key="i"
					class="grid grid-cols-1 gap-4 sm:grid-cols-2"
				>
					<div>
						<dt class="text-muted">
							{{ t("profile.parentGuardian") }}
						</dt>
						<dd class="text-default">
							{{ g.name || "—"
							}}<span v-if="g.relationship" class="text-muted">
								({{ g.relationship }})</span
							>
						</dd>
					</div>
					<div v-if="showContact">
						<dt class="text-muted">{{ t("profile.email") }}</dt>
						<dd class="text-default">{{ g.email || "—" }}</dd>
					</div>
				</div>
				<div v-if="showContact">
					<dt class="text-muted">{{ t("profile.address") }}</dt>
					<dd class="text-default">{{ address || "—" }}</dd>
				</div>
			</div>
		</UCard>

		<!-- 5. Sponsorship -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">
					{{ t("profile.catSponsorship") }}
				</h2>
			</template>
			<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-muted">{{ t("profile.sponsored") }}</dt>
					<dd class="text-default">
						{{ sponsored ? t("common.yes") : t("common.no") }}
					</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.sponsorName") }}</dt>
					<dd class="text-default">{{ sponsorName || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.amount") }}</dt>
					<dd class="text-default">{{ sponsorAmount || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.otherAids") }}</dt>
					<dd class="text-default">
						{{
							supportLabels.length
								? supportLabels.join(", ")
								: t("profile.none")
						}}
					</dd>
				</div>
			</dl>
		</UCard>

		<!-- 6. Clinical & therapeutic -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">
					{{ t("profile.catClinical") }}
				</h2>
			</template>
			<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-muted">{{ t("profile.diagnosed") }}</dt>
					<dd class="text-default">
						{{
							patient?.diagnosed
								? t("common.yes")
								: t("common.no")
						}}
					</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.diagnosis") }}</dt>
					<dd class="text-default">{{ diagnosesText || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.medication") }}</dt>
					<dd class="text-default">
						{{ medical.medications || "—" }}
					</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.allergies") }}</dt>
					<dd class="text-default">{{ medical.allergies || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("profile.diet") }}</dt>
					<dd class="text-default">
						{{ medical.dietaryRestrictions || "—" }}
					</dd>
				</div>
				<div>
					<dt class="text-muted">
						{{ t("profile.therapiesReceived") }}
					</dt>
					<dd class="text-dimmed italic">
						{{ t("profile.notTracked") }}
					</dd>
				</div>
			</dl>
		</UCard>
	</div>
</template>
