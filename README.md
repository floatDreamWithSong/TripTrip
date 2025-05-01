TripTrip是一个基于pnpm workspace的monorepo项目，主要优点包括：

1. **代码共享方便**：所有子包可以轻松共享公共验证逻辑代码（utils子包）和前后端数据类型定义（types子包）
2. **依赖管理统一**：一些共用的依赖集中在根目录管理，避免重复安装
3. **独立开发灵活**：每个子包可以独立开发和构建

以下是主要脚本命令的使用说明：

### 安装依赖
```bash
pnpm install
```

### 开发环境启动
```bash
# 启动管理后台开发服务
pnpm dev:admin

# 启动用户端H5开发环境 
pnpm dev:user:h5

# 启动用户端小程序开发环境
pnpm dev:user:weapp

# 启动后端服务开发环境
pnpm dev:server

# 同时启动移动端，管理端，后端三个开发服务器
pnpm dev
```

### 构建命令
```bash
# 构建所有子包
pnpm build

# 构建管理后台
pnpm build:admin

# 构建用户端H5
pnpm build:user:h5

# 构建用户端小程序
pnpm build:user:weapp

# 构建后端服务
pnpm build:server
```

### 构建公共库

如果commons库发生变动了，需要build一下，其它库才能跟进公共库导出的代码

```bash
# 构建公共库
pnpm build:types
pnpm build:utils
```

### 代码检查与格式化
```bash
# 检查所有子包代码
pnpm lint

# 格式化所有子包代码
pnpm format
```

### 数据库相关
```bash
# 生成Prisma客户端
pnpm server:prisma:generate

# 开发环境数据库迁移
pnpm server:prisma:migrate:dev
```

        