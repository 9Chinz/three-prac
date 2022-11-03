import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'

const btnArgen = document.getElementById('load_argen')
const btnBelgium = document.getElementById('load_belgium')

let scene, renderer, camera
let stats, controls
let assetLoader
let currentShow
let playerList = {}

function start() {
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.set(0, 2, 25)


    // Stats.js
    stats = new Stats()
    document.body.appendChild(stats.dom)

    const ambLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambLight)

    const light = new THREE.DirectionalLight(0xdfdfdf, 1)
    light.position.set(0, 0, 20)
    light.castShadow = true
    light.shadow.camera.near = 10
    light.shadow.camera.far = 100
    light.shadow.camera.fov = 30
    scene.add(light)

    const light2 = new THREE.DirectionalLight(0xdfdfdf, 1)
    light2.position.set(0, 0, -20)
    light2.castShadow = true
    light2.shadow.camera.near = 10
    light2.shadow.camera.far = 100
    light2.shadow.camera.fov = 30
    scene.add(light2)

    window.addEventListener('resize', windowResize)

    initObject()
    initInput()
    animate()
}

function windowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function initObject() {
    loadModel(new URL('./assets/FootBall_Player_Argentina.glb', import.meta.url), 'argen')
    loadModel(new URL('./assets/FootBall_Player_Belgium.glb', import.meta.url), 'belgium')
}

function loadModel(url, key) {
    assetLoader = new GLTFLoader()
    assetLoader.load(url.href, (gltf) => {
        const model = gltf.scene
        playerList[key] = model
        scene.add(model)
        model.visible = false
    })
}

function initInput() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

    btnArgen.addEventListener('click', (e) => {
        currentShow = 'argen'
    })

    btnBelgium.addEventListener('click', (e) => {
        currentShow = 'belgium'
    })

}

function animate() {
    requestAnimationFrame(animate)

    // event key
    if (currentShow) {
        playerList[currentShow].visible = true
        for (let char in playerList) {
            if (char != currentShow) {
                playerList[char].visible = false
            }
        }
        currentShow = undefined
    }

    // for update position

    // if have three with cannon
    // position of obj in three copy position obj of cannon


    renderer.render(scene, camera)
    stats.update()
}

start()