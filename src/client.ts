import io from "socket.io-client";
import net from "net";

interface OPTIONS {
	server: string;
	port: number;
	hostname: string;
	subdomain: string;
}

function start(options: OPTIONS) {
	return new Promise((resolve, reject) => {
		const socket = io(options.server);

		socket.on("connect", () => {
			console.log(new Date() + ": connected");
			console.log(new Date() + ": requesting subdomain " + options["subdomain"] + " via " + options["server"]);

			socket.emit("createTunnel", options["subdomain"], () => {
				let url;
				let subdomain = options["subdomain"].toString();
				let server = options["server"].toString();

				if (server.includes("https://")) {
					url = `https://${subdomain}.${server.slice(8)}`;
				} else if (server.includes("http://")) {
					url = `http://${subdomain}.${server.slice(7)}`;
				} else {
					url = `https://${subdomain}.${server}`;
				}
				resolve(url);
			});

			socket.on("incomingClient", (requestId) => {
				let client = net.createConnection(options.port, options.hostname, () => {
					client.on("end", () => {
						client.destroy();
					});
					socket.emit(requestId, client);
				});
			});
		});
	});
}

start({ hostname: "127.0.0.1", port: 3000, server: "http://pranavs.tech", subdomain: "hello" })
	.then((url) => {
		console.log(url);
	})
	.catch((err) => {
		console.log(err);
	});
