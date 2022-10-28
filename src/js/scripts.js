import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const renderer = new THREE.WebGLRenderer()

renderer.shadowMap.enabled = true

renderer.setSize(window.innerWidth, innerHeight)

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 3

const footballPlayer = new URL('../assets/FootBall_Player_England.glb', import.meta.url)

const assetLoader = new GLTFLoader()

assetLoader.load(footballPlayer.href, (gltf) => {
    const model = gltf.scene
    scene.add(model)
    model.position.set(0, -1, 0)
}, undefined, (error) => {
    console.error(error)
})

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionLight.position.set(0, 0, 10)
directionLight.castShadow = true
directionLight.shadow.camera.bottom = -12
scene.add(directionLight)

// const lightHelper = new THREE.DirectionalLightHelper(directionLight)
// scene.add(lightHelper)

// const lightShadowHelper = new THREE.CameraHelper(directionLight.shadow.camera)
// scene.add(lightShadowHelper)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.touches = {
    ONE: THREE.TOUCH.ROTATE
}
orbit.enablePan = false
orbit.enableZoom = false
orbit.maxPolarAngle = 3/2
orbit.minPolarAngle = 3/2
orbit.update()

// const boxGeo = new THREE.BoxGeometry();
// const boxMat = new THREE.MeshStandardMaterial({color: 0xffffff})
// const box = new THREE.Mesh(boxGeo, boxMat)
// box.castShadow = true
// scene.add(box)

// const planeGeo = new THREE.PlaneGeometry(30, 30)
// const planMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF})
// const plane = new THREE.Mesh(planeGeo, planMat)
// plane.position.z = -5
//plane.rotation.x = -0.5 * Math.PI
// plane.receiveShadow = true
// scene.add(plane)

// const gridHelper = new THREE.GridHelper()
// scene.add(gridHelper)

// const axesHelp = new THREE.AxesHelper(5)
// scene.add(axesHelp)

function animate(){
    renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})