import { useEffect, useRef } from 'react';
import styles from './MessageList.module.css';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Group consecutive messages by same author
function groupMessages(messages) {
  const groups = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.nick === msg.nickname) {
      last.messages.push(msg);
    } else {
      groups.push({ nick: msg.nickname, messages: [msg] });
    }
  }
  return groups;
}

export default function MessageList({ messages, nickname }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        No messages yet — say something!
      </div>
    );
  }

  const groups = groupMessages(messages);

  return (
    <div className={styles.list}>
      {groups.map((group, i) => {
        const isMe = group.nick === nickname;
        const firstMsg = group.messages[0];
        return (
          <div key={i} className={styles.group}>
            <div className={styles.meta}>
              <span className={`${styles.nick} ${isMe ? styles.isMe : ''}`}>{group.nick}</span>
              <span className={styles.time}>{formatTime(firstMsg.created_at)}</span>
            </div>
            {group.messages.map(msg => (
              <p key={msg.id} className={styles.text}>{msg.content}</p>
            ))}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
