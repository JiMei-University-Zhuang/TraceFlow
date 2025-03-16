# Trace Server 部署指南

## 环境要求

- Node.js >= 16
- PostgreSQL >= 12
- Redis (可选)
- PM2 (用于进程管理)

## 部署步骤

### 1. 准备工作

1. 在服务器上安装必要的软件：

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 PostgreSQL（如果未安装）
sudo apt-get install postgresql postgresql-contrib
```

2. 创建数据库：

```sql
CREATE DATABASE traceflow;
CREATE USER your_db_user WITH ENCRYPTED PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE traceflow TO your_db_user;
```

### 2. 部署文件

1. 在服务器上创建项目目录：

```bash
mkdir -p /www/wwwroot/traceflow
cd /www/wwwroot/traceflow
```

2. 上传以下文件到服务器：

   - `dist/` 目录（编译后的文件）
   - `ecosystem.config.js`（PM2 配置文件）
   - `config/production.env`（生产环境配置）
   - `package.json` 和 `package-lock.json`

3. 安装依赖：

```bash
npm ci --production
```

### 3. 配置环境

1. 修改 `config/production.env` 文件，设置正确的：

   - 数据库连接信息
   - JWT 密钥
   - Redis 配置（如果使用）
   - 日志路径

2. 创建日志目录：

```bash
mkdir -p /www/wwwroot/traceflow/logs
chmod 755 /www/wwwroot/traceflow/logs
```

### 4. 启动服务

使用 PM2 启动服务：

```bash
cd /www/wwwroot/traceflow
pm2 start ecosystem.config.js --env production
```

### 5. 配置 Nginx

添加以下 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 日志配置
    access_log /www/wwwlogs/traceflow.access.log;
    error_log /www/wwwlogs/traceflow.error.log;
}
```

### 6. 常用命令

```bash
# 启动服务
pm2 start ecosystem.config.js --env production

# 停止服务
pm2 stop trace-server

# 重启服务
pm2 restart trace-server

# 查看日志
pm2 logs trace-server

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

### 7. 目录结构

```
/www/wwwroot/traceflow/
├── dist/               # 编译后的文件
├── node_modules/       # 依赖包
├── config/            # 配置文件
│   └── production.env
├── logs/              # 日志文件
├── ecosystem.config.js # PM2配置
└── package.json
```

## 注意事项

1. 确保服务器防火墙允许 3000 端口（或你设置的其他端口）
2. 定期备份数据库
3. 监控服务器资源使用情况
4. 设置日志轮转，避免日志文件过大
5. 配置文件中的敏感信息（如数据库密码、JWT密钥）要妥善保管

## 故障排查

1. 查看应用日志：

```bash
pm2 logs trace-server
```

2. 查看系统日志：

```bash
tail -f /var/log/syslog
```

3. 检查数据库连接：

```bash
psql -h localhost -U your_db_user -d traceflow
```

4. 检查端口占用：

```bash
netstat -tulpn | grep 3000
```
