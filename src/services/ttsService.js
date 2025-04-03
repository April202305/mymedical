import Nls from 'alibabacloud-nls'

export class TTSService {
  constructor() {
    this.URL = "wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1"
    this.APPKEY = "SOxWUoD0IHTWxaOx"  // 需要替换为您的APPKEY
    this.TOKEN = "85e2472a278d4dd793bb87f5ec4d507e"    // 需要替换为您的TOKEN
  }

  async synthesize(text) {
    return new Promise((resolve, reject) => {
      const tts = new Nls.SpeechSynthesizer({
        url: this.URL,
        appkey: this.APPKEY,
        token: this.TOKEN
      })

      let audioData = []

      tts.on("meta", (msg) => {
        console.log("收到元信息:", msg)
      })

      tts.on("data", (msg) => {
        audioData.push(msg)
      })

      tts.on("completed", (msg) => {
        console.log("合成完成:", msg)
        const audioBlob = new Blob(audioData, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        resolve(audioUrl)
      })

      tts.on("failed", (msg) => {
        console.error("合成失败:", msg)
        reject(new Error("语音合成失败"))
      })

      tts.on("closed", () => {
        console.log("连接已关闭")
      })

      const param = tts.defaultStartParams()
      param.text = text
      param.voice = "xiaoyun"  // 发音人
      param.format = "wav"     // 音频格式
      param.sample_rate = 16000 // 采样率
      param.volume = 50        // 音量
      param.speech_rate = 0    // 语速
      param.pitch_rate = 0     // 语调

      tts.start(param, true, 6000).catch(error => {
        console.error("启动合成失败:", error)
        reject(error)
      })
    })
  }
} 