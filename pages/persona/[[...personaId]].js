import { useState, useEffect } from "react";
import { ChatSidebar } from "components/ChatSidebar";
import Head from "next/head";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Message } from "components/Message";
import { redirect } from "next/dist/server/api-utils";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import { useRouter } from "next/router";

import DynamicQuill from "../../components/Quill/DynamicQuill";
import "react-quill/dist/quill.snow.css"; // import styles

export default function PersonaPage({
  chatId,
  personaId,
  persona,
  personaName,
  isPublic,
}) {
  const [personaPrompt, setPersonaPrompt] = useState(persona || "");
  const [incomingMessage, setIncomingMessage] = useState("");
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [name, setName] = useState(personaName || "");
  const [publicState, setPublicState] = useState();

  useEffect(() => {
    setPersonaPrompt(persona);
    setName(personaName);
    setPublicState(isPublic);
  }, [persona, personaName, isPublic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);

    const apiRoute = personaId
      ? "/api/persona/editPersona"
      : "/api/persona/createPersona";
    const body = personaId
      ? { personaId, persona: personaPrompt, name, isPublic: publicState }
      : { persona: personaPrompt, name, isPublic: publicState };

    const response = await fetch(apiRoute, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Handle error
      console.log("Error with persona operation");
      alert("Error with persona operation. Please try again."); // Added this line
      setGeneratingResponse(false);
      return;
    }

    setGeneratingResponse(false);
    alert("Persona operation successful!"); // Added this line
  };

  const handleQuillChange = (content, delta, source, editor) => {
    setPersonaPrompt(editor.getHTML());
  };

  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} personaId={personaId} />
        <div className="flex flex-col bg-gray-800">
          <div className="flex flex-1 p-10 text-white">
            <form onSubmit={handleSubmit}>
              <label
                class="text-white-800 mb-2 block text-sm font-bold"
                for="name"
              >
                Name
              </label>
              <textarea
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={generatingResponse ? "" : "Name your persona..."}
                className="mb-4 w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline-none"
              />
              <label
                class="text-white-800 mb-2 block text-sm font-bold"
                for="persona"
              >
                Persona
              </label>
              <DynamicQuill
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                value={personaPrompt}
                onChange={handleQuillChange}
                placeholder={generatingResponse ? "" : "Create a Persona..."}
                className="mb-4 w-full resize-none rounded-md p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline-none"
              />
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="public"
                  name="public"
                  checked={publicState}
                  onChange={(e) => setPublicState(e.target.checked)}
                  className="mr-2 rounded bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline-none"
                />
                <label class="text-white-800 text-sm font-bold" for="public">
                  Public
                </label>
              </div>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                {personaId && (
                  <button
                    type="submit"
                    className="btn rounded bg-emerald-500 px-4 py-2 font-bold text-white hover:bg-emerald-600 focus:outline-none active:bg-emerald-700"
                  >
                    Update
                  </button>
                )}
                {!personaId && (
                  <button
                    type="submit"
                    className="btn rounded bg-emerald-500 px-4 py-2 font-bold text-white hover:bg-emerald-600 focus:outline-none active:bg-emerald-700"
                  >
                    Create
                  </button>
                )}
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const personaId = ctx.params?.personaId?.[0] || null;

  if (personaId) {
    let objectId;

    try {
      objectId = new ObjectId(personaId);
    } catch (e) {
      return {
        redirect: {
          destination: "/persona",
        },
      };
    }
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChattyPete");
    const persona = await db.collection("personas").findOne({
      $or: [
        { userId: user.sub, _id: objectId },
        { _id: objectId, isPublic: true },
      ],
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
        personaName: persona.name,
        isPublic: persona.isPublic || null,
      },
    };
  }
  return {
    props: {},
  };
};
