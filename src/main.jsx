import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AssemblyAIContextProvider } from "./context/assemblyai-provider";
import { MicrophoneContextProvider } from "./context/microphone-provider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AssemblyAIContextProvider>
      <MicrophoneContextProvider>
        <App />
      </MicrophoneContextProvider>
    </AssemblyAIContextProvider>
  </React.StrictMode>,
);
