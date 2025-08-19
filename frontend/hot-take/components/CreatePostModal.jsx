import { useState, useRef } from "react";
// prettier-ignore
import { Button, Textarea, Modal, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, ModalContent } from "@chakra-ui/react";

import { useErrorToast } from "../hooks/useErrorToast";
import { env_url } from "/utils/api_url";

export function CreatePostModal({ isOpen, onClose }) {
  const { addToast } = useErrorToast();
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const API_URL = env_url();

  // ref for input
  const input = useRef(null);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    setIsCreateLoading(true);

    fetch(`${API_URL}/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input.current.value }),
    })
      .then((response) => response.json())
      .then(function (data) {
        // reload to refetch
        // TODO: Change this to redirect to hottake.gg/post_id
        setIsCreateLoading(false);
        window.location.reload(true);
      })
      .catch(function (error) {
        console.error(error);
        // addToast(error?.response || error.message);
        addToast("Posting too fast");
        setIsCreateLoading(false);
      });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} motionPreset="scale" isCentered>
        <ModalOverlay />
        <ModalContent style={{ width: "90%" }}>
          <ModalHeader>Share a hot take!</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePostSubmit}>
            <ModalBody>
              <Textarea
                ref={input}
                placeholder="Share a hot take of up to 140 characters!"
              />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="teal"
                type="submit"
                disabled={isCreateLoading}
              >
                Post to HotTake
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
