<script setup lang="ts">
import { TransitionFade } from "@morev/vue-transitions";

const emit = defineEmits(["leave", "enter", "change", "disconnect"]);

const props = defineProps({
	autoHide: {
		type: Boolean,
		default: true
	},
	once: {
		type: Boolean,
		default: false
	},
	threshold: {
		type: [Array<number>, Number],
		default: 0
	},
	root: {
		type: Object,
		default: null
	},
	rootMargin: {
		type: String,
		default: "0px 0px 0px 0px"
	}
});
const show = computed(() => (props.autoHide ? loaded.value : true));

const observer = ref<IntersectionObserver>();
const loaded = ref(false);
const el = ref<Element>();

function onElementObserved(entries: IntersectionObserverEntry[]): void {
	entries.forEach(({ target, isIntersecting }) => {
		if (props.autoHide) {
			loaded.value = isIntersecting;
		}
		if (isIntersecting) {
			emit("enter", target);

			if (props.once) {
				return observer.value?.unobserve(target);
			}
		} else {
			emit("leave", target);
		}
		emit("change", target);
	});
}

onMounted(() => {
	const option: IntersectionObserverInit = {
		threshold: props.threshold,
		rootMargin: props.rootMargin
	};
	if (props.root) {
		option["root"] = props.root as any;
	}
	observer.value = new IntersectionObserver(onElementObserved, option);
	observer.value?.observe(el.value!);
});

onUnmounted(() => {
	emit("disconnect");
	observer.value?.disconnect();
});
</script>

<template>
	<div class="lazy-deferred" ref="el">
		<transition-fade mode="out-in">
			<template v-if="show">
				<slot></slot>
			</template>
			<template v-else>
				<slot name="loading"></slot>
			</template>
		</transition-fade>
	</div>
</template>

<style scoped></style>
