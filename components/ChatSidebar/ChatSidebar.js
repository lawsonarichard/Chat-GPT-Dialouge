import {
  faMessage,
  faPlus,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar = ({ chatId, personaId }) => {
  const [chatList, setChatList] = useState([]);
  const [personaList, setPersonaList] = useState([]);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch(`/api/chat/getChatList`, {
        method: "POST",
      });
      const json = await response.json();
      setChatList(json?.chats || []);
    };
    const loadPersonaList = async () => {
      const response = await fetch(`/api/persona/getPersonaList`, {
        method: "POST",
      });
      const json = await response.json();
      setPersonaList(json?.personas || []);
    };
    loadChatList();
    loadPersonaList();
  }, [chatId, personaId]);

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <Link
        href="/chat"
        className="side-menu-item bg-violet-500 hover:bg-violet-600"
      >
        <FontAwesomeIcon icon={faPlus} /> New chat
      </Link>

      <div className="flex-1 overflow-auto bg-gray-950">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`side-menu-item ${
              chatId === chat._id ? "bg-gray-700 hover:bg-gray-700" : ""
            }`}
          >
            <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {chat.persona}
            </span>

            <span
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/persona"
        className="side-menu-item bg-violet-500 hover:bg-violet-600"
      >
        <FontAwesomeIcon icon={faPlus} /> New Persona
      </Link>
      <div className="flex-1 overflow-auto bg-gray-950">
        {personaList.map((persona) => (
          <Link
            key={persona._id}
            href={`/persona/${persona._id}`}
            className={`side-menu-item ${
              personaId === persona._id ? "bg-gray-700 hover:bg-gray-700" : ""
            }`}
          >
            <span
              title={persona.name}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {persona.name}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/api/auth/logout" className="side-menu-item">
        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
      </Link>
    </div>
  );
};
