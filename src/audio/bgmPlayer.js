/**
 * BGM播放器工具
 * 支持随机播放BGM文件夹下的音乐文件
 */

class BgmPlayer {
  constructor(config) {
    this.config = config;
    this.audio = null;
    this.bgmFiles = [];
    this.currentBgmIndex = 0;
    this.isMuted = false;
  }

  /**
   * 初始化BGM播放器
   */
  async init() {
    // 在实际项目中，这里可以加载BGM文件夹中的所有音频文件
    // 示例文件列表（实际使用时应动态加载）
    this.bgmFiles = this.config.bgmFiles || [];
  }

  /**
   * 随机播放BGM
   */
  playRandomBgm() {
    if (!this.config.autoPlay || this.bgmFiles.length === 0) {
      return;
    }

    // 随机选择一个BGM文件
    const randomIndex = Math.floor(Math.random() * this.bgmFiles.length);
    this.playBgm(randomIndex);
  }

  /**
   * 播放指定索引的BGM
   * @param {number} index - BGM文件索引
   */
  playBgm(index) {
    if (this.bgmFiles.length === 0 || index >= this.bgmFiles.length) {
      return;
    }

    // 停止当前播放的音乐
    this.stop();

    // 创建新的音频对象
    this.currentBgmIndex = index;
    // 确保文件夹路径以/结尾
    const folder = this.config.bgmFolder.endsWith('/') ? this.config.bgmFolder : this.config.bgmFolder + '/';
    const bgmPath = `${folder}${this.bgmFiles[index]}`;
    
    this.audio = new Audio(bgmPath);
    this.audio.volume = this.config.defaultVolume;
    this.audio.loop = false; // BGM通常不循环，播放完切换下一首
    this.audio.muted = this.isMuted;

    // 当前音乐播放完毕后播放下一首
    this.audio.addEventListener('ended', () => {
      this.playNext();
    });

    // 播放音乐
    this.audio.play().catch(e => {
      console.log("音频播放被阻止:", e);
    });
  }

  /**
   * 播放下一首BGM
   */
  playNext() {
    if (this.bgmFiles.length === 0) {
      return;
    }

    if (this.config.randomBgm) {
      // 随机播放模式
      this.playRandomBgm();
    } else {
      // 顺序播放模式
      const nextIndex = (this.currentBgmIndex + 1) % this.bgmFiles.length;
      this.playBgm(nextIndex);
    }
  }

  /**
   * 停止播放
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  /**
   * 设置静音状态
   * @param {boolean} muted - 是否静音
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.muted = muted;
    }
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值 (0-1)
   */
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export default BgmPlayer;