import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);

    const { persona } = req.body;

    // validate persona data
    if (!persona || typeof persona !== "string" || persona.length > 1000) {
      res.status(422).json({
        message: "Persona is required and must be less than 1000 characters",
      });
      return;
    }

    const client = await clientPromise;
    const db = client.db("ChattyPete");

    // Create new MongoDB document in the "personas" collection with persona and user ID
    await db
      .collection("personas")
      .insertOne({ userId: user.sub, persona: persona });

    res.status(200).json({
      message: "Persona created successfully",
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "An error occurred when creating a new persona" });
    console.log("ERROR OCCURRED IN CREATE PERSONA: ", e);
  }
}
