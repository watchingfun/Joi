<script setup lang="ts">
import { ConnectStatusEnum } from "@/store/lcu";
import { ArrowSync16Regular, CheckmarkCircle16Regular, PlugDisconnected20Regular } from "@vicons/fluent";
import { Icon } from "@vicons/utils";
import { toRefs } from "vue";

const props = defineProps<{ connectStatus: ConnectStatusEnum }>();
const { connectStatus } = toRefs(props);
</script>

<template>
	<div class="flex flex-row items-center" style="gap: 2px">
		<div>客户端连接状态:</div>
		<div class="status-info" style="font-size: 18px">
			<div v-if="connectStatus === ConnectStatusEnum.connected">
				<Icon style="color: rgb(76 255 124 / 87%)">
					<CheckmarkCircle16Regular />
				</Icon>
			</div>
			<div v-else-if="connectStatus === ConnectStatusEnum.disconnect" class="disconnect">
				<Icon>
					<PlugDisconnected20Regular />
				</Icon>
			</div>
			<div v-else-if="connectStatus === ConnectStatusEnum.connecting">
				<Icon class="rotate">
					<ArrowSync16Regular />
				</Icon>
			</div>
		</div>
	</div>
</template>

<style scoped>
.status-info :deep(.el-text) {
	font-size: 12px;
}

.status-info > div {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.disconnect {
	transition: all 0.2s ease-in-out;
}

.rotate {
	animation: rotation 2s infinite linear;
}

@keyframes rotation {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(365deg);
	}
}
</style>
