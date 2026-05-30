import { Card } from "antd";
import EasyTable from "../../../components/EasyTable";
import { RELATED_DOC_COLUMNS } from "../config/relatedDoc";

interface RelatedDocSectionProps {
  dataSource: Record<string, unknown>[];
}

const RelatedDocSection = ({ dataSource }: RelatedDocSectionProps) => {
  return (
    <Card title="关联单据" style={{ marginBottom: 16 }}>
      <EasyTable
        columns={RELATED_DOC_COLUMNS}
        dataSource={dataSource}
        hasBorder
        maxBodyHeight={300}
      />
    </Card>
  );
};

export default RelatedDocSection;
