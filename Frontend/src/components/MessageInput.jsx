import { useState } from "react";
import "../styles/MessageInput.css";

const MessageInput = ({ onSend, onTyping }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleTyping = () => {
    if (onTyping) onTyping();
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleTyping}
        className="message-input"
      />
      <button type="submit" className="send-btn">
        ➤
      </button>
    </form>
  );
};

export default MessageInput;
