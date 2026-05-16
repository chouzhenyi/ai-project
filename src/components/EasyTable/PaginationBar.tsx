import React from "react";
import { Pagination } from "antd";
import type { PaginationBarProps } from "./types";
import "./styles.css";

const PaginationBar: React.FC<PaginationBarProps> = ({ pagination, dataLength }) => {
  const total = pagination?.total ?? dataLength;
  const pageSize = pagination?.pageSize ?? 10;
  const current = pagination?.current ?? 1;

  if (total <= pageSize && !pagination?.total) return null;

  return (
    <div className="easy-table-pagination">
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        showQuickJumper
        pageSizeOptions={[10, 20, 50, 100]}
        showTotal={(t) => `共 ${t} 条`}
        onChange={(page, size) => pagination?.onChange?.(page, size)}
      />
    </div>
  );
};

export default PaginationBar;
