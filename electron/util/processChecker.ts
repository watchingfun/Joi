import { exec } from "child_process";
import { EventEmitter } from "events";

class ProcessChecker extends EventEmitter {
  pid: number;
  pollInterval: number;
  timer: ReturnType<typeof setInterval>;

  constructor(pid: number, pollInterval = 5000) {
    super();
    this.pid = pid;
    this.pollInterval = pollInterval;
    this.timer = null;
  }

  start() {
    if (this.timer === null) {
      this.timer = setInterval(() => {
        this.checkProcess();
      }, this.pollInterval);
      this.checkProcess(); // Check immediately when starting
    }
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  checkProcess() {
    checkProcessExist(this.pid).then(
      (flag) => () => this.emit(flag ? "running" : "stopped"),
    );
  }
}

export async function checkProcessExist(pid: number) {
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

export default ProcessChecker;
