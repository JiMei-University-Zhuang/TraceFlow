# 认证 API 文档

本文档提供了 TraceFlow 认证系统的 API 使用示例，包括用户注册和登录功能。

## 用户注册

注册新用户账号。

### 请求

```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 响应

```json
{
  "_id": "65f6a8c7e4b0a1b2c3d4e5f6",
  "username": "testuser",
  "email": "test@example.com",
  "role": "user",
  "isActive": true,
  "projects": [],
  "createdAt": "2024-03-17T08:30:15.123Z",
  "updatedAt": "2024-03-17T08:30:15.123Z"
}
```

## 用户登录

使用用户名和密码登录系统。

### 请求

```http
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 响应

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f6a8c7e4b0a1b2c3d4e5f6",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

## 验证登录功能

你可以使用以下方法验证登录功能是否正常工作：

### 使用 curl 命令行工具

1. 注册新用户：

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

2. 登录用户：

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

3. 使用返回的 token 访问受保护的资源：

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 使用 Postman

1. 创建一个 POST 请求到 `http://localhost:3000/auth/register`，设置 Body 为 raw JSON：

   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. 创建一个 POST 请求到 `http://localhost:3000/auth/login`，设置 Body 为 raw JSON：

   ```json
   {
     "username": "testuser",
     "password": "password123"
   }
   ```

3. 从登录响应中复制 `access_token`，然后创建一个 GET 请求到 `http://localhost:3000/users`，在 Headers 中添加：
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

## 错误处理

### 注册错误

- 用户名已存在：

```json
{
  "statusCode": 409,
  "message": "用户名已存在",
  "error": "Conflict"
}
```

- 邮箱已存在：

```json
{
  "statusCode": 409,
  "message": "邮箱已存在",
  "error": "Conflict"
}
```

### 登录错误

- 用户名或密码不正确：

```json
{
  "statusCode": 401,
  "message": "用户名或密码不正确",
  "error": "Unauthorized"
}
```

## 安全建议

1. 在生产环境中，确保使用 HTTPS 传输所有认证请求
2. 定期轮换 JWT 密钥
3. 设置合理的 token 过期时间
4. 实现刷新 token 机制以提高安全性
