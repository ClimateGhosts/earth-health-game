import { Socket } from "socket.io-client";

export type ServerToClientEvents = {
  [K in keyof ClientEvents]: (event: ClientEvents[K]) => void;
};

export type ClientToServerEvents = {
  [K in keyof ServerEvents]: (event: ServerEvents[K]) => void;
};

export type SoluzionSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
