import type { ValidationRule } from "./types";

/**
 * 获取嵌套属性值，支持 "a.b.c" 路径写法
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    return acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined;
  }, obj);
};

/**
 * 设置嵌套属性值，返回新的对象（不可变更新）
 */
export const setNestedValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> => {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...((current[keys[i]] as Record<string, unknown>) || {}) };
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;

  return result;
};

/**
 * 执行字段验证规则，返回错误信息或 null
 */
export const executeValidation = async (
  value: unknown,
  rules: ValidationRule[],
  formValues: Record<string, unknown>,
): Promise<string | null> => {
  if (!rules || rules.length === 0) return null;

  for (const rule of rules) {
    if (rule.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        return typeof rule.required === "string" ? rule.required : "此字段为必填项";
      }
    }

    if (rule.pattern && value !== undefined && value !== null && value !== "") {
      if (!rule.pattern.test(String(value))) {
        return "格式不正确";
      }
    }

    if (rule.min !== undefined && value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < rule.min) {
        return `最小值为 ${rule.min}`;
      }
      if (typeof value === "string" && value.length < rule.min) {
        return `最少输入 ${rule.min} 个字符`;
      }
    }

    if (rule.max !== undefined && value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > rule.max) {
        return `最大值为 ${rule.max}`;
      }
      if (typeof value === "string" && value.length > rule.max) {
        return `最多输入 ${rule.max} 个字符`;
      }
    }

    if (rule.validator) {
      try {
        const result = await rule.validator(value, formValues);
        if (result === false) {
          return "验证失败";
        }
        if (typeof result === "string") {
          return result;
        }
      } catch (error) {
        return error instanceof Error ? error.message : "验证失败";
      }
    }
  }

  return null;
};

/**
 * 判断值是否为空（用于 required 校验）
 */
export const isEmptyValue = (value: unknown): boolean => {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
};
