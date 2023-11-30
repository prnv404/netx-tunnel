import io from "socket.io-client";
import net from "net";
import ss from "socket.io-stream";
import * as cli from "./cli.js";
interface OPTIONS {
	server: string;
	port: number;
	hostname: string;
	subdomain: string;
}

function initiliazeClient(options: OPTIONS) {
	return new Promise((resolve, reject) => {
		// connecting to socket.io server
		const socket = io(options.server);

		socket.on("connect", () => {
			// emiting createTunnel event to create tunnel connection with subdomain
			socket.emit("createTunnel", options["subdomain"], () => {
				let url;
				let subdomain = options["subdomain"].toString();
				let server = options["server"].toString();
				url = `https://${subdomain}.${server.slice(7)}`;
				resolve(url);
			});
			// registering incomingClient event for proxying request to locally running application
			socket.on("incomingClient", (requestId) => {
				// creating a tcp connection
				cli.printRequest(requestId);
				let client = net.createConnection(options["port"], options["hostname"], () => {
					// creating socket stream
					let s = ss.createStream({});
					// pipeing stream with tcp client
					s.pipe(client).pipe(s);
					s.on("end", () => {
						client.destroy();
					});
					// sending the request socket stream
					ss(socket).emit(requestId, s);
				});
			});
		});
	});
}

export default initiliazeClient;
