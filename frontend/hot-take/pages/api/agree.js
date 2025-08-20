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
          return res
            .status(400)
            .json({ message: "Agreement failed, no post included." });
        }

        if (!userUUID) {
          return res
            .status(400)
            .json({ message: "Agreement failed, no user registered." });
        }

        // Get current post
        const post = await prisma.post.findUnique({
          where: { id: postID },
        });

        if (!post) {
          return res.status(404).json({ message: "Post not found." });
        }

        let newAgree = post.agree || [];
        let newDisagree = post.disagree || [];

        if (newAgree.includes(userUUID)) {
          // User already agreed, remove
          newAgree = newAgree.filter((id) => id !== userUUID);
        } else if (newDisagree.includes(userUUID)) {
          // User previously disagreed, remove from disagree, add to agree
          newDisagree = newDisagree.filter((id) => id !== userUUID);
          newAgree.push(userUUID);
        } else {
          // First-time agreement
          newAgree.push(userUUID);
        }

        const updatedPost = await prisma.post.update({
          where: { id: postID },
          data: {
            agree: newAgree,
            disagree: newDisagree,
            votes: newAgree.length - newDisagree.length,
            interactions: newAgree.length + newDisagree.length,
          },
        });

        res.status(200).json(updatedPost);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed." });
      break;
  }
}
