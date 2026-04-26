import { useRef, useState, useMemo } from "react";
import EasyForm, { type FormSchema, type FormInstance } from "../components/EasyForm";
import { Button, Card, Tab, Message } from "@alifd/next";

// ============ 示例1: 基础表单 ============
const BasicFormDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "username",
      label: "用户名",
      component: "Input",
      placeholder: "请输入用户名",
      required: true,
      rules: [{ required: "用户名不能为空" }, { min: 3, max: 20 }],
      span: 12,
    },
    {
      name: "password",
      label: "密码",
      component: "Input.Password",
      placeholder: "请输入密码",
      required: true,
      span: 12,
    },
    {
      name: "email",
      label: "邮箱",
      component: "Input",
      placeholder: "请输入邮箱",
      span: 12,
      rules: [{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }],
    },
    {
      name: "phone",
      label: "手机号",
      component: "Input",
      placeholder: "请输入手机号",
      span: 12,
      rules: [{ pattern: /^1[3-9]\d{9}$/ }],
    },
  ];

  return (
    <EasyForm
      schema={schema}
      onSubmit={(values) => {
        console.log("提交数据:", values);
        Message.success("提交成功");
      }}
      columns={2}
    />
  );
};

// ============ 示例2: 字段联动 ============
const LinkedFormDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "userType",
      label: "用户类型",
      component: "Select",
      defaultValue: "personal",
      options: [
        { label: "个人用户", value: "personal" },
        { label: "企业用户", value: "enterprise" },
      ],
      span: 12,
    },
    {
      name: "companyName",
      label: "企业名称",
      component: "Input",
      placeholder: "请输入企业名称",
      visible: (values) => values.userType === "enterprise",
      required: true,
      span: 12,
    },
    {
      name: "companyCode",
      label: "信用代码",
      component: "Input",
      placeholder: "统一社会信用代码",
      visible: (values) => values.userType === "enterprise",
      span: 12,
    },
    {
      name: "contactName",
      label: "联系人",
      component: "Input",
      placeholder: "请输入联系人",
      required: true,
      span: 12,
    },
    {
      name: "hasVip",
      label: "VIP会员",
      component: "Switch",
      defaultValue: false,
      span: 12,
    },
    {
      name: "vipLevel",
      label: "VIP等级",
      component: "Select",
      placeholder: "请选择等级",
      visible: (values) => values.hasVip === true,
      options: [
        { label: "青铜会员", value: "bronze" },
        { label: "白银会员", value: "silver" },
        { label: "黄金会员", value: "gold" },
        { label: "钻石会员", value: "diamond" },
      ],
      span: 12,
    },
  ];

  return (
    <EasyForm
      schema={schema}
      onSubmit={(values) => {
        console.log("提交数据:", values);
        Message.success("提交成功");
      }}
      columns={2}
    />
  );
};

// ============ 示例3: 异步选项 + 联动 ============
const AsyncOptionsDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "province",
      label: "省份",
      component: "Select",
      placeholder: "请选择省份",
      span: 8,
      // 异步加载选项
      options: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return [
          { label: "北京市", value: "beijing" },
          { label: "上海市", value: "shanghai" },
          { label: "广东省", value: "guangdong" },
          { label: "浙江省", value: "zhejiang" },
        ];
      },
      // 联动更新城市
      effect: (_value, _values, form) => {
        form.setFieldValue("city", undefined);
        form.setFieldOptions("city", []);
      },
    },
    {
      name: "city",
      label: "城市",
      component: "Select",
      placeholder: "请选择城市",
      span: 8,
      // 根据省份动态加载城市
      options: async (values) => {
        const province = values.province;
        if (!province) return [];

        await new Promise((r) => setTimeout(r, 200));

        const cityMap: Record<string, { label: string; value: string }[]> = {
          beijing: [{ label: "北京市", value: "beijing-city" }],
          shanghai: [{ label: "上海市", value: "shanghai-city" }],
          guangdong: [
            { label: "广州市", value: "guangzhou" },
            { label: "深圳市", value: "shenzhen" },
            { label: "东莞市", value: "dongguan" },
          ],
          zhejiang: [
            { label: "杭州市", value: "hangzhou" },
            { label: "宁波市", value: "ningbo" },
          ],
        };
        return cityMap[province as string] || [];
      },
    },
    {
      name: "district",
      label: "区县",
      component: "Input",
      placeholder: "请输入区县",
      span: 8,
    },
  ];

  return (
    <EasyForm
      schema={schema}
      onSubmit={(values) => {
        console.log("提交数据:", values);
        Message.success("提交成功");
      }}
      columns={3}
    />
  );
};

// ============ 示例4: 表单验证 ============
const ValidationDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "password",
      label: "密码",
      component: "Input.Password",
      placeholder: "请输入密码（6-20位）",
      required: true,
      rules: [{ min: 6, max: 20 }],
      span: 12,
    },
    {
      name: "confirmPassword",
      label: "确认密码",
      component: "Input.Password",
      placeholder: "请再次输入密码",
      required: true,
      span: 12,
      rules: [
        {
          validator: async (value, formValues) => {
            if (value !== formValues.password) {
              return "两次密码输入不一致";
            }
            return true;
          },
        },
      ],
    },
    {
      name: "age",
      label: "年龄",
      component: "NumberPicker",
      placeholder: "请输入年龄",
      span: 12,
      rules: [{ min: 0, max: 150 }],
      componentProps: { min: 0, max: 150 },
    },
    {
      name: "idCard",
      label: "身份证号",
      component: "Input",
      placeholder: "请输入身份证号",
      span: 12,
      rules: [{ pattern: /^\d{17}[\dXx]$/ }],
    },
  ];

  return (
    <EasyForm
      schema={schema}
      onSubmit={(values) => {
        console.log("提交数据:", values);
        Message.success("验证通过，提交成功");
      }}
      columns={2}
    />
  );
};

// ============ 示例5: Ref 控制 ============
const RefControlDemo = () => {
  const formRef = useRef<FormInstance>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  const schema: FormSchema[] = [
    { name: "name", label: "姓名", component: "Input", required: true, span: 8 },
    { name: "age", label: "年龄", component: "NumberPicker", span: 8 },
    {
      name: "gender",
      label: "性别",
      component: "Radio",
      span: 8,
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
    },
  ];

  const handleFill = () => {
    formRef.current?.setValues({
      name: "张三",
      age: 28,
      gender: "male",
    });
  };

  const handleValidate = async () => {
    const result = await formRef.current?.validate();
    if (result?.valid) {
      Message.success("验证通过");
    } else {
      Message.error("验证失败，请检查表单");
    }
  };

  const handleGetValues = () => {
    const values = formRef.current?.getValues();
    setFormValues(values || {});
    console.log("当前表单值:", values);
  };

  const handleReset = () => {
    formRef.current?.reset();
    setFormValues({});
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Button type="primary" onClick={handleFill}>
          填充数据
        </Button>
        <Button onClick={handleValidate}>验证表单</Button>
        <Button onClick={handleGetValues}>获取数据</Button>
        <Button onClick={handleReset}>重置</Button>
        <Button type="secondary" onClick={() => formRef.current?.submit()}>
          提交
        </Button>
      </div>
      <EasyForm
        ref={formRef}
        schema={schema}
        onSubmit={(values) => {
          console.log("提交:", values);
          Message.success("提交成功");
        }}
        onChange={(values) => setFormValues(values)}
        showActions={false}
        columns={3}
      />
      <Card style={{ marginTop: 16 }}>
        <pre>{JSON.stringify(formValues, null, 2)}</pre>
      </Card>
    </div>
  );
};

// ============ 示例6: 自定义组件 ============
const CustomComponentDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "agreement",
      label: "用户协议",
      component: "Custom",
      span: 24,
      render: ({ value, onChange, disabled }) => (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span>我已阅读并同意《用户服务协议》和《隐私政策》</span>
        </label>
      ),
    },
    {
      name: "tags",
      label: "标签选择",
      component: "Custom",
      span: 24,
      render: ({ value, onChange }) => {
        const tags = ["技术", "设计", "产品", "运营", "市场"];
        const selected = (value as string[]) || [];
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <Button
                key={tag}
                type={selected.includes(tag) ? "primary" : "normal"}
                onClick={() => {
                  if (selected.includes(tag)) {
                    onChange(selected.filter((t) => t !== tag));
                  } else {
                    onChange([...selected, tag]);
                  }
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        );
      },
    },
    {
      name: "rating",
      label: "评分",
      component: "Custom",
      span: 12,
      render: ({ value, onChange }) => (
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => onChange(star)}
              style={{
                fontSize: 24,
                cursor: "pointer",
                color: (value as number) >= star ? "#f59e0b" : "#d1d5db",
              }}
            >
              ★
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <EasyForm
      schema={schema}
      onSubmit={(values) => {
        console.log("提交数据:", values);
        Message.success("提交成功");
      }}
    />
  );
};

// ============ 示例7: 无限滚动下拉 ============
const SelectInfiniteDemo = () => {
  // 模拟数据源（实际项目中通常从 API 获取）
  const allUsers = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      label: `用户 ${i + 1} - ${["张三", "李四", "王五", "赵六", "钱七"][i % 5]}`,
      value: `user_${i + 1}`,
    }));
  }, []);

  const schema: FormSchema[] = [
    {
      name: "userId",
      label: "选择用户",
      component: "SelectInfinite",
      placeholder: "请输入关键词搜索用户",
      span: 12,
      // 分页加载函数
      paginationOptions: async (params) => {
        const { page, pageSize, keyword } = params;

        // 模拟 API 请求延迟
        await new Promise((r) => setTimeout(r, 500));

        // 过滤数据
        let filtered = allUsers;
        if (keyword) {
          filtered = allUsers.filter((u) => u.label.toLowerCase().includes(keyword.toLowerCase()));
        }

        // 分页
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageData = filtered.slice(start, end);

        return {
          options: pageData,
          hasMore: end < filtered.length,
          total: filtered.length,
        };
      },
    },
    {
      name: "projectId",
      label: "选择项目",
      component: "SelectInfinite",
      placeholder: "请输入关键词搜索项目",
      span: 12,
      // 另一个分页加载示例
      paginationOptions: async (params) => {
        const { page, pageSize, keyword } = params;

        await new Promise((r) => setTimeout(r, 300));

        // 模拟项目数据
        const projects = Array.from({ length: 50 }, (_, i) => ({
          label: `项目 ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1} - ${keyword ? `搜索: ${keyword}` : "全部"}`,
          value: `project_${i + 1}`,
        }));

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageData = projects.slice(start, end);

        return {
          options: pageData,
          hasMore: end < projects.length,
          total: projects.length,
        };
      },
    },
    {
      name: "remark",
      label: "备注",
      component: "Input.TextArea",
      span: 24,
      placeholder: "请输入备注信息",
    },
  ];

  return (
    <div>
      <p style={{ marginBottom: 16, color: "#666" }}>
        提示：下拉列表支持分页加载，滚动到底部或点击"加载更多"可获取下一页数据。支持关键词搜索。
      </p>
      <EasyForm
        schema={schema}
        onSubmit={(values) => {
          console.log("提交数据:", values);
          Message.success("提交成功");
        }}
        columns={2}
      />
    </div>
  );
};

// ============ 示例8: 完整表单 ============
const CompleteFormDemo = () => {
  const formRef = useRef<FormInstance>(null);

  const schema: FormSchema[] = [
    // 基本信息
    { name: "name", label: "姓名", component: "Input", required: true, span: 8 },
    {
      name: "gender",
      label: "性别",
      component: "Radio",
      span: 8,
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
    },
    {
      name: "birthday",
      label: "出生日期",
      component: "DatePicker",
      dateFormat: "YYYY/MM/DD",
      span: 8,
    },
    {
      name: "age",
      label: "年龄",
      component: "NumberPicker",
      span: 8,
      componentProps: { min: 0, max: 150 },
    },
    {
      name: "education",
      label: "学历",
      component: "Select",
      span: 8,
      options: [
        { label: "高中", value: "high" },
        { label: "大专", value: "college" },
        { label: "本科", value: "bachelor" },
        { label: "硕士", value: "master" },
        { label: "博士", value: "doctor" },
      ],
    },
    {
      name: "marital",
      label: "婚姻状况",
      component: "Select",
      span: 8,
      options: [
        { label: "未婚", value: "single" },
        { label: "已婚", value: "married" },
        { label: "离异", value: "divorced" },
      ],
      labelAlign: "top",
    },

    // 联系方式
    {
      name: "phone",
      label: "手机号",
      component: "Input",
      span: 8,
      rules: [{ pattern: /^1[3-9]\d{9}$/ }],
    },
    {
      name: "email",
      label: "邮箱",
      component: "Input",
      span: 8,
      rules: [{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }],
    },
    { name: "wechat", label: "微信", component: "Input", span: 8 },

    // 地址
    {
      name: "province",
      label: "省份",
      component: "Select",
      span: 8,
      options: [
        { label: "北京", value: "beijing" },
        { label: "上海", value: "shanghai" },
        { label: "广东", value: "guangdong" },
      ],
    },
    {
      name: "city",
      label: "城市",
      component: "Select",
      span: 8,
      options: [
        { label: "广州市", value: "guangzhou" },
        { label: "深圳市", value: "shenzhen" },
      ],
    },
    { name: "address", label: "详细地址", component: "Input.TextArea", span: 24 },

    // 其他
    {
      name: "hobbies",
      label: "爱好",
      component: "Checkbox",
      span: 24,
      options: [
        { label: "阅读", value: "reading" },
        { label: "运动", value: "sports" },
        { label: "音乐", value: "music" },
        { label: "旅行", value: "travel" },
        { label: "美食", value: "food" },
      ],
    },
    { name: "score", label: "自我评分", component: "Rating", span: 12 },
    { name: "active", label: "是否激活", component: "Switch", span: 12, defaultValue: true },
    {
      name: "remark",
      label: "备注",
      component: "Input.TextArea",
      span: 24,
      componentProps: { rows: 3 },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Button type="primary" onClick={() => formRef.current?.submit()}>
          提交
        </Button>
        <Button onClick={() => formRef.current?.reset()}>重置</Button>
        <Button
          onClick={() => {
            formRef.current?.setValues({
              name: "测试用户",
              gender: "male",
              age: 25,
              phone: "13800138000",
              active: true,
            });
          }}
        >
          填充测试数据
        </Button>
      </div>
      <EasyForm
        ref={formRef}
        schema={schema}
        onSubmit={(values) => {
          console.log("提交数据:", values);
          Message.success("提交成功");
        }}
        showActions={false}
        columns={3}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      />
    </div>
  );
};

// ============ 示例9: 禁用状态 ============
const DisabledDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "username",
      label: "用户名",
      component: "Input",
      placeholder: "只读字段",
      disabled: true,
      defaultValue: "zhangsan",
      span: 8,
    },
    {
      name: "email",
      label: "邮箱",
      component: "Input",
      placeholder: "请输入邮箱",
      span: 8,
    },
    {
      name: "role",
      label: "角色",
      component: "Select",
      span: 8,
      disabled: true,
      defaultValue: "admin",
      options: [
        { label: "管理员", value: "admin" },
        { label: "普通用户", value: "user" },
      ],
    },
    {
      name: "remark",
      label: "备注",
      component: "Input.TextArea",
      placeholder: "当前表单整体禁用",
      span: 24,
    },
  ];

  return (
    <EasyForm
      schema={schema}
      disabled
      onSubmit={(values) => {
        console.log("提交数据:", values);
        Message.success("提交成功");
      }}
      columns={3}
    />
  );
};

// ============ 示例10: 联动禁用 ============
const LinkedDisabledDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "enableDetail",
      label: "启用详细信息",
      component: "Switch",
      defaultValue: false,
      span: 8,
      effect: (value, _values, form) => {
        if (!value) {
          form.setFieldValue("detail", undefined);
        }
      },
    },
    {
      name: "detail",
      label: "详细信息",
      component: "Input",
      placeholder: "启用后输入",
      span: 8,
      disabled: (values) => !values.enableDetail,
    },
    {
      name: "category",
      label: "分类",
      component: "Select",
      placeholder: "请选择",
      span: 8,
      options: [
        { label: "分类A", value: "A" },
        { label: "分类B", value: "B" },
        { label: "分类C", value: "C" },
      ],
      disabled: (values) => !values.enableDetail,
    },
    {
      name: "uploadFile",
      label: "上传文件",
      component: "Upload",
      span: 24,
      disabled: (values) => !values.enableDetail,
    },
  ];

  return (
    <div>
      <p style={{ marginBottom: 16, color: "#666" }}>
        切换"启用详细信息"开关，控制下方字段的禁用状态。
      </p>
      <EasyForm
        schema={schema}
        onSubmit={(values) => {
          console.log("提交数据:", values);
          Message.success("提交成功");
        }}
        columns={3}
      />
    </div>
  );
};

// ============ 示例11: 下拉携带额外数据 ============
const SelectExtraDemo = () => {
  const schema: FormSchema[] = [
    {
      name: "product",
      label: "选择商品",
      component: "Select",
      placeholder: "请选择商品",
      span: 12,
      optionRender: (opt) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span>{opt.label}</span>
          <span style={{ color: "#f59e0b", fontWeight: 500 }}>
            ¥{(opt.extra?.productPrice as number)?.toLocaleString()}
          </span>
        </div>
      ),
      options: [
        {
          label: "iPhone 15",
          value: "iphone15",
          extra: { productName: "iPhone 15", productPrice: 6999, productStock: 128 },
        },
        {
          label: "MacBook Pro",
          value: "macbook",
          extra: { productName: "MacBook Pro", productPrice: 14999, productStock: 56 },
        },
        {
          label: "AirPods Pro",
          value: "airpods",
          extra: { productName: "AirPods Pro", productPrice: 1999, productStock: 300 },
        },
      ],
    },
    {
      name: "productName",
      label: "商品名称",
      component: "Input",
      placeholder: "选中后自动填充",
      span: 12,
    },
    {
      name: "productPrice",
      label: "单价",
      component: "NumberPicker",
      placeholder: "选中后自动填充",
      span: 12,
      componentProps: { min: 0 },
    },
    {
      name: "productStock",
      label: "库存",
      component: "NumberPicker",
      placeholder: "选中后自动填充",
      span: 12,
    },
  ];

  return (
    <div>
      <p style={{ marginBottom: 16, color: "#666" }}>
        选择商品后，自动填充名称、单价、库存等字段（通过选项的 <code>extra</code> 配置）。
      </p>
      <EasyForm
        schema={schema}
        onSubmit={(values) => {
          console.log("提交数据:", values);
          Message.success("提交成功");
        }}
        columns={2}
      />
    </div>
  );
};

// ============ 主页面 ============
const FormDemo = () => {
  const items = [
    { tab: "基础表单", key: "basic", content: <BasicFormDemo /> },
    { tab: "字段联动", key: "linked", content: <LinkedFormDemo /> },
    { tab: "异步选项", key: "async", content: <AsyncOptionsDemo /> },
    { tab: "表单验证", key: "validation", content: <ValidationDemo /> },
    { tab: "Ref控制", key: "ref", content: <RefControlDemo /> },
    { tab: "自定义组件", key: "custom", content: <CustomComponentDemo /> },
    { tab: "无限滚动下拉", key: "infinite", content: <SelectInfiniteDemo /> },
    { tab: "禁用状态", key: "disabled", content: <DisabledDemo /> },
    { tab: "联动禁用", key: "linkedDisabled", content: <LinkedDisabledDemo /> },
    { tab: "下拉携带数据", key: "selectExtra", content: <SelectExtraDemo /> },
    { tab: "完整示例", key: "complete", content: <CompleteFormDemo /> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>EasyForm 配置化表单示例</h2>
      <Tab>
        {items.map((item) => (
          <Tab.Item key={item.key} title={item.tab}>
            <Card style={{ marginTop: 16 }}>{item.content}</Card>
          </Tab.Item>
        ))}
      </Tab>
    </div>
  );
};

export default FormDemo;
