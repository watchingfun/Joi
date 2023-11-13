import { exec } from "child_process";
import { EventEmitter } from "events";
import logger from "../lib/logger";

class ProcessChecker extends EventEmitter {
	pid: number;
	name: string;
	pollInterval: number;
	timer: ReturnType<typeof setInterval>;

	constructor(pid: number, pollInterval: number);
	constructor(name: string, pollInterval: number);
	constructor(arg: string | number, pollInterval = 5000) {
		super();
		if (typeof arg === "string") {
			this.name = arg;
		} else {
			this.pid = arg;
		}
		this.pollInterval = pollInterval;
		this.timer = null;
	}

	start(immediate: boolean = false) {
		if (this.timer === null) {
			logger.debug("start processChecker");
			this.timer = setInterval(() => {
				this.checkProcess();
			}, this.pollInterval);
			if (immediate) this.checkProcess(); // Check immediately when starting
		}
	}

	stop() {
		if (this.timer !== null) {
			logger.debug("stop processChecker");
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	checkProcess() {
		if (this.pid) {
			checkProcessExistByPid(this.pid).then((flag) => this.emit(flag ? "running" : "stopped"));
		} else {
			checkProcessExistByName(this.name).then((flag) => this.emit(flag ? "running" : "stopped"));
		}
	}
}

export async function checkProcessExistByPid(pid: number) {
	return new Promise((resolve, reject) => {
		exec(`tasklist /fi "pid eq ${pid}"`, (error, stdout) => {
			if (!error && stdout.includes(pid.toString())) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
}

export async function checkProcessExistByName(name: string) {
	return new Promise((resolve, reject) => {
		exec(`tasklist /FI "ImageName eq ${name}"`, (error, stdout) => {
			if (!error && stdout.includes(name)) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
}

export default ProcessChecker;
