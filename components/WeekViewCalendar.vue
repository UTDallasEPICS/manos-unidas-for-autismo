<!-- 11 Mar 2025 coder-Mika

	Calendar displays days from Monday-Friday, and hours based on fixed values. Later, when we have appointments in a database, the hours should be adjusted to the earliest and latest times of all the appointments displayed to account for appointments added in the future. Does not yet display any appointments. Colors/styles are placeholders.
-->
<template>
	<!-- Header part -->
	<div class="calendar-header grid grid-cols-11 text-center">
		<div class="col-span-1">
			<div class="row-span-1">Time</div>
		</div>
		<!-- Displays each day -->
		<div class="col-span-2" v-for="(day, index) in dayNames" :key="index">
			<div class="row-span-1">{{ day }}</div>
		</div>
	</div>

	<!-- Main Body -->
	<div class="grid grid-cols-11 text-center">
		<!-- Times -->
		<div class="col-span-1">
			<div
				class="col-span-1 row-span-4"
				v-for="(hr, index) in hours"
				:key="index"
			>
				<div class="time-container">
					<b>{{ hr }}:00</b>
				</div>
				<div class="time-container row-span-1">{{ hr }}:15</div>
				<div class="time-container row-span-1">{{ hr }}:30</div>
				<div class="time-container row-span-1">{{ hr }}:45</div>
			</div>
		</div>

		<!-- Appointments -->
		<div class="col-span-2" v-for="(day, index) in dayNames" :key="index">
			<!-- Replace the below with appointment components -->
			{{ day }} appointments go here
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
			startHr: 8, // The start and end hour might be computed in the future once appointments are added in instead of being fixed
			endHr: 18,
			hours: [],
		};
	},
	methods: {
		getHours(start, end) {
			this.hours = [];
			if (
				start < end &&
				start >= 0 &&
				start < 24 &&
				end >= 0 &&
				end < 24
			) {
				for (let i = start; i <= end; i++) {
					this.hours.push(i);
				}
			} else {
				// default hours in case of error: show all
				for (let i = 0; i <= 23; i++) {
					this.hours.push(i);
				}
			}
		},
	},
	created() {
		this.getHours(this.startHr, this.endHr);
	},
	watch: {
		// triggers when the start and end hour changes
		startHr: function () {
			this.getHours(this.startHr, this.endHr);
		},
		endHr: function () {
			this.getHours(this.startHr, this.endHr);
		},
	},
};
</script>

<style>
.calendar-header {
	/* Placeholder */
	background-color: #b4bbc9;
	font-size: large;
}

.time-container {
	border-bottom: 1px solid gray;
	border-right: 1px solid gray;
}
</style>
