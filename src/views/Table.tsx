import { useRef, useState, useCallback, useMemo } from "react";
import EasyTable, {
  type ColumnSchema,
  type ActionSchema,
  type TableInstance,
} from "../components/EasyTable";
import { Button, Card, Tabs, message, Tag } from "antd";

// ============ 示例1: 基础表格 ============
const BasicTableDemo = () => {
  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    { key: "name", title: "姓名", dataIndex: "name", width: 120 },
    { key: "age", title: "年龄", dataIndex: "age", width: 80, align: "center" },
    { key: "email", title: "邮箱", dataIndex: "email", width: 200 },
    { key: "address", title: "地址", dataIndex: "address" },
  ];

  const dataSource = [
    { id: 1, name: "张三", age: 28, email: "zhangsan@example.com", address: "北京市朝阳区" },
    { id: 2, name: "李四", age: 32, email: "lisi@example.com", address: "上海市浦东新区" },
    { id: 3, name: "王五", age: 25, email: "wangwu@example.com", address: "广州市天河区" },
    { id: 4, name: "赵六", age: 35, email: "zhaoliu@example.com", address: "深圳市南山区" },
  ];

  return <EasyTable columns={columns} dataSource={dataSource} showIndex hasBorder isZebra />;
};

// ============ 示例2: 带操作列的表格 ============
const ActionTableDemo = () => {
  const tableRef = useRef<TableInstance>(null);

  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    { key: "name", title: "姓名", dataIndex: "name", width: 120 },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      format: (value) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: "success", text: "启用" },
          inactive: { color: "error", text: "禁用" },
          pending: { color: "warning", text: "待审核" },
        };
        const status = statusMap[String(value)] || { color: "default", text: "未知" };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    { key: "createTime", title: "创建时间", dataIndex: "createTime", width: 180 },
  ];

  const [data, setData] = useState([
    { id: 1, name: "张三", status: "active", createTime: "2024-01-15 10:30:00" },
    { id: 2, name: "李四", status: "inactive", createTime: "2024-01-16 14:20:00" },
    { id: 3, name: "王五", status: "pending", createTime: "2024-01-17 09:00:00" },
  ]);

  const actions: ActionSchema[] = [
    {
      key: "view",
      text: "查看",
      type: "primary",
      onClick: (record) => {
        message.info(`查看: ${record.name}`);
      },
    },
    {
      key: "edit",
      text: "编辑",
      onClick: (record) => {
        message.info(`编辑: ${record.name}`);
      },
    },
    {
      key: "delete",
      text: "删除",
      danger: true,
      confirm: "确定要删除此记录吗？",
      onClick: (record) => {
        setData((prev) => prev.filter((item) => item.id !== record.id));
        message.success("删除成功");
      },
    },
  ];

  return (
    <EasyTable
      ref={tableRef}
      columns={columns}
      dataSource={data}
      showActions
      actions={actions}
      actionsWidth={200}
    />
  );
};

// ============ 示例3: 可选择表格 ============
const SelectionTableDemo = () => {
  const tableRef = useRef<TableInstance>(null);
  const [selectedInfo, setSelectedInfo] = useState<string>("");

  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    { key: "name", title: "姓名", dataIndex: "name", width: 120 },
    { key: "department", title: "部门", dataIndex: "department", width: 150 },
    { key: "position", title: "职位", dataIndex: "position" },
  ];

  const dataSource = [
    { id: 1, name: "张三", department: "技术部", position: "前端工程师" },
    { id: 2, name: "李四", department: "产品部", position: "产品经理" },
    { id: 3, name: "王五", department: "设计部", position: "UI设计师" },
    { id: 4, name: "赵六", department: "技术部", position: "后端工程师" },
    { id: 5, name: "钱七", department: "运营部", position: "运营专员" },
  ];

  const handleSelectionChange = (keys: (string | number)[], rows: Record<string, unknown>[]) => {
    setSelectedInfo(`已选择 ${keys.length} 条数据: ${rows.map((r) => r.name).join(", ")}`);
  };

  const handleBatchDelete = () => {
    const selectedRows = tableRef.current?.getSelectedRows() || [];
    if (selectedRows.length === 0) {
      message.warning("请先选择数据");
      return;
    }
    message.success(`批量删除 ${selectedRows.length} 条数据`);
    tableRef.current?.setSelectedRows([]);
  };

  return (
    <div>
      <EasyTable
        ref={tableRef}
        columns={columns}
        dataSource={dataSource}
        showSelection
        onSelectionChange={handleSelectionChange}
        renderToolbar={() => (
          <Button danger onClick={handleBatchDelete}>
            批量删除
          </Button>
        )}
      />
      {selectedInfo && <div style={{ marginTop: 16, color: "#666" }}>{selectedInfo}</div>}
    </div>
  );
};

// ============ 示例4: 可编辑表格（行编辑） ============
const EditableTableDemo = () => {
  const tableRef = useRef<TableInstance>(null);

  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80, editable: false },
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      width: 120,
      type: "input",
      editable: true,
      validator: (value) => {
        if (!value) return "姓名不能为空";
        if (String(value).length < 2) return "姓名至少2个字符";
        return true;
      },
    },
    {
      key: "age",
      title: "年龄",
      dataIndex: "age",
      width: 100,
      type: "number",
      editable: true,
      min: 0,
      max: 150,
    },
    {
      key: "gender",
      title: "性别",
      dataIndex: "gender",
      width: 100,
      type: "select",
      editable: true,
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
    },
    {
      key: "email",
      title: "邮箱",
      dataIndex: "email",
      type: "input",
      editable: true,
    },
  ];

  const [data, setData] = useState([
    { id: 1, name: "张三", age: 28, gender: "male", email: "zhangsan@example.com" },
    { id: 2, name: "李四", age: 32, gender: "male", email: "lisi@example.com" },
    { id: 3, name: "王五", age: 25, gender: "female", email: "wangwu@example.com" },
  ]);

  const handleChange = useCallback((newData: Record<string, unknown>[]) => {
    setData(newData as typeof data);
  }, []);

  return (
    <div>
      <p style={{ marginBottom: 16, color: "#666" }}>
        提示：点击"编辑"按钮进入行编辑模式，修改后点击"保存"或"取消"。
      </p>
      <EasyTable
        ref={tableRef}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        editable
        editMode="row"
        showActions
        actionsWidth={120}
      />
    </div>
  );
};

// ============ 示例5: 可新增删除的表格 ============
const CrudTableDemo = () => {
  const tableRef = useRef<TableInstance>(null);
  const [idCounter, setIdCounter] = useState(100);

  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      width: 120,
      type: "input",
      editable: true,
    },
    {
      key: "age",
      title: "年龄",
      dataIndex: "age",
      width: 100,
      type: "number",
      editable: true,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 120,
      type: "select",
      editable: true,
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
      format: (value) => (
        <Tag color={value === 1 ? "success" : "error"}>{value === 1 ? "启用" : "禁用"}</Tag>
      ),
    },
    { key: "remark", title: "备注", dataIndex: "remark", type: "input", editable: true },
  ];

  const [data, setData] = useState([
    { id: 1, name: "张三", age: 28, status: 1, remark: "测试数据" },
    { id: 2, name: "李四", age: 32, status: 0, remark: "" },
  ]);

  const handleChange = (newData: Record<string, unknown>[]) => {
    setData(newData as typeof data);
  };

  const handleAdd = () => {
    const newId = idCounter + 1;
    setIdCounter(newId);
    tableRef.current?.addRow({
      id: newId,
      name: "",
      age: 18,
      status: 1,
      remark: "",
    });
    message.success("新增成功，请编辑数据");
  };

  const handleDelete = (keys: (string | number)[]) => {
    tableRef.current?.deleteRows(keys);
    message.success(`删除 ${keys.length} 条数据`);
  };

  return (
    <div>
      <EasyTable
        ref={tableRef}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        editable
        editMode="row"
        showSelection
        showActions
        showAddButton
        addButtonText="新增用户"
        onAddClick={handleAdd}
        showDeleteButton
        deleteButtonText="删除选中"
        onDelete={handleDelete}
        defaultRowData={{ status: 1 }}
      />
      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            const changes = tableRef.current?.getChanges();
            console.log("变更记录:", changes);
            message.success("请查看控制台输出");
          }}
        >
          查看变更记录
        </Button>
      </div>
    </div>
  );
};

// ============ 示例6: 带格式化的表格 ============
const FormatTableDemo = () => {
  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      width: 120,
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{String(value)}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{String(record.email)}</div>
        </div>
      ),
    },
    {
      key: "avatar",
      title: "头像",
      dataIndex: "avatar",
      width: 80,
      align: "center",
      render: (value) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#1890ff",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          {String(value || "?")
            .charAt(0)
            .toUpperCase()}
        </div>
      ),
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
      key: "progress",
      title: "进度",
      dataIndex: "progress",
      width: 150,
      render: (value) => {
        const percent = Number(value);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 8,
                background: "#e8e8e8",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  background: percent >= 80 ? "#52c41a" : percent >= 50 ? "#1890ff" : "#faad14",
                }}
              />
            </div>
            <span style={{ fontSize: 12 }}>{percent}%</span>
          </div>
        );
      },
    },
    {
      key: "tags",
      title: "标签",
      dataIndex: "tags",
      render: (value) => {
        const tags = value as string[];
        return (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tags?.map((tag) => (
              <Tag key={tag} color="processing">
                {tag}
              </Tag>
            ))}
          </div>
        );
      },
    },
  ];

  const dataSource = [
    {
      id: 1,
      name: "张三",
      email: "zhangsan@example.com",
      avatar: "张",
      amount: 12500,
      progress: 85,
      tags: ["前端", "React"],
    },
    {
      id: 2,
      name: "李四",
      email: "lisi@example.com",
      avatar: "李",
      amount: 8900,
      progress: 60,
      tags: ["后端", "Java"],
    },
    {
      id: 3,
      name: "王五",
      email: "wangwu@example.com",
      avatar: "王",
      amount: 15600,
      progress: 45,
      tags: ["设计", "UI"],
    },
  ];

  return <EasyTable columns={columns} dataSource={dataSource} hasBorder />;
};

// ============ 示例7: 分页表格 ============
const PaginationTableDemo = () => {
  const [current, setCurrent] = useState(1);
  const pageSize = 5;

  // 模拟大量数据
  const allData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `138${String(i).padStart(8, "0")}`,
      status: i % 3 === 0 ? "active" : i % 3 === 1 ? "inactive" : "pending",
    }));
  }, []);

  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80, sortable: true },
    { key: "name", title: "姓名", dataIndex: "name", width: 120 },
    { key: "email", title: "邮箱", dataIndex: "email" },
    { key: "phone", title: "手机号", dataIndex: "phone", width: 150 },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      format: (value) => {
        const map: Record<string, { color: string; text: string }> = {
          active: { color: "success", text: "启用" },
          inactive: { color: "error", text: "禁用" },
          pending: { color: "warning", text: "待审核" },
        };
        const s = map[String(value)];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrent(page);
  };

  return (
    <EasyTable
      columns={columns}
      dataSource={allData}
      pagination={{
        current,
        pageSize,
        total: allData.length,
        onChange: handlePageChange,
      }}
      showIndex
    />
  );
};

// ============ 示例8: 完整功能表格 ============
const CompleteTableDemo = () => {
  const tableRef = useRef<TableInstance>(null);
  const [idCounter, setIdCounter] = useState(100);

  const columns: ColumnSchema[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 70, editable: false },
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      width: 100,
      type: "input",
      editable: true,
      required: true,
    },
    {
      key: "age",
      title: "年龄",
      dataIndex: "age",
      width: 80,
      type: "number",
      editable: true,
      min: 18,
      max: 65,
    },
    {
      key: "gender",
      title: "性别",
      dataIndex: "gender",
      width: 80,
      type: "select",
      editable: true,
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
      format: (v) => (v === "male" ? "男" : "女"),
    },
    {
      key: "department",
      title: "部门",
      dataIndex: "department",
      width: 120,
      type: "select",
      editable: true,
      options: [
        { label: "技术部", value: "tech" },
        { label: "产品部", value: "product" },
        { label: "设计部", value: "design" },
        { label: "运营部", value: "operation" },
      ],
    },
    {
      key: "salary",
      title: "薪资",
      dataIndex: "salary",
      width: 100,
      type: "number",
      editable: true,
      format: (v) => `¥${Number(v).toLocaleString()}`,
    },
    {
      key: "active",
      title: "状态",
      dataIndex: "active",
      width: 80,
      type: "switch",
      editable: true,
      format: (v) => (v ? "在职" : "离职"),
    },
    { key: "remark", title: "备注", dataIndex: "remark", type: "input", editable: true },
  ];

  const [data, setData] = useState([
    {
      id: 1,
      name: "张三",
      age: 28,
      gender: "male",
      department: "tech",
      salary: 15000,
      active: true,
      remark: "",
    },
    {
      id: 2,
      name: "李四",
      age: 32,
      gender: "male",
      department: "product",
      salary: 18000,
      active: true,
      remark: "产品经理",
    },
    {
      id: 3,
      name: "王五",
      age: 25,
      gender: "female",
      department: "design",
      salary: 12000,
      active: true,
      remark: "",
    },
    {
      id: 4,
      name: "赵六",
      age: 35,
      gender: "male",
      department: "tech",
      salary: 20000,
      active: false,
      remark: "已离职",
    },
  ]);

  const actions: ActionSchema[] = [
    {
      key: "detail",
      text: "详情",
      type: "primary",
      onClick: (record) => {
        message.info(`查看详情: ${record.name}`);
      },
    },
  ];

  const handleChange = (newData: Record<string, unknown>[]) => {
    setData(newData as typeof data);
  };

  const handleAdd = () => {
    const newId = idCounter + 1;
    setIdCounter(newId);
    tableRef.current?.addRow({
      id: newId,
      name: "",
      age: 25,
      gender: "male",
      department: "tech",
      salary: 10000,
      active: true,
      remark: "",
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Button type="primary" onClick={handleAdd}>
          新增员工
        </Button>
        <Button
          onClick={() => {
            const changes = tableRef.current?.getChanges();
            console.log("数据变更:", changes);
            message.success("请查看控制台");
          }}
        >
          查看变更
        </Button>
        <Button
          onClick={() => {
            tableRef.current?.validate().then(({ valid, errors }) => {
              if (valid) {
                message.success("验证通过");
              } else {
                console.log("验证错误:", errors);
                message.error("存在验证错误，请查看控制台");
              }
            });
          }}
        >
          验证数据
        </Button>
        <Button
          onClick={() => {
            console.log("当前数据:", tableRef.current?.getData());
            message.success("请查看控制台");
          }}
        >
          获取数据
        </Button>
      </div>
      <EasyTable
        ref={tableRef}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        editable
        editMode="row"
        showIndex
        showSelection
        showActions
        actions={actions}
        actionsWidth={100}
        hasBorder
        isZebra
        maxBodyHeight={400}
      />
    </div>
  );
};

// ============ 主页面 ============
const TableDemo = () => {
  const items = [
    { tab: "基础表格", key: "basic", content: <BasicTableDemo /> },
    { tab: "操作列", key: "action", content: <ActionTableDemo /> },
    { tab: "可选择", key: "selection", content: <SelectionTableDemo /> },
    { tab: "可编辑", key: "editable", content: <EditableTableDemo /> },
    { tab: "增删改", key: "crud", content: <CrudTableDemo /> },
    { tab: "格式化", key: "format", content: <FormatTableDemo /> },
    { tab: "分页", key: "pagination", content: <PaginationTableDemo /> },
    { tab: "完整示例", key: "complete", content: <CompleteTableDemo /> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>EasyTable 配置化表格示例</h2>
      <Tabs
        items={items.map((item) => ({
          key: item.key,
          label: item.tab,
          children: <Card style={{ marginTop: 16 }}>{item.content}</Card>,
        }))}
      />
    </div>
  );
};

export default TableDemo;
