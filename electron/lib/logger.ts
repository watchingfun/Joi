import winston, { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { app } from "electron";
import util from "util";
import path from "path";

const isDev = !!process.env.VITE_DEV_SERVER_URL;

// https://github.com/winstonjs/winston/issues/1427
const combineMessageAndSplat = () => ({
	transform(info) {
		const { [Symbol.for("splat")]: args = [], message } = info;
		info.message = util.format(message, ...args);
		return info;
	}
});

const createLogger = () =>
	winston.createLogger({
		format: format.combine(
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			combineMessageAndSplat(),
			format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
		)
	});

const logDirPath = isDev ? "." : app.getPath("userData");

const dailyRotateFileTransport = new DailyRotateFile({
	level: isDev ? "debug" : "info",
	filename: path.join(logDirPath, "logs/application-%DATE%.log"),
	datePattern: "YYYY-MM-DD-HH",
	zippedArchive: true,
	maxSize: "20m",
	maxFiles: "14d"
});

const dailyRotateFileTransport2 = new DailyRotateFile({
	level: "error",
	filename: path.join(logDirPath, "logs/application-error-%DATE%.log"),
	datePattern: "YYYY-MM-DD-HH",
	zippedArchive: true,
	maxSize: "20m",
	maxFiles: "14d"
});

const logger = createLogger();
logger.add(dailyRotateFileTransport);
logger.add(dailyRotateFileTransport2);
if (isDev)
	logger.add(
		new winston.transports.Console({
			level: "debug",
			format: format.combine(
				format.colorize(),
				format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
			)
		})
	);

export default logger;
