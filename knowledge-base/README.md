# 知识库文件夹

此文件夹用于存放答题系统的题库Excel文件。

## 文件格式说明

Excel文件应包含以下列：
- **ID**: 题目唯一标识符
- **Question**: 题目内容
- **OptionA**: 选项A
- **OptionB**: 选项B
- **OptionC**: 选项C
- **OptionD**: 选项D
- **CorrectAnswer**: 正确答案（A/B/C/D）
- **TimeLimit**: 答题时间限制（秒）
- **Category**: 题目分类（可选）

## 使用方法

1. 将Excel文件放入此文件夹
2. 系统会自动读取文件中的题目信息
3. 支持多个Excel文件同时存在

## 示例文件

- [sample_questions.xlsx](sample_questions.xlsx) - 示例题库文件