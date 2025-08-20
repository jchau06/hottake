// pages/api/report.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { postID, userUUID } = req.body;

  if (!postID) {
    return res.status(400).json({ message: "Report failed, no post included." });
  }
  if (!userUUID) {
    return res.status(400).json({ message: "Report failed, no user registered." });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postID },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Add or remove user from reports array
    let updatedReports;
    if (post.reports.includes(userUUID)) {
      // Remove user from reports
      updatedReports = post.reports.filter((id) => id !== userUUID);
    } else {
      // Add user to reports
      updatedReports = [...post.reports, userUUID];
    }

    const updatedPost = await prisma.post.update({
      where: { id: postID },
      data: { reports: updatedReports },
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating reports:", error);
    res.status(500).json({ message: error.message });
  }
}
