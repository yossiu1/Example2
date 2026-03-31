import { useState } from 'react';
import NicknameScreen from './components/NicknameScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';
import { useChat } from './hooks/useChat.js';
import styles from './App.module.css';

export default function App() {
  const [nickname, setNickname] = useState('');

  const {
    rooms,
    currentRoom,
    currentRoomId,
    currentMessages,
    currentOnline,
    connected,
    switchRoom,
    sendMessage,
    createRoom,
  } = useChat(nickname);

  if (!nickname) {
    return <NicknameScreen onJoin={setNickname} />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        nickname={nickname}
        onSwitch={switchRoom}
        onCreateRoom={createRoom}
      />
      <ChatArea
        room={currentRoom}
        messages={currentMessages}
        nickname={nickname}
        onSend={sendMessage}
        connected={connected}
        onlineCount={currentOnline}
      />
    </div>
  );
}
