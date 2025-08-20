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
    case "POST":
      try {
        const { postID, userUUID } = req.body;

        if (!postID) {
          return res.status(400).json({ message: "Disagreement failed, no post included." });
        }

        if (!userUUID) {
          return res.status(400).json({ message: "Disagreement failed, no user registered." });
        }

        // Fetch the post
        const post = await prisma.post.findUnique({
          where: { id: postID },
        });

        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        let updatedAgree = post.agree || [];
        let updatedDisagree = post.disagree || [];

        if (updatedAgree.includes(userUUID)) {
          // Move user from agree → disagree
          updatedAgree = updatedAgree.filter((u) => u !== userUUID);
          updatedDisagree.push(userUUID);
        } else if (updatedDisagree.includes(userUUID)) {
          // Remove user from disagree
          updatedDisagree = updatedDisagree.filter((u) => u !== userUUID);
        } else {
          // Add user to disagree
          updatedDisagree.push(userUUID);
        }

        const updatedPost = await prisma.post.update({
          where: { id: postID },
          data: {
            agree: updatedAgree,
            disagree: updatedDisagree,
            votes: updatedAgree.length - updatedDisagree.length,
            interactions: updatedAgree.length + updatedDisagree.length,
          },
        });

        return res.status(200).json(updatedPost);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
