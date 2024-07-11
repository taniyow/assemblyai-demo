import React, { createContext, useContext, useState, useEffect } from "react";
import { AssemblyAI } from "assemblyai";

const AssemblyAIContext = createContext(undefined);

const API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;

const AssemblyAIContextProvider = ({ children }) => {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcriber, setTranscriber] = useState(null);

  useEffect(() => {
    const client = new AssemblyAI({ apiKey: API_KEY });
    const transcriber = client.realtime.transcriber({
      sampleRate: 16000,
      headers: {
        Authorization: API_KEY,
      },
    });

    console.log("Transcriber created", transcriber);

    transcriber.on("open", ({ sessionId }) => {
      console.log(`Session opened with ID: ${sessionId}`);
    });

    transcriber.on("error", (error) => {
      console.error("Error:", error);
    });

    transcriber.on("close", (code, reason) => {
      console.log("Session closed:", code, reason);
    });

    transcriber.on("transcript", (transcript) => {
      console.log("Received:", transcript);

      if (!transcript.text) {
        return;
      }

      if (transcript.message_type === "FinalTranscript") {
        console.log("Final:", transcript.text);
        setTranscript(transcript.text);
      } else {
        console.log("Partial:", transcript.text);
        setTranscript(transcript.text);
      }
    });

    setTranscriber(transcriber);
  }, []);

  const startRecording = async () => {
    if (transcriber) {
      console.log("Connecting to real-time transcript service");
      await transcriber.connect();
      setIsRecording(true);
    }
  };

  const stopRecording = async () => {
    if (transcriber) {
      await transcriber.close();
      setIsRecording(false);
    }
  };

  const addAudioChunk = (chunk) => {
    if (isRecording && transcriber) {
      transcriber.send(chunk);
    }
  };

  return (
    <AssemblyAIContext.Provider
      value={{
        transcript,
        startRecording,
        stopRecording,
        addAudioChunk,
      }}
    >
      {children}
    </AssemblyAIContext.Provider>
  );
};

function useAssemblyAI() {
  const context = useContext(AssemblyAIContext);
  if (context === undefined) {
    throw new Error(
      "useAssemblyAI must be used within an AssemblyAIContextProvider",
    );
  }
  return context;
}

export { AssemblyAIContextProvider, useAssemblyAI };
