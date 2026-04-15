import EasyForm, { type FormSchema } from "../components/EasyForm";

const schema: FormSchema[] = [
  {
    name: "userType",
    label: "用户类型",
    component: "Select",
    options: [
      { label: "个人", value: "personal" },
      { label: "企业", value: "company" },
    ],
    componentProps: async () => {
      return {
        required: true,
      };
    },
  },
  {
    name: "companyName",
    label: "公司名称",
    component: "Input",
    componentProps: async (formModel, formActions) => {
      const { setValues } = formActions;
      return {
        disabled: formModel.userType !== "company",
        required: formModel.userType === "company",
        onChange: (value) => {
          if (value === "特例公司") {
            setValues({
              companyCode: "",
            });
          }
        },
      };
    },
  },
  {
    name: "companyCode",
    label: "统一社会信用代码",
    component: "Input",
    componentProps: async (formModel) => {
      return {
        disabled: !!formModel.companyName,
        required: formModel.userType === "company",
      };
    },
  },
  {
    name: "age",
    label: "年龄",
    component: "NumberPicker",
  },
  {
    name: "maxAge",
    label: "最大年龄",
    component: "NumberPicker",
    defaultValue: 100,
  },
  {
    name: "minAge",
    label: "最小年龄",
    component: "NumberPicker",
    defaultValue: 0,
  },
  {
    name: "vip",
    label: "VIP会员",
    component: "Switch",
    defaultValue: false,
  },
  {
    name: "vipLevel",
    label: "VIP等级",
    component: "Select",
    defaultValue: undefined,
    options: [
      { label: "青铜", value: "bronze" },
      { label: "白银", value: "silver" },
      { label: "黄金", value: "gold" },
    ],
  },
  {
    name: "customField",
    label: "自定义组件",
    component: "Custom",
    customRender: ({ value, onChange, disabled }) => (
      <input
        value={String(value || "")}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px" }}
        placeholder="自定义输入"
      />
    ),
  },
];

const Demo = () => {
  const handleSubmit = (values: Record<string, unknown>) => {
    console.log("Submit values:", values);
  };

  return (
    <div style={{ width: "60%" }}>
      <EasyForm schema={schema} onSubmit={handleSubmit} />
    </div>
  );
};

export default Demo;
