<template>
	<table
		class="font-cormorant-garamond w-full border-collapse border-2 border-b-black text-2xl"
	>
		<thead>
			<tr class="border-collapse border-2 border-b-black">
				<th
					v-for="col in columns"
					:key="col.key"
					class="border-collapse border-2 border-b-black px-2"
				>
					{{ col.label }}
				</th>
				<th class="border-collapse border-2 border-b-black px-2">
					Actions
				</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="(request, index) in requests"
				:key="index"
				class="font-sc-encode border-collapse border-2 border-b-black text-lg"
			>
				<td class="border-collapse border-2 border-b-black px-2">
					{{ request.firstName }} {{ request.lastName }}
				</td>
				<td class="border-collapse border-2 border-b-black px-2">
					{{ request.email }}
				</td>
				<td class="border-collapse border-2 border-b-black px-2">
					{{ request.phone.map((p) => p.number).join(", ") }}
				</td>
				<td class="border-collapse border-2 border-b-black px-2">
					{{ request.patientFirstName }} {{ request.patientLastName }}
				</td>
				<td class="border-collapse border-2 border-b-black px-2">
					{{ new Date(request.createdAt).toLocaleDateString() }}
				</td>
				<td class="border-collapse border-2 border-b-black px-2">
					<div class="flex gap-2">
						<button
							class="rounded-md bg-blue-950 px-3 py-1 text-sm text-white hover:bg-blue-800"
							@click="$emit('view', request)"
						>
							View Full Request
						</button>
						<button
							class="rounded-md bg-green-700 px-3 py-1 text-sm text-white hover:bg-green-600"
							@click="completeIntake(request.id)"
						>
							Complete Intake
						</button>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script setup lang="ts">
interface RequestTherapy {
	name: string;
}

interface RequestComplementaryService {
	name: string;
}

interface RequestWorkshop {
	name: string;
}

interface RequestPhone {
	id: number;
	number: string;
	requestId: number;
}

interface Request {
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
	therapies: RequestTherapy[];
	complementaryServices: RequestComplementaryService[];
	workshops: RequestWorkshop[];
}

defineProps<{
	columns: { key: string; label: string }[];
	requests: Request[];
}>();

defineEmits<{
	view: [request: Request];
}>();

const router = useRouter();

function completeIntake(requestId: number) {
	router.push(`/intake/${requestId}`);
}
</script>
