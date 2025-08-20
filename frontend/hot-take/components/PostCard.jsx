// prettier-ignore
import { useEffect, useRef, useState } from "react";
// UI Imports
// prettier-ignore
import { Stack, Input, Divider, Container, Heading, Button, Card, CardHeader, CardBody, CardFooter, Tooltip, Flex, Spacer, Text, Icon, Toast } from "@chakra-ui/react";
// Icons
// prettier-ignore
import { BsFillHandThumbsUpFill, BsFillHandThumbsDownFill, BsChat, BsReply } from "react-icons/bs";
import { MdIosShare, MdWarningAmber } from "react-icons/md";
// prettier-ignore
import { AiOutlineFire, AiOutlineInfoCircle, AiOutlineWarning, AiFillHeart, AiOutlineSend } from "react-icons/ai";
import { TfiShare } from "react-icons/tfi";
// Styling
// prettier-ignore
import { cardContainer, toolTipContainer, toolTipIcon, iconStyle } from "../styles/Card.module.css";
// Dependencies

// Components
import { PostComment } from "./PostComment";

import { useErrorToast } from "../hooks/useErrorToast";
import { useSuccessToast } from "../hooks/useSuccessToast";

import { env_url } from "/utils/api_url";

export const PostCard = ({
  uuid,
  setAnimated,
  scrollContainerRef,
  ...post
}) => {
  const { title, interactions, id } = post;

  const [agree, setAgree] = useState(post.agree || []);
  const [disagree, setDisagree] = useState(post.disagree || []);


  const { addToast } = useErrorToast();
  const { addSuccessToast } = useSuccessToast();

  const API_URL = env_url();

  const [heat, setHeat] = useState(agree.length + disagree.length);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportTooltip, setReportTooltip] = useState(false);
  const [infoTooltip, setInfoTooltip] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [comments, setComments] = useState([]);

  const commentInput = useRef(null);
  const lastComment = useRef(null);
  const commentContainer = useRef(null);

  const hasShare = !!navigator.share;

  const fetchComments = async () => {
  try {
    const res = await fetch(`/api/comment?postID=${id}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    const data = await res.json();
    setComments(data);
  } catch (err) {
    console.error(err);
    addToast(err.message);
  }
};

  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/post?postID=${id}`);
      if (!res.ok) throw new Error("Failed to fetch votes");
      const data = await res.json();

      // assuming data has arrays for agree and disagree
      setHeat(data.agree.length + data.disagree.length);
      post.agree = data.agree;
      post.disagree = data.disagree;
    } catch (err) {
      console.error(err);
      addToast(err.message);
    }
  };


  useEffect(() => {
    fetchComments(); // fetch comments on mount
  }, []);

  useEffect(() => {
    // Update the document title using the browser API
  }, [comments]);

  function formatNumberCompact(num) {
    return new Intl.NumberFormat("en-GB", {
      notation: "compact",
    }).format(num);
  }

  const agreeWithPost = async () => {
    setAnimated((prev) => ({ ...prev, left: true }));
    setTimeout(() => {
      scrollContainerRef.current.scrollBy({ top: 50 });
    }, 800);

    // Local state update for immediate UI feedback
    if (agree.includes(uuid)) {
      setAgree((prev) => prev.filter((id) => id !== uuid));
      setHeat((prev) => prev - 1);
    } else if (disagree.includes(uuid)) {
      setDisagree((prev) => prev.filter((id) => id !== uuid));
      setAgree((prev) => [...prev, uuid]);
      setHeat((prev) => prev); // net 0
    } else {
      setAgree((prev) => [...prev, uuid]);
      setHeat((prev) => prev + 1);
    }

    try {
      await fetch(`${API_URL}/agree`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID: id, userUUID: uuid, type: "AGREE" }),
      });
      fetchVotes();
    } catch (err) {
      addToast(err.message);
    }
  };

  const disagreeWithPost = async () => {
    setAnimated((prev) => ({ ...prev, right: true }));
    setTimeout(() => {
      scrollContainerRef.current.scrollBy({ top: 50 });
    }, 800);

    if (disagree.includes(uuid)) {
      setDisagree((prev) => prev.filter((id) => id !== uuid));
      setHeat((prev) => prev - 1);
    } else if (agree.includes(uuid)) {
      setAgree((prev) => prev.filter((id) => id !== uuid));
      setDisagree((prev) => [...prev, uuid]);
      setHeat((prev) => prev); // net 0
    } else {
      setDisagree((prev) => [...prev, uuid]);
      setHeat((prev) => prev + 1);
    }

    try {
      await fetch(`${API_URL}/disagree`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID: id, userUUID: uuid, type: "DISAGREE" }),
      });
      fetchVotes();
    } catch (err) {
      addToast(err.message);
    }
  };


  async function handleSubmitComment() {
    const inputtedComment = commentInput.current.value.trim();

    if (inputtedComment.length === 0) {
      addToast("Comment content is missing.");
      return;
    } else if (inputtedComment.length > 140) {
      addToast("Comment must be less than 140 characters.");
      return;
    }

    // Clear input immediately
    commentInput.current.value = "";

    // Create a temporary ID for optimistic comment
    const tempId = "temp-" + Math.random();

    // Optimistic update
    const optimisticComment = {
      _id: tempId,
      content: inputtedComment,
      date: Date.now(), // Ensure this matches the 'date' field used in PostComment
      userId: uuid,
    };
    setComments((prev) => [...prev, optimisticComment]);

    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputtedComment,
          postID: id,
          userId: uuid,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit comment");
      const data = await res.json(); // actual comment from server

      // Replace the optimistic comment with the real one
      setComments((prev) =>
        prev.map((c) => (c._id === tempId ? data : c))
      );
    } catch (err) {
      // Remove the optimistic comment if server fails
      setComments((prev) => prev.filter((c) => c._id !== tempId));
      addToast(err.message);
    }
  }


  return (
    <div className={cardContainer}>
      <Card variant="outline" bg="white" w="90%" maxW="400px">
        {/* tool tip container */}
        <div className={toolTipContainer}>
          <Tooltip label={"Click to report this post"} isOpen={reportTooltip}>
            <Button
              onMouseEnter={() => setReportTooltip(true)}
              onMouseLeave={() => setReportTooltip(false)}
              onClick={() => {
                setReportTooltip(true);

                fetch(`${API_URL}/report`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postID: _id, userUUID: uuid }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    addSuccessToast(`Post "${post.title}" has been reported`);
                  })
                  .catch(function (error) {
                    console.error(error);
                    addToast(error?.response?.data || error.message);
                  });
              }}
              color="gray.300"
              variant="ghost"
              className={toolTipIcon}
              _hover={{ color: "var(--chakra-colors-gray-500)" }}
              _active={{ transform: "scale(.9)" }}
            >
              <MdWarningAmber
                className={iconStyle}
                style={{ transform: "translateY(1.5px)" }}
              />
            </Button>
          </Tooltip>
          {/* hide icon tooltip for now */}
          {/* <Tooltip label={"Total votes: " + interactions} isOpen={infoTooltip}>
						<Button
							onMouseEnter={() => setInfoTooltip(true)}
							onMouseLeave={() => setInfoTooltip(false)}
							onClick={() => setInfoTooltip(true)}
							color="gray.300"
							variant="ghost"
							className={toolTipIcon}
							_hover={{ color: "var(--chakra-colors-gray-500)" }}
							_active={{ transform: "scale(.9)" }}
						>
							<AiOutlineInfoCircle className={iconStyle} />
						</Button>
					</Tooltip> */}
          <Tooltip
            label={
              hasShare ? "Share drawer opened!" : "Click to copy sharable link!"
            }
            isOpen={shareTooltip}
          >
            <Button
              onMouseEnter={() => setShareTooltip(true)}
              onMouseLeave={() => setShareTooltip(false)}
              onClick={() => {
                const link = `https://hottake.gg/post/${_id}`;
                if (hasShare) {
                  navigator
                    .share({
                      title: title,
                      text: "Check out this hottake!",
                      url: link,
                    })
                    .catch((error) => {
                      if (
                        error.message !== "Abort due to cancellation of share."
                      ) {
                        addToast(error.message);
                      }
                    });
                  setShareTooltip(false);
                } else {
                  navigator.clipboard.writeText(link);
                  addSuccessToast("Copied to clipboard!");
                }
              }}
              color="gray.300"
              variant="ghost"
              className={toolTipIcon}
              _hover={{ color: "var(--chakra-colors-gray-500)" }}
              _active={{ transform: "scale(.9)" }}
            >
              <MdIosShare className={iconStyle} />
            </Button>
          </Tooltip>
        </div>
        {/* content */}
        <CardBody p="16px" pt="24px">
          <Stack mt="6" spacing="3">
            <Heading size="lg">{title}</Heading>
          </Stack>
        </CardBody>
        {/* buttons */}
        <CardBody p="16px" pt="0">
          {/* //agree heat and disagree div */}
          <Flex style={{ width: "100%" }} gap="6px">
            <Button
              // width="125px"
              // leftIcon={<BsFillHandThumbsUpFill />}
              variant="outline"
              colorScheme="teal"
              color="#319795"
              onClick={agreeWithPost}
              style={{
                backgroundColor: agree.includes(uuid) ? "#B2F5EA" : "white",
                borderRadius: "24px",
                width: "72px",
                height: "72px",
                borderWidth: "2px",
              }}
            >
              {disagree.includes(uuid) || agree.includes(uuid) ? (
                <div>
                  {agree.length}
                  <Icon as={BsFillHandThumbsUpFill} w={3} h={3} ml="1" />
                </div>
              ) : (
                <BsFillHandThumbsUpFill size={24} />
              )}
              {/* <Text fontSize={{ base: "12px", sm: "15px" }}>{agree.length} Agree</Text> */}
            </Button>
            <Spacer />
            {/* <Button
							leftIcon={<AiOutlineFire />}
							disabled
							variant="outline"
							color="black"
							colorScheme="gray"
						></Button> */}
            <div
              style={{
                height: "inherit",
                color: "#A0AEC0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
                fontWeight: "600",
                gap: "6px",
                marginRight: "6px",
                marginLeft: "6px",
              }}
            >
              <Icon as={AiOutlineFire} w={6} h={6} />
              {formatNumberCompact(heat)}
            </div>
            <Spacer />
            <Button
              // width="125px"
              // rightIcon={<BsFillHandThumbsDownFill />}
              variant="outline"
              colorScheme="red"
              color="#ff5242"
              onClick={disagreeWithPost}
              style={{
                backgroundColor: disagree.includes(uuid) ? "#FEB2B2" : "white",
                borderRadius: "24px",
                width: "72px",
                height: "72px",
                borderWidth: "2px",
              }}
            >
              {disagree.includes(uuid) || agree.includes(uuid) ? (
                <div>
                  <Icon as={BsFillHandThumbsDownFill} w={3} h={3} mr="1" />
                  {disagree.length}
                </div>
              ) : (
                <BsFillHandThumbsDownFill size={24} />
              )}
              {/* <Text fontSize={{ base: "12px", sm: "15px" }}>{disagree.length} Disagree</Text> */}
            </Button>
          </Flex>
          {/* //agree heat disagree div ends */}
        </CardBody>

        <Divider />

        <CardFooter p="16px">
          <Flex w="100%" align="" direction="column" gap={2}>
            <Flex
              w="100%"
              justify="center"
              align="center"
              gap={2}
              onClick={() => setCommentsOpen((i) => !i)}
              color="gray.500"
              cursor="pointer"
            >
              <Icon as={BsChat} />
              <Text>Comments ({comments.length})</Text>
            </Flex>
            {commentsOpen && (
              <div>
                <Card variant="outline">
                  <div
                    style={{
                      maxHeight: "176px",
                      overflowY: "scroll",
                      overflowX: "hidden",
                    }}
                    ref={commentContainer}
                  >
                    {comments.map((comment, i) => {
                      // if (i === comments.length - 1) {
                      // 	console.log(comment.content);
                      // 	return (
                      // 		<div ref={lastComment}>
                      // 			<PostComment
                      // 				key={`${comment._id}${i}`}
                      // 				content={comment.content}
                      // 				time={comment.date}
                      // 			/>
                      // 		</div>
                      // 	);
                      // } else {
                      // 	return (
                      // 		<div>
                      // 			<PostComment
                      // 				key={`${comment._id}${i}`}
                      // 				content={comment.content}
                      // 				time={comment.date}
                      // 			/>
                      // 		</div>
                      // 	);
                      // }
                      return (
                        <div key={`${comment._id}${i}`}>
                          <PostComment
                            key={`${comment._id}${i}`}
                            content={comment.content}
                            time={comment.date}
                            dev={comment?.dev}
                          />
                        </div>
                      );
                    })}

                    <Divider />
                    {comments.length > 2 ? (
                      <div
                        ref={lastComment}
                        style={{
                          height: "50px",
                          background: "none",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#718096",
                        }}
                      >
                        end of comments
                      </div>
                    ) : null}

                    {/* <Divider />
												<Container m={1} ml={4} position="relative">
													<Icon
														w={3}
														h={3}
														as={AiFillHeart}
														fill="red"
														style={{
															position: "absolute",
															top: "20px",
															right: "28px",
														}}
													/>
													<Icon
														w={3}
														h={3}
														as={BsReply}
														style={{
															position: "absolute",
															top: "20px",
															right: "44px",
														}}
													/>
													<Text fontSize="xs">10:01 am, Jan 5</Text>
													<Text>u just coping</Text>
												</Container> */}
                  </div>
                  <Divider />

                  <CardFooter
                    style={{
                      margin: "0",
                      padding: "0",
                    }}
                  >
                    <Flex
                      direction="row"
                      w="100%"
                      justify="center"
                      align="center"
                    >
                      <Input
                        variant="filled"
                        placeholder="Comment your thoughts..."
                        ref={commentInput}
                        style={{ margin: "8px" }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSubmitComment();
                        }}
                      />
                      <Icon
                        as={AiOutlineSend}
                        h={6}
                        w={6}
                        mr="8px"
                        onClick={handleSubmitComment}
                      />
                    </Flex>
                  </CardFooter>
                </Card>
              </div>
            )}
          </Flex>
        </CardFooter>
      </Card>
    </div>
  );
};
