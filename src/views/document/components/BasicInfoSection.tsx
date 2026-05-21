import { Card } from "antd";
import type { RefObject } from "react";
import EasyForm, { type FormInstance } from "../../../components/EasyForm";
import { BASIC_INFO_SCHEMA } from "../config";

interface BasicInfoSectionProps {
  formRef: RefObject<FormInstance>;
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

const BasicInfoSection = ({ formRef, initialValues, onChange }: BasicInfoSectionProps) => {
  return (
    <Card title="基本信息" style={{ marginBottom: 16 }}>
      <EasyForm
        ref={formRef}
        schema={BASIC_INFO_SCHEMA}
        showActions={false}
        columns={3}
        initialValues={initialValues ?? { status: "draft", currency: "CNY" }}
        onChange={onChange}
      />
    </Card>
  );
};

export default BasicInfoSection;
