import React, { useEffect, useState } from "react";

export default function App() {
  const [text, setText] = useState(""); // for onchange
  // this state for getting text and appending to user text div.
  // using local storage kyu ki after refresh text should not be invisible
  const [message, setMessage] = useState(() => {
    const saved = localStorage.getItem("Message-key");
    return saved ? JSON.parse(saved) : [];
  });

  const handleOnChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    localStorage.setItem("Message-key", JSON.stringify(message));
  }, [message]);

  const handleSubmit = () => {
    if(!text.trim()) return
    setMessage((prev) => [...prev, text]);
    setText("");
  };
  // console.log(text)
  return (
    <div className="bg-neutral-950 overflow-x-hidden text-white min-h-screen ">
      body
      {/* chat container */}
      <div className="container mx-auto border-amber-100 max-w-3xl pb-44">
        {/* messages */}

        {/* user message */}
        {message.map((msg, index) => (
          <div className="my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit">
            {msg}
          </div>
        ))}

        {/* Assistatn message */}
        <div className="max-w-fit">Assistant</div>

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
