import http, { IncomingMessage } from "http";
import { Duplex, Writable } from "stream";
import tldjs from "tldjs";
import { v4 as uuid } from "uuid";
import * as socketIO from "socket.io";
import ss from "socket.io-stream";

/** Wrapper for IncomingMessage with additional properties */
interface CustomSocket extends NodeJS.Socket {
	subdomain: string;
	tunnelClientStream: Duplex;
}

interface CustomSocketIO extends socketIO.Socket {
	requestedName: string;
}

interface OPTIONS {
	hostname: string;
	port: number;
}
// Storing Active Connected Sockets
let ACTIVE_SOCKETS: Record<string, CustomSocketIO> = {};

// Starting function
const COLD_START = function (options: OPTIONS) {
	const server = http.createServer(async (req: IncomingMessage, res: http.ServerResponse) => {
		try {
			const tunnelStream = await getClientSocketStream(req);
			const reqBodyChunk: any = [];
			req.on("error", (err) => {
				console.log(err.stack);
			});
			req.on("data", (chunk) => {
				reqBodyChunk.push(chunk);
			});
			req.on("end", () => {
				if (req.complete) {
					const reqLine = getReqLineFromReq(req);
					const headers = getHeadersFromReq(req);

					let reqBody = null;
					if (reqBodyChunk.length > 0) {
						reqBody = Buffer.concat(reqBodyChunk);
					}

					streamResponse(reqLine, headers, reqBody, tunnelStream);
				}
			});
		} catch (error: any) {
			console.log(error);
			res.statusCode = 502;
			res.end(error.message);
		}
	});

	const io = new socketIO.Server(server);

	const getClientSocketStream = async function (req: IncomingMessage): Promise<CustomSocket["tunnelClientStream"]> {
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
				return reject(new Error("tunnel client is not registered or offline at this moment"));
			}
			const socket = req.socket as unknown as CustomSocket;

			if (socket.tunnelClientStream !== undefined && !socket.tunnelClientStream.destroyed && socket.subdomain === subdomain) {
				return resolve(socket.tunnelClientStream);
			}

			let requestId = uuid();

			ss(tunnelSocket).once(requestId, (tunnelClientStream: any) => {
				socket.subdomain = subdomain;
				socket.tunnelClientStream = tunnelClientStream;
				tunnelClientStream.pipe(socket);
				resolve(tunnelClientStream);
			});

			tunnelSocket.emit("incomingClient", requestId);
		});
	};

	io.on("connection", (tunnelSocket) => {
		const socket = tunnelSocket as CustomSocketIO;
		socket.on("createTunnel", (requestedName, resCallback) => {
			if (socket.requestedName) {
				return;
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

	function getReqLineFromReq(req: IncomingMessage) {
		return `${req.method} ${req.url} HTTP/${req.httpVersion}`;
	}

	function getHeadersFromReq(req: IncomingMessage) {
		const headers = [];

		for (let i = 0; i < req.rawHeaders.length - 1; i += 2) {
			headers.push(req.rawHeaders[i] + ": " + req.rawHeaders[i + 1]);
		}

		return headers;
	}

	function streamResponse(reqLine: string, headers: any, reqBody: any, tunnelClientStream: Writable) {
		tunnelClientStream.write(reqLine);
		tunnelClientStream.write("\r\n");
		tunnelClientStream.write(headers.join("\r\n"));
		tunnelClientStream.write("\r\n\r\n");
		if (reqBody) {
			tunnelClientStream.write(reqBody);
		}
	}

	server.listen(options.port, options.hostname);

	console.log("server is listening on port " + options.port);
};

COLD_START({ hostname: "pranavs.tech", port: 80 });

export default COLD_START;
