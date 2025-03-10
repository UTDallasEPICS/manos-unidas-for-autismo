<template>
	<ContactForm />
</template>
<!--3/10/25 coder-Lewis,
I believe this is just the set up page. More notes will be had in the ContactForm.vue
main issue: Not quite sure how to get the server running to look at website & the problem may lie here.  
-->
<script>
import ContactForm from "./MANOS-UNIDAS-FOR-AUTISMO/ContactForm.vue"; /*no clue if this works*/
export default {
	name: "App",
	components: { ContactForm },
};
</script>

<style>
#app {
	font-family: "Courier New", Courier, monospace;
	text-align: center;
	color: black;
	margin-top: 60px;
}
body {
	margin: 0;
	background: #eee;
}
</style>
