import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { personaId, persona, name } = req.body;

    const client = await clientPromise;
    const db = client.db("ChattyPete");

    const updateResponse = await db.collection("personas").updateOne(
      {
        _id: new ObjectId(personaId),
        userId: user.sub,
      },
      {
        $set: {
          persona: persona,
          name: name,
        },
      }
    );

    if (updateResponse.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No persona found with this id for this user" });
    }

    res.status(200).json({ message: "Successfully updated persona" });
  } catch (e) {
    res
      .status(500)
      .json({ message: "An error occurred when updating the persona" });
  }
}
