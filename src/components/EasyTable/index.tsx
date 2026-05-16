import React, { useCallback, useImperativeHandle, forwardRef, useMemo } from "react";
import { Table, Button, Switch, message, Popconfirm } from "antd";
import type { ColumnSchema, EasyTableProps, TableInstance } from "./types";
import { useTableInstance } from "./useTableInstance";
import EditCell from "./EditCell";
import PaginationBar from "./PaginationBar";
import "./styles.css";

const EasyTable = forwardRef<TableInstance, EasyTableProps>((props, ref) => {
  const {
    columns,
    dataSource: externalData,
    rowKey = "id",
    editable = false,
    editMode = "row",
    showIndex = false,
    indexTitle = "#",
    indexWidth = 60,
    showActions = false,
    actions = [],
    actionsTitle = "操作",
    actionsWidth = 150,
    showSelection = false,
    onSelectionChange,
    onChange,
    pagination,
    loading = false,
    emptyContent = "暂无数据",
    hasBorder = true,
    isZebra = false,
    style,
    className,
    getRowProps,
    maxBodyHeight,
    fixedHeader = true,
    defaultRowData = {},
    showAddButton = false,
    addButtonText = "新增",
    onAddClick,
    showDeleteButton = false,
    deleteButtonText = "删除",
    onDelete,
    renderToolbar,
    renderFooter,
  } = props;

  const {
    data,
    selectedKeys,
    setSelectedKeys,
    editingKey,
    editData,
    tableInstance,
    getRowKeyValue,
    editDataRef,
    setEditData,
  } = useTableInstance({
    columns,
    externalData,
    rowKey,
    defaultRowData,
    onChange,
    onSelectionChange,
  });

  useImperativeHandle(ref, () => tableInstance, [tableInstance]);

  const handleSelectionChange = useCallback(
    (keys: React.Key[]) => {
      const typedKeys = keys as (string | number)[];
      setSelectedKeys(typedKeys);
      const keySet = new Set(typedKeys);
      const rows = data.filter((item) => keySet.has(getRowKeyValue(item)));
      onSelectionChange?.(typedKeys, rows);
    },
    [data, getRowKeyValue, onSelectionChange, setSelectedKeys],
  );

  const handleCellChange = useCallback(
    (column: ColumnSchema, value: unknown) => {
      const newEditData = { ...editDataRef.current, [column.dataIndex]: value };
      editDataRef.current = newEditData;
      setEditData(newEditData);

      if (column.onChange) {
        const rowIndex = data.findIndex((item) => getRowKeyValue(item) === editingKey);
        if (rowIndex !== -1) {
          column.onChange(value, newEditData, rowIndex, column);
        }
      }
    },
    [data, editingKey, getRowKeyValue, editDataRef, setEditData],
  );

  const handleAdd = useCallback(() => {
    if (onAddClick) {
      onAddClick();
    } else {
      tableInstance.addRow();
    }
  }, [onAddClick, tableInstance]);

  const handleDelete = useCallback(() => {
    if (selectedKeys.length === 0) {
      message.warning("请先选择要删除的数据");
      return;
    }
    if (onDelete) {
      const keySet = new Set(selectedKeys);
      const rows = data.filter((item) => keySet.has(getRowKeyValue(item)));
      onDelete(selectedKeys, rows);
    } else {
      tableInstance.deleteRows(selectedKeys);
      message.success("删除成功");
    }
  }, [selectedKeys, data, getRowKeyValue, onDelete, tableInstance]);

  const handleEdit = useCallback(
    (record: Record<string, unknown>) => {
      tableInstance.startEdit(getRowKeyValue(record));
    },
    [tableInstance, getRowKeyValue],
  );

  const handleSave = useCallback(() => {
    if (tableInstance.saveEdit()) {
      message.success("保存成功");
    }
  }, [tableInstance]);

  const handleCancel = useCallback(() => {
    tableInstance.cancelEdit();
  }, [tableInstance]);

  const tableColumns = useMemo(() => {
    const cols: Record<string, unknown>[] = [];

    // ── 序号列 ──
    if (showIndex) {
      cols.push({
        key: "__index__",
        title: indexTitle,
        width: indexWidth,
        align: "center" as const,
        render: (_value: unknown, record: Record<string, unknown>) => {
          const rowIndex = data.findIndex(
            (item) => getRowKeyValue(item) === getRowKeyValue(record),
          );
          return rowIndex + 1;
        },
      });
    }

    // ── 数据列 ──
    columns.forEach((col) => {
      const {
        key,
        title,
        dataIndex,
        width,
        align,
        fixed,
        sortable,
        type = "text",
        editable: colEditable,
        visible: colVisible,
        format,
        render,
      } = col;

      const isColumnVisible =
        typeof colVisible === "function" ? colVisible({}, 0) : colVisible !== false;

      if (!isColumnVisible) return;

      cols.push({
        key: key || dataIndex,
        title,
        dataIndex,
        width,
        align,
        fixed,
        sorter: sortable ? true : undefined,
        render: (value: unknown, record: Record<string, unknown>, rowIndex: number) => {
          const recordKey = getRowKeyValue(record);
          const isEditing = editingKey === recordKey;

          const isEditable =
            editable &&
            (typeof colEditable === "function"
              ? colEditable(record, rowIndex)
              : colEditable !== false);

          if (isEditing && isEditable) {
            return (
              <EditCell
                column={col}
                record={editData}
                rowIndex={rowIndex}
                value={editData[dataIndex]}
                onSave={handleSave}
                onCancel={handleCancel}
                onValueChange={(val) => handleCellChange(col, val)}
              />
            );
          }

          if (render) {
            return render(value, record, rowIndex);
          }

          if (format) {
            return format(value, record, rowIndex);
          }

          if (type === "switch") {
            return <Switch checked={Boolean(value)} disabled />;
          }

          if (type === "select" && col.options) {
            const opts =
              typeof col.options === "function" ? col.options(record, rowIndex) : col.options;
            const opt = opts.find((o) => o.value === value);
            return opt?.label || value;
          }

          return value ?? "-";
        },
      });
    });

    // ── 操作列 ──
    if (showActions && actions.length > 0) {
      cols.push({
        key: "__actions__",
        title: actionsTitle,
        width: actionsWidth,
        align: "center" as const,
        fixed: "right" as const,
        render: (_value: unknown, record: Record<string, unknown>, rowIndex: number) => {
          const recordKey = getRowKeyValue(record);
          const isEditing = editingKey === recordKey;

          if (isEditing && editMode === "row") {
            return (
              <div className="easy-table-actions">
                <Button type="primary" size="small" onClick={handleSave}>
                  保存
                </Button>
                <Button size="small" onClick={handleCancel}>
                  取消
                </Button>
              </div>
            );
          }

          return (
            <div className="easy-table-actions">
              {actions.map((action) => {
                const {
                  key: actionKey,
                  text,
                  type: btnType = "default",
                  visible: actionVisible = true,
                  disabled: actionDisabled = false,
                  onClick: actionOnClick,
                  confirm,
                  danger,
                } = action;

                const isVisible =
                  typeof actionVisible === "function"
                    ? actionVisible(record, rowIndex)
                    : actionVisible;

                const isDisabled =
                  typeof actionDisabled === "function"
                    ? actionDisabled(record, rowIndex)
                    : actionDisabled;

                if (!isVisible) return null;

                const antdBtnType =
                  btnType === "secondary" || btnType === "normal" ? "default" : btnType;

                const button = (
                  <Button
                    key={actionKey}
                    type={antdBtnType}
                    size="small"
                    disabled={isDisabled}
                    danger={danger}
                    onClick={() => actionOnClick?.(record, rowIndex)}
                  >
                    {text}
                  </Button>
                );

                if (confirm) {
                  return (
                    <Popconfirm
                      key={actionKey}
                      title={confirm}
                      onConfirm={() => actionOnClick?.(record, rowIndex)}
                      okText="确定"
                      cancelText="取消"
                    >
                      {button}
                    </Popconfirm>
                  );
                }

                return button;
              })}

              {editable && editMode === "row" && editingKey !== recordKey && (
                <Button type="primary" size="small" onClick={() => handleEdit(record)}>
                  编辑
                </Button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [
    columns,
    showIndex,
    indexTitle,
    indexWidth,
    showActions,
    actions,
    actionsTitle,
    actionsWidth,
    editable,
    editMode,
    editingKey,
    editData,
    data,
    getRowKeyValue,
    handleSave,
    handleCancel,
    handleEdit,
    handleCellChange,
  ]);

  const renderToolbarContent = () => {
    if (!showAddButton && !showDeleteButton && !renderToolbar) return null;

    return (
      <div className="easy-table-toolbar">
        {showAddButton && (
          <Button type="primary" onClick={handleAdd}>
            {addButtonText}
          </Button>
        )}
        {showDeleteButton && (
          <Button danger onClick={handleDelete} disabled={selectedKeys.length === 0}>
            {deleteButtonText}
          </Button>
        )}
        {renderToolbar?.(tableInstance)}
      </div>
    );
  };

  const scrollConfig = useMemo(() => {
    if (maxBodyHeight) {
      return { y: maxBodyHeight as number };
    }
    if (fixedHeader) {
      return { y: 400 };
    }
    return undefined;
  }, [maxBodyHeight, fixedHeader]);

  return (
    <div className={className} style={style}>
      {renderToolbarContent()}
      <Table
        rowKey={rowKey}
        dataSource={data}
        columns={tableColumns}
        loading={loading}
        bordered={hasBorder}
        locale={{ emptyText: emptyContent }}
        scroll={scrollConfig}
        rowClassName={
          isZebra ? (_record, index) => (index % 2 === 1 ? "easy-table-zebra-row" : "") : undefined
        }
        rowSelection={
          showSelection
            ? {
                selectedRowKeys: selectedKeys,
                onChange: handleSelectionChange,
                columnWidth: 50,
              }
            : undefined
        }
        onRow={(record, index) => (getRowProps ? getRowProps(record, index ?? 0) : {})}
        pagination={false}
      />
      {pagination !== false && <PaginationBar pagination={pagination} dataLength={data.length} />}
      {renderFooter?.(tableInstance)}
    </div>
  );
});

EasyTable.displayName = "EasyTable";

export { EasyTable };
export default EasyTable;
export type {
  ColumnSchema,
  ActionSchema,
  TableInstance,
  EasyTableProps,
  EditRenderProps,
  TableOptionItem,
  ColumnType,
  EditableControl,
  VisibleControl,
  DisabledControl,
} from "./types";
