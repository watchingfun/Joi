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
    exec(`tasklist /fi "pid eq ${this.pid}"`, (error, stdout) => {
      if (!error && stdout.includes(this.pid.toString())) {
        this.emit("running");
      } else {
        this.emit("stopped");
      }
    });
  }
}

export default ProcessChecker
