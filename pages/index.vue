<template>
	<h1>This is a Template Index page</h1>
	<p>It needs liks to login & to submit a contact form</p>
</template>

<head> 
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Encode+Sans+SC:wght@100..900&display=swap" rel="stylesheet">
</head>

<script lang="ts" setup>
import { onMounted } from "vue";
import { navigateTo } from "#imports";
/* add you page's name after the / in 'navigateTo("/")' */
onMounted(async () => {
	await navigateTo("/ContactForm");
});
</script>
