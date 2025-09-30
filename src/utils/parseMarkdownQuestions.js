/**
 * 解析Markdown格式的题库文件
 * @param {string} markdownContent - Markdown格式的题库内容
 * @returns {Array} - 解析后的题目数组
 */
export const parseMarkdownQuestions = (markdownContent) => {
  // 按照##分割题目
  const questionBlocks = markdownContent.split(/##\s/).filter(block => block.trim() !== '');
  
  // 解析每个题目块
  const questions = questionBlocks.map((block, index) => {
    const lines = block.split('\n').filter(line => line.trim() !== '');
    
    // 获取题目标题（第一行）
    const title = lines[0] || `题目${index + 1}`;
    
    // 解析题目内容
    const question = {};
    question.id = index + 1;
    
    lines.forEach(line => {
      if (line.startsWith('- 问题:')) {
        question.text = line.replace('- 问题:', '').trim();
      } else if (line.startsWith('- 选项A:')) {
        question.optionA = line.replace('- 选项A:', '').trim();
      } else if (line.startsWith('- 选项B:')) {
        question.optionB = line.replace('- 选项B:', '').trim();
      } else if (line.startsWith('- 选项C:')) {
        question.optionC = line.replace('- 选项C:', '').trim();
      } else if (line.startsWith('- 选项D:')) {
        question.optionD = line.replace('- 选项D:', '').trim();
      } else if (line.startsWith('- 正确答案:')) {
        question.correctAnswerLetter = line.replace('- 正确答案:', '').trim();
      } else if (line.startsWith('- 时间限制:')) {
        question.timeLimit = parseInt(line.replace('- 时间限制:', '').trim()) || 30;
      }
    });
    
    // 将选项组织成数组
    question.options = [
      question.optionA,
      question.optionB,
      question.optionC,
      question.optionD
    ].filter(option => option !== undefined);
    
    // 将正确答案字母转换为索引
    const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    question.correctAnswer = answerMap[question.correctAnswerLetter] !== undefined 
      ? answerMap[question.correctAnswerLetter] 
      : 0;
    
    return question;
  });
  
  return questions;
};

/**
 * 随机抽取指定数量的题目
 * @param {Array} questions - 题目数组
 * @param {number} count - 需要抽取的题目数量
 * @returns {Array} - 随机抽取的题目数组
 */
export const getRandomQuestions = (questions, count) => {
  // 打乱题目顺序
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  // 返回指定数量的题目
  return shuffled.slice(0, Math.min(count, questions.length));
};