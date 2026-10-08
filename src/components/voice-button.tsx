"use client";

import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";

export default function VoiceButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggle() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return <button type="button" className="voice-button" onClick={toggle} disabled={!text.trim()}>{speaking ? <Square size={15} fill="currentColor"/> : <Volume2 size={16}/>} {speaking ? "Stop" : label}</button>;
}
