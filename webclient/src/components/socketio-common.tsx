import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { io } from "socket.io-client";
import { SoluzionSocket } from "../types/socketio";
import { useDebounce, useList, useSessionStorage, useSet } from "react-use";
import Indicator from "./indicator";

type SocketContext = {
  socket?: SoluzionSocket;
  serverUrl: string;
  isConnected: boolean | null;
  currentRoom?: Room;
  roleInfo?: Role[];
};

export const SocketContext = createContext<SocketContext>({
  serverUrl: process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL as string,
  isConnected: false,
});

const createSocket = (url: string) => {
  const socket = io(url) as SoluzionSocket;
  socket.url = url;
  return socket;
};

export const SocketIOCommon = ({
  children,
  title,
}: PropsWithChildren<{ title: string }>) => {
  const [serverUrl, setServerUrl] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL as string,
  );
  const [socket, setSocket] = useState(() =>
    typeof window === "undefined"
      ? (undefined as unknown as SoluzionSocket)
      : createSocket(serverUrl),
  );
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [username, setUsername] = useSessionStorage("username", "Client");
  const [roleInfo, setRoleInfo] = useState([] as Role[]);
  const [roles, roleSet] = useSet(new Set<number>([]));
  const [gameStarted, setGameStarted] = useState(false);
  const [sid, setSid] = useState("");

  const randomRoomId = () =>
    Math.round(new Date().getMilliseconds()).toString();
  const [roomId, setRoomId] = useState(randomRoomId());

  const [rooms, roomList] = useList([] as Room[]);

  const currentRoom = rooms.find((room) =>
    room.players.some((player) => player.sid === sid),
  );
  const isInRoom = !!currentRoom;

  useEffect(() => {
    setTimeout(() => {
      if (!socket.connected) {
        setIsConnected(false);
      }
    }, 2000);

    roomList.clear();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Client Connected");

      socket.emit("list_roles", {}, ({ roles }) => {
        setRoleInfo(roles);
      });
      socket.emit("list_rooms", {}, ({ rooms }) => {
        roomList.set(rooms);
      });
      socket.emit("info", {}, (info) => {
        console.log(info);
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      roomList.clear();
      console.log("Client Disconnected");
    });

    socket.on("your_sid", ({ sid }) => {
      setSid(sid);
    });

    socket.onAny((event, args) => {
      console.log(event, args);
    });

    socket.on("game_started", () => {
      setGameStarted(true);
    });

    socket.on("room_changed", (room) => {
      roomList.update((r) => r.room == room.room, room);
    });

    socket.on("room_created", ({ room, owner_sid }) => {
      roomList.push({ room, owner: owner_sid, in_game: false, players: [] });
    });

    socket.on("room_deleted", ({ room }) => {
      roomList.filter((r, i, rooms) => r.room != room);
    });

    return () => {
      socket.disconnect();
      socket.close();
    };
  }, [socket]);

  useDebounce(
    () => {
      if (serverUrl === socket.url) return;

      if (socket.connected) {
        socket.disconnect();
      }
      socket.close();
      setIsConnected(null);

      setSocket(createSocket(serverUrl));
    },
    1000,
    [serverUrl],
  );

  useDebounce(
    () => {
      if (socket?.connected) {
        socket.emit("set_roles", { roles: [...roles] });
      }
    },
    500,
    [roles],
  );

  useDebounce(
    () => {
      if (username && socket?.connected) {
        socket.emit("set_name", { name: username });
      }
    },
    500,
    [username],
  );

  const [errorTitle, setErrorTitle] = useState("");
  const [errorText, setErrorText] = useState("");

  return (
    <>
      {gameStarted || (
        <Container>
          {title && <h1 className={"text-center m-2"}>{title}</h1>}
          <Row className={"align-items-center m-2 g-3 justify-content-center"}>
            <Col md={4}>
              <Form.Label>Server URL</Form.Label>
              <div className={"position-relative"}>
                <Form.Control
                  type="text"
                  placeholder="Enter server URL"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                />
                <div
                  className={"end-0 position-absolute absolute-centered-y me-2"}
                >
                  <Indicator
                    status={socket?.url === serverUrl ? isConnected : null}
                  />
                </div>
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
          </Row>
          <h3 className={"text-center my-3"}>Rooms</h3>
          <Row className={"g-3 justify-content-center"}>
            {rooms.map((room) => {
              const currentRoom = room.players.some(
                (player) => player.sid === sid,
              );
              const owner = room.owner === sid;
              return (
                <Col md={4} key={room.room}>
                  <Card
                    className={
                      "text-center p-3 d-flex flex-column h-100 shadow-sm justify-content-between"
                    }
                  >
                    <h5>{room.room}</h5>
                    {room.players.map((player) => (
                      <div
                        key={player.name}
                        className={
                          "d-flex justify-content-center align-items-center my-2"
                        }
                      >
                        {player.name}
                        {player.sid === sid ? (
                          <Dropdown autoClose={"outside"} className={"ms-2"}>
                            <DropdownToggle size={"sm"} className={"text-wrap"}>
                              {[...roles]
                                .sort()
                                .map((r) => roleInfo[r].name)
                                .join(", ") || "No Roles"}
                            </DropdownToggle>
                            <DropdownMenu className={"py-0"}>
                              {roleInfo.map((role, i) => (
                                <DropdownItem
                                  active={roleSet.has(i)}
                                  key={i}
                                  className={"my-2 rounded-2"}
                                  onClick={() =>
                                    roleSet.has(i)
                                      ? roleSet.remove(i)
                                      : roleSet.add(i)
                                  }
                                >
                                  {role.name} (min {role.min}, max {role.max})
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>
                        ) : (
                          <>
                            {" "}
                            (
                            {player.roles
                              .sort()
                              .map((r) => roleInfo[r].name)
                              .join(", ") || "No Roles"}
                            )
                          </>
                        )}
                      </div>
                    ))}
                    {!currentRoom && (
                      <Button
                        size={"sm"}
                        className="w-50 mt-3 mx-auto"
                        variant={"primary"}
                        onClick={() => {
                          socket.emit("join_room", {
                            room: room.room,
                            username: username || null,
                          });
                          socket.emit("set_roles", { roles: [...roles] });
                        }}
                        disabled={room.in_game}
                      >
                        {room.in_game ? "In Game" : "Join"}
                      </Button>
                    )}
                    {currentRoom && (
                      <Button
                        size={"sm"}
                        className="w-50 mt-3 mx-auto"
                        variant={"danger"}
                        onClick={() => socket.emit("leave_room", {})}
                      >
                        Leave
                      </Button>
                    )}
                    {owner && currentRoom && (
                      <Button
                        size={"sm"}
                        className="w-50 mt-3 mx-auto"
                        variant="success"
                        onClick={() =>
                          socket.emit("start_game", {}, ({ error } = {}) => {
                            if (error) {
                              setErrorTitle(error.type);
                              setErrorText(error.message || "");
                            }
                          })
                        }
                      >
                        Start Game
                      </Button>
                    )}
                    {room.players.length === 0 && (
                      <Button
                        size={"sm"}
                        className="w-50 mt-3 mx-auto"
                        variant="danger"
                        onClick={() =>
                          socket.emit("delete_room", { room: room.room })
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </Card>
                </Col>
              );
            })}
            {!isInRoom && (
              <Col md={4} className={"text-center"}>
                <div
                  className={
                    "text-center p-3 d-flex flex-column h-100 justify-content-between"
                  }
                >
                  <Form.Label>Room ID</Form.Label>
                  <Form.Control
                    className={"w-25 mx-auto mb-3 text-center"}
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <Button
                    className="w-50 mx-auto"
                    size={"sm"}
                    variant="primary"
                    onClick={() => {
                      socket.emit("create_room", { room: roomId });
                      socket.emit("join_room", {
                        room: roomId,
                        username: username || "Client",
                      });
                      setRoomId(randomRoomId());
                    }}
                    disabled={isConnected !== true || isInRoom}
                  >
                    Create
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      )}
      <SocketContext.Provider
        value={{ socket, serverUrl, isConnected, roleInfo, currentRoom }}
      >
        {children}
      </SocketContext.Provider>
      <Modal show={!!errorText} onHide={() => setErrorText("")}>
        <Modal.Header closeButton>
          <Modal.Title>{errorTitle || "Error"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{errorText}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};
