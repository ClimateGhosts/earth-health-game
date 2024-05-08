import { Socket } from "socket.io-client";

export type SoluzionSocket = Socket<
  SocketTypes<ServerToClientEvents>,
  SocketTypes<ClientToServerEvents, ClientToServerResponse>
> & {
  url: string;
};
