import React from 'react';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd';

// 定义 onChange 函数的类型
type OnChangeFunction = (e: RadioChangeEvent) => void;
//type SelectOnChangeFunction = (value: string) => void;
// 定义 TimeSelector 组件的 props 类型
type TimeSelectorProps = {
  onChangeTime: OnChangeFunction;
  time: string;
};

export const TimeSelector: React.FC<TimeSelectorProps> = ({ onChangeTime, time }) => {
  return (
    <div
      style={{
        marginRight: 20,
        marginLeft: 5,
      }}
    >
      <span>时间：</span>{' '}
      <Radio.Group
        onChange={onChangeTime}
        value={time}
        options={[
          {
            value: 'today',
            label: <p>今日</p>,
          },
          {
            value: 'yesterday',
            label: <p>昨日</p>,
          },
          {
            value: 'seven',
            label: <p>近7天</p>,
          },
          {
            value: 'thirty',
            label: <p>近30天</p>,
          },
        ]}
      />{' '}
    </div>
  );
};
