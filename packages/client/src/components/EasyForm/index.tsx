import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  createContext,
  useContext,
} from "react";
import { Form, Row, Col, Button, message } from "antd";
import type { FormSchema, FormInstance, EasyFormProps, OptionItem } from "./types";
import { getNestedValue, setNestedValue, executeValidation, isEmptyValue } from "./utils";
import Field from "./Field";
import "./styles.css";

// ============ Context：消除 formValues/formActions 逐层穿透 ============

interface FormContextValue {
  formValues: Record<string, unknown>;
  formActions: FormInstance;
}

const formContext = createContext<FormContextValue | null>(null);

export const useEasyFormContext = () => {
  const ctx = useContext(formContext);
  if (!ctx) throw new Error("useEasyFormContext must be used within EasyForm");
  return ctx;
};

// ============ 主组件 ============

const EMPTY_INITIAL_VALUES: Record<string, unknown> = {};

const EasyForm = forwardRef<FormInstance, EasyFormProps>((props, ref) => {
  const {
    schema,
    initialValues = EMPTY_INITIAL_VALUES,
    onSubmit,
    onChange,
    onReset,
    style,
    labelCol = { span: 6 },
    wrapperCol = { span: 18 },
    labelAlign = "left",
    submitText = "提交",
    resetText = "重置",
    showActions = true,
    renderActions,
    disabled: formDisabled = false,
    readonly: formReadonly = false,
    inline = false,
    columns = 1,
  } = props;

  const [values, setValuesState] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    schema.forEach((item) => {
      if (item.defaultValue !== undefined) {
        init[item.name] = item.defaultValue;
      }
    });
    return { ...init, ...initialValues };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({});

  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const formActionsRef = useRef<FormInstance | null>(null);
  const onSubmitRef = useRef(onSubmit);
  const onChangeRef = useRef(onChange);
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  const formActions: FormInstance = useMemo(
    () => ({
      setValues: (newValues) => {
        setValuesState((prev) => ({ ...prev, ...newValues }));
      },
      setFieldValue: (name, value) => {
        setValuesState((prev) => setNestedValue(prev, name, value));
      },
      getValues: () => valuesRef.current,
      getFieldValue: (name) => getNestedValue(valuesRef.current, name),
      reset: () => {
        const init: Record<string, unknown> = {};
        schema.forEach((item) => {
          init[item.name] = item.defaultValue ?? undefined;
        });
        setValuesState({ ...init, ...initialValues });
        setErrors({});
      },
      validate: async () => {
        const newErrors: Record<string, string> = {};
        let valid = true;

        for (const item of schema) {
          const fieldValue = getNestedValue(valuesRef.current, item.name);

          if (item.required) {
            if (isEmptyValue(fieldValue)) {
              newErrors[item.name] =
                typeof item.required === "string" ? item.required : "此字段为必填项";
              valid = false;
              continue;
            }
          }

          if (item.rules && item.rules.length > 0) {
            const error = await executeValidation(fieldValue, item.rules, valuesRef.current);
            if (error) {
              newErrors[item.name] = error;
              valid = false;
            }
          }
        }

        setErrors(newErrors);
        return { valid, values: valuesRef.current, errors: newErrors };
      },
      setFieldError: (name, error) => {
        setErrors((prev) => ({ ...prev, [name]: error }));
      },
      clearErrors: () => {
        setErrors({});
      },
      setFieldOptions: (name, options) => {
        setFieldOptions((prev) => ({ ...prev, [name]: options }));
      },
      submit: () => {
        const actions = formActionsRef.current;
        if (!actions) return;
        actions.validate().then(({ valid, values: vals }) => {
          if (valid && formActionsRef.current) {
            onSubmitRef.current?.(vals, formActionsRef.current);
          }
        });
      },
    }),
    [schema, initialValues],
  );

  useEffect(() => {
    formActionsRef.current = formActions;
  }, [formActions]);

  useImperativeHandle(ref, () => formActions, [formActions]);

  useEffect(() => {
    const init = async () => {
      const newOptions: Record<string, OptionItem[]> = {};
      const actions = formActionsRef.current;

      for (const item of schema) {
        if (typeof item.options === "function") {
          try {
            newOptions[item.name] = await item.options(valuesRef.current, actions ?? formActions);
          } catch {
            newOptions[item.name] = [];
          }
        }
      }

      setFieldOptions(newOptions);
    };

    init();
  }, [schema, initialValues, formActions]);

  /** 预构建 schema Map：O(1) 查找替代 schema.find() 的 O(n) 线性扫描 */
  const schemaMap = useMemo(() => {
    const map = new Map<string, FormSchema>();
    schema.forEach((item) => map.set(item.name, item));
    return map;
  }, [schema]);

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      const next = setNestedValue(valuesRef.current, name, value);
      valuesRef.current = next;

      setValuesState(next);
      setErrors((prev) => {
        const err = { ...prev };
        delete err[name];
        return err;
      });

      onChangeRef.current?.(next, formActions);

      const fieldSchema = schemaMap.get(name);
      if (fieldSchema?.onChange) {
        fieldSchema.onChange(value, next, formActions);
      }
      if (fieldSchema?.effect) {
        fieldSchema.effect(value, next, formActions);
      }
    },
    [schemaMap, formActions],
  );

  const handleSubmit = useCallback(async () => {
    const { valid, values: formValues } = await formActions.validate();
    if (valid) {
      try {
        await onSubmitRef.current?.(formValues, formActions);
      } catch (e) {
        message.error(e instanceof Error ? e.message : "提交失败");
      }
    }
  }, [formActions]);

  const handleReset = useCallback(() => {
    formActions.reset();
    onResetRef.current?.({}, formActions);
  }, [formActions]);

  const getFieldOptions = useCallback(
    (item: FormSchema): OptionItem[] => {
      if (typeof item.options === "function") {
        return fieldOptions[item.name] || [];
      }
      return item.options || [];
    },
    [fieldOptions],
  );

  /* eslint-disable react-hooks/refs -- formActions is passed to visible/disabled callbacks which may call getValues() internally;
     this is safe because formActions reads refs only in event-handler-like callbacks, not during the synchronous render path */
  const fieldStates = useMemo(
    () =>
      schema.map((item) => {
        const visible = item.visible;
        const disabled = item.disabled;
        return {
          item,
          isVisible:
            typeof visible === "function" ? visible(values, formActions) : visible !== false,
          isDisabled:
            typeof disabled === "function" ? disabled(values, formActions) : disabled === true,
        };
      }),
    [schema, values, formActions],
  );
  /* eslint-enable react-hooks/refs */

  const contextValue = useMemo<FormContextValue>(
    () => ({ formValues: values, formActions }),
    [values, formActions],
  );

  const renderFields = useMemo(() => {
    const visibleFields = fieldStates.filter((fs) => fs.isVisible);

    if (inline) {
      return visibleFields.map((fs) => {
        const item = fs.item;
        const fieldLabelAlign = item.labelAlign || labelAlign;
        const options = getFieldOptions(item);
        const fieldValue = getNestedValue(values, item.name);

        const isTopLabel = fieldLabelAlign === "top";
        const itemLabelCol = isTopLabel ? { span: 24 } : labelCol;
        const itemWrapperCol = isTopLabel ? { span: 24 } : wrapperCol;

        return (
          <Form.Item
            key={item.name}
            label={item.label}
            required={item.required || item.rules?.some((r) => r.required)}
            validateStatus={errors[item.name] ? "error" : undefined}
            help={errors[item.name]}
            extra={item.tooltip}
            labelCol={itemLabelCol}
            wrapperCol={itemWrapperCol}
          >
            <Field
              schema={item}
              value={fieldValue}
              error={errors[item.name] || null}
              disabled={formDisabled || fs.isDisabled}
              readonly={formReadonly}
              options={options}
              onChange={handleFieldChange}
            />
          </Form.Item>
        );
      });
    }

    const colSpan = Math.floor(24 / columns);
    return (
      <Row gutter={[16, 16]}>
        {visibleFields.map((fs) => {
          const item = fs.item;
          const fieldLabelAlign = item.labelAlign || labelAlign;
          const options = getFieldOptions(item);
          const fieldValue = getNestedValue(values, item.name);
          const itemSpan = item.span || colSpan;

          const isTopLabel = fieldLabelAlign === "top";
          const itemLabelCol = isTopLabel ? { span: 24 } : labelCol;
          const itemWrapperCol = isTopLabel ? { span: 24 } : wrapperCol;

          return (
            <Col key={item.name} span={itemSpan}>
              <Form.Item
                label={item.label}
                required={item.required || item.rules?.some((r) => r.required)}
                validateStatus={errors[item.name] ? "error" : undefined}
                help={errors[item.name]}
                extra={item.tooltip}
                labelCol={itemLabelCol}
                wrapperCol={itemWrapperCol}
              >
                <Field
                  schema={item}
                  value={fieldValue}
                  error={errors[item.name] || null}
                  disabled={formDisabled || fs.isDisabled}
                  readonly={formReadonly}
                  options={options}
                  onChange={handleFieldChange}
                />
              </Form.Item>
            </Col>
          );
        })}
      </Row>
    );
  }, [
    fieldStates,
    errors,
    formDisabled,
    formReadonly,
    inline,
    columns,
    values,
    handleFieldChange,
    getFieldOptions,
    labelAlign,
    labelCol,
    wrapperCol,
  ]);

  const renderActionButtons = () => {
    if (!showActions) return null;

    if (renderActions) {
      return renderActions(formActions);
    }

    return (
      <Form.Item wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
        <Button type="primary" onClick={handleSubmit} disabled={formDisabled}>
          {submitText}
        </Button>
        <Button onClick={handleReset} disabled={formDisabled} style={{ marginLeft: 8 }}>
          {resetText}
        </Button>
      </Form.Item>
    );
  };

  return (
    <formContext.Provider value={contextValue}>
      <Form
        style={style}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        labelAlign={labelAlign === "top" ? "left" : labelAlign === "inset" ? "left" : labelAlign}
        layout={inline ? "inline" : "horizontal"}
      >
        {renderFields}
        {/* eslint-disable-next-line react-hooks/refs -- renderActionButtons reads formActions which internally accesses refs only in callbacks */}
        {renderActionButtons()}
      </Form>
    </formContext.Provider>
  );
});

EasyForm.displayName = "EasyForm";

export { EasyForm };
export default EasyForm;
export type {
  FormSchema,
  FormInstance,
  EasyFormProps,
  OptionItem,
  ComponentType,
  ValidationRule,
  ComponentProps,
  VisibleControl as FormVisibleControl,
  DisabledControl as FormDisabledControl,
  CustomRenderProps,
  OptionsLoader,
  PaginationOptionsLoader,
  PaginationParams,
  PaginationResult,
} from "./types";
