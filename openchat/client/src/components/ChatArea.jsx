import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import styles from './ChatArea.module.css';

export default function ChatArea({ room, messages, nickname, onSend, connected, onlineCount }) {
  return (
    <div className={styles.area}>
      <header className={styles.header}>
        <span className={styles.hash}>#</span>
        <span className={styles.roomName}>{room?.name || '...'}</span>
        <div className={styles.meta}>
          <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} />
          <span className={styles.metaText}>
            {connected ? `${onlineCount} online` : 'reconnecting...'}
          </span>
        </div>
      </header>

      <MessageList messages={messages} nickname={nickname} />

      <MessageInput
        roomName={room?.name}
        onSend={onSend}
        disabled={!connected || !room}
      />
    </div>
  );
}
