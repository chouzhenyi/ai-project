import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, message, Spin, Modal, Input, Image } from "antd";
import EasyForm, { type FormSchema, type FormInstance } from "@components/EasyForm";
import { itemsApi, type Item } from "../../api/items";
import { aiApi } from "../../api/ai";

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef<FormInstance>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(id) && id !== "new";

  useEffect(() => {
    if (id && id !== "new") {
      setLoading(true);
      itemsApi.getById(id).then((item) => {
        setInitialValues(item as unknown as Record<string, unknown>);
        const paths = item.photoPaths ? JSON.parse(item.photoPaths) : [];
        setPhotos(paths);
        setEditNotes(item.notes || "");
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/photos/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.data?.url) {
        const updated = [...photos, json.data.url];
        setPhotos(updated);

        // Try AI identify from photo
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const result = await aiApi.identify(base64);
            if (result.notes) {
              setEditNotes(result.notes.slice(0, 200));
              if (result.name) {
                formRef.current?.setValues({ name: result.name });
              }
              message.success("AI 已识别物品并生成注意事项");
            }
          } catch {
            // vision not available, user can type manually
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      message.error("上传失败");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSuggest = async () => {
    const name = formRef.current?.getValues()?.name as string;
    if (!name) { message.warning("请先输入物品名称"); return; }
    setAiLoading(true);
    try {
      const result = await aiApi.suggestNotes(name);
      if (result.source === "ai") {
        Modal.confirm({
          title: "AI 建议",
          content: (
            <div>
              <p><b>注意事项：</b>{result.notes || "无"}</p>
              <p><b>保质期：</b>{result.shelfLife || "未知"}</p>
              <p><b>存放要求：</b>{result.storageRequirements ? JSON.stringify(result.storageRequirements) : "无"}</p>
            </div>
          ),
          onOk: () => {
            formRef.current?.setValues({
              notes: result.notes,
              expiryDate: result.shelfLife || undefined,
              storageRequirements: result.storageRequirements ? JSON.stringify(result.storageRequirements) : undefined,
            });
          },
        });
      } else {
        message.info("AI 未配置或暂不可用，请手动填写");
      }
    } catch {
      message.error("AI 服务暂不可用");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const payload = { ...values, notes: editNotes || values.notes, photoPaths: JSON.stringify(photos) };
      if (isEdit) {
        await itemsApi.update(id!, payload as Partial<Item>);
        message.success("更新成功");
      } else {
        await itemsApi.create(payload as Partial<Item>);
        message.success("创建成功");
      }
      navigate("/items");
    } catch {
      message.error("保存失败");
    }
  };

  const schema: FormSchema[] = [
    { name: "name", label: "物品名称", component: "Input", required: true, span: 12 },
    {
      name: "categoryId", label: "分类", component: "Select", span: 12,
      options: [
        { label: "食品饮料", value: "food" }, { label: "药品保健", value: "medicine" },
        { label: "日用百货", value: "daily" }, { label: "电子产品", value: "electronics" },
        { label: "运动器材", value: "sports" }, { label: "工具五金", value: "tools" },
        { label: "衣物鞋帽", value: "clothing" }, { label: "厨房用品", value: "kitchen" },
        { label: "其他", value: "other" },
      ],
    },
    { name: "brand", label: "品牌", component: "Input", span: 8 },
    { name: "model", label: "型号/规格", component: "Input", span: 8 },
    { name: "unit", label: "单位", component: "Input", span: 8, defaultValue: "个" },
    { name: "quantity", label: "数量", component: "NumberPicker", span: 12, componentProps: { min: 0, precision: 2 } },
    { name: "minStock", label: "低库存预警", component: "NumberPicker", span: 12, componentProps: { min: 0, precision: 0 } },
    { name: "productionDate", label: "生产日期", component: "DatePicker", span: 12 },
    { name: "expiryDate", label: "到期日期", component: "DatePicker", span: 12 },
    { name: "storageRequirements", label: "存放要求", component: "Input.TextArea", span: 24, componentProps: { rows: 2, placeholder: "如：冷藏保存、避光干燥" } },
  ];

  if (loading) return <Spin style={{ display: "block", margin: "100px auto" }} />;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? "编辑物品" : "新增物品"}</h2>
      <Card>
        {/* Photo + AI section */}
        <div style={{ marginBottom: 16, padding: 16, background: "#fafafa", borderRadius: 8 }}>
          <p><b>物品照片</b><span style={{ color: "#999", fontWeight: 400, marginLeft: 8 }}>拍照后 AI 自动识别并生成注意事项</span></p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {photos.map((url) => (
              <Image key={url} src={url} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoUpload} />
          <Button onClick={() => fileRef.current?.click()} loading={aiLoading}>
            {photos.length > 0 ? "添加/更换照片" : "拍照/选择照片"}
          </Button>
          {photos.length > 0 && (
            <Button onClick={() => setPhotos([])} style={{ marginLeft: 8 }}>清除照片</Button>
          )}
        </div>

        {/* Notes section */}
        <div style={{ marginBottom: 16, padding: 16, background: "#fafafa", borderRadius: 8 }}>
          <p><b>注意事项</b><span style={{ color: "#999", fontWeight: 400, marginLeft: 8 }}>可手动输入，建议先拍照让 AI 自动生成</span></p>
          <Input.TextArea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value.slice(0, 200))}
            rows={3}
            maxLength={200}
            showCount
            placeholder="拍照后 AI 自动生成，也可手动输入"
          />
          <Button onClick={handleAiSuggest} loading={aiLoading} style={{ marginTop: 8 }}>
            🤖 按名称 AI 建议
          </Button>
        </div>

        <EasyForm
          ref={formRef}
          schema={schema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          columns={2}
          submitText="保存"
        />
      </Card>
    </div>
  );
};

export default ItemForm;
