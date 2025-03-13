<template>
	<h1>This is a Template Index page</h1>
	<p>It needs liks to login & to submit a contact form</p>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { navigateTo } from "#imports";
/* add you page's name after the / in 'navigateTo("/")' */
onMounted(async () => {
	await navigateTo("/");
});
</script>
