<script setup lang="ts">
import Footer from "@/components/Footer.vue";
import Nav from "@/components/Nav.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import { useRoute } from "vue-router";
import { TransitionSlide } from "@morev/vue-transitions";

const route = useRoute();
</script>

<template>
	<div class="flex flex-col h-screen">
		<HeaderBar></HeaderBar>
		<Nav v-show="route.name !== 'setting'"></Nav>
		<router-view v-slot="{ Component }">
			<transition-slide :offset="[-16, 0]" mode="out-in">
				<keep-alive>
					<component :is="Component" />
				</keep-alive>
			</transition-slide>
		</router-view>
		<Footer></Footer>
	</div>
</template>

<style scoped></style>
