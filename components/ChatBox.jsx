// ✅ MongoDB + NextAuth 기반 ChatBox.jsx 완성형
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

function ChatBox({ matchId }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages?matchId=${matchId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("메시지 불러오기 오류:", err);
      }
    };
    if (matchId) fetchMessages();
  }, [matchId]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !userId) return;
    try {
      await axios.post("/api/messages", {
        matchId,
        text,
        sender: userId,
      });
      setInput("");
      const res = await axios.get(`/api/messages?matchId=${matchId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("메시지 전송 오류:", err);
    }
  };

  return (
    <div>
      <div className="h-64 overflow-y-auto bg-gray-50 p-3 border border-gray-300 rounded-lg mb-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`text-sm mb-1 ${msg.sender === userId ? "text-right text-blue-600" : "text-left text-gray-800"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 text-sm"
        >
          전송
        </button>
      </div>
    </div>
  );
}

export default ChatBox;