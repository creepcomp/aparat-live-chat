"use client";

import { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, IconButton, Container, Paper, Typography } from "@mui/material";
import {
  Fullscreen as FullscreenIcon, ArrowDownward as ArrowDownwardIcon, Reply as ReplyIcon, Send as SendIcon,
  Delete as DeleteIcon, Block as BlockIcon, Close as CloseIcon, MailOutline as MailOutlineIcon
} from "@mui/icons-material";
import { formatTime, getNicknameColor, isArabicOrHebrew } from "./utils";
import LogoutButton from "./Logout";
import { useChat } from "../contexts/ChatContext";

export default function Chat() {
  const { connected, joinedCount, messages, sendMessage, deleteMessage, user, isAdmin, banUser } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [whisperTo, setWhisperTo] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAtBottom) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAtBottom]);

  const handleSendMessage = () => {
    const content = inputMessage.trim();
    if (!content) return;
    const extra = {};
    if (replyingTo) {
      extra.replyToId = replyingTo.id;
      extra.replyToPreview = {
        nickname: replyingTo.nickname,
        content: replyingTo.content
      };
      if (replyingTo.whisperTo || replyingTo.nickname === user.nickname) {
        extra.whisperTo = replyingTo.whisperTo || replyingTo.nickname;
      }
      setReplyingTo(null);
    }
    if (whisperTo) {
      extra.whisperTo = whisperTo.nickname;
      setWhisperTo(null);
    }
    sendMessage(content, extra);
    setInputMessage("");
  };

  const handleScroll = (e) => {
    const el = e.currentTarget;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
  };

  const handleBanUser = (username) => {
    if (window.confirm(`Ban ${username} for 5 minutes?`)) banUser(username);
  };

  return (
    <Container maxWidth="sm" disableGutters>
      <Box component={Paper} position="relative" p={2} sx={{ "&:hover .chat-only-btn": { display: "block" } }}>
        <Box className="chat-only-btn" display="none" position="absolute" top={0} left={0} zIndex={1000}>
          <IconButton href="?chat_only=true"><FullscreenIcon /></IconButton>
        </Box>

        <Box position="relative">
          <Box height="80vh" overflow="auto" mb={1} ref={containerRef} onScroll={handleScroll}>
            {messages.length ? messages.map((message) => {
              const originalMessage = message.replyToId ? messages.find((m) => m.id === message.replyToId) : null;
              const nickname = user?.nickname?.toLowerCase();
              const isWhisperToMe = message.whisperTo?.toLowerCase() === nickname;
              const isWhisperFromMe = message.nickname?.toLowerCase() === nickname && !!message.whisperTo;
              const isPrivate = isWhisperToMe || isWhisperFromMe;
              const bgColor = isPrivate ? "#ff5722" : getNicknameColor(message.nickname);
              const borderStyle = isPrivate ? "2px dashed #fff" : "none";

              return (
                <Box key={message.id} mb={2}>
                  {originalMessage && (
                    <Box ml={3} mb={1} p={1} borderLeft="4px solid #888" borderRadius={1} sx={{ opacity: 0.8, cursor: "pointer" }}
                      onClick={() => document.getElementById(`msg-${originalMessage.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                      <Typography variant="caption" noWrap display='block' textOverflow='ellipsis'>Replied to {originalMessage.nickname}: {originalMessage.content}</Typography>
                    </Box>
                  )}

                  <Box id={`msg-${message.id}`} p={1} borderRadius={2} bgcolor={bgColor} border={borderStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight="bold" dir={isArabicOrHebrew(message.nickname) ? "rtl" : "ltr"}>{message.nickname}:</Typography>
                      {isPrivate && <Typography variant="caption">[Private]</Typography>}

                      <Box display="flex" alignItems="center" gap={1}>
                        {isAdmin && (
                          <>
                            <IconButton size="small" sx={{ color: "red" }} onClick={() => handleBanUser(message.username)}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteMessage(message.id)}><DeleteIcon fontSize="small" /></IconButton>
                          </>
                        )}

                        <IconButton size="small" onClick={() => setWhisperTo(message)}>
                          <MailOutlineIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setReplyingTo(message)}>
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption">{formatTime(message.timestamp)}</Typography>
                      </Box>
                    </Box>

                    <Typography p={1} dir={isArabicOrHebrew(message.content) ? "rtl" : "ltr"} sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                      {message.content}
                    </Typography>
                  </Box>
                </Box>
              );
            }) : (
              <Typography align="center" p={2}>No messages</Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {!isAtBottom && (
            <IconButton sx={{ position: "absolute", bottom: 10, right: 10 }} onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              setIsAtBottom(true);
            }}>
              <ArrowDownwardIcon />
            </IconButton>
          )}
        </Box>

        {replyingTo && (
          <Box display="flex" justifyContent="space-between" alignItems="center"
            bgcolor={getNicknameColor(replyingTo.nickname)} p={1} borderRadius={1} mb={1}>
            <Typography variant="caption" noWrap display='block' textOverflow='ellipsis'>Replying to {replyingTo.nickname}: {replyingTo.content}</Typography>
            <IconButton onClick={() => setReplyingTo(null)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
        )}

        {whisperTo && (
          <Box display="flex" justifyContent="space-between" alignItems="center" bgcolor="#555" p={1} borderRadius={1} mb={1}>
            <Typography variant="caption" noWrap display='block' textOverflow='ellipsis'>Whisper to {whisperTo.nickname}</Typography>
            <IconButton onClick={() => setWhisperTo(null)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
        )}

        <Box display="flex" gap={1} mb={2}>
          <TextField fullWidth multiline label="Your message" value={inputMessage} disabled={!connected}
            dir={isArabicOrHebrew(inputMessage) ? "rtl" : "ltr"} onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
          <Button variant="contained" onClick={handleSendMessage} disabled={!inputMessage.trim()}><SendIcon /></Button>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems='center'>
          <Typography variant="caption">{connected ? `Connected as ${user ? user.nickname : "Guest"}` : "Connecting..."}</Typography>
          <Typography variant="caption">Online users: {joinedCount}</Typography>
          <LogoutButton />
        </Box>
      </Box>
    </Container>
  );
}
