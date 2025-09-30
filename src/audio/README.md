# 音频功能说明

## 音频配置

音频配置文件位于 [musicConfig.js](musicConfig.js)，包含以下设置：

- `backgroundMusic`: 背景音乐列表
- `soundEffects`: 音效列表（开始、正确、错误、时间到等）
- `defaultVolume`: 默认音量
- `autoPlay`: 是否自动播放
- `allowMute`: 是否允许静音

## 添加音频文件

要添加实际的音频文件，请执行以下操作：

1. 将音频文件放入 [audio](.) 文件夹
2. 在 [musicConfig.js](musicConfig.js) 中更新对应的文件路径
3. 重新构建并部署应用

## 静音控制

用户可以通过点击 "🔊 点击静音" / "🔇 点击取消静音" 按钮来控制音频播放。