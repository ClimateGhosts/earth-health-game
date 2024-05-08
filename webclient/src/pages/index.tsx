import { SocketIOCommon } from "../components/socketio-common";
import Game from "../components/game";

export default () => {
  return (
    <>
      <SocketIOCommon title={"Collaborative Climate Contest"}>
        <Game />
      </SocketIOCommon>
    </>
  );
};
