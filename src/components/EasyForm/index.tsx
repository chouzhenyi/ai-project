import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import { Form, Row, Col, Button, message } from "antd";
import type { FormSchema, FormInstance, EasyFormProps, OptionItem } from "./types";
import { getNestedValue, setNestedValue, executeValidation, isEmptyValue } from "./utils";
import Field from "./Field";
import "./styles.css";

const EasyForm = forwardRef<FormInstance, EasyFormProps>((props, ref) => {
  const {
    schema,
    initialValues = {},
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
        formActionsRef.current?.validate().then(({ valid, values }) => {
          if (valid) {
            onSubmit?.(values, formActionsRef.current!);
          }
        });
      },
    }),
    [schema, initialValues, onSubmit],
  );

  useEffect(() => {
    formActionsRef.current = formActions;
  }, [formActions]);

  useImperativeHandle(ref, () => formActions, [formActions]);

  useEffect(() => {
    const init = async () => {
      const newOptions: Record<string, OptionItem[]> = {};

      for (const item of schema) {
        if (typeof item.options === "function") {
          try {
            newOptions[item.name] = await item.options(valuesRef.current, formActionsRef.current!);
          } catch (e) {
            console.error(`Failed to load options for ${item.name}:`, e);
            newOptions[item.name] = [];
          }
        }
      }

      setFieldOptions(newOptions);
    };

    init();
  }, [schema, initialValues]);

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

      onChange?.(next, formActions);

      const fieldSchema = schema.find((s) => s.name === name);
      if (fieldSchema?.onChange) {
        fieldSchema.onChange(value, next, formActions);
      }
      if (fieldSchema?.effect) {
        fieldSchema.effect(value, next, formActions);
      }
    },
    [schema, onChange, formActions],
  );

  const handleSubmit = useCallback(async () => {
    const { valid, values: formValues } = await formActions.validate();
    if (valid) {
      try {
        await onSubmit?.(formValues, formActions);
      } catch (e) {
        message.error(e instanceof Error ? e.message : "提交失败");
      }
    }
  }, [onSubmit, formActions]);

  const handleReset = useCallback(() => {
    formActions.reset();
    onReset?.({}, formActions);
  }, [formActions, onReset]);

  const getFieldOptions = useCallback(
    (item: FormSchema): OptionItem[] => {
      if (typeof item.options === "function") {
        return fieldOptions[item.name] || [];
      }
      return item.options || [];
    },
    [fieldOptions],
  );

  // formActionsRef 始终持有最新引用，作为 visible/disabled 回调参数传入
  // 这样 fieldStates 仅依赖 schema + values，不因 formActions 引用变化而重建
  const fieldStates = useMemo(
    () =>
      schema.map((item) => ({
        item,
        isVisible:
          typeof item.visible === "function"
            ? item.visible(values, formActionsRef.current!)
            : item.visible !== false,
        isDisabled:
          typeof item.disabled === "function"
            ? item.disabled(values, formActionsRef.current!)
            : item.disabled === true,
      })),
    [schema, values],
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
              formValues={values}
              formActions={formActions}
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
                  formValues={values}
                  formActions={formActions}
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
    formActions,
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
    <Form
      style={style}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      labelAlign={labelAlign === "top" ? "left" : labelAlign === "inset" ? "left" : labelAlign}
      layout={inline ? "inline" : "horizontal"}
    >
      {renderFields}
      {renderActionButtons()}
    </Form>
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
