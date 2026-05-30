import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Space, message, Spin } from "antd";
import { ScanOutlined } from "@ant-design/icons";
import CameraScanner from "../components/CameraScanner";
import { api } from "../api/client";

const ScanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleScan = async (code: string) => {
    setLoading(true);
    try {
      const data = await api.post<{ scanType: string; id: string; name: string }>("/scan", { code });
      if (data.scanType === "container") {
        navigate(`/m/box/${data.id}`);
      } else {
        navigate(`/m/item/${data.id}`);
      }
    } catch {
      message.error("未识别到有效二维码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h2 style={{ marginBottom: 24 }}>扫描二维码</h2>
      <Card style={{ maxWidth: 400, margin: "0 auto" }}>
        {loading ? (
          <Spin tip="正在识别..." style={{ display: "block", marginTop: 80, marginBottom: 80 }} />
        ) : (
          <>
            <div style={{ fontSize: 80, color: "#1890ff", marginBottom: 24 }}>
              <ScanOutlined />
            </div>
            <CameraScanner onResult={handleScan} buttonText="拍照扫码" />
            <p style={{ marginTop: 16, color: "#999" }}>
              对准容器或物品上的二维码拍照即可识别
            </p>
          </>
        )}
      </Card>
      <Space style={{ marginTop: 16 }}>
        <Button onClick={() => navigate("/m/checkin")}>手动入库</Button>
        <Button onClick={() => navigate("/m/new-container")}>+ 新建容器</Button>
      </Space>
    </div>
  );
};

export default ScanPage;
