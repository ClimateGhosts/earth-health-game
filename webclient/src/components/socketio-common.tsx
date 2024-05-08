import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Row,
} from "react-bootstrap";
import { io } from "socket.io-client";
import { SoluzionSocket } from "../types/socketio";
import { useLocalStorage, useSet } from "react-use";
import { orderBy } from "lodash";

type SocketContext = {
  socket?: SoluzionSocket;
  url: string;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContext>({
  url: process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL as string,
  isConnected: false,
});

const createSocket = (url: string) => io(url) as SoluzionSocket;

export const SocketIOCommon = ({ children }: PropsWithChildren) => {
  const [serverUrl, setServerUrl] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL as string,
  );
  const [socket, setSocket] = useState(() =>
    typeof window === "undefined"
      ? (undefined as unknown as SoluzionSocket)
      : createSocket(serverUrl),
  );
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [username, setUsername] = useLocalStorage("username", "Client");
  const [roles, role] = useSet(new Set([0, 1, 2, 3]));
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setConnectionStatus(true);
      console.log("Client Connected");
    });
    socket.on("disconnect", () => {
      setConnectionStatus(false);
      console.log("Client Disconnected");
    });

    socket.onAny((event, args) => {
      console.log(event, args);
    });

    socket.on("game_started", () => {
      setGameStarted(true);
    });

    return () => {
      socket.disconnect();
      socket.close();
    };
  }, [socket]);

  const handleConnect = () => {};

  // TODO remake socket for URL change

  return (
    <>
      {gameStarted || (
        <Container>
          <Row className="align-items-center m-2">
            <Col md={4}>
              <Form.Label>Server URL</Form.Label>
              <div className={"position-relative"}>
                <Form.Control
                  type="text"
                  placeholder="Enter server URL"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                />
                <div></div>
              </div>
            </Col>
            <Col md={2}>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Col>
            <Col md={1}>
              <Form.Label>Roles</Form.Label>
              <Dropdown>
                <DropdownToggle>
                  {orderBy([...roles], (r) => r).join(" ")}
                </DropdownToggle>
                <DropdownMenu className={"py-0"}>
                  {[0, 1, 2, 3].map((i) => (
                    <DropdownItem
                      active={role.has(i)}
                      key={i}
                      className={"my-2 rounded-2"}
                      onClick={() =>
                        role.has(i) ? role.remove(i) : role.add(i)
                      }
                    >
                      Player {i}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>
            <Col md={5}>
              <Form.Label>Actions</Form.Label>
              <Row>
                <Col>
                  <Button
                    className="w-100"
                    variant="primary"
                    onClick={() => socket.emit("create_room", { room: "room" })}
                  >
                    Create Room
                  </Button>
                </Col>
                <Col>
                  <Button
                    className="w-100"
                    variant="primary"
                    onClick={() => {
                      socket.emit("join_room", {
                        room: "room",
                        username: username || null,
                      });
                      socket.emit("set_roles", { roles: [...roles] });
                    }}
                  >
                    Join Room
                  </Button>
                </Col>
                <Col>
                  <Button
                    className="w-100"
                    variant="success"
                    onClick={() => socket.emit("start_game", {})}
                  >
                    Start Game
                  </Button>
                </Col>
              </Row>
            </Col>
            {/*<Col md={2}>
            <Alert variant={connectionStatus ? "success" : "danger"}>
              {connectionStatus ? "Connected!" : "Not Connected"}
            </Alert>
          </Col>*/}
          </Row>
        </Container>
      )}
      <SocketContext.Provider
        value={{ socket, url: serverUrl, isConnected: connectionStatus }}
      >
        {children}
      </SocketContext.Provider>
    </>
  );
};
