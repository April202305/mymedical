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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'

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

    // 添加动画状态
    const animationState = {
      breathingOffset: 0,
      swayOffset: 0
    }

    // 呼吸动画函数
    const updateBreathing = (deltaTime) => {
      if (!vrm || !vrm.humanoid) return
      
      animationState.breathingOffset += deltaTime * 2
      const breatheAmount = Math.sin(animationState.breathingOffset) * 0.03

      // 上半身轻微上下移动
      const chest = vrm.humanoid.getNormalizedBoneNode('chest')
      if (chest) {
        chest.position.y = breatheAmount
      }

      // 头部轻微跟随
      const neck = vrm.humanoid.getNormalizedBoneNode('neck')
      if (neck) {
        neck.rotation.x = breatheAmount * 0.1
      }
    }

    // 身体摆动动画
    const updateSwaying = (deltaTime) => {
      if (!vrm || !vrm.humanoid) return

      animationState.swayOffset += deltaTime
      const swayAmount = Math.sin(animationState.swayOffset) * 0.02

      // 整体轻微左右摆动
      const hips = vrm.humanoid.getNormalizedBoneNode('hips')
      if (hips) {
        hips.rotation.y = swayAmount
      }

      // 头部轻微跟随
      const head = vrm.humanoid.getNormalizedBoneNode('head')
      if (head) {
        head.rotation.z = -swayAmount * 0.2
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

        // 添加轨道控制器
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.minDistance = 1.0
        controls.maxDistance = 3.0
        controls.minPolarAngle = Math.PI / 4
        controls.maxPolarAngle = Math.PI / 1.5
        controls.target.set(0, 1.2, 0)

        // 添加灯光
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(1, 1, 1)
        scene.add(light)
        scene.add(new THREE.AmbientLight(0xffffff, 0.5))

        // 加载 VRM 模型
        const loader = new GLTFLoader()
        loader.register((parser) => new VRMLoaderPlugin(parser))
        
        clock = new THREE.Clock()
        
        loader.load(
          '/models/虚拟数字人.vrm',
          (gltf) => {
            const vrmData = gltf.userData.vrm
            if (vrmData) {
              vrm = vrmData
              vrm.scene = gltf.scene
              vrm.scene.rotation.y = Math.PI
              vrm.scene.scale.set(1.2, 1.2, 1.2)
              scene.add(vrm.scene)
              loading.value = false

              // 更新动画循环
              const animate = () => {
                const deltaTime = clock.getDelta()
                
                if (vrm) {
                  // 更新 VRM
                  vrm.update(deltaTime)
                  
                  // 更新自定义动画
                  updateBreathing(deltaTime)
                  updateSwaying(deltaTime)
                }
                
                controls.update()
                renderer.render(scene, camera)
                animationFrame = requestAnimationFrame(animate)
              }

              animate()
            } else {
              error.value = 'VRM 模型加载失败'
              loading.value = false
            }
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
          },
          (err) => {
            loading.value = false
            error.value = '模型加载失败，请检查文件路径'
            console.error('模型加载错误:', err)
          }
        )
      } catch (err) {
        loading.value = false
        error.value = '初始化失败: ' + err.message
        console.error('初始化错误:', err)
      }
    }

    // 处理窗口大小变化
    const handleResize = () => {
      if (!avatarCanvas.value) return
      
      const width = avatarCanvas.value.clientWidth
      const height = avatarCanvas.value.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    // 组件挂载时初始化
    onMounted(() => {
      setTimeout(() => {
        initAvatar()
      }, 0)
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载时清理
    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      window.removeEventListener('resize', handleResize)
      if (renderer) {
        renderer.dispose()
      }
    })

    return {
      avatarCanvas,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.avatar-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
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