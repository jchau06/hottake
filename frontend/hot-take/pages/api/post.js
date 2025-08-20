// pages/api/post.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const postID = req.query.postID;

        if (!postID) {
          return res.status(400).json({ message: "No postID provided" });
        }

        const post = await prisma.post.findUnique({
          where: { id: postID },
          include: {
            comments: {
              include: {
                replies: true, // also pull replies for each comment
              },
            },
          },
        });

        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
      }
      break;

    case "POST":
      try {
        const { title } = req.body;

        if (!title || title.length === 0) {
          return res.status(400).json({ message: "Post content is missing" });
        }

        if (title.length <= 5) {
          return res
            .status(400)
            .json({ message: "Post must be longer than 5 characters" });
        }

        if (title.length > 140) {
          return res
            .status(400)
            .json({ message: "Post must be less than 140 characters" });
        }

        const newPost = await prisma.post.create({
          data: {
            title,
            agree: [],
            disagree: [],
            votes: 0,
            interactions: 0,
            reports: [],
          },
        });

        res.status(200).json(newPost);
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}
