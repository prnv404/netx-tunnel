#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import client from "../client.js";
import * as cli from "../cli.js";

const argv = await yargs(hideBin(process.argv))
	.option("server", {
		describe: "Tunnel server url to connect",
		demandOption: true,
		type: "string",
		default: "http://pranavs.tech"
	})
	.option("subdomain", {
		alias: "sub",
		describe: "subdomain you want to give ",
		demandOption: true,
		type: "string"
	})
	.option("hostname", {
		describe: "local hostname",
		demandOption: true,
		type: "string",
		default: "127.0.0.1"
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
	port: argv.port,
	subdomain: argv.subdomain,
	hostname: argv.hostname
};

client(options).then((url) => {
	cli.printIntro("NET  X  TUNNEL");
	const spinner = cli.runSpinner("connecting to tunnel server");
	spinner.start();
	setTimeout(() => {
		spinner.stop();
		console.log(url);
	}, 3000);
});
