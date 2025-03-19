import { User } from '@/types';
import { Button, Form, Input } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import React from 'react';
import axios from 'axios';
import { useUser } from '@/store/user-context';
export default function LoginScreen() {
  const handleSubmit = (user: User) => {
    const { setUser, setTokenToLocalStorage, setToken } = useUser();
    //模拟登录请求
    axios.post('/api/login', user).then(res => {
      const { data } = res;
      setUser(data.user);
      setTokenToLocalStorage(data.token);
      setToken(data.token);
    });
  };
  return (
    <Form onFinish={handleSubmit}>
      <label>用户名</label>
      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input placeholder="用户名" type="text" id="username" />
      </Form.Item>
      <label>密码</label>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input placeholder="密码" type="password" id="password" />
      </Form.Item>
      <FormItem>
        <Button htmlType="submit" type="primary">
          登录
        </Button>
      </FormItem>
    </Form>
  );
}
