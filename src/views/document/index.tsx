import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Space, message, Tag } from "antd";
import EasyTable, { type ColumnSchema, type ActionSchema } from "../../components/EasyTable";
import { getDocuments, deleteDocument, TYPE_MAP, STATUS_MAP, getStatusColor } from "./store";

const DocumentList = () => {
  const navigate = useNavigate();
  const [allDocuments] = useState(getDocuments());
  const [searchKeyword, setSearchKeyword] = useState("");
  const [current, setCurrent] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    if (!searchKeyword.trim()) return allDocuments;
    const kw = searchKeyword.trim().toLowerCase();
    return allDocuments.filter(
      (d) => d.code.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw),
    );
  }, [allDocuments, searchKeyword]);

  const pagedData = useMemo(() => {
    const start = (current - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, current]);

  const handleSearch = useCallback(() => {
    setCurrent(1);
  }, []);

  const handleDelete = useCallback(
    (record: Record<string, unknown>) => {
      deleteDocument(record.id as number);
      message.success("删除成功");
      navigate(0);
    },
    [navigate],
  );

  const columns: ColumnSchema[] = [
    {
      key: "code",
      title: "单据编号",
      dataIndex: "code",
      width: 140,
    },
    {
      key: "name",
      title: "单据名称",
      dataIndex: "name",
      width: 180,
    },
    {
      key: "supplierName",
      title: "供应商",
      dataIndex: "supplierName",
      width: 160,
    },
    {
      key: "type",
      title: "单据类型",
      dataIndex: "type",
      width: 100,
      format: (value) => TYPE_MAP[String(value)] ?? String(value),
    },
    {
      key: "amount",
      title: "金额",
      dataIndex: "amount",
      width: 120,
      align: "right",
      format: (value) => `¥ ${Number(value).toLocaleString()}`,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 120,
      format: (value) => {
        const label = STATUS_MAP[String(value)] || String(value);
        return <Tag color={getStatusColor(String(value))}>{label}</Tag>;
      },
    },
    {
      key: "createTime",
      title: "创建时间",
      dataIndex: "createTime",
      width: 180,
    },
  ];

  const actions: ActionSchema[] = [
    {
      key: "edit",
      text: "编辑",
      type: "primary",
      onClick: (record) => {
        navigate(`/document/form/${record.id}`);
      },
    },
    {
      key: "delete",
      text: "删除",
      danger: true,
      confirm: "确定要删除此单据吗？",
      onClick: handleDelete,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>单据管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="单据编号/名称"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 240 }}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
        <Button type="primary" onClick={() => navigate("/document/form")}>
          新建单据
        </Button>
      </Space>
      <EasyTable
        columns={columns}
        dataSource={pagedData as unknown as Record<string, unknown>[]}
        showActions
        actions={actions}
        actionsWidth={150}
        hasBorder
        isZebra
        loading={false}
        pagination={{
          current,
          pageSize,
          total: filteredData.length,
          onChange: (page) => setCurrent(page),
        }}
      />
    </div>
  );
};

export default DocumentList;
