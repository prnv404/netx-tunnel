import { Duplex } from "stream";
import * as socketio from "socket.io";

export type ClientOptions = {
	server: string;
	port: number;
	hostname: string;
	subdomain: string;
};

export interface CustomSocket extends NodeJS.Socket {
	subdomain: string;
	tunnelClientStream: Duplex;
}

export interface CustomSocketIO extends socketio.Socket {
	requestedName: string;
}

export type ServerOptions = {
	hostname?: string;
	port: number;
};
