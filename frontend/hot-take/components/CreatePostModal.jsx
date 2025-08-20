import { useState, useRef } from "react";
// prettier-ignore
import { Button, Textarea, Modal, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, ModalContent } from "@chakra-ui/react";

import { useErrorToast } from "../hooks/useErrorToast";

export function CreatePostModal({ isOpen, onClose }) {
  const { addToast } = useErrorToast();
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // ref for input
  const input = useRef(null);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsCreateLoading(true);

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.current.value }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const data = await response.json();

      // TODO: Instead of reloading, redirect to `/post/${data.id}`
      setIsCreateLoading(false);
      window.location.reload(true);
    } catch (error) {
      console.error("Error creating post:", error);
      addToast(error.message || "Something went wrong");
      setIsCreateLoading(false);
    }
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
                maxLength={140}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="teal"
                type="submit"
                isLoading={isCreateLoading}
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

export default CreatePostModal;