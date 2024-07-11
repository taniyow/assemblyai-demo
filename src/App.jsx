import React, { useEffect, useRef, useState } from "react";
import { useAssemblyAI } from "./context/assemblyai-provider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "./context/microphone-provider";
import Visualizer from "./components/visualizer";

const App = () => {
  const [caption, setCaption] = useState("Powered by AssemblyAI");
  const { transcript, startRecording, stopRecording, addAudioChunk } =
    useAssemblyAI();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    pauseMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone();
  const captionTimeout = useRef(null);

  useEffect(() => {
    setupMicrophone();
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      console.log("Microphone is ready, starting recording...");
      startRecording();
    }
  }, [microphoneState, startRecording]);

  useEffect(() => {
    if (!microphone) return;

    const onData = (e) => {
      addAudioChunk(e.data);
    };

    if (microphoneState === MicrophoneState.Open) {
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();
    }

    return () => {
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
  }, [microphoneState, microphone, startMicrophone, addAudioChunk]);

  useEffect(() => {
    if (transcript) {
      setCaption(transcript);
      clearTimeout(captionTimeout.current);
      captionTimeout.current = setTimeout(() => {
        setCaption(undefined);
        clearTimeout(captionTimeout.current);
      }, 3000);
    }
  }, [transcript]);

  return (
    <div className="flex h-full antialiased">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <div className="flex flex-col flex-auto h-full">
          <div className="relative w-full h-full">
            {microphone && <Visualizer microphone={microphone} />}
            <div className="absolute bottom-[8rem] inset-x-0 max-w-4xl mx-auto text-center px-10">
              {caption && <span className="bg-black/70 p-8">{caption}</span>}
            </div>
            <div className="absolute bottom-10 left-10">
              <button
                onClick={startMicrophone}
                disabled={microphoneState === MicrophoneState.Open}
              >
                Start
              </button>
              <button
                onClick={pauseMicrophone}
                disabled={microphoneState !== MicrophoneState.Open}
              >
                Pause
              </button>
              <button
                onClick={stopMicrophone}
                disabled={microphoneState === MicrophoneState.Stopped}
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
