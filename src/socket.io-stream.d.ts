// socket.io-stream.d.ts

declare module "socket.io-stream" {
	import * as stream from "stream";

	// Define your types here based on the library's functionality
	// Add type definitions for the specific functionality
	// For example:
	export function createStream(options: any): stream.Duplex;

	export const socketIOStream: SocketIOStream;
	function lookup(sio: Socket, options?: { forceBase64?: boolean }): Socket;
	export = lookup;
}
