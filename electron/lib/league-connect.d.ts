import { EventEmitter } from 'events';
import { IncomingMessage } from 'http';
import http2, { IncomingHttpHeaders, IncomingHttpStatusHeader } from 'http2';
import WebSocket, { ClientOptions } from 'ws';
import { Response } from 'node-fetch';

interface Credentials {
    /**
     * The system port the LCU API is running on
     */
    port: number;
    /**
     * The password for the LCU API
     */
    password: string;
    /**
     * The system process id for the LeagueClientUx process
     */
    pid: number;
    /**
     * Riot Games' self-signed root certificate (contents of .pem). If
     * it is `undefined` then unsafe authentication will be used.
     */
    certificate?: string;
}
interface AuthenticationOptions {
    /**
     * League Client process name. Set to RiotClientUx if you would like to
     * authenticate with the Riot Client
     *
     * Defaults: LeagueClientUx
     */
    name?: string;
    /**
     * Does not return before the League Client has been detected. This means the
     * function stays unresolved until a League has been found.
     *
     * Defaults: false
     */
    awaitConnection?: boolean;
    /**
     * The time duration in milliseconds between each attempt to locate a League
     * Client process. Has no effect if awaitConnection is false
     *
     * Default: 2500
     */
    pollInterval?: number;
    /**
     * Riot Games' self-signed root certificate (contents of .pem)
     *
     * Default: version of certificate bundled in package
     */
    certificate?: string;
    /**
     * Do not authenticate requests with Riot Games' self-signed root certificate
     *
     * Default: true if `certificate` is `undefined`
     */
    unsafe?: boolean;
    /**
     * Use deprecated Windows WMIC command line over Get-CimInstance. Does nothing
     * if the system is not running on Windows. This is used to keep backwards
     * compatability with Windows 7 systems that don't have Get-CimInstance
     *
     * See https://github.com/matsjla/league-connect/pull/54
     * See https://github.com/matsjla/league-connect/pull/68
     *
     * Default: false
     */
    useDeprecatedWmic?: boolean;
    /**
     * Set the Windows shell to use.
     *
     * Default: 'powershell'
     */
    windowsShell?: 'cmd' | 'powershell';
}
/**
 * Indicates that the application does not run on an environment that the
 * League Client supports. The Client runs on windows, linux or darwin.
 */
declare class InvalidPlatformError extends Error {
    constructor();
}
/**
 * Indicates that the League Client could not be found
 */
declare class ClientNotFoundError extends Error {
    constructor();
}
/**
 * Locates a League Client and retrieves the credentials for the LCU API
 * from the found process
 *
 * If options.awaitConnection is false the promise will resolve into a
 * rejection if a League Client is not running
 *
 * @param {AuthenticationOptions} [options] Authentication options, if any
 *
 * @throws InvalidPlatformError If the environment is not running
 * windows/linux/darwin
 * @throws ClientNotFoundError If the League Client could not be found
 * @throws ClientElevatedPermsError If the League Client is running as administrator and the script is not (Windows only)
 */
declare function authenticate(options?: AuthenticationOptions): Promise<Credentials>;

interface LeagueClientOptions {
    /**
     * The time duration in milliseconds between each check for a client
     * disconnect
     *
     * Default: 2500
     */
    pollInterval: number;
}
declare interface LeagueClient {
    on(event: 'connect', callback: (credentials: Credentials) => void): this;
    on(event: 'disconnect', callback: () => void): this;
}
declare class LeagueClient extends EventEmitter {
    options?: LeagueClientOptions | undefined;
    private isListening;
    credentials?: Credentials;
    constructor(credentials: Credentials, options?: LeagueClientOptions | undefined);
    /**
     * Start listening for League Client processes
     */
    start(): void;
    /**
     * Stop listening for client stop/start
     */
    stop(): void;
    private onTick;
}

declare type HeaderPair = [string, string];
declare type JsonObjectLike = Record<string, unknown>;
interface HttpResponse {
    readonly ok: boolean;
    /** Was the request redirected at some point? */
    readonly redirected: boolean;
    /** Http status code */
    readonly status: number;
    /** Get the raw text response. */
    text(): string;
    /** Attempt to parse the text response into json. Will throw if invalid json */
    json<T>(): string;
    /** Http response headers */
    headers(): HeaderPair[];
}
interface HttpRequestOptions<T = JsonObjectLike> {
    /**
     * Relative URL (relative to LCU API base url) to send api request to
     */
    url: string;
    /**
     * Http verb to use for request
     */
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /**
     * Optionally a body to pass to PUT/PATCH/POST/DELETE. This is typically
     * an object type as the library will parse this into JSON and send along
     * with the request
     */
    body?: T;
}

declare class Http1Response implements HttpResponse {
    private _message;
    private _raw;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    constructor(_message: IncomingMessage, _raw: Buffer);
    json<T = JsonObjectLike>(): T;
    text(): string;
    buffer(): Buffer;
    headers(): HeaderPair[];
}
declare function createHttp1Request<T>(options: HttpRequestOptions<T>, credentials: Credentials): Promise<Http1Response>;

/**
 * Create a HTTP/2.0 client session.
 *
 * This invocation requires the credentials to have
 */
declare function createHttpSession(credentials: Credentials): Promise<http2.ClientHttp2Session>;
declare class Http2Response implements HttpResponse {
    private _headers;
    private _stream;
    private _raw;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    constructor(_headers: IncomingHttpHeaders & IncomingHttpStatusHeader, _stream: http2.ClientHttp2Stream, _raw: Buffer);
    json<T = JsonObjectLike>(): T;
    text(): string;
    buffer(): Buffer;
    headers(): HeaderPair[];
}
declare function createHttp2Request<T>(options: HttpRequestOptions<T>, session: http2.ClientHttp2Session, credentials: Credentials): Promise<Http2Response>;

interface EventResponse<T = any> {
    /**
     * The uri this event was dispatched at
     */
    uri: string;
    /**
     * The data, if any
     */
    data: T;
}
/**
 * Callback function for an subscription listener
 *
 * @param data The data payload (deserialized json)
 */
declare type EventCallback<T = any> = (data: T | null, event: EventResponse<T>) => void;
/**
 * WebSocket extension
 */
declare class LeagueWebSocket extends WebSocket {
    subscriptions: Map<string, EventCallback[]>;
    constructor(address: string, options: ClientOptions);
    subscribe<T extends any = any>(path: string, effect: EventCallback<T>): void;
    unsubscribe(path: string): void;
}
interface ConnectionOptions {
    /**
     * Options that will be used to authenticate to the LCU WebSocket API
     */
    authenticationOptions?: AuthenticationOptions;
    /**
     * Polling interval in case connection fails.
     *
     * Default: 1000
     */
    pollInterval?: number;
    /**
     * Maximum number of retries to connect to the LCU WebSocket API.
     * If set to -1, it will retry indefinitely.
     * If set to 0, it will not retry.
     * Default: 10
     */
    maxRetries?: number;
}
/**
 * Creates a WebSocket connection to the League Client
 * @param {ConnectionOptions} [options] Options that will be used to authenticate to the League Client
 *
 * @throws Error If the connection fails due to ECONNREFUSED
 * @throws WebSocket.ErrorEvent If the connection fails for any other reason
 */
declare function createWebSocketConnection(options?: ConnectionOptions): Promise<LeagueWebSocket>;

interface DEPRECATED_RequestOptions<T = any> {
    /**
     * Relative URL (relative to LCU API base url) to send api request to
     */
    url: string;
    /**
     * Http verb to use for request
     */
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /**
     * Optionally a body to pass to PUT/PATCH/POST/DELETE. This is typically
     * an object type as the library will parse this into JSON and send along
     * with the request
     */
    body?: T;
}
/**
 * Wrapper around Node-fetch Response which will deserialize JSON into the
 * proper type
 */
declare class DEPRECATED_Response<T> extends Response {
    constructor(parent: Response);
    /**
     * Deserialize the response body into T
     */
    json(): Promise<T>;
}
declare function DEPRECATED_request<T = any, R = any>(options: DEPRECATED_RequestOptions<T>, credentials?: Credentials): Promise<DEPRECATED_Response<R>>;

declare function DEPRECATED_connect(credentials: Credentials): Promise<LeagueWebSocket>;

export { AuthenticationOptions, ClientNotFoundError, ConnectionOptions, Credentials, DEPRECATED_RequestOptions, DEPRECATED_Response, DEPRECATED_connect, DEPRECATED_request, EventCallback, EventResponse, HeaderPair, Http1Response, Http2Response, HttpRequestOptions, HttpResponse, InvalidPlatformError, JsonObjectLike, LeagueClient, LeagueClientOptions, LeagueWebSocket, authenticate, createHttp1Request, createHttp2Request, createHttpSession, createWebSocketConnection };
