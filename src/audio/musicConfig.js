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
  
  // BGM文件夹路径
  bgmFolder: "./bgmFiles/",
  
  // BGM文件列表（实际项目中可以动态加载文件夹中的文件）
  bgmFiles: [
    // 示例文件，实际使用时需要添加真实音频文件
    "靠近一点点.m4a"
    // 可以添加更多不同格式的音频文件
    // "叹云兮.mp3",
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
  randomBgm: true,  // 是否随机播放BGM
  allowMute: true   // 是否允许静音
};

export default musicConfig;