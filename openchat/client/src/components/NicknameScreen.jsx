import { useState } from 'react';
import styles from './NicknameScreen.module.css';

export default function NicknameScreen({ onJoin }) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const name = value.trim();
    if (name.length < 1) return;
    onJoin(name);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.icon}>💬</div>
        <h1 className={styles.title}>Open Chat</h1>
        <p className={styles.sub}>No account needed — just pick a name.</p>
        <div className={styles.form}>
          <input
            className={styles.input}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Your nickname..."
            maxLength={32}
            autoFocus
          />
          <button className={styles.btn} onClick={handleSubmit}>Join →</button>
        </div>
      </div>
    </div>
  );
}
