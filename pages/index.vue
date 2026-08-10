<template>
	<div class="flex flex-col items-center gap-6 pt-10">
		<!-- HEADER -->
		<div class="flex items-center gap-4">
			<img
				src="/manos-unidas-logo.jpg"
				alt="Logo"
				class="h-[150px] w-[150px]"
			/>

			<h1 class="text-center text-[30px] font-bold">
				Manos Unidas Foundation for Autism
			</h1>
		</div>

		<!-- HERO IMAGE -->
		<img
			src="/home.png"
			alt="Home"
			class="h-[1400px] w-[2700px] max-w-full object-cover"
		/>
		<p class="mt-[5px] mb-[20px] text-center text-[20px] font-bold">
			For more inquiries, you can contact us at
			<a href="tel:+18499251246" class="text-blue-500 hover:text-red-500">
				(849) 925-1246 </a
			>. Our email is fundación@manosunidasporautismo.org.
		</p>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: "auth" });
</script>
