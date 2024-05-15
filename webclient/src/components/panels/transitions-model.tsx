import { Modal } from "react-bootstrap";
import { ansiToHtml } from "../../lib/colors";
import React from "react";

export default ({
  text,
  title,
  onHide,
}: {
  text?: string;
  title: string;
  onHide: () => void;
}) => {
  return (
    <Modal
      size={"lg"}
      show={!!text}
      onHide={onHide}
      backdrop={"static"}
      className={"user-select-none"}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p
          dangerouslySetInnerHTML={{
            __html: ansiToHtml(text || ""),
          }}
        />
      </Modal.Body>
    </Modal>
  );
};
