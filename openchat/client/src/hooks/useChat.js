import { useState, useEffect, useCallback, useRef } from 'react';
import socket from '../socket.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function useChat(nickname) {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState({}); // { roomId: [] }
  const [onlineCount, setOnlineCount] = useState({});  // { roomId: number }
  const [connected, setConnected] = useState(socket.connected);
  const joinedRef = useRef(null);

  // Fetch rooms on mount
  useEffect(() => {
    if (!nickname) return;
    fetch(`${SERVER_URL}/rooms`)
      .then(r => r.json())
      .then(data => {
        setRooms(data);
        if (data.length > 0) setCurrentRoomId(data[0].id);
      })
      .catch(console.error);
  }, [nickname]);

  // Socket lifecycle
  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
  }, []);

  // New message from server
  useEffect(() => {
    const handler = (msg) => {
      setMessages(prev => ({
        ...prev,
        [msg.room_id]: [...(prev[msg.room_id] || []), msg],
      }));
    };
    socket.on('message:new', handler);
    return () => socket.off('message:new', handler);
  }, []);

  // Online count updates
  useEffect(() => {
    const handler = ({ roomId, count }) => {
      setOnlineCount(prev => ({ ...prev, [roomId]: count }));
    };
    socket.on('room:online', handler);
    return () => socket.off('room:online', handler);
  }, []);

  // New room created by someone else
  useEffect(() => {
    const handler = (room) => {
      setRooms(prev => prev.find(r => r.id === room.id) ? prev : [...prev, room]);
    };
    socket.on('room:created', handler);
    return () => socket.off('room:created', handler);
  }, []);

  // Join room + fetch history when currentRoomId changes
  useEffect(() => {
    if (!currentRoomId || !nickname) return;
    if (joinedRef.current === currentRoomId) return;
    joinedRef.current = currentRoomId;

    socket.emit('room:join', { roomId: currentRoomId, nickname });

    if (!messages[currentRoomId]) {
      fetch(`${SERVER_URL}/rooms/${currentRoomId}/messages`)
        .then(r => r.json())
        .then(data => {
          setMessages(prev => ({ ...prev, [currentRoomId]: data }));
        })
        .catch(console.error);
    }
  }, [currentRoomId, nickname]);

  const switchRoom = useCallback((roomId) => {
    joinedRef.current = null;
    setCurrentRoomId(roomId);
  }, []);

  const sendMessage = useCallback((content) => {
    if (!content.trim() || !currentRoomId) return;
    socket.emit('message:send', { roomId: currentRoomId, nickname, content });
  }, [currentRoomId, nickname]);

  const createRoom = useCallback(async (name) => {
    const res = await fetch(`${SERVER_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create room');
    }
    const room = await res.json();
    setRooms(prev => prev.find(r => r.id === room.id) ? prev : [...prev, room]);
    switchRoom(room.id);
    return room;
  }, [switchRoom]);

  const currentRoom = rooms.find(r => r.id === currentRoomId) || null;
  const currentMessages = messages[currentRoomId] || [];
  const currentOnline = onlineCount[currentRoomId] || 1;

  return {
    rooms,
    currentRoom,
    currentRoomId,
    currentMessages,
    currentOnline,
    connected,
    switchRoom,
    sendMessage,
    createRoom,
  };
}
