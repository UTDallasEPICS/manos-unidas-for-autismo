<!-- Public "Contact Us" info page (auth layout). Rebuilt on NuxtUI. -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });
const { t } = useI18n();
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<h1 class="text-highlighted mb-6 text-center text-2xl font-semibold">
			{{ t("contact.title") }}
		</h1>

		<UCard>
			<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
				<dt class="text-muted font-medium">{{ t("contact.email") }}</dt>
				<dd>
					<ULink
						href="mailto:fundación@manosunidasporautismo.org"
						class="text-primary"
					>
						fundación@manosunidasporautismo.org
					</ULink>
				</dd>

				<dt class="text-muted font-medium">{{ t("contact.phone") }}</dt>
				<dd>
					<ULink href="tel:+18095953163" class="text-primary">
						+1 809-595-3163
					</ULink>
				</dd>

				<dt class="text-muted font-medium">
					{{ t("contact.website") }}
				</dt>
				<dd>
					<ULink
						to="https://www.manosunidasporautismo.org/"
						target="_blank"
						class="text-primary"
					>
						{{ t("contact.websiteLink") }}
					</ULink>
				</dd>
			</dl>

			<template #footer>
				<p class="text-muted text-center text-sm">
					{{ t("contact.message") }}
				</p>
			</template>
		</UCard>
	</div>
</template>
