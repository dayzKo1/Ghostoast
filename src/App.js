import React, { useState, useEffect, useCallback, useRef } from 'react';
import questionsData from './questions.md';
import { parseMarkdownQuestions, getRandomQuestions } from './utils/parseMarkdownQuestions';
import musicConfig from './audio/musicConfig';
import BgmPlayer from './audio/bgmPlayer';
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
  const [isMuted, setIsMuted] = useState(false);
  const bgmPlayerRef = useRef(null);

  // 获取Markdown内容
  useEffect(() => {
    fetch(questionsData)
      .then(response => response.text())
      .then(text => setRawMarkdown(text));
  }, []);

  // 初始化BGM播放器
  useEffect(() => {
    const initBgmPlayer = async () => {
      bgmPlayerRef.current = new BgmPlayer(musicConfig);
      await bgmPlayerRef.current.init();
    };

    initBgmPlayer();
  }, []);

  // 移动到下一题
  const moveToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedOption(null);
    // 设置下一题的倒计时
    const nextQuestion = questions[currentQuestionIndex + 1];
    setQuestionTimeLeft(nextQuestion.timeLimit || 30);
  }, [currentQuestionIndex, questions]);

  // 结束答题
  const finishQuiz = useCallback(() => {
    setGameStatus('finished');
  }, []);

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
  }, [questions, currentQuestionIndex, userAnswers, moveToNextQuestion, finishQuiz]);

  // 总倒计时效果
  useEffect(() => {
    let timer;
    if (gameStatus === 'in-progress' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameStatus === 'in-progress' && timeLeft === 0) {
      finishQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStatus, finishQuiz]);

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
  }, [questionTimeLeft, gameStatus, questions, currentQuestionIndex, handleTimeUp]);

  // 控制BGM播放
  useEffect(() => {
    // 延迟一小段时间确保BGM播放器初始化完成
    const timer = setTimeout(() => {
      if (gameStatus === 'in-progress' && musicConfig.autoPlay && bgmPlayerRef.current) {
        // 开始答题时随机播放BGM
        bgmPlayerRef.current.playRandomBgm();
      } else if (gameStatus === 'finished' && bgmPlayerRef.current) {
        // 停止播放
        bgmPlayerRef.current.stop();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [gameStatus]);

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
    
    // 在用户交互后尝试播放音乐
    if (bgmPlayerRef.current) {
      setTimeout(() => {
        bgmPlayerRef.current.playOnUserInteraction();
      }, 200);
    }
  }, [rawMarkdown]);

  // 选择答案
  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  // 提交答案
  const submitAnswer = useCallback(() => {
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
  }, [currentQuestionIndex, questions, score, selectedOption, userAnswers, moveToNextQuestion, finishQuiz]);

  // 切换静音状态
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (bgmPlayerRef.current) {
      bgmPlayerRef.current.setMuted(newMutedState);
    }
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取面包烘烤进度显示
  const getBreadProgress = () => {
    if (questions.length === 0) return 0;
    const progress = Math.round((score / questions.length) * 4); // 0-4的进度
    return Math.min(progress, 4);
  };

  // 面包烘烤状态描述
  const getBreadDescription = () => {
    const progress = getBreadProgress();
    switch (progress) {
      case 0: return "未烤的面包";
      case 1: return "微烤的面包";
      case 2: return "半熟的面包";
      case 3: return "快熟的面包";
      case 4: return "全熟的面包";
      default: return "未烤的面包";
    }
  };

  // 面包表情符号
  const getBreadEmoji = () => {
    const progress = getBreadProgress();
    switch (progress) {
      case 0: return "🍞";
      case 1: return "🍞";
      case 2: return "🍞";
      case 3: return "🍞";
      case 4: return "🍞";
      default: return "🍞";
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>答题烘烤坊</h1>
        {gameStatus === 'not-started' && (
          <div className="start-screen">
            <h2>欢迎来到答题烘烤坊！</h2>
            <div className="bread-area">
              <div className="bread-emoji">{getBreadEmoji()}</div>
              <div className="bread-status">未烤的面包</div>
              <div className="bread-description">每答对一道题，面包就离烤好更近一步！</div>
            </div>
            <p>题目数量: 随机抽取最多5题</p>
            <p>总时间: 5 分钟</p>
            <div className="audio-controls">
              <button onClick={toggleMute} className="mute-button">
                {isMuted ? '🔇 点击取消静音' : '🔊 点击静音'}
              </button>
            </div>
            <button onClick={startQuiz} className="start-button">
              开始烘烤面包
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
              <div className="audio-controls">
                <button onClick={toggleMute} className="mute-button small">
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </div>
            </div>

            <div className="question-section">
              <div className="bread-progress">
                <div className="bread-emoji">{getBreadEmoji()}</div>
                <div className="bread-status">{getBreadDescription()}</div>
                <div className="score-display">得分: {score}/{questions.length}</div>
              </div>
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
            <h2>烘烤完成!</h2>
            <div className="bread-result">
              <div className="bread-emoji">{getBreadEmoji()}</div>
              <div className="bread-status">{getBreadDescription()}</div>
              {getBreadProgress() === 4 ? (
                <div className="perfect-bread">🎉 恭喜！你获得了一个完美的全熟面包！ 🎉</div>
              ) : (
                <div className="bread-message">
                  {score > 0 
                    ? `不错哦！答对了${score}题，继续努力可以获得完美面包！` 
                    : "还需要多加练习哦，再来一次吧！"}
                </div>
              )}
            </div>
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
            <div className="audio-controls">
              <button onClick={toggleMute} className="mute-button">
                {isMuted ? '🔇 点击取消静音' : '🔊 点击静音'}
              </button>
            </div>
            <button onClick={startQuiz} className="restart-button">
              重新烘烤
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;