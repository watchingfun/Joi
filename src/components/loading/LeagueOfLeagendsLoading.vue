<script setup lang="ts"></script>

<template>
	<div class="container">
		<svg class="diamond small" viewBox="0 0 30 30">
			<path class="path" d="M1.56502 15L15 1.56502L28.4351 15L15 28.4351L1.56502 15Z" />
		</svg>
		<svg class="diamond small rotated" viewBox="0 0 30 30">
			<path class="path" d="M1.56502 15L15 1.56502L28.4351 15L15 28.4351L1.56502 15Z" />
		</svg>
		<div class="square centered"></div>
		<svg class="diamond large" viewBox="0 0 58 58">
			<path class="path" d="M1.42293 29L29 1.42293L56.5771 29L29 56.5771L1.42293 29Z" />
		</svg>
		<svg class="diamond large rotated" viewBox="0 0 58 58">
			<path class="path" d="M1.42293 29L29 1.42293L56.5771 29L29 56.5771L1.42293 29Z" />
		</svg>

		<div class="circle centered"></div>
	</div>
</template>

<style scoped>
* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

.container {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 50%;
	top: 50%;
	translate: -50% -50%;
	background-color: hsl(200deg, 100%, 4%);
}

.square {
	width: 30px;
	height: 30px;
	rotate: 45deg;
	border: solid goldenrod 2px;
	animation: jitter 1.5s ease-in-out infinite;
	background-color: hsl(200deg, 100%, 4%);
}

.circle {
	width: 60px;
	height: 60px;
	border: dashed goldenrod 2px;
	border-radius: 50%;
	animation: smooth 10s linear infinite;
}

.centered {
	position: absolute;
	left: 50%;
	top: 50%;
	translate: -50% -50%;
}

.diamond {
	position: absolute;
	left: 50%;
	top: 50%;
	translate: 0 -50%;
}

.diamond.small {
	width: 30px;
	height: 30px;
	stroke-dasharray: 100;
	stroke-width: 2px;
	animation: disappear-small 3s ease-in-out infinite;
}

.diamond.large {
	width: 60px;
	height: 60px;
	stroke-dasharray: 200;
	stroek-width: 0.25px;
	animation: disappear-large 3s ease-in-out infinite;
}

.path {
	stroke: goldenrod;
	fill: none;
}

.rotated {
	transform-origin: left;
	rotate: 180deg;
}

@keyframes jitter {
	0% {
		rotate: 45deg;
	}
	33% {
		rotate: 135deg;
	}
	100% {
		rotate: 135deg;
	}
}

@keyframes smooth {
	from {
		rotate: 0deg;
	}
	to {
		rotate: 360deg;
	}
}

@keyframes disappear-small {
	0% {
		stroke-dashoffset: 100;
	}
	100% {
		stroke-dashoffset: -100;
	}
}

@keyframes disappear-large {
	0% {
		stroke-dashoffset: 200;
	}
	100% {
		stroke-dashoffset: -200;
	}
}
</style>
