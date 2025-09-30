import React, { useState, useEffect, useCallback } from 'react';
import Markdown from 'markdown-to-jsx';
import questionsData from './questions.md';
import { parseMarkdownQuestions, getRandomQuestions } from './utils/parseMarkdownQuestions';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5分钟总倒计时
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0); // 每题倒计时
  const [gameStatus, setGameStatus] = useState('not-started'); // not-started, in-progress, finished
  const [userAnswers, setUserAnswers] = useState([]);
  const [rawMarkdown, setRawMarkdown] = useState('');

  // 获取Markdown内容
  useEffect(() => {
    fetch(questionsData)
      .then(response => response.text())
      .then(text => setRawMarkdown(text));
  }, []);

  // 总倒计时效果
  useEffect(() => {
    let timer;
    if (gameStatus === 'in-progress' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameStatus === 'in-progress' && timeLeft === 0) {
      finishQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStatus]);

  // 每题倒计时效果
  useEffect(() => {
    let questionTimer;
    if (gameStatus === 'in-progress' && questionTimeLeft > 0) {
      questionTimer = setTimeout(() => setQuestionTimeLeft(questionTimeLeft - 1), 1000);
    } else if (gameStatus === 'in-progress' && questionTimeLeft === 0 && questions.length > 0) {
      // 时间到了自动跳转到下一题
      handleTimeUp();
    }
    return () => clearTimeout(questionTimer);
  }, [questionTimeLeft, gameStatus, questions, currentQuestionIndex]);

  // 处理题目时间到的情况
  const handleTimeUp = useCallback(() => {
    // 记录未答题
    const currentQuestion = questions[currentQuestionIndex];
    const newUserAnswers = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        selectedOption: null,
        isCorrect: false
      }
    ];
    
    setUserAnswers(newUserAnswers);

    // 移动到下一题或结束
    if (currentQuestionIndex < questions.length - 1) {
      moveToNextQuestion();
    } else {
      finishQuiz();
    }
  }, [questions, currentQuestionIndex, userAnswers]);

  // 移动到下一题
  const moveToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedOption(null);
    // 设置下一题的倒计时
    const nextQuestion = questions[currentQuestionIndex + 1];
    setQuestionTimeLeft(nextQuestion.timeLimit || 30);
  }, [currentQuestionIndex, questions]);

  // 开始答题
  const startQuiz = useCallback(() => {
    // 解析Markdown题库
    const parsedQuestions = parseMarkdownQuestions(rawMarkdown);
    // 随机抽取题目（最多5题）
    const selectedQuestions = getRandomQuestions(parsedQuestions, Math.min(5, parsedQuestions.length));
    
    setQuestions(selectedQuestions);
    setGameStatus('in-progress');
    setTimeLeft(300); // 5分钟总时间
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedOption(null);
    // 设置第一题的倒计时
    setQuestionTimeLeft(selectedQuestions[0]?.timeLimit || 30);
  }, [rawMarkdown]);

  // 选择答案
  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  // 提交答案
  const submitAnswer = () => {
    if (selectedOption === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    const newUserAnswers = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        selectedOption: selectedOption,
        isCorrect: isCorrect
      }
    ];
    
    setUserAnswers(newUserAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // 移动到下一题或结束
    if (currentQuestionIndex < questions.length - 1) {
      moveToNextQuestion();
    } else {
      finishQuiz();
    }
  };

  // 结束答题
  const finishQuiz = () => {
    setGameStatus('finished');
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>答题系统</h1>
        {gameStatus === 'not-started' && (
          <div className="start-screen">
            <h2>欢迎来到答题系统</h2>
            <p>题目数量: 随机抽取最多5题</p>
            <p>总时间: 5 分钟</p>
            <button onClick={startQuiz} className="start-button">
              开始答题
            </button>
          </div>
        )}

        {gameStatus === 'in-progress' && questions.length > 0 && (
          <div className="quiz-screen">
            <div className="quiz-header">
              <div className="timer">
                总剩余时间: {formatTime(timeLeft)}
              </div>
              <div className="question-timer">
                本题剩余: {formatTime(questionTimeLeft)}
              </div>
              <div className="progress">
                进度: {currentQuestionIndex + 1}/{questions.length}
              </div>
            </div>

            <div className="question-section">
              <h2>{questions[currentQuestionIndex].text}</h2>
              <div className="options">
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${selectedOption === index ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={questionTimeLeft === 0}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
              <button 
                onClick={submitAnswer} 
                disabled={selectedOption === null || questionTimeLeft === 0}
                className="submit-button"
              >
                {currentQuestionIndex < questions.length - 1 ? '下一题' : '提交答案'}
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'finished' && (
          <div className="result-screen">
            <h2>答题完成!</h2>
            <p className="score">你的得分: {score}/{questions.length}</p>
            <div className="answers-review">
              <h3>答题回顾</h3>
              {questions.map((question, index) => {
                const userAnswer = userAnswers.find(ans => ans.questionId === question.id);
                return (
                  <div key={question.id} className="review-item">
                    <p><strong>问题 {index + 1}: {question.text}</strong></p>
                    <p>你的答案: {userAnswer?.selectedOption !== null && userAnswer?.selectedOption !== undefined ? 
                      `${String.fromCharCode(65 + userAnswer.selectedOption)}. ${question.options[userAnswer.selectedOption]}` : 
                      '未作答'}</p>
                    <p className={userAnswer?.isCorrect ? 'correct' : 'incorrect'}>
                      {userAnswer?.isCorrect ? '✓ 正确' : userAnswer?.selectedOption === null || userAnswer?.selectedOption === undefined ? '✗ 未作答' : '✗ 错误'}
                    </p>
                  </div>
                );
              })}
            </div>
            <button onClick={startQuiz} className="restart-button">
              重新开始
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;