import { SocketIOCommon } from "../components/socketio-common";
import Game from "../components/game";

export default () => {
  return (
    <>
      <h1 className={"text-center m-2"}>Collaborative Climate Conquest</h1>
      <SocketIOCommon>
        <Game />
      </SocketIOCommon>
    </>
  );
};
