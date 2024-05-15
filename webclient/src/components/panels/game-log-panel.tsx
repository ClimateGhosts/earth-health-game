import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import cx from "classnames";
import { displayTime } from "../game";
import { orderBy } from "lodash";

export default ({
  className,
  gameLogs,
}: {
  className?: string;
  gameLogs: { time: number; message: string }[];
}) => {
  const [showing, setShowing] = useState(false);

  return (
    <div className={cx("w-50 h-25 text-center", className)}>
      {showing && (
        <Card
          className={
            "shadow-lg p-3 mb-5 h-100 overflow-y-scroll w-100 bottom-0 position-absolute d-flex flex-column-reverse pointer-events-auto"
          }
        >
          <table>
            {orderBy(gameLogs, (log) => log.time).map(
              ({ time, message }, index) => (
                <tr key={index}>
                  <td>{displayTime(time)}</td>
                  <td>{message}</td>
                </tr>
              ),
            )}
          </table>
        </Card>
      )}
      <Button
        variant={"outline-dark"}
        className={
          "border-0 fs-4 pointer-events-auto bottom-0 position-absolute"
        }
        onClick={() => setShowing(!showing)}
      >
        Logs
      </Button>
    </div>
  );
};
