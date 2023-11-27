import http, { IncomingMessage } from "http";
import { Readable } from "stream";
import tldjs from "tldjs";
import { v4 as uuid } from "uuid";
import * as socketIO from "socket.io";

/** Wrapper for IncomingMessage with additional properties */
interface CustomSocket extends NodeJS.Socket {
	subdomain: string;
	tunnelClientStream: Readable;
}

interface CustomSocketIO extends socketIO.Socket {
	requestedName: string;
}

interface OPTIONS {
	hostname: string;
	port: number;
	server: string;
}
// Storing Active Connected Sockets
let ACTIVE_SOCKETS: Record<string, CustomSocketIO> = {};
// Starting function
const COLD_START = function (options: OPTIONS) {

	const server = http.createServer((req: IncomingMessage, res: http.ServerResponse) => {});

	const io = new socketIO.Server(server);

	const getClientSocketStream = async function (req: IncomingMessage):Promise<CustomSocket['tunnelClientStream']> {
		return new Promise((resolve, reject) => {
			const hostname = req.headers.host;
			if (!hostname) {
				return reject(new Error("no hostname"));
			}
			const subdomain = tldjs.getSubdomain(hostname)!.toLowerCase();
			if (!subdomain) {
				return reject(new Error("no subdomain"));
			}
			let tunnelSocket = ACTIVE_SOCKETS[subdomain];
			if (!tunnelSocket) {
				return reject("tunnel client is not registered or offline at this moment");
			}
			const socket = req.socket as unknown as CustomSocket;

			if (socket.tunnelClientStream !== undefined && socket.tunnelClientStream.destroyed && socket.subdomain === subdomain) {
				return resolve(socket.tunnelClientStream);
			}

			let requestId = uuid();

			tunnelSocket.once(requestId, (tunnelClientStream) => {
				socket.subdomain = subdomain;
				socket.tunnelClientStream = tunnelClientStream;
				tunnelClientStream.pipe(socket);
				 return resolve(tunnelClientStream);
			});

			tunnelSocket.emit("incomingClient", requestId);
		});
	};

	io.on("connection", (tunnelSocket) => {
		const socket = tunnelSocket as CustomSocketIO;
		socket.on("createTunnel", (requestedName, resCallback) => {
			if (socket.requestedName) {
			}
			if (ACTIVE_SOCKETS[requestedName]) {
				resCallback("subDomain is not Available");
				return socket.disconnect();
			}
			ACTIVE_SOCKETS[requestedName] = socket;
			socket.requestedName = requestedName;
			if (resCallback) {
				resCallback(null);
			}
		});

		socket.on("disconnect", () => {
			if (socket.requestedName) {
				delete ACTIVE_SOCKETS[socket.requestedName];
			}
		});
	});

	server.listen(options.port, options.hostname);
};
