// 背景音乐配置文件
const musicConfig = {
  // 背景音乐列表
  backgroundMusic: [
    {
      id: 1,
      name: "轻松背景音乐",
      file: null, // 实际项目中可以放置音乐文件路径
      volume: 0.5,
      loop: true
    }
  ],
  
  // 音效列表
  soundEffects: {
    start: null,     // 开始答题音效
    correct: null,   // 正确答案音效
    wrong: null,     // 错误答案音效
    timeout: null    // 时间到音效
  },
  
  // 默认设置
  defaultVolume: 0.5,
  autoPlay: true,   // 是否自动播放
  allowMute: true   // 是否允许静音
};

export default musicConfig;