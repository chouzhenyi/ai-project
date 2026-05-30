import { useState } from "react";
import { Image, Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface PhotoGalleryProps {
  photos: string[];
  onPhotosChange?: (photos: string[]) => void;
  readonly?: boolean;
}

const PhotoGallery = ({ photos, onPhotosChange, readonly }: PhotoGalleryProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/photos/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.data?.url) {
        const updated = [...photos, json.data.url];
        onPhotosChange?.(updated);
      }
    } catch {
      message.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    const updated = photos.filter((p) => p !== url);
    onPhotosChange?.(updated);
  };

  return (
    <div>
      <Image.PreviewGroup>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {photos.map((url) => (
            <div key={url} style={{ position: "relative" }}>
              <Image
                src={url}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                preview={{ mask: "查看" }}
              />
              {!readonly && (
                <Button
                  size="small"
                  danger
                  style={{ position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, fontSize: 12 }}
                  onClick={() => handleRemove(url)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
      </Image.PreviewGroup>
      {!readonly && (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => { handleUpload(file); return false; }}
        >
          <Button
            icon={<PlusOutlined />}
            loading={uploading}
            style={{ marginTop: 8 }}
          >
            添加照片
          </Button>
        </Upload>
      )}
    </div>
  );
};

export default PhotoGallery;
