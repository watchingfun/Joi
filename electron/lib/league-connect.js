// src/authentication.ts
import cp from "node:child_process";
import util from "node:util";
// src/client.ts
import { EventEmitter } from "events";
// src/http.ts
import https from "https";
import { TextEncoder, TextEncoder as TextEncoder2 } from "util";
import assert from "assert";
import assert2 from "assert";
// src/http2.ts
import http2 from "http2";

// src/cert.ts
var RIOT_GAMES_CERT = `
-----BEGIN CERTIFICATE-----
MIIEIDCCAwgCCQDJC+QAdVx4UDANBgkqhkiG9w0BAQUFADCB0TELMAkGA1UEBhMC
VVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFTATBgNVBAcTDFNhbnRhIE1vbmljYTET
MBEGA1UEChMKUmlvdCBHYW1lczEdMBsGA1UECxMUTG9MIEdhbWUgRW5naW5lZXJp
bmcxMzAxBgNVBAMTKkxvTCBHYW1lIEVuZ2luZWVyaW5nIENlcnRpZmljYXRlIEF1
dGhvcml0eTEtMCsGCSqGSIb3DQEJARYeZ2FtZXRlY2hub2xvZ2llc0ByaW90Z2Ft
ZXMuY29tMB4XDTEzMTIwNDAwNDgzOVoXDTQzMTEyNzAwNDgzOVowgdExCzAJBgNV
BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRUwEwYDVQQHEwxTYW50YSBNb25p
Y2ExEzARBgNVBAoTClJpb3QgR2FtZXMxHTAbBgNVBAsTFExvTCBHYW1lIEVuZ2lu
ZWVyaW5nMTMwMQYDVQQDEypMb0wgR2FtZSBFbmdpbmVlcmluZyBDZXJ0aWZpY2F0
ZSBBdXRob3JpdHkxLTArBgkqhkiG9w0BCQEWHmdhbWV0ZWNobm9sb2dpZXNAcmlv
dGdhbWVzLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKoJemF/
6PNG3GRJGbjzImTdOo1OJRDI7noRwJgDqkaJFkwv0X8aPUGbZSUzUO23cQcCgpYj
21ygzKu5dtCN2EcQVVpNtyPuM2V4eEGr1woodzALtufL3Nlyh6g5jKKuDIfeUBHv
JNyQf2h3Uha16lnrXmz9o9wsX/jf+jUAljBJqsMeACOpXfuZy+YKUCxSPOZaYTLC
y+0GQfiT431pJHBQlrXAUwzOmaJPQ7M6mLfsnpHibSkxUfMfHROaYCZ/sbWKl3lr
ZA9DbwaKKfS1Iw0ucAeDudyuqb4JntGU/W0aboKA0c3YB02mxAM4oDnqseuKV/CX
8SQAiaXnYotuNXMCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAf3KPmddqEqqC8iLs
lcd0euC4F5+USp9YsrZ3WuOzHqVxTtX3hR1scdlDXNvrsebQZUqwGdZGMS16ln3k
WObw7BbhU89tDNCN7Lt/IjT4MGRYRE+TmRc5EeIXxHkQ78bQqbmAI3GsW+7kJsoO
q3DdeE+M+BUJrhWorsAQCgUyZO166SAtKXKLIcxa+ddC49NvMQPJyzm3V+2b1roP
SvD2WV8gRYUnGmy/N0+u6ANq5EsbhZ548zZc+BI4upsWChTLyxt2RxR7+uGlS1+5
EcGfKZ+g024k/J32XP4hdho7WYAS2xMiV83CfLR/MNi8oSMaVQTdKD8cpgiWJk3L
XWehWA==
-----END CERTIFICATE-----
`;

// src/authentication.ts
var exec = util.promisify(cp.exec);
var DEFAULT_NAME = "LeagueClientUx";
var DEFAULT_POLL_INTERVAL = 2500;
var InvalidPlatformError = class extends Error {
	constructor() {
		super("process runs on platform client does not support");
	}
};
var ClientNotFoundError = class extends Error {
	constructor() {
		super("League Client process could not be located");
	}
};
var ClientElevatedPermsError = class extends Error {
	constructor() {
		super("League Client has been detected but is running as administrator");
	}
};

async function authenticate(options) {
	async function tryAuthenticate() {
		const name = (options == null ? void 0 : options.name) ?? DEFAULT_NAME;
		const portRegex = /--app-port=([0-9]+)(?= *"| --)/;
		const passwordRegex = /--remoting-auth-token=(.+?)(?= *"| --)/;
		const pidRegex = /--app-pid=([0-9]+)(?= *"| --)/;
		const isWindows = process.platform === "win32";
		let command;
		if (!isWindows) {
			command = `ps x -o args | grep '${name}'`;
		} else if (isWindows && (options == null ? void 0 : options.useDeprecatedWmic) === true) {
			command = `wmic process where caption='${name}.exe' get commandline`;
		} else {
			command = `Get-CimInstance -Query "SELECT * from Win32_Process WHERE name LIKE '${name}.exe'" | Select-Object -ExpandProperty CommandLine`;
		}
		const executionOptions = isWindows
			? {
					shell: (options == null ? void 0 : options.windowsShell) ?? "powershell"
			  }
			: {};
		try {
			const { stdout: rawStdout } = await exec(command, executionOptions);
			const stdout = rawStdout.replace(/\n|\r/g, "");
			const [, port] = stdout.match(portRegex);
			const [, password] = stdout.match(passwordRegex);
			const [, pid] = stdout.match(pidRegex);
			const unsafe = (options == null ? void 0 : options.unsafe) === true;
			const hasCert = (options == null ? void 0 : options.certificate) !== void 0;
			const certificate = hasCert ? options.certificate : unsafe ? void 0 : RIOT_GAMES_CERT;
			return {
				port: Number(port),
				pid: Number(pid),
				password,
				certificate
			};
		} catch (err) {
			if (options == null ? void 0 : options.__internalDebug) console.error(err);
			if (executionOptions.shell === "powershell") {
				const { stdout: isAdmin } = await exec(
					`if ((Get-Process -Name ${name} -ErrorAction SilentlyContinue | Where-Object {!$_.Handle -and !$_.Path})) {Write-Output "True"} else {Write-Output "False"}`,
					executionOptions
				);
				if (isAdmin.includes("True")) throw new ClientElevatedPermsError();
			}
			throw new ClientNotFoundError();
		}
	}

	if (!["win32", "linux", "darwin"].includes(process.platform)) {
		throw new InvalidPlatformError();
	}
	if (options == null ? void 0 : options.awaitConnection) {
		return new Promise(function self(resolve, reject) {
			tryAuthenticate()
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					if (err instanceof ClientElevatedPermsError) reject(err);
					setTimeout(self, (options == null ? void 0 : options.pollInterval) ?? DEFAULT_POLL_INTERVAL, resolve, reject);
				});
		});
	} else {
		return tryAuthenticate();
	}
}

var DEFAULT_POLL_INTERVAL2 = 2500;
var LeagueClient = class extends EventEmitter {
	constructor(credentials, options) {
		super();
		this.options = options;
		this.credentials = credentials;
	}

	isListening = false;
	credentials = void 0;

	start() {
		if (!this.isListening) {
			this.isListening = true;
			if (this.credentials === void 0 || !processExists(this.credentials.pid)) {
				throw new ClientNotFoundError();
			}
			this.onTick();
		}
	}

	stop() {
		this.isListening = false;
	}

	async onTick() {
		var _a, _b, _c;
		if (this.isListening) {
			if (this.credentials !== void 0) {
				if (!processExists(this.credentials.pid)) {
					this.emit("disconnect");
					this.credentials = void 0;
					this.onTick();
				} else {
					setTimeout(
						() => {
							this.onTick();
						},
						((_a = this.options) == null ? void 0 : _a.pollInterval) ?? DEFAULT_POLL_INTERVAL2
					);
				}
			} else {
				const credentials = await authenticate({
					awaitConnection: true,
					pollInterval: ((_b = this.options) == null ? void 0 : _b.pollInterval) ?? DEFAULT_POLL_INTERVAL2
				});
				this.credentials = credentials;
				this.emit("connect", credentials);
				setTimeout(
					() => {
						this.onTick();
					},
					((_c = this.options) == null ? void 0 : _c.pollInterval) ?? DEFAULT_POLL_INTERVAL2
				);
			}
		}
	}
};

function processExists(pid) {
	try {
		return process.kill(pid, 0);
	} catch (err) {
		return (err == null ? void 0 : err.code) === "EPERM";
	}
}

// src/trim.ts
function trim(s) {
	let r = s;
	while (r.startsWith("/")) {
		r = r.substring(1);
	}
	return r;
}

// src/http.ts
var Http1Response = class {
	constructor(_message, _raw) {
		this._message = _message;
		this._raw = _raw;
		assert(_message.complete, "Response constructor called with incomplete HttpIncomingMessage");
		const code = _message.statusCode;
		this.ok = code >= 200 && code < 300;
		this.redirected = [301, 302, 303, 307, 308].includes(code);
		this.status = code;
	}

	ok;
	redirected;
	status;

	json() {
		return JSON.parse(this._raw.toString());
	}

	text() {
		return this._raw.toString();
	}

	buffer() {
		return this._raw;
	}

	headers() {
		const headers = [];
		for (const [key, value] of Object.entries(this._message.headers)) {
			if (key.startsWith(":")) {
				continue;
			}
			if (value === void 0) {
				headers.push([key, ""]);
			} else if (Array.isArray(value)) {
				headers.push([key, value.join(", ")]);
			} else {
				headers.push([key, value]);
			}
		}
		return headers;
	}
};

async function createHttp1Request(options, credentials) {
	const agentOptions =
		credentials.certificate === void 0 ? { rejectUnauthorized: false } : { ca: credentials.certificate };
	return new Promise((resolve, reject) => {
		const request = https.request(
			{
				host: "127.0.0.1",
				port: credentials.port,
				path: "/" + trim(options.url),
				method: options.method,
				headers: {
					Accept: "*/*",
					"Content-Type": "application/json",
					Authorization: "Basic " + Buffer.from(`riot:${credentials.password}`).toString("base64")
				},
				agent: new https.Agent(agentOptions)
			},
			(response) => {
				let buffer = [];
				response.on("data", (data) => void buffer.push(data));
				response.on("end", () => {
					try {
						resolve(new Http1Response(response, Buffer.concat(buffer)));
					} catch (jsonError) {
						reject(jsonError);
					}
				});
			}
		);
		if (options.body !== void 0) {
			const data = JSON.stringify(options.body);
			const body = new TextEncoder().encode(data);
			request.write(body, "utf8");
		}
		request.on("error", (err) => reject(err));
		request.end();
	});
}

async function createHttpSession(credentials) {
	const certificate = credentials.certificate ?? RIOT_GAMES_CERT;
	return http2.connect(`https://127.0.0.1:${credentials.port}`, {
		ca: certificate
	});
}

var Http2Response = class {
	constructor(_headers, _stream, _raw) {
		this._headers = _headers;
		this._stream = _stream;
		this._raw = _raw;
		assert2(_stream.closed, "Response constructor called with unclosed ClientHttp2Stream");
		const code = _headers[":status"];
		this.ok = code >= 200 && code < 300;
		this.redirected = [301, 302, 303, 307, 308].includes(code);
		this.status = code;
	}

	ok;
	redirected;
	status;

	json() {
		return JSON.parse(this._raw.toString());
	}

	text() {
		return this._raw.toString();
	}

	buffer() {
		return this._raw;
	}

	headers() {
		const headers = [];
		for (const [key, value] of Object.entries(this._headers)) {
			if (key.startsWith(":")) {
				continue;
			}
			if (value === void 0) {
				headers.push([key, ""]);
			} else if (Array.isArray(value)) {
				headers.push([key, value.join(", ")]);
			} else {
				headers.push([key, value]);
			}
		}
		return headers;
	}
};

async function createHttp2Request(options, session, credentials) {
	assert2(!session.closed, "createHttp2Request called on closed session");
	const request = session.request({
		":path": "/" + trim(options.url),
		":method": options.method,
		Accept: "*/*",
		"Content-Type": "application/json",
		Authorization: "Basic " + Buffer.from(`riot:${credentials.password}`).toString("base64")
	});
	if (options.body) {
		const data = JSON.stringify(options.body);
		const body = new TextEncoder2().encode(data);
		request.write(body, "utf8");
	}
	return new Promise((resolve, reject) => {
		let stream = [];
		let headers;
		request.on("response", (response) => {
			headers = response;
		});
		request.on("data", (data) => {
			stream.push(data);
		});
		request.on("error", (err) => reject(err));
		request.on("end", () => {
			try {
				request.close();
				resolve(new Http2Response(headers, request, Buffer.concat(stream)));
			} catch (jsonError) {
				reject(jsonError);
			}
		});
	});
}

const { WebSocket } = require("ws");

/**
 * WebSocket extension
 */
class LeagueWebSocket extends WebSocket {
	subscriptions = new Map();

	constructor(address, options) {
		super(address, options);

		// Subscribe to Json API
		this.on("open", () => {
			this.send(JSON.stringify([5, "OnJsonApiEvent"]));
		});

		// Attach the LeagueWebSocket subscription hook
		this.on("message", (content) => {
			// Attempt to parse into JSON and dispatch events
			try {
				const json = JSON.parse(content);
				const [res] = json.slice(2);

				if (this.subscriptions.has(res.uri)) {
					this.subscriptions.get(res.uri)?.forEach((cb) => {
						cb(res.data, res);
					});
				}
			} catch {}
		});
	}

	subscribe(path, effect) {
		var _a;
		const p = `/${trim(path)}`;
		if (!this.subscriptions.has(p)) {
			this.subscriptions.set(p, [effect]);
		} else {
			(_a = this.subscriptions.get(p)) == null ? void 0 : _a.push(effect);
		}
	}

	unsubscribe(path) {
		const p = `/${trim(path)}`;
		this.subscriptions.delete(p);
	}
}

async function createWebSocketConnection(credentials) {
	const url = `wss://riot:${credentials.password}@127.0.0.1:${credentials.port}`;
	return await new Promise((resolve, reject) => {
		const ws = new LeagueWebSocket(url, {
			headers: {
				Authorization: "Basic " + Buffer.from(`riot:${credentials.password}`).toString("base64")
			},
			agent: new https.Agent(
				typeof credentials?.certificate === "undefined"
					? {
							rejectUnauthorized: false
					  }
					: {
							ca: credentials?.certificate
					  }
			)
		});
		const errorHandler = (ws.onerror = (err) => {
			ws.close();
			if (err.message.includes("ECONNREFUSED")) {
				reject(new Error("Could not connect to LCU WebSocket API"));
			} else {
				reject(err);
			}
		});
		ws.onopen = () => {
			ws.removeListener("error", errorHandler);
			resolve(ws);
		};
	});
}

export {
	ClientNotFoundError,
	Http1Response,
	Http2Response,
	InvalidPlatformError,
	LeagueClient,
	LeagueWebSocket,
	authenticate,
	createHttp1Request,
	createHttp2Request,
	createHttpSession,
	createWebSocketConnection
};
