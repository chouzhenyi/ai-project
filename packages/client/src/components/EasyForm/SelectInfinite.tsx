import React, { useState, useCallback, useEffect, useRef } from "react";
import { Select } from "antd";
import type { SelectInfiniteProps, OptionItem } from "./types";
import { useEasyFormContext } from "./index";
import "./styles.css";

const SelectInfinite: React.FC<SelectInfiniteProps> = ({
  value,
  onChange,
  disabled,
  placeholder,
  paginationOptions,
  pageSize = 20,
}) => {
  const { formValues, formActions } = useEasyFormContext();
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const loadingRef = useRef(false);

  // 使用 ref 持有最新引用，避免 formValues/formActions 变化导致 loadOptions 重建和 useEffect 重触发
  const formValuesRef = useRef(formValues);
  const formActionsRef = useRef(formActions);
  useEffect(() => {
    formValuesRef.current = formValues;
    formActionsRef.current = formActions;
  }, [formValues, formActions]);

  const loadOptions = useCallback(
    async (pageNum: number, searchKeyword: string, append = true) => {
      if (!paginationOptions || loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const result = await paginationOptions(
          { page: pageNum, pageSize, keyword: searchKeyword },
          formValuesRef.current,
          formActionsRef.current,
        );

        if (append) {
          setOptions((prev) => [...prev, ...result.options]);
        } else {
          setOptions(result.options);
        }
        setHasMore(result.hasMore);
      } catch {
        // 静默处理，保留现有选项
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [paginationOptions, pageSize],
  );

  useEffect(() => {
    if (paginationOptions) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset and reload when paginationOptions reference changes
      setPage(1);
      setOptions([]);
      loadOptions(1, "", false);
    }
  }, [paginationOptions, loadOptions]);

  const handleSearch = useCallback(
    (searchKeyword: string) => {
      setKeyword(searchKeyword);
      setPage(1);
      setOptions([]);
      loadOptions(1, searchKeyword, false);
    },
    [loadOptions],
  );

  const handleScrollToBottom = useCallback(() => {
    if (hasMore && !loading && !loadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOptions(nextPage, keyword);
    }
  }, [hasMore, loading, page, keyword, loadOptions]);

  const renderFooter = () => {
    if (loading) {
      return <div className="easy-form-select-infinite-loading">加载中...</div>;
    }
    if (!hasMore && options.length > 0) {
      return <div className="easy-form-select-infinite-nomore">没有更多数据了</div>;
    }
    return null;
  };

  return (
    <Select
      className="easy-form-full-width"
      value={value}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      placeholder={placeholder}
      options={options}
      showSearch
      onSearch={handleSearch}
      filterOption={false}
      onPopupScroll={(e) => {
        const target = e.target as HTMLElement;
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
          handleScrollToBottom();
        }
      }}
      dropdownRender={(menu) => (
        <>
          {menu}
          {renderFooter()}
          {hasMore && !loading && (
            <div
              className="easy-form-select-infinite-loadmore"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleScrollToBottom}
            >
              点击加载更多
            </div>
          )}
        </>
      )}
    />
  );
};

export default SelectInfinite;
