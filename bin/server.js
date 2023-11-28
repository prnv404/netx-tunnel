#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import server from "../build/server.js";

const main = async () => {
	const argv = await yargs(hideBin(process.argv))
		.option("server", {
			alias: "s",
			describe: "Tunnel server url to connect",
			demandOption: true,
			type: "string",
			default: "http://pranavs.tech"
		})
		.option("port", {
			alias: "p",
			describe: "Specify the port",
			demandOption: true,
			type: "number"
		})
		.parse();

	const options = {
		server: argv.server,
		port: argv.port
	};

	server(options);
};
main();
