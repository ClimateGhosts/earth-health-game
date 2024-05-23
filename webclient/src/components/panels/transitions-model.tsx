import { Modal } from "react-bootstrap";
import React, { ReactNode } from "react";

export default ({
  body,
  title,
  onHide,
}: {
  body?: ReactNode;
  title: ReactNode;
  onHide: () => void;
}) => {
  return (
    <Modal
      size={"lg"}
      show={!!body}
      onHide={onHide}
      backdrop={"static"}
      className={"user-select-none"}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{body}</Modal.Body>
    </Modal>
  );
};
