import { useState, useRef } from "react";
import { Button, Tooltip } from "antd";
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons";

interface VoiceInputProps {
  onResult: (text: string) => void;
}

const VoiceInput = ({ onResult }: VoiceInputProps) => {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleClick = () => {
    if (!supported) return;

    const SpeechRecognitionCtor: SpeechRecognitionConstructor | undefined =
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition as SpeechRecognitionConstructor
      || (window as unknown as Record<string, unknown>).SpeechRecognition as SpeechRecognitionConstructor;

    if (!SpeechRecognitionCtor) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };

    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => { setListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (!supported) return null;

  return (
    <Tooltip title={listening ? "点击停止" : "语音输入"}>
      <Button
        icon={listening ? <AudioMutedOutlined /> : <AudioOutlined />}
        onClick={handleClick}
        type={listening ? "primary" : "default"}
        danger={listening}
        size="small"
      />
    </Tooltip>
  );
};

export default VoiceInput;
