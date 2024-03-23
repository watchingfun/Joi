import { isPromise } from "@vue/shared";
import { random } from "lodash";
import { Player, SummonerInfo } from "@@/types/lcuType";

/**
 * 错误重试包装器
 *
 * @param  asyncFunc 要包装的异步函数
 * @param  defaultRetryTime 默认的重试次数
 * @param  retryInterval 重试间隔时常
 * @returns Promise<T> 会自动进行错误重试的异步函数
 */
export const retryWrapper = function <T>(
	asyncFunc: (...args: any[]) => Promise<T>,
	defaultRetryTime: number = 3,
	retryInterval: number = 1000
) {
	// 内部重试计数器
	let retryTime = defaultRetryTime;

	const retryCallback = async function (...args: any[]): Promise<T> {
		try {
			return await asyncFunc(...args);
		} catch (e: any) {
			if (retryTime <= 0) throw e;
			console.error(
				`error occurred:${e.message}, retryWrapper, 将在 ${retryInterval} 毫秒后重试，剩余重试次数 ${retryTime}`
			);
			retryTime -= 1;
			await new Promise((resolve) => setTimeout(resolve, retryInterval));
			return await retryCallback(...args);
		}
	};

	return retryCallback;
};

/**
 * 随机延迟执行
 * @param func
 * @param min
 * @param max
 */
export const randomTimout = function <T>(
	func: ((...args: any[]) => Promise<T>) | ((...args: any[]) => T),
	min: number = 500,
	max: number = 2000
) {
	return new Promise<T>((resolve) => {
		setTimeout(
			async () => {
				const result = func();
				if (isPromise(result)) {
					resolve(await result);
				} else {
					resolve(result);
				}
			},
			random(min, max)
		);
	});
};

export const getNameAndTagLine = (summoner: SummonerInfo | Player) => {
	let name;
	if ("summonerName" in summoner) {
		name = summoner.gameName || summoner.summonerName;
	} else {
		name = summoner.gameName || summoner.displayName;
	}
	return name + (summoner.tagLine ? " #" + summoner.tagLine : "");
};
