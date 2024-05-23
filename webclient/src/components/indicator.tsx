import { CheckLg, QuestionLg, XLg } from "react-bootstrap-icons";
import React from "react";

export const Indicator = ({
  status,
}: {
  status: boolean | null | undefined;
}) =>
  status === true ? (
    <CheckLg color={"green"} />
  ) : status === false ? (
    <XLg color={"red"} />
  ) : (
    <QuestionLg color={"orange"} />
  );
