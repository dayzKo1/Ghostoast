# 答题系统

这是一个基于React构建的答题系统，具有以下功能：

1. 支持JSON配置题库
2. 倒计时答题系统
3. 随机抽取题库系统
4. GitHub Pages部署

## 功能特点

- **JSON题库配置**：题目存储在 [src/questions.json](src/questions.json) 文件中，可以轻松添加或修改题目
- **倒计时功能**：默认设置为5分钟答题时间，在界面上方实时显示剩余时间
- **每题倒计时**：每道题都有独立的倒计时，时间结束后自动跳转到下一题
- **随机抽题**：每次开始答题时会从题库中随机选取题目
- **答题回顾**：答题结束后可查看每道题的正确与否及自己的选择

## 安装与运行

1. 克隆或下载此项目
2. 在项目根目录下运行 `npm install` 安装依赖
3. 运行 `npm start` 启动开发服务器

## 部署到GitHub Pages

1. 修改 [package.json](package.json) 中的 `homepage` 字段为你自己的GitHub Pages地址：
   ```
   "homepage": "https://[你的用户名].github.io/quiz-system"
   ```

2. 运行 `npm run deploy` 命令进行部署

## 自定义题库

编辑 [src/questions.json](src/questions.json) 文件来自定义题库。每个题目包含以下字段：

- `id`: 题目唯一标识符
- `text`: 题目内容
- `options`: 选项数组
- `correctAnswer`: 正确答案索引（从0开始）
- `timeLimit`: 每题的时间限制（秒）

示例：
```json
{
  "id": 1,
  "text": "世界上最大的洲是哪个？",
  "options": [
    "A. 非洲",
    "B. 亚洲",
    "C. 欧洲",
    "D. 北美洲"
  ],
  "correctAnswer": 1,
  "timeLimit": 30
}
```

## 知识库管理

[knowledge-base](knowledge-base) 文件夹用于存放题库的Excel文件，方便非技术人员维护题目。

- [knowledge-base/README.md](knowledge-base/README.md) - 知识库使用说明
- [knowledge-base/sample_questions.xlsx](knowledge-base/sample_questions.xlsx) - 示例题库Excel文件

## 技术栈

- React
- JavaScript (ES6+)
- CSS3

## 可扩展功能

你可以根据需求继续扩展此系统，例如：
- 添加题目分类
- 实现不同难度等级
- 记录用户历史成绩
- 添加更多题型（多选题、判断题等）