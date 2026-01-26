# 学习计划工具

一个帮助用户设置学习目标、拆分任务并跟踪完成情况的移动应用。

## 功能特性

### 核心功能
- **学习计划管理** - 创建、编辑、删除学习计划，设置目标完成日期和优先级
- **任务管理** - 为每个计划添加多个任务，支持任务描述、截止日期和优先级设置
- **子任务拆分** - 将大任务拆分为多个小的子任务，逐步完成
- **进度跟踪** - 实时计算和显示计划、任务的完成进度
- **学习统计** - 查看总体完成度、按优先级分类统计、最近完成的任务列表

### 提醒功能
- **任务提醒** - 支持6种提醒类型：无提醒、提前5分钟、15分钟、30分钟、1小时、1天
- **本地通知** - 在设定的时间自动发送提醒通知
- **跨平台支持** - iOS和Android平台均支持提醒功能

### 用户体验
- **日期选择器** - 快捷日期选择（明天、后天、一周后等）和手动输入
- **深色模式** - 自动适配系统深色/浅色主题
- **触觉反馈** - 按钮点击、操作成功/失败的触觉反馈
- **响应式设计** - 适配不同屏幕尺寸的移动设备

## 技术栈

- **React Native 0.81** - 跨平台移动应用框架
- **Expo SDK 54** - 开发工具和原生功能集成
- **TypeScript 5.9** - 类型安全的JavaScript超集
- **NativeWind 4** - Tailwind CSS for React Native
- **AsyncStorage** - 本地数据持久化
- **Expo Notifications** - 本地推送通知
- **Expo Router 6** - 基于文件的路由系统

## 项目结构

```
learning-plan-app/
├── app/                          # 应用页面和路由
│   ├── (tabs)/                   # 底部标签页
│   │   ├── index.tsx            # 首页 - 计划列表
│   │   ├── statistics.tsx       # 统计页面
│   │   └── about.tsx            # 关于应用
│   ├── plan-form.tsx            # 创建/编辑计划
│   ├── plan-detail/[id].tsx     # 计划详情
│   ├── task-form/[planId].tsx   # 创建任务
│   └── task-detail/[planId]/[taskId].tsx  # 任务详情
├── components/                   # 可复用组件
│   ├── date-picker.tsx          # 日期选择器
│   ├── screen-container.tsx     # 屏幕容器
│   └── ui/                      # UI组件
├── lib/                         # 核心逻辑
│   ├── storage.ts               # 数据存储和类型定义
│   ├── plan-context.tsx         # 全局状态管理
│   └── notifications.ts         # 通知管理
├── hooks/                       # 自定义Hooks
├── assets/                      # 静态资源
└── __tests__/                   # 单元测试

```

## 开发指南

### 环境要求

- Node.js 22.x
- pnpm 9.x
- Expo CLI

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 在设备上预览

1. 安装 Expo Go 应用（iOS/Android）
2. 扫描终端显示的二维码
3. 应用将在您的设备上打开

### 运行测试

```bash
pnpm test
```

### 构建生产版本

```bash
# Android APK
eas build --platform android --profile preview

# iOS
eas build --platform ios --profile preview
```

## 数据模型

### Plan（学习计划）
```typescript
interface Plan {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetDate?: string;
  createdAt: string;
  tasks: Task[];
}
```

### Task（任务）
```typescript
interface Task {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  reminder?: ReminderType;
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];
}
```

### Subtask（子任务）
```typescript
interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}
```

## 开发者信息

- **开发者**: Kolin Lu
- **个人博客**: [Linluxi.com](https://linluxi.com)
- **应用版本**: 1.0.0

## 许可证

MIT License

## 更新日志

### v1.0.2 (2026-01-26)
- 修复APK构建问题
- 重新实现日期选择器（使用原生组件）
- 添加快捷日期选择功能
- 优化日期输入验证

### v1.0.1 (2026-01-26)
- 添加任务提醒功能
- 添加关于应用页面
- 优化用户界面

### v1.0.0 (2026-01-26)
- 初始版本发布
- 实现核心功能：计划管理、任务管理、进度跟踪
- 添加学习统计功能
- 支持深色模式
