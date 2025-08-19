import { Heading, Flex, Text } from "@chakra-ui/react";

const TitleBlock = ({ title, url }) => {
  return (
    <>
      <div
        style={{
          height: "30vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${url})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          marginBottom: "15px",
        }}
      >
        <Heading size="2xl" style={{ color: "white" }} noOfLines={1}>
          {title}
        </Heading>
      </div>
    </>
  );
};

const ItemBlock = ({ title, content, children }) => {
  return (
    <>
      <Flex
        style={{}}
        align="center"
        justify="center"
        direction="column"
        p={10}
        pt={5}
        pb={0}
        w={"100%"}
      >
        <Heading
          style={{ textAlign: "left", maxWidth: "600px", width: "100%" }}
        >
          {title}
        </Heading>
        <Text mt={2} fontSize="xl" style={{ width: "100%", maxWidth: "600px" }}>
          {children}
        </Text>
      </Flex>
    </>
  );
};

const Spacer = ({ size }) => {
  return <div style={{ height: `${size}px` }}></div>;
};

export { TitleBlock, ItemBlock, Spacer };
