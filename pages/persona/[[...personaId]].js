import { useState } from "react";
import { ChatSidebar } from "components/ChatSidebar";
import Head from "next/head";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Message } from "components/Message";
import { redirect } from "next/dist/server/api-utils";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

export default function PersonaPage({ chatId, personaId, persona }) {
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [incomingMessage, setIncomingMessage] = useState("");
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [name, setName] = useState("");
  console.log("persona", persona);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);

    const response = await fetch("/api/persona/createPersona", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ persona: personaPrompt, name: name }),
    });

    if (!response.ok) {
      // Handle error
      console.log("Error creating persona");
      alert("Error creating persona. Please try again."); // Added this line
      setGeneratingResponse(false);
      return;
    }

    // Clear the form
    setPersonaPrompt("");
    setName("");
    setGeneratingResponse(false);
    alert("Persona created successfully!"); // Added this line
    console.log("handled");
  };
  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="flex flex-col overflow-hidden bg-gray-700">
          <div className="flex flex-1 flex-col-reverse overflow-scroll text-white">
            {!personaId && (
              <div className="m-auto flex items-center justify-center text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200"
                  />
                  <h1 className="mt-2 text-4xl font-bold text-white/50">
                    Create a new persona
                  </h1>
                </div>
              </div>
            )}
          </div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <textarea
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={generatingResponse ? "" : "Name your persona..."}
                className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
              />
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={personaPrompt}
                  onChange={(e) => setPersonaPrompt(e.target.value)}
                  placeholder={generatingResponse ? "" : "Create a Persona..."}
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                />
                {personaId && (
                  <button type="submit" className="btn">
                    Update
                  </button>
                )}
                {!personaId && (
                  <button type="submit" className="btn">
                    Create
                  </button>
                )}
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const personaId = ctx.params?.personaId?.[0] || null;
  console.log("personaId", ctx);

  if (personaId) {
    let objectId;

    try {
      objectId = new ObjectId(personaId);
    } catch (e) {
      redirect: {
        destination: "/persona";
      }
    }
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChattyPete");
    const persona = await db.collection("personas").findOne({
      userId: user.sub,
      _id: objectId,
    });

    if (!persona) {
      return {
        redirect: {
          destination: "/persona",
        },
      };
    }
    return {
      props: {
        personaId,
        persona: persona.persona,
        name: persona.name,
      },
    };
  }
  return {
    props: {},
  };
};
