import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Input, Select, Button, Space } from 'antd';

interface FieldConfig {
  label: string;
  name: string;
  type: 'input' | 'select';
  options?: { label: string; value: string }[];
}

interface SearchProps {
  fields: FieldConfig[];
  onSubmit: (values: any) => void;
}

const Search: React.FC<SearchProps> = ({ fields, onSubmit }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = field.type === 'select' ? '' : '';
        return acc;
      },
      {} as Record<string, string>,
    ),
  });

  return (
    <Form
      layout="inline"
      onFinish={handleSubmit(onSubmit)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginLeft: '20px',
      }}
    >
      <Space size={4}>
        {fields.map(field => (
          <Form.Item key={field.name} label={<span style={{ color: '#ccc' }}>{field.label}</span>}>
            <Controller
              name={field.name}
              control={control}
              defaultValue={field.type === 'select' ? '' : ''}
              render={({ field: controllerField }) =>
                field.type === 'input' ? (
                  <Input
                    {...controllerField}
                    style={{
                      width: '125px',
                      backgroundColor: '#1a1a1a',
                      color: 'white',
                      border: '1px solid #555',
                      padding: '4px 8px',
                    }}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    {...controllerField}
                    allowClear
                    style={{
                      width: '120px',
                      backgroundColor: '#1a1a1a',
                      color: 'white',
                      padding: '4px 8px',
                    }}
                  >
                    <Select.Option value="">请选择</Select.Option>
                    {field.options?.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : null
              }
            />
          </Form.Item>
        ))}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: '#1677ff',
              borderColor: '#1677ff',
              color: 'white',
            }}
          >
            查询
          </Button>
        </Form.Item>
      </Space>
    </Form>
  );
};

export default Search;
