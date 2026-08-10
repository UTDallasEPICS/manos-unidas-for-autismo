<!-- Staff view of a single service request, with a "Complete Intake" hand-off. -->
<script setup lang="ts">
interface RequestPhone {
	id: number;
	number: string;
	requestId: number;
}
interface RequestDetail {
	id: number;
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	phone: RequestPhone[];
	whatsapp: string;
	idNumber: string;
	status: string;
	streetName: string;
	streetNum: string;
	buildingNum?: string;
	postCode: string;
	isAdult: boolean;
	patientFirstName: string;
	patientMiddleName?: string;
	patientLastName: string;
	patientAge: number;
	diagnosed: boolean;
	returnPatient: boolean;
	previousVisitDate?: string;
	wantsEval: boolean;
	hasReferral: boolean;
	createdAt: string;
	therapies: { name: string }[];
	complementaryServices: { name: string }[];
	workshops: { name: string }[];
}

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const requestId = route.params.id as string;

const {
	data: request,
	status,
	error,
} = await useFetch<RequestDetail>(`/api/request/${requestId}`, {
	default: () => null,
});

const yesNo = (v: boolean) => (v ? t("request.yes") : t("request.no"));
const fmtDate = (v?: string) =>
	v ? new Date(v).toLocaleDateString(locale.value) : "—";

function completeIntake() {
	navigateTo(localePath(`/intake/${requestId}`));
}
</script>

<template>
	<div class="mx-auto w-full max-w-3xl">
		<div class="mb-6 flex items-center justify-between gap-3">
			<UButton
				:to="localePath('/viewContactForms')"
				variant="link"
				color="neutral"
				icon="i-lucide-arrow-left"
				:label="t('requestDetail.back')"
			/>
			<UButton
				v-if="request"
				color="success"
				icon="i-lucide-clipboard-check"
				:label="t('requestDetail.completeIntake')"
				@click="completeIntake"
			/>
		</div>

		<div v-if="status === 'pending'" class="space-y-4">
			<USkeleton class="h-8 w-64" />
			<USkeleton v-for="n in 3" :key="n" class="h-28 w-full" />
		</div>

		<UAlert
			v-else-if="error || !request"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('requestDetail.notFound')"
		/>

		<div v-else class="space-y-6">
			<div>
				<h1 class="text-highlighted text-2xl font-semibold">
					{{ t("requestDetail.title") }} — #{{ request.id }}
				</h1>
				<div
					class="text-muted mt-2 flex flex-wrap items-center gap-3 text-sm"
				>
					<span
						>{{ t("requestDetail.submitted") }}:
						{{ fmtDate(request.createdAt) }}</span
					>
					<UBadge color="neutral" variant="subtle">{{
						request.status
					}}</UBadge>
					<span>{{
						request.isAdult
							? t("requestDetail.adultSelf")
							: t("requestDetail.guardian")
					}}</span>
				</div>
			</div>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{
							request.isAdult
								? t("requestDetail.contactPerson")
								: t("requestDetail.contactGuardian")
						}}
					</h2>
				</template>
				<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.fullName") }}
						</dt>
						<dd class="text-default">
							{{ request.firstName }}
							{{ request.middleName ?? "" }}
							{{ request.lastName }}
						</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.idCard") }}
						</dt>
						<dd class="text-default">{{ request.idNumber }}</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.email") }}
						</dt>
						<dd class="text-default">{{ request.email }}</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.phone") }}
						</dt>
						<dd class="text-default">
							{{
								request.phone.map((p) => p.number).join(", ") ||
								"—"
							}}
						</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.whatsapp") }}
						</dt>
						<dd class="text-default">{{ request.whatsapp }}</dd>
					</div>
				</dl>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("requestDetail.address") }}
					</h2>
				</template>
				<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.street") }}
						</dt>
						<dd class="text-default">
							{{ request.streetName }} {{ request.streetNum }}
						</dd>
					</div>
					<div v-if="request.buildingNum">
						<dt class="text-muted text-sm">
							{{ t("requestDetail.building") }}
						</dt>
						<dd class="text-default">{{ request.buildingNum }}</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.postalCode") }}
						</dt>
						<dd class="text-default">{{ request.postCode }}</dd>
					</div>
				</dl>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{
							request.isAdult
								? t("requestDetail.patientDetails")
								: t("requestDetail.patientInfo")
						}}
					</h2>
				</template>
				<dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div v-if="!request.isAdult">
						<dt class="text-muted text-sm">
							{{ t("requestDetail.patientName") }}
						</dt>
						<dd class="text-default">
							{{ request.patientFirstName }}
							{{ request.patientMiddleName ?? "" }}
							{{ request.patientLastName }}
						</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.age") }}
						</dt>
						<dd class="text-default">{{ request.patientAge }}</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.diagnosed") }}
						</dt>
						<dd class="text-default">
							{{ yesNo(request.diagnosed) }}
						</dd>
					</div>
				</dl>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("requestDetail.history") }}
					</h2>
				</template>
				<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.previousPatient") }}
						</dt>
						<dd class="text-default">
							{{ yesNo(request.returnPatient) }}
						</dd>
					</div>
					<div v-if="request.previousVisitDate">
						<dt class="text-muted text-sm">
							{{ t("requestDetail.previousVisit") }}
						</dt>
						<dd class="text-default">
							{{ fmtDate(request.previousVisitDate) }}
						</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.wantsEval") }}
						</dt>
						<dd class="text-default">
							{{ yesNo(request.wantsEval) }}
						</dd>
					</div>
					<div>
						<dt class="text-muted text-sm">
							{{ t("requestDetail.hasReferral") }}
						</dt>
						<dd class="text-default">
							{{ yesNo(request.hasReferral) }}
						</dd>
					</div>
				</dl>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("requestDetail.servicesRequested") }}
					</h2>
				</template>
				<div class="space-y-4">
					<div v-if="request.therapies.length">
						<p class="text-muted mb-1 text-sm">
							{{ t("requestDetail.therapies") }}
						</p>
						<ul class="text-default ml-5 list-disc">
							<li v-for="s in request.therapies" :key="s.name">
								{{ t(`request.svc_${s.name}`) }}
							</li>
						</ul>
					</div>
					<div v-if="request.complementaryServices.length">
						<p class="text-muted mb-1 text-sm">
							{{ t("requestDetail.complementary") }}
						</p>
						<ul class="text-default ml-5 list-disc">
							<li
								v-for="s in request.complementaryServices"
								:key="s.name"
							>
								{{ t(`request.svc_${s.name}`) }}
							</li>
						</ul>
					</div>
					<div v-if="request.workshops.length">
						<p class="text-muted mb-1 text-sm">
							{{ t("requestDetail.workshops") }}
						</p>
						<ul class="text-default ml-5 list-disc">
							<li v-for="s in request.workshops" :key="s.name">
								{{ t(`request.svc_${s.name}`) }}
							</li>
						</ul>
					</div>
					<p
						v-if="
							!request.therapies.length &&
							!request.complementaryServices.length &&
							!request.workshops.length
						"
						class="text-dimmed text-sm italic"
					>
						{{ t("requestDetail.noServices") }}
					</p>
				</div>
			</UCard>
		</div>
	</div>
</template>
