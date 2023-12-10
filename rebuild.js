const path = require("path");
const child = require("child_process");

function execute(cmd, callback = (contents) => console.log(contents), cwd = process.cwd()) {
	let items = cmd;
	let exe = items.shift();
	let processor = child.spawn(exe, items, { cwd });
	let collect = () => {
		let str = "";
		let print = () => {
			let lines = str.split(/[\n|\r\n]/);
			str = lines.pop();
			let contents = lines.join("\r\n");
			if (str === "") {
				// 如果本来内容就是完整断句的，这里进行修正，表示结尾是正常断句的
				contents += "\r\n";
			}
			callback(contents);
		};
		return (data) => {
			str += data.toString();
			print();
		};
	};
	if (typeof callback === "function") {
		processor.stdout.on("data", collect());
		processor.stderr.on("data", collect());
	}
	processor.on("exit", (code) => {
		if (code === 0) {
			console.log("Rebuild success.");
		}
		process.exit(code);
	});
}

// If you prefer electron-rebuild:
// 👉 https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/docs/troubleshooting.md#electron
// 👉 https://stackoverflow.com/questions/46384591/node-was-compiled-against-a-different-node-js-version-using-node-module-versio/52796884#52796884

const better_sqlite3 = require.resolve("better-sqlite3");
const better_sqlite3_root = path.posix.join(
	better_sqlite3.slice(0, better_sqlite3.lastIndexOf("node_modules")),
	"node_modules/better-sqlite3"
);

const keysender = require.resolve("keysender");
const keysender_root = path.posix.join(
	keysender.slice(0, keysender.lastIndexOf("node_modules")),
	"node_modules/keysender"
);

const cmd = [
	"npm.cmd",
	"run",
	"build-release",
	`--target=${process.versions.electron}`,
	// https://github.com/electron/electron/blob/v26.1.0/docs/tutorial/using-native-node-modules.md#manually-building-for-electron
	"--dist-url=https://electronjs.org/headers"
];
const cmd2 = [
	"npm.cmd",
	"run",
	"install",
	"--runtime=electron",
	`--target=${process.versions.electron}`,
	// https://github.com/electron/electron/blob/v26.1.0/docs/tutorial/using-native-node-modules.md#manually-building-for-electron
	"--dist-url=https://electronjs.org/headers",
	`--abi=${process.version}`
];

execute(cmd, undefined, better_sqlite3_root);
execute(cmd2, undefined, keysender_root);
