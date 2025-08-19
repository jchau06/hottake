import { useToast } from "@chakra-ui/react";

export function useErrorToast() {
  const toast = useToast();

  const addToast = (message) => {
    toast({
      title: "Error",
      description: message,
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  };

  return { addToast };
}
