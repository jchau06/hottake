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
        const { postID } = req.query;

        if (!postID) {
          return res.status(400).json({ message: "Please provide a postID" });
        }

        const comments = await prisma.comment.findMany({
          where: { postId: postID },
          orderBy: { date: "asc" },
        });

        return res.status(200).json(comments);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }

    case "POST":
      try {
        const { content, postID } = req.body;

        if (!content || content.length === 0) {
          return res.status(400).json({ message: "Comment content is missing" });
        }

        if (content.length > 140) {
          return res.status(400).json({ message: "Comment exceeds 140 characters" });
        }

        if (!postID) {
          return res.status(400).json({ message: "Parent post ID is missing" });
        }

        const newComment = await prisma.comment.create({
          data: {
            content,
            date: new Date(),
            postId: postID,
          },
        });

        return res.status(200).json(newComment);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
