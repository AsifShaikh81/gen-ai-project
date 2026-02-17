import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [text, setText] = useState(""); // for onchange
  // this state for getting text and appending to user text div.
  // using local storage kyu ki after refresh text should not be disappear
  const [message, setMessage] = useState(() => {
    const saved = localStorage.getItem("Message-key");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
   //* gen random key
  const conversationId = Date.now().toString(36) +  Math.random().toString(36).substring(2,8)
  

  const handleOnChange = (e) => {
    setText(e.target.value);
  };

  //*storing msg in local storage
  useEffect(() => {
    localStorage.setItem("Message-key", JSON.stringify(message));
  }, [message]);

  //*auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, loading]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const userMessage = text;
    setMessage((prev) => [...prev, { role: "user", content: userMessage }]);
    setText("");

    //*fetching chatbot api
    try {
      setLoading(true);
      const response = await axios.post("api/chat", {
        conversationId,
        message: userMessage
      });
      /* const response = await axios.post("http://localhost:3001/chat", {
        conversationId,
        message: userMessage
      }); */
      setLoading(false);

      setMessage((prev) => [
        ...prev,
        { role: "assistant", content: response.data.message },
      ]);
    } catch (error) {
      console.log("Error", error.message);
    }
  };
  // console.log(text)
  return (
    <div className="bg-neutral-950 overflow-x-hidden text-white min-h-screen ">
      {/* chat container */}
      <div className="container mx-auto border-amber-100 max-w-3xl pb-44">
        {/* messages */}
        {/* user & assistant message */}
        {message.map((msg, index) => (
          <div
            key={index}
            className={`my-6 p-3 rounded-xl max-w-fit ${msg.role === "user" ? "bg-neutral-800 ml-auto" : "bg-neutral-900"}`}
          >
            {msg.content}
          </div>
        ))}
        {/* loading state */}
        {loading && <div className="animate-pulse">Thinking...</div>}
        <div ref={bottomRef}></div>
        {/* bottom chatbox*/}
        <div className="fixed inset-x-0 bottom-0 flex justify-center bg-neutral-900">
          <div className="bg-neutral-800 p-2 rounded-3xl w-full max-w-3xl mb-3">
            <textarea
              className="w-full resize-none outline-0 p-3"
              rows="2"
              id=""
              value={text}
              onChange={handleOnChange}
            ></textarea>
            <div className="flex justify-end items-center">
              <button
                className="bg-white text-black px-4 py-1 rounded-full cursor-pointer hover:bg-gray-200"
                onClick={handleSubmit}
              >
                {" "}
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
