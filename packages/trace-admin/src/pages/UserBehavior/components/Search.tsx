import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Input, Select, Button, Row, Col, Space } from 'antd';

interface FieldConfig {
  label: string;
  name: string;
  type: 'input' | 'select' | 'multiselect';
  options?: { label: string; value: string }[];
  width?: number | string;
  placeholder?: string;
}

interface SearchProps {
  fields: FieldConfig[];
  onSubmit: (values: any) => void;
  onReset?: () => void;
  loading?: boolean;
  collapsed?: boolean;
}

const Search: React.FC<SearchProps> = ({ fields, onSubmit, onReset, loading = false, collapsed = false }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = field.type === 'multiselect' ? [] : '';
        return acc;
      },
      {} as Record<string, any>,
    ),
  });

  const handleReset = () => {
    reset();
    if (onReset) onReset();
  };

  // 根据字段类型渲染不同的表单控件
  const renderFieldControl = (field: FieldConfig, controllerField: any) => {
    if (field.type === 'input') {
      return <Input {...controllerField} placeholder={field.placeholder || `请输入${field.label}`} style={{ width: field.width || '100%' }} allowClear />;
    }

    if (field.type === 'select') {
      return (
        <Select {...controllerField} placeholder={field.placeholder || `请选择${field.label}`} allowClear style={{ width: field.width || '100%' }}>
          {field.options?.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
    }

    if (field.type === 'multiselect') {
      return (
        <Select {...controllerField} mode="multiple" placeholder={field.placeholder || `请选择${field.label}`} allowClear style={{ width: field.width || '100%' }}>
          {field.options?.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
    }

    // 默认返回空的div而不是null，避免类型错误
    return <div />;
  };

  return (
    <Form layout="horizontal" onFinish={handleSubmit(onSubmit)} style={{ marginBottom: 16 }} size="middle">
      <Row gutter={[16, 16]}>
        {fields.map(field => (
          <Col key={field.name} xs={24} sm={12} md={8} lg={6} xl={collapsed ? 4 : 6}>
            <Form.Item label={field.label}>
              <Controller
                name={field.name}
                control={control}
                defaultValue={field.type === 'multiselect' ? [] : ''}
                render={({ field: controllerField }) => renderFieldControl(field, controllerField)}
              />
            </Form.Item>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8} lg={6} xl={collapsed ? 4 : 6}>
          <Form.Item style={{ textAlign: 'right', marginTop: 4 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default Search;
