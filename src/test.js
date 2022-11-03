import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import AMMO from 'three/examples/js/libs/ammo.wasm.js'
import Stats from 'three/examples/jsm/libs/stats.module'

// model url
const goalKeeperUrl = new URL('./assets/GoalKeeper_v2.glb', import.meta.url)

//for loading scene
const progressBar = document.getElementById('progress-bar')
const progressBarContainer = document.querySelector('.progress-bar-container')

const loadingManage = new THREE.LoadingManager()

loadingManage.onProgress = (url, loaded, total) => {
    progressBar.value = (loaded / total) * 100
}

loadingManage.onLoad = () => {
    progressBarContainer.style.display = 'none'
}

// graphic global use
let renderer, scene, camera, mixer, assetLoader
let controls, stats
const clock = new THREE.Clock()

function main() {
    init()
    animate()
}

function init() {
    initGraphic()
    // initPhysics()
    // initObject()
    initControls()
}

function initGraphic() {
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xA3A3A3)
    document.body.appendChild(renderer.domElement)

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.set(0, 0, 5)

    stats = new Stats()
    document.body.appendChild(stats.domElement)

    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0, 0, 5)
    light.castShadow = true
    scene.add(light)

}

// function initObject(){
//     assetLoader = new GLTFLoader(loadingManage)
//     assetLoader.load(goalKeeperUrl.href, (gltf) => {
//         const model = gltf.scene
//         scene.add(model)
//         mixer = new THREE.AnimationMixer(model)
//         const clipsList = gltf.animations
//         console.log(clipsList)

//         const topLeftClip = THREE.AnimationClip.findByName(clipsList, 'TopLeft')
//         const topLeftAction = mixer.clipAction(topLeftClip)
//         topLeftAction.loop = THREE.LoopOnce
//         if (playTopLeft){
//             topLeftAction.play()
//         }
        

//         const topRightClip = THREE.AnimationClip.findByName(clipsList, 'TopRight')
//         const topRightAction = mixer.clipAction(topRightClip)
//         topRightAction.loop = THREE.LoopOnce

//         mixer.addEventListener('finished', (e)=>{
//             if(e.action._clip.name === 'TopLeft'){
//                 topLeftAction.reset()
//             }else if (e.action._clip.name === 'TopRight'){
//                 topLeftAction.reset()
//             }
//         })
//     }, undefined, (error)=>{
//         console.error(error)
//     })
// }

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

    addEventListener('keydown', (e) => {
        console.log(e)
        if (e.code === "Space"){
            console.log("space")
        }
    })
}

function animate() {
    requestAnimationFrame(animate)
    onWindowResize()
    // if (mixer){
    //     mixer.update(clock.getDelta())
    // }
    renderer.render(scene, camera)
    stats.update()
}

main()
