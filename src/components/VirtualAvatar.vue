<template>
  <div class="avatar-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <canvas ref="avatarCanvas"></canvas>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { TTSService } from '../services/ttsService'

export default {
  name: 'VirtualAvatar',
  setup() {
    const avatarCanvas = ref(null)
    const loading = ref(true)
    const error = ref(null)
    let scene, camera, renderer, controls
    let vrm = null
    let animationFrame = null
    let clock = null
    let audioContext = null
    let analyser = null
    let speaking = false
    const ttsService = new TTSService()

    // 添加说话功能
    const speak = async (text) => {
      try {
        if (!vrm || !vrm.blendshape) return

        // 创建音频上下文和分析器
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 256

        // 合成语音
        const audioUrl = await ttsService.synthesize(text)
        
        // 加载音频文件
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(analyser)
        source.connect(audioContext.destination)
        
        speaking = true
        source.start(0)

        // 开始口型动画
        const animateMouth = () => {
          if (!speaking) return

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(dataArray)
          
          // 计算音量
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          const threshold = 10 // 音量阈值
          
          // 根据音量控制口型
          if (average > threshold) {
            vrm.blendshape.setValue('viseme_aa', 1.0) // 张嘴
          } else {
            vrm.blendshape.setValue('viseme_aa', 0.0) // 闭嘴
          }

          requestAnimationFrame(animateMouth)
        }

        animateMouth()

        // 音频播放结束时停止说话
        source.onended = () => {
          speaking = false
          vrm.blendshape.setValue('viseme_aa', 0.0)
          URL.revokeObjectURL(audioUrl) // 释放音频URL
        }
      } catch (err) {
        console.error('语音合成失败:', err)
        error.value = '语音合成失败'
      }
    }

    // 停止说话
    const stopSpeaking = () => {
      speaking = false
      if (audioContext) {
        audioContext.close()
        audioContext = null
      }
      if (vrm && vrm.blendshape) {
        vrm.blendshape.setValue('viseme_aa', 0.0)
      }
    }

    const initAvatar = () => {
      try {
        // 创建场景
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf0f0f0)

        // 创建相机
        camera = new THREE.PerspectiveCamera(
          45,
          avatarCanvas.value.clientWidth / avatarCanvas.value.clientHeight,
          0.1,
          1000
        )
        camera.position.set(0, 1.2, 1.5)

        // 创建渲染器
        renderer = new THREE.WebGLRenderer({
          canvas: avatarCanvas.value,
          antialias: true
        })
        renderer.setSize(avatarCanvas.value.clientWidth, avatarCanvas.value.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)

        // 创建控制器
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.target.set(0, 1.2, 0)

        // 添加光源
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(1, 1, 1)
        scene.add(light)
        scene.add(new THREE.AmbientLight(0xffffff, 0.5))

        // 创建加载器
        const loader = new GLTFLoader()
        const plugin = new VRMLoaderPlugin()
        loader.register(() => plugin)
        
        clock = new THREE.Clock()
        
        // 加载模型
        loader.load(
          '/models/虚拟数字人.vrm',
          (gltf) => {
            try {
              const vrmData = gltf.userData.vrm
              if (vrmData) {
                vrm = vrmData
                scene.add(vrm.scene)
                vrm.scene.rotation.y = Math.PI
                vrm.scene.scale.set(1.2, 1.2, 1.2)

                // 设置手臂自然下垂
                if (vrm.humanoid) {
                  const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm')
                  const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm')
                  if (leftArm) {
                    leftArm.rotation.set(0, 0, 20)
                  }
                  if (rightArm) {
                    rightArm.rotation.set(0, 0, -20)
                  }
                }

                loading.value = false

                // 动画循环
                const animate = () => {
                  const deltaTime = clock.getDelta()
                  
                  if (vrm) {
                    vrm.update(deltaTime)
                  }
                  
                  controls.update()
                  renderer.render(scene, camera)
                  animationFrame = requestAnimationFrame(animate)
                }

                animate()
              } else {
                error.value = 'VRM模型加载失败'
                loading.value = false
              }
            } catch (err) {
              error.value = 'VRM处理失败: ' + err.message
              loading.value = false
              console.error(err)
            }
          },
          undefined,
          (err) => {
            error.value = '模型加载失败: ' + err.message
            loading.value = false
            console.error(err)
          }
        )
      } catch (err) {
        error.value = '初始化失败: ' + err.message
        loading.value = false
        console.error(err)
      }
    }

    const handleResize = () => {
      if (!avatarCanvas.value || !camera || !renderer) return
      
      const width = avatarCanvas.value.clientWidth
      const height = avatarCanvas.value.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    onMounted(() => {
      setTimeout(initAvatar, 0)
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      window.removeEventListener('resize', handleResize)
      if (renderer) {
        renderer.dispose()
      }
      if (audioContext) {
        audioContext.close()
      }
    })

    return {
      avatarCanvas,
      loading,
      error,
      speak,
      stopSpeaking
    }
  }
}

</script>

<style scoped>
.avatar-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.loading, .error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  z-index: 1;
}

.error {
  color: red;
}
</style> 
