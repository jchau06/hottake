// pages/api/posts.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = { api: { externalResolver: true } };

export default async function handler(req, res) {
  const { method, query } = req;
  const limit = parseInt(query.limit) || 10;
  const offset = parseInt(query.offset) || 0;
  const sort = query.sort || "new";
  const userId = query.userId || "c74a8536-9ab4-44ed-9f96-ffe116e5aba8";

  if (method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    let posts;

    switch (sort) {
      case "hot": {
        const std = 0.4;
        const mean = 0.31;
        const engagementBonusCoef = 0.1;

        // Hotness formula in raw SQL
        posts = await prisma.$queryRaw`
          SELECT *,
            (
              (
                1 / (${std} * sqrt(2 * pi())) *
                EXP(-0.5 * POWER(((votes + 1.0)/(interactions + 2.0) - ${mean}) / ${std}, 2))
                +
                ${engagementBonusCoef} * LN(interactions + 1)
              )
              *
              (
                (30 - (EXTRACT(EPOCH FROM NOW() - date)/60/60/24)) / 30
              )
            ) AS rating
          FROM "Post"
          WHERE NOT (agree @> ARRAY[${userId}]::text[])
            AND NOT (disagree @> ARRAY[${userId}]::text[])
          ORDER BY rating DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
        break;
      }

      case "new":
        posts = await prisma.post.findMany({
          orderBy: { date: "desc" },
          skip: offset,
          take: limit,
        });
        break;

      case "old":
        posts = await prisma.post.findMany({
          orderBy: { date: "asc" },
          skip: offset,
          take: limit,
        });
        break;

      case "popular":
        posts = await prisma.post.findMany({
          orderBy: { interactions: "desc" },
          skip: offset,
          take: limit,
        });
        break;

      case "random":
        posts = await prisma.$queryRaw`
          SELECT * FROM "Post"
          ORDER BY RANDOM()
          LIMIT ${limit} OFFSET ${offset};
        `;
        break;

      case "agreed":
        posts = await prisma.post.findMany({
          orderBy: { votes: "desc" },
          skip: offset,
          take: limit,
        });
        break;

      case "disagreed":
        posts = await prisma.post.findMany({
          orderBy: { votes: "asc" },
          skip: offset,
          take: limit,
        });
        break;

      case "reported":
        posts = await prisma.post.findMany({
          orderBy: { reports: "desc" },
          skip: offset,
          take: limit,
        });
        break;

      default:
        // fallback to new
        posts = await prisma.post.findMany({
          orderBy: { date: "desc" },
          skip: offset,
          take: limit,
        });
        break;
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
}
