import { useRef, useState } from "react";
import { Button, message } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import jsQR from "jsqr";

interface CameraScannerProps {
  onResult: (code: string) => void;
  buttonText?: string;
}

const CameraScanner = ({ onResult, buttonText = "扫码" }: CameraScannerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { message.error("无法读取图片"); return; }
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      URL.revokeObjectURL(url);

      if (code) {
        onResult(code.data);
      } else {
        message.warning("未识别到二维码，请重拍");
      }
    } catch {
      message.error("扫码失败");
    } finally {
      setScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <Button icon={<CameraOutlined />} onClick={() => inputRef.current?.click()} loading={scanning}>
        {buttonText}
      </Button>
    </>
  );
};

export default CameraScanner;
