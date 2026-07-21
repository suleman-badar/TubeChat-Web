// show all the previous chats of user 

export default function ChatHistory({ videoId }) {
  const [chatHistory, setChatHistory] = useState([])

  return (
    <div className="chat-history">
      <h3>Previous Chats</h3>
      <ul>
        {chatHistory.map((chat, index) => (
          <li key={index}>{chat}</li>
        ))}
      </ul>
    </div>
  )
}