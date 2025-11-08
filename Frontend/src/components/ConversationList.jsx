import "../styles/Messages.css";

const ConversationList = ({ conversations, userId, onSelect, selectedChat }) => {
  return (
    <div className="conversation-list">
      <h3>Chats</h3>
      {conversations.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        conversations.map((conv) => {
          const partner = conv.participants.find((p) => p._id !== userId);
          return (
            <div
              key={conv._id}
              className={`conversation-item ${
                selectedChat?._id === conv._id ? "active" : ""
              }`}
              onClick={() => onSelect(conv)}
            >
              <img
                src={partner?.avatar || "https://via.placeholder.com/40"}
                alt="avatar"
                className="conv-avatar"
              />
              <div>
                <h4>@{partner?.username}</h4>
                <p className="last-message">
                  {conv.lastMessage?.text?.slice(0, 30) || "No messages yet"}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
