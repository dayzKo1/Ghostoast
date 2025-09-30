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
      return Promise.resolve(); // 返回resolved的Promise
    }

    // 随机选择一个BGM文件
    const randomIndex = Math.floor(Math.random() * this.bgmFiles.length);
    return this.playBgm(randomIndex); // 返回playBgm的Promise
  }

  /**
   * 播放指定索引的BGM
   * @param {number} index - BGM文件索引
   */
  playBgm(index) {
    return new Promise((resolve, reject) => {
      if (this.bgmFiles.length === 0 || index >= this.bgmFiles.length) {
        return resolve(); // 无文件可播放时resolve
      }

      // 停止当前播放的音乐
      this.stop();

      // 创建新的音频对象
      this.currentBgmIndex = index;
      const fileName = this.bgmFiles[index];
      const bgmPath = `${this.config.bgmFolder}${fileName}`;
      
      this.audio = new Audio();
      this.audio.volume = this.config.defaultVolume;
      this.audio.loop = false; // BGM通常不循环，播放完切换下一首
      this.audio.muted = this.isMuted;
      
      // 检查文件扩展名并设置正确的类型
      const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      
      // 如果是M4A文件，特殊处理
      if (fileExt === '.m4a') {
        // 创建source元素以更好地支持M4A
        const source = document.createElement('source');
        source.src = bgmPath;
        source.type = 'audio/mp4'; // M4A通常使用audio/mp4 MIME类型
        this.audio.appendChild(source);
      } else if (fileExt === '.flac') {
        // 如果是FLAC文件
        const source = document.createElement('source');
        source.src = bgmPath;
        source.type = 'audio/flac';
        this.audio.appendChild(source);
      } else if (fileExt === '.mp3') {
        // 如果是MP3文件
        const source = document.createElement('source');
        source.src = bgmPath;
        source.type = 'audio/mpeg';
        this.audio.appendChild(source);
      } else {
        // 其他格式直接设置src
        this.audio.src = bgmPath;
      }

      // 当前音乐播放完毕后播放下一首
      this.audio.addEventListener('ended', () => {
        this.playNext();
      });

      // 音频可以播放时resolve
      this.audio.addEventListener('canplay', () => {
        resolve();
      }, { once: true });

      // 音频播放错误时reject
      this.audio.addEventListener('error', (e) => {
        reject(new Error(`Failed to load audio: ${e.message}`));
      }, { once: true });

      // 播放音乐
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log("音频播放被阻止:", e);
          // 可能是自动播放策略阻止，尝试用户交互后播放
          if (e.name === 'NotAllowedError') {
            console.log("自动播放被浏览器阻止，需要用户交互");
          }
          // 即使播放失败也resolve，因为我们已经处理了错误
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 播放下一首BGM
   */
  playNext() {
    if (this.bgmFiles.length === 0) {
      return Promise.resolve();
    }

    if (this.config.randomBgm) {
      // 随机播放模式
      return this.playRandomBgm();
    } else {
      // 顺序播放模式
      const nextIndex = (this.currentBgmIndex + 1) % this.bgmFiles.length;
      return this.playBgm(nextIndex);
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
  
  /**
   * 尝试在用户交互后播放（解决自动播放策略问题）
   */
  playOnUserInteraction() {
    if (this.audio) {
      // 如果已经有音频对象，先尝试播放
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        return playPromise.catch(e => {
          console.log("用户交互后播放仍被阻止:", e);
        });
      }
      return Promise.resolve();
    } else if (this.bgmFiles.length > 0) {
      // 如果还没有音频对象，创建并播放第一个文件
      return this.playRandomBgm();
    }
    return Promise.resolve();
  }
}

export default BgmPlayer;