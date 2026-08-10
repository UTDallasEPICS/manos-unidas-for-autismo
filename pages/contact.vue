<template>
	<div>
		<h1
			class="font-cormorant-garamond mt-[100px] mb-8 text-center text-3xl font-bold"
		>
			Contact Us
		</h1>
		<div class="font-sc-encode flex justify-center p-4">
			<div
				class="mt-[30px] min-h-[300px] w-full max-w-[1200px] rounded border border-gray-300 bg-gray-100 p-8"
			>
				<!-- Header -->

				<!-- Contact Info -->
				<div class="grid grid-cols-2 gap-y-10 text-xl">
					<div class="font-semibold">Email:</div>
					<a
						href="mailto:fundación@manosunidasporautismo.org"
						class="text-red-600 hover:underline"
					>
						fundación@manosunidasporautismo.org
					</a>

					<div class="font-semibold">Phone:</div>
					<a
						href="tel:+18095953163"
						class="text-red-600 hover:underline"
					>
						+1 809-595-3163
					</a>

					<div class="font-semibold">Website:</div>
					<NuxtLink
						to="https://www.manosunidasporautismo.org/"
						class="text-red-600 hover:underline"
					>
						{{ $t("Manos-Link") }}
					</NuxtLink>
				</div>

				<!-- Footer message -->
				<p class="mt-[70px] text-center font-medium">
					Feel free to reach out anytime for questions or support.
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });
// No logic needed
</script>
