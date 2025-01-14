import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("ChattyPete");

    // Define the find conditions
    const findConditions = {
      $or: [{ userId: user.sub }, { isPublic: true }],
    };

    const personas = await db
      .collection("personas")
      .find(findConditions, {
        projection: {
          userId: 0,
        },
      })
      .sort({
        _id: -1,
      })
      .toArray();

    res.status(200).json({ personas });
  } catch (e) {
    res
      .status(500)
      .json({ message: "An error occurred when getting the persona list" });
  }
}
