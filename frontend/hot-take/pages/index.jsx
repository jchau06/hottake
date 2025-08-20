import { useState, useRef, useEffect } from "react";
// UI imports
// prettier-ignore
import { useDisclosure, Button, Icon, Flex, Text } from "@chakra-ui/react";
// Icons
// prettier-ignore
import { BsPlusLg, BsSortNumericUp, BsFillStarFill, BsSortNumericDownAlt, BsShuffle, BsFillHandThumbsUpFill, BsFillHandThumbsDownFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
// Components
import { PostCard } from "../components/PostCard";
import { CreatePostModal } from "../components/CreatePostModal";
import { Navbar } from "../components/Navbar";
import FireLoadAnimation from "../components/FireLoadAnimation";
import InfiniteScroll from "react-infinite-scroll-component";
// Styling
// prettier-ignore
import { animateGreen, animateRed, scrollContainer, screenButtonContainer, createButton, sortText, relative } from "../styles/Card.module.css";
// Dependencies
import { v4 as uuidv4 } from "uuid";
import ReactGA from "react-ga";

import { useErrorToast } from "../hooks/useErrorToast";

import { env_url } from "/utils/api_url";

// Google Analytics ID
const TRACKING_ID = "UA-253199381-1"; // OUR_TRACKING_ID

// export async function getServerSideProps() {
// 	const API_URL = env_url();
// 	// process.env.NEXT_PUBLIC_API_URL || "https://hottake.gg/api";

// 	const res = await fetch(`${API_URL}/posts?offset=0`);
// 	const postsFromDB = await res.json();
// 	return { props: { postsFromDB } };
// }

export default function Home() {
  const API_URL = env_url();

  // key for sorting button

  const SORT_ICONS = [
    { icon: BsSortNumericDownAlt, name: "New", w: 6, h: 6 },
    { icon: AiFillFire, name: "Hot", w: 6, h: 6 },
    { icon: BsShuffle, name: "Random", w: 6, h: 6 },
    { icon: BsFillStarFill, name: "Popular", w: 4, h: 4 },
    { icon: BsFillHandThumbsDownFill, name: "Disagreed", w: 5, h: 5 },
    { icon: BsFillHandThumbsUpFill, name: "Agreed", w: 5, h: 5 },
    { icon: BsSortNumericUp, name: "Old", w: 6, h: 6 },
  ];

  // toast
  const { addToast } = useErrorToast();

  // states
  const [animated, setAnimated] = useState({ left: false, right: false }); // Left and Right flashing animations
  const [uuid, setUUID] = useState(null);
  const [sortMethod, setSortMethod] = useState(1);
  const [posts, setPosts] = useState([]); 
  const [hasMorePosts, setHasMorePosts] = useState(false);

  // other hooks
  const scrollContainerRef = useRef(null); // To access scroll container containing posts
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal state

  async function fetchPosts(type, offset = 0) {
    try {
      const res = await fetch(`/api/posts?sort=${type}&offset=${offset}`, {
        headers: {
          Authorization: `Basic ${btoa(localStorage.getItem("uuid"))}`,
        },
      });
      const results = await res.json();

      if (offset === 0) {
        setPosts(results);
      } else {
        setPosts((prev) => [...prev, ...results]);
      }

      setHasMorePosts(results.length > 0);

      if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }


    } catch (error) {
      console.error(error);
      addToast(error?.message || "Failed to fetch posts.");
    }
  }

  useEffect(() => {
    // Google Analytics initialization
    ReactGA.initialize(TRACKING_ID);
    ReactGA.pageview(window.location.pathname);

    // Check if user has visited already
    if (!localStorage.getItem("uuid")) {
      // If not, add UUID to local storage.
      localStorage.setItem("uuid", uuidv4());
    }
    setUUID(localStorage.getItem("uuid"));

    (async () => {
      await fetchPosts(SORT_ICONS[sortMethod].name.toLowerCase());
    })();
  }, []);

  // if (localStorage.getItem("sort") == null) localStorage.setItem("sort", "0");
  // setSortMethod(parseInt(localStorage.getItem("sort")));
  // if (localStorage.getItem("sort") !== "0") {
  // 	fetchPosts(SORT_ICONS[parseInt(localStorage.getItem("sort")) % SORT_ICONS.length].name.toLowerCase())
  // 		.then((res) => setPosts(res))
  // 		.catch((error) => {
  // 			console.error(error);
  // 			addToast(error?.response?.data || error.message);
  // 		});
  // }

  // useEffect(() => {
  // 	localStorage.setItem("sort", sortMethod);
  // }, [sortMethod]);

  async function loadMore() {
    try {
      const res = await fetch(
        `${API_URL}/posts?offset=${posts.length}&sort=${SORT_ICONS[sortMethod].name.toLowerCase()}`,
        {
          headers: {
            Authorization: `Basic ${btoa(localStorage.getItem("uuid"))}`,
          },
        }
      );
      const loadedPosts = await res.json();
      if (loadedPosts?.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prev) => [...prev, ...loadedPosts]);
      }
    } catch (error) {
      addToast(error?.response?.data || error.message);
    }
  }

  // Sorting button handler
  const handleSortSwitch = async () => {
    // Compute the new sort index first
    const newIndex = (sortMethod + 1) % SORT_ICONS.length;
    setSortMethod(newIndex); // async, but safe because we use newIndex below
    await fetchPosts(SORT_ICONS[newIndex].name.toLowerCase());
  };


  // async function loadMore() {
  //   try {
  //     console.log("Loading");
  //     const res = await fetch(
  //       `${API_URL}/posts?offset=${posts.length}&sort=${SORT_ICONS[sortMethod].name.toLowerCase()}`,
  //       {
  //         headers: {
  //           Authorization: `Basic ${btoa(localStorage.getItem("uuid"))}`,
  //         },
  //       },
  //     );
  //     const loadedPosts = await res.json();
  //     if (loadedPosts.length == 0) {
  //       setHasMorePosts(false);
  //     } else {
  //       setHasMorePosts(true);
  //     }
  //     setPosts((prev) => [...prev, ...loadedPosts]);
  //   } catch (error) {
  //     addToast(error?.response?.data || error.message);
  //   }
  // }

  return (
    <>
      <Navbar />
      <CreatePostModal isOpen={isOpen} onClose={onClose} />
      <Button
        onClick={onOpen}
        colorScheme="teal"
        style={{
          zIndex: "999",
          height: "48px",
          width: "48px",
          borderRadius: "100%",
          position: "fixed",
          right: "18px",
          bottom: "18px",
        }}
      >
        <Icon as={BsPlusLg} w={4} h={4} color="white" />
      </Button>
      <Flex justify="center" align="center" gap="6px" className={createButton}>
        <Button
          onClick={handleSortSwitch}
          colorScheme="gray"
          style={{
            background: "#718096",
            height: "48px",
            width: "48px",
            borderRadius: "25%",
          }}
        >
          <Icon
            as={SORT_ICONS[sortMethod].icon}
            w={SORT_ICONS[sortMethod].w}
            h={SORT_ICONS[sortMethod].h}
            color="white"
          />
        </Button>
        <Text className={sortText} fontSize="large">
          Sort by {SORT_ICONS[sortMethod].name}
        </Text>
      </Flex>

      {posts && posts.length !== 0 ? (
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMore}
          hasMore={hasMorePosts}
          scrollableTarget="scrollContainer"
          style={{ overflow: "hidden" }}
          // loader={<h4>Loading...</h4>}
          // loader was showing up persistently...
        >
          <div
            id="scrollContainer"
            ref={scrollContainerRef}
            m={0}
            p={0}
            className={scrollContainer}
          >
            {posts.map(
              (
                post,
                i //TODO theres an error here...duplicate keys
              ) => (
                <div key={`${post._id}${i}`} className={relative}>
                  {/* this is the left and right indicators */}
                  <div id="flexContainer" className={screenButtonContainer}>
                    <div
                      onClick={() => {
                        scrollContainerRef.current.scrollBy({ top: 50 });
                        setAnimated((prev) => ({ ...prev, left: true }));
                      }}
                      onAnimationEnd={() =>
                        setAnimated((prev) => ({ ...prev, left: false }))
                      }
                      style={{ width: "50%", height: "100vh" }}
                      className={animated.left ? animateGreen : ""}
                    ></div>
                    <div
                      onClick={() => {
                        scrollContainerRef.current.scrollBy({ top: 50 });
                        setAnimated((prev) => ({ ...prev, right: true }));
                      }}
                      onAnimationEnd={() =>
                        setAnimated((prev) => ({ ...prev, right: false }))
                      }
                      style={{ width: "50%", height: "100vh" }}
                      className={animated.right ? animateRed : ""}
                    ></div>
                  </div>
                  {/* actual card */}
                  <PostCard
                    {...post}
                    uuid={uuid}
                    setAnimated={setAnimated}
                    scrollContainerRef={scrollContainerRef}
                    key={`${post.id}${i}`}
                  />
                </div>
              )
            )}
          </div>
        </InfiniteScroll>
      ) : (
        <FireLoadAnimation />
      )}
    </>
  );
}
