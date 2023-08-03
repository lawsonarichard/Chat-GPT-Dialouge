import { useState } from "react";
import { ChatSidebar } from "components/ChatSidebar";
import Head from "next/head";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Message } from "components/Message";

export default function PersonaPage({ chatId, title, messages = [] }) {
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [incomingMessage, setIncomingMessage] = useState("");
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [name, setName] = useState("");

  const allMessages = [...messages, ...newChatMessages];

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
            {!allMessages.length && !incomingMessage && (
              <div className="m-auto flex items-center justify-center text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200"
                  />
                  <h1 className="mt-2 text-4xl font-bold text-white/50">
                    Create a Persona
                  </h1>
                </div>
              </div>
            )}
            {!!allMessages.length && (
              <div className="mb-auto">
                {allMessages.map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {!!incomingMessage && !routeHasChanged && (
                  <Message role="assistant" content={incomingMessage} />
                )}
                {!!incomingMessage && !!routeHasChanged && (
                  <Message
                    role="notice"
                    content="Only one message at a time. Please allow any other responses to complete before sending another message"
                  />
                )}
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
                <button type="submit" className="btn">
                  Create
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
