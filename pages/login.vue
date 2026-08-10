<!-- /login is merged into the root route (/). Kept as a redirect so existing
     links/bookmarks still work. -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });
await navigateTo("/", { replace: true });
</script>

<template>
	<div />
</template>
