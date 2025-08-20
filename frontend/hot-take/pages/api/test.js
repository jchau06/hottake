// import connect from "../../db/connect";
// import Post from "../../db/models/Post";

// export const config = {
// 	api: {
// 		externalResolver: true,
// 	},
// };

// export default async function handler(req, res) {
// 	const { method } = req;

// 	await connect();

// 	switch (method) {
// 		case "GET":
// 			const results = await Post.findById("64711997ce441726e6aeb831").limit(1);
// 			res.status(200).json(results);

// 			// res.status(200).json({ success: true, data: "MOMs!1aa", other: "lol" });
// 			break;
// 		default:
// 			res.status(400).json({ success: false });
// 			break;
// 	}
// }
