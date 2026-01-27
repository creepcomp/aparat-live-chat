"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAlert } from "@/app/contexts/AlertContext";
import { getAparatChannelInfo, getCurrentUser } from "../actions";
import Cookies from "js-cookie";

const ChatContext = createContext(null);

/* ========= SOCKET SINGLETON ========= */
const sockets = {};

function getSocket(channel) {
  if (!sockets[channel]) {
    sockets[channel] = io({
      path: "/socket.io",
      query: { channel },
      reconnection: true,
      reconnectionAttempts: 32,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return sockets[channel];
}

function cleanupSocket(channel) {
  const socket = sockets[channel];
  if (socket) {
    socket.removeAllListeners();
    delete sockets[channel];
  }
}

/* ========= CONSTANTS ========= */
const MAX_MESSAGES = 60;

export function ChatProvider({ channel, children }) {
  const [connected, setConnected] = useState(false);
  const [joinedCount, setJoinedCount] = useState(0);
  const [user, setUser] = useState();
  const [channelInfo, setChannelInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [isGuest, setIsGuest] = useState(false);

  const isAdmin = !!user && user.username === channel;

  const { showAlert } = useAlert();
  const socketRef = useRef(null);

  /* ========= LOAD USER (JWT CHECK) ========= */
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        setUser({
          username: user.username,
          nickname: user.name || user.username
        });

      } else {
        const nickname = Cookies.get("nickname");
        if (nickname) {
          setUser({ nickname: nickname });
        }
        setIsGuest(true);
      }
    })();
  }, []);

  /* ========= LOAD CHANNEL INFO ========= */
  useEffect(() => {
    if (!channel) return;

    (async () => {
      try {
        const info = await getAparatChannelInfo(channel);
        setChannelInfo(info);
      } catch (err) {
        console.error("Failed to load channel info:", err);
      }
    })();
  }, [channel]);

  /* ========= MESSAGE HANDLER ========= */
  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;

      const next = [...prev, msg];
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
    });
  }, []);

  /* ========= SOCKET ========= */
  useEffect(() => {
    if (!channel) {
      showAlert("Cannot connect: missing channel", "error");
      return;
    }

    const socket = getSocket(channel);
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onMessage = addMessage;
    const onDeleted = (id) =>
      setMessages((prev) => prev.filter((m) => m.id !== id));
    const onCount = setJoinedCount;

    const onError = (msg) => {
      showAlert(msg, "error");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("deleted", onDeleted);
    socket.on("count", onCount);
    socket.on("error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("deleted", onDeleted);
      socket.off("count", onCount);
      socket.off("error", onError);
      cleanupSocket(channel);
    };
  }, [channel, addMessage, showAlert]);

  /* ========= EMIT HELPER ========= */
  const emit = useCallback(
    (event, payload) => {
      if (!socketRef.current || !connected) return;
      socketRef.current.emit(event, payload);
    },
    [connected]
  );

  /* ========= ACTIONS ========= */
  const sendMessage = useCallback(
    (content, extra = {}) =>
      emit("message", { content, ...extra }),
    [emit]
  );

  const deleteMessage = useCallback(
    (messageId) => emit("delete", messageId),
    [emit]
  );

  const banUser = useCallback(
    (username) => emit("ban", username),
    [emit]
  );

  return (
    <ChatContext.Provider value={{
      user, isGuest, isAdmin, channelInfo, connected, joinedCount, messages,
      sendMessage, deleteMessage, banUser
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
