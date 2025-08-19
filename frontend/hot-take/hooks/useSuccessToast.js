import { useToast } from "@chakra-ui/react";

export function useSuccessToast() {
  const toast = useToast();

  const addSuccessToast = (message) => {
    toast({
      title: "Success!",
      description: message,
      status: "success",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  };

  return { addSuccessToast };
}
