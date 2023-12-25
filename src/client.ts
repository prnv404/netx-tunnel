import io from "socket.io-client";
import net from "net";
import ss from "socket.io-stream";
import * as cli from "./cli.js";
import { ClientOptions } from "./types/index.js";

function initiliazeClient(options: ClientOptions): Promise<string> {
	return new Promise((resolve, reject) => {
		const socket = io(options.server);

		socket.on("connect", () => {
			socket.emit("createTunnel", options["subdomain"], () => {
				let url;
				let subdomain = options["subdomain"].toString();
				let server = options["server"].toString();
				url = `https://${subdomain}.${server.slice(7)}`;
				resolve(url);
			});

			socket.on("incomingClient", (requestId) => {
				cli.printRequest(requestId);
				let client = net.createConnection(options["port"], options["hostname"], () => {
					let s = ss.createStream({});
					s.pipe(client).pipe(s);
					s.on("end", () => {
						client.destroy();
					});
					ss(socket).emit(requestId, s);
				});
			});
		});
	});
}

export default initiliazeClient;
