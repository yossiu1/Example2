import { useState } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar({ rooms, currentRoomId, nickname, onSwitch, onCreateRoom }) {
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const name = roomName.trim();
    if (!name) return;
    setLoading(true);
    setError('');
    try {
      await onCreateRoom(name);
      setRoomName('');
      setShowModal(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <span className={styles.logo}>Open Chat</span>
          <div className={styles.nickBadge}>
            <span className={styles.dot} />
            <span className={styles.nick}>{nickname}</span>
          </div>
        </div>

        <div className={styles.label}>Rooms</div>
        <nav className={styles.roomList}>
          {rooms.map(room => (
            <button
              key={room.id}
              className={`${styles.roomItem} ${room.id === currentRoomId ? styles.active : ''}`}
              onClick={() => onSwitch(room.id)}
            >
              <span className={styles.hash}>#</span>
              {room.name}
            </button>
          ))}
        </nav>

        <button className={styles.addRoom} onClick={() => setShowModal(true)}>
          + new room
        </button>
      </aside>

      {showModal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Create a new room</h3>
            <input
              className={styles.modalInput}
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="room-name"
              maxLength={32}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.createBtn} onClick={handleCreate} disabled={loading}>
                {loading ? '...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
