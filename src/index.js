import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import swipedetect from './js/swipeControls.js'
import { Howl, Howler } from 'howler'
import Cookies from 'js-cookie'

const argenUrl = new URL('./assets/FootBall_Player_Argentina.glb', import.meta.url)
const belgiumUrl = new URL('./assets/FootBall_Player_Belgium.glb', import.meta.url)
const brazilUrl = new URL('./assets/FootBall_Player_Brazil.glb', import.meta.url)
const englandUrl = new URL('./assets/FootBall_Player_England.glb', import.meta.url)
const franceUrl = new URL('./assets/FootBall_Player_France.glb', import.meta.url)
const portugalUrl = new URL('./assets/FootBall_Player_Portugal.glb', import.meta.url)
const qatarUrl = new URL('./assets/FootBall_Player_Qatar.glb', import.meta.url)
const spainUrl = new URL('./assets/FootBall_Player_Spain.glb', import.meta.url)
const playerUrls = {
    'argen': argenUrl,
    'belgium': belgiumUrl,
    'brazil': brazilUrl,
    'england': englandUrl,
    'france': franceUrl,
    'portugal': portugalUrl,
    'qatar': qatarUrl,
    'spain': spainUrl
}

const btnArgen = document.getElementById('load_argen')
const btnBelgium = document.getElementById('load_belgium')
const btnBrazil = document.getElementById('load_brazil')
const btnEngland = document.getElementById('load_england')
const btnFrance = document.getElementById('load_france')
const btnPortugal = document.getElementById('load_portugal')
const btnQatar = document.getElementById('load_qatar')
const btnSpain = document.getElementById('load_spain')

const tutorialPage = document.querySelector('.tutorial-page')

const skipBtn = document.getElementById('skip-tutorial-btn')
const goSelectChar = document.getElementById('go_select_char')
const loadingMenu = document.querySelector('.loading-menu')
const loadingGame = document.querySelector('.loading-game')
const selectCharMenu = document.querySelector('.select-char-menu')
const startMenu = document.querySelector('.start-menu')
const goMainGame = document.getElementById('go_main_game')

const playAgainBtn = document.getElementById('playAgain')
const goToRewardBtn = document.getElementById('goToReward')

const scoreDisplayBoard = document.getElementById('score_diplay')
const params = new URLSearchParams(window.location.search)
const accessToken = params.get("accessToken")

const scorePerRound = document.getElementById('score_diplay_round')
const goalBoard = document.querySelector('.goal-show')
const scoreUiLower = document.getElementById('score_ui_lower')

const bgGame = new URL('./img/bg/BG-Gaol.jpg', import.meta.url)
const bgSelectChar = new URL('./img/bg/Select-Char.png', import.meta.url)

let bgMusic = new Howl({
    src: [new URL('./sounds/bg-music.mp3', import.meta.url).href], html5: true, usingWebAudio: false, html5: true, mute: false, loop: true, webAudio: false, volume: 0.3
})
let failSound = new Howl({
    src: [new URL('./sounds/failSound.mp3', import.meta.url).href], html5: true, usingWebAudio: false, html5: true, mute: false, loop: false, webAudio: false, volume: 0.5
})
let hitFootballSound = new Howl({
    src: [new URL('./sounds/hitFootball-3.mp3', import.meta.url).href], html5: true, usingWebAudio: false, html5: true, mute: false, loop: false, webAudio: false, volume: 0.5
})
let pressBtnSound = new Howl({
    src: [new URL('./sounds/pressBtn.mp3', import.meta.url).href], html5: true, usingWebAudio: false, html5: true, mute: false, loop: false, webAudio: false, volume: 0.5
})
let winSound = new Howl({
    src: [new URL('./sounds/winSound.mp3', import.meta.url).href], html5: true, usingWebAudio: false, html5: true, mute: false, loop: false, webAudio: false, volume: 0.5
})

const canvasTag = document.getElementById('gameCanvas')

let el

let scene, renderer, camera
let stats, controls, axesHelp, cannonDebug
let assetLoader
let currentShow

let playerList = {}
let playerCurrentUrlKey = 'argen'
let pageName = {}
let physicsWorld
const clock = new THREE.Clock()

let playerThree, playerMixer, playerAnimations = {}

let goalKeeperThree
let goalMixer
let goalAnimations = {}
let goalBody
let goalCurrenBlock

let sphrBody, sphrThree

let planeThree, groundBody

let bgMusicPlayed = false
let isShoot = false
let shootTime
let gameRound = 0
let shootSuccess = 0
let totalBall = 5
let shootGoal = false
let shootDirection = ''
let footballLeftSection = document.querySelector('.football-left')

let lockShoot = false

let newRef = ""

let tokenLeft = document.getElementById('token_display')
let tokenBegin = document.getElementById('token_begin')

let isLoaded = false

const loadingManage = new THREE.LoadingManager()

loadingManage.onLoad = () => {
    loadingMenu.setAttribute('style', 'display:none;')
    selectCharMenu.setAttribute('style', 'display:block')
    isLoaded = true
}

const loadingGameManage = new THREE.LoadingManager()

loadingGameManage.onLoad = () => {
    loadingGame.setAttribute('style', 'display:none;')
}

function start() {
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = false
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.querySelector('#gameCanvas').appendChild(renderer.domElement)
    pageName['selectCharPage'] = renderer.domElement


    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.set(0, 3, 5)

    // Stats.js
    // stats = new Stats()
    // document.querySelector('#gameCanvas').appendChild(stats.dom)

    const ambLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambLight)

    const light = new THREE.DirectionalLight(0xffffff, 1.1)
    light.position.set(0, 0, 20)
    light.castShadow = true
    light.shadow.camera.near = 10
    light.shadow.camera.far = 100
    light.shadow.camera.fov = 30
    scene.add(light)

    const light2 = new THREE.DirectionalLight(0xffffff, 1.1)
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
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.updateProjectionMatrix()
}

function initObject() {
    loadModel(argenUrl, 'argen', true)
    loadModel(belgiumUrl, 'belgium')
    loadModel(brazilUrl, 'brazil')
    loadModel(englandUrl, 'england')
    loadModel(franceUrl, 'france')
    loadModel(portugalUrl, 'portugal')
    loadModel(qatarUrl, 'qatar')
    loadModel(spainUrl, 'spain')
}

function loadModel(url, key, showNow = false) {
    assetLoader = new GLTFLoader(loadingManage)
    assetLoader.load(url.href, (gltf) => {
        const model = gltf.scene
        playerList[key] = model
        model.position.set(0, -0.4, 0)
        // model.traverse((node) => {
        //     if (node.isMesh) {
        //         node.castShadow = true
        //     }
        // })
        scene.add(model)
        model.visible = false
        if (showNow) {
            currentShow = key
        }
    })
}

function initInput() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.minPolarAngle = 3 / 2
    controls.maxPolarAngle = 3 / 2
    controls.update()

    btnArgen.addEventListener('click', (e) => {
        currentShow = 'argen'
        pressBtnSound.play()
    })
    btnBelgium.addEventListener('click', (e) => {
        currentShow = 'belgium'
        pressBtnSound.play()
    })
    btnBrazil.addEventListener('click', (e) => {
        currentShow = 'brazil'
        pressBtnSound.play()
    })
    btnEngland.addEventListener('click', (e) => {
        currentShow = 'england'
        pressBtnSound.play()
    })
    btnFrance.addEventListener('click', (e) => {
        currentShow = 'france'
        pressBtnSound.play()
    })
    btnPortugal.addEventListener('click', (e) => {
        currentShow = 'portugal'
        pressBtnSound.play()
    })
    btnQatar.addEventListener('click', (e) => {
        currentShow = 'qatar'
        pressBtnSound.play()
    })
    btnSpain.addEventListener('click', (e) => {
        currentShow = 'spain'
        pressBtnSound.play()
    })

}

function animate() {
    requestAnimationFrame(animate)

    // event key
    if (currentShow) {
        if (!playerList[currentShow].visible) {
            playerList[currentShow].visible = true
            playerCurrentUrlKey = currentShow
        }

        for (let char in playerList) {
            if (char != currentShow) {
                playerList[char].visible = false
            }
        }
        playerList[currentShow].rotation.y -= 0.005
    }

    renderer.render(scene, camera)
    // stats.update()
}

function startGame() {
    // pageName['selectCharPage'].setAttribute('style', 'display:none;')

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true
    })
    // renderer.setClearColor(0xfdfdfd)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = false
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding
    document.querySelector('#gameCanvas').appendChild(renderer.domElement)
    pageName['mainGamePage'] = renderer.domElement

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    camera.position.set(0, 9, 30)

    const ambLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambLight)

    const spotLight = new THREE.SpotLight(0xffffff, 1, 1000, 1000)
    spotLight.position.set(0, 10, 50)
    spotLight.castShadow = true
    scene.add(spotLight)

    window.addEventListener('resize', windowResize)


    initGameSystem()
    renderGame()


}

function initGameSystem() {
    initPhysics()
    initGameObj()
    initGameControl()
    //initDebugTool()
}

function initPhysics() {
    physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -20, 0)
    })

    groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(20, 40, 1))
    })
    groundBody.position.set(0, 40, -50)
    groundBody.addEventListener('collide', () => {
        failSound.play()
        shootGoal = false
    })
    physicsWorld.addBody(groundBody)

    const groundBody2 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(20, 40, 1))
    })
    groundBody2.position.set(0, 0, -10)
    groundBody2.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    physicsWorld.addBody(groundBody2)

    goalBody = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(20, 15, 1))
    })
    goalBody.position.set(0, 5, -42)
    physicsWorld.addBody(goalBody)
    goalBody.addEventListener('collide', () => {
        winSound.play()
        shootGoal = true

        shootSuccess += 1
        scoreUiLower.innerHTML = shootSuccess
        scorePerRound.innerHTML = shootSuccess
        goalBoard.setAttribute('style', 'display:flex')
    })

    goalCurrenBlock = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(3, 3, 2))
    })
    goalCurrenBlock.addEventListener('collide', () => {
        shootGoal = false
        failSound.play()
    })
    goalCurrenBlock.position.set(0, 14, -38)
    physicsWorld.addBody(goalCurrenBlock)

    const radius = 1
    sphrBody = new CANNON.Body({
        mass: 100,
        shape: new CANNON.Sphere(radius)
    })
    sphrBody.position.set(0, 2, 15)
    sphrBody.quaternion.setFromEuler(0, Math.PI - 0.4, 0)
    physicsWorld.addBody(sphrBody)
}

function initGameObj() {

    const txLoader = new THREE.TextureLoader(loadingGameManage)

    const footballUrl = new URL('./img/Soccer Skin.png', import.meta.url)
    txLoader.load(footballUrl.href, (txt) => {
        const sphrGeo = new THREE.SphereGeometry(1)
        const sphrMat = new THREE.MeshPhysicalMaterial({
            map: txt
        })
        sphrThree = new THREE.Mesh(sphrGeo, sphrMat)
        scene.add(sphrThree)
    })


    const GoalUrl = new URL('./assets/GoalKeeper_v2.glb', import.meta.url)
    assetLoader = new GLTFLoader(loadingGameManage)
    assetLoader.load(GoalUrl.href, (gltf) => {
        goalKeeperThree = gltf.scene
        const goalScale = 7
        goalKeeperThree.scale.set(goalScale, goalScale, goalScale)
        // goalKeeperThree.traverse((node) => {
        //     if (node.isMesh) {
        //         node.castShadow = true
        //     }
        // })
        goalKeeperThree.position.set(0, 0, -38)
        scene.add(goalKeeperThree)

        goalMixer = new THREE.AnimationMixer(goalKeeperThree)
        gltf.animations.forEach((clips) => {
            goalAnimations[clips.name] = goalMixer.clipAction(clips)
            goalAnimations[clips.name].loop = THREE.LoopOnce
        })
    })

    assetLoader.load(playerUrls[playerCurrentUrlKey].href, (gltf) => {
        playerThree = gltf.scene
        const playerScale = 3.5
        playerThree.scale.set(playerScale, playerScale, playerScale)
        // playerThree.traverse((node) => {
        //     if (node.isMesh) {
        //         node.castShadow = true
        //     }
        // })
        playerThree.position.set(0, 2, 19)
        playerThree.rotation.y = Math.PI
        scene.add(playerThree)
        playerThree.visible = false

        playerMixer = new THREE.AnimationMixer(playerThree)
        gltf.animations.forEach((clips) => {
            playerAnimations[clips.name] = playerMixer.clipAction(clips)
            playerAnimations[clips.name].loop = THREE.LoopOnce
        })
    })

}

function initGameControl() {
    // controls = new OrbitControls(camera, pageName['mainGamePage'])
    // controls.update()

    el = document.querySelector('.swipe-top-play')
    //var el = pageName['mainGamePage']
    const BALLSPEED = -45

    swipedetect(el, function (swipedir) {
        if (!isShoot && !lockShoot) {
            shootDirection = swipedir
            switch (swipedir) {
                case "fastTop":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            0, 28, BALLSPEED * 2.5
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "fastTopFar":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            0, 55, BALLSPEED * 3
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "fastLeftFar":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            -45, 55, BALLSPEED * 3
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "fastLeft":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            -33, 25, BALLSPEED * 2.5
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "slowLeft":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            -22, 10, BALLSPEED * 1.4
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "fastRightFar":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            45, 55, BALLSPEED * 3
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "fastRight":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            33, 25, BALLSPEED * 2.5
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                case "slowRight":
                    el.setAttribute('style', 'display:none;')
                    isShoot = true
                    shootTime = new Date().getTime()
                    setTimeout(() => {
                        hitFootballSound.play()
                        randomBlockPosition()
                        sphrBody.velocity.set(
                            22, 10, BALLSPEED * 1.4
                        )
                        playerThree.visible = false
                    }, 800)
                    playHardKick()

                    break
                default:
                    //console.log("try again")
                    break
            }
        }
    })
}

function playHardKick() {
    footballLeftSection.removeChild(footballLeftSection.children[totalBall - 1])
    playerThree.visible = true
    playerAnimations['HardKick'].play()
    playerAnimations['HardKick'].reset()
}

function randomBlockPosition() {
    const blockPosition = ["TopMiddle", "TopRight", "Right", "TopLeft", "Left"]
    const getBlockPosition = blockPosition[Math.floor(Math.random() * blockPosition.length)]
    switch (getBlockPosition) {
        case "TopMiddle":
            goalAnimations['TopMiddle'].play()
            goalAnimations['TopMiddle'].reset()
            goalCurrenBlock.position.set(0, 14, -38)
            break
        case "TopRight":
            goalAnimations['TopRight'].play()
            goalAnimations['TopRight'].reset()
            goalCurrenBlock.position.set(-14, 14, -38)
            break
        case "Right":
            goalAnimations['Right'].play()
            goalAnimations['Right'].reset()
            goalCurrenBlock.position.set(-14, 2, -38)
            break
        case "TopLeft":
            goalAnimations['TopLeft'].play()
            goalAnimations['TopLeft'].reset()
            goalCurrenBlock.position.set(14, 14, -38)
            break
        case "Left":
            goalAnimations['Left'].play()
            goalAnimations['Left'].reset()
            goalCurrenBlock.position.set(14, 2, -38)
            break
    }
    physicsWorld.addBody(goalCurrenBlock)
}

function initDebugTool() {
    stats = new Stats()
    document.querySelector('#gameCanvas').appendChild(stats.dom)
    axesHelp = new THREE.AxesHelper(8)
    scene.add(axesHelp)

    cannonDebug = new CannonDebugger(scene, physicsWorld)
}

function resetRound() {
    if (gameRound >= 5){
        el.setAttribute('style', 'display:none;')
    }else{
        el.setAttribute('style', 'display:flex')
    }
    goalBoard.setAttribute('style', 'display:none')
    isShoot = false
    shootGoal = false
    totalBall -= 1
    gameRound += 1
    physicsWorld.removeBody(goalCurrenBlock)

    sphrBody.position.set(0, 2, 15)
    sphrBody.quaternion.setFromEuler(0, Math.PI - 0.4, 0)
    sphrBody.interpolatedPosition.setZero();
    sphrBody.initPosition.setZero();

    sphrBody.velocity.setZero();
    sphrBody.initVelocity.setZero();
    sphrBody.angularVelocity.setZero();
    sphrBody.initAngularVelocity.setZero();
}

async function renderGame() {
    // event key
    if (gameRound >= 5) {
        isShoot = false
        lockShoot = true

        loadingGame.setAttribute('style', 'display:flex;')
        el.setAttribute('style', 'display:none;')
        loadingGame.setAttribute('style', 'display:none;')

        scoreDisplayBoard.innerHTML = shootSuccess
        gameRound = 0
        shootSuccess = 0
        document.querySelector('.final-score-ui').setAttribute('style', 'display: block;')
    }

    if (isShoot) {
        // shoot delay condition
        const nowTime = new Date().getTime()
        if (nowTime - shootTime >= 3000 && !shootGoal) {
            resetRound()
        } else if (nowTime - shootTime >= 3100 && shootGoal && shootDirection == 'fastTop') {
            resetRound()
        } else if (nowTime - shootTime >= 3200 && shootGoal && (shootDirection == 'fastRight' || shootDirection == 'fastLeft')) {
            resetRound()
        } else if (nowTime - shootTime >= 3500 && shootGoal && (shootDirection == 'slowRight' || shootDirection == 'slowLeft')) {
            resetRound()
        } else if (nowTime - shootTime >= 3500) {
            resetRound()
        }
    }

    // for update position
    // if have three with cannon
    // position of obj in three copy position obj of cannon
    if (sphrThree) {
        // if ball loaded
        sphrThree.position.copy(sphrBody.position)
        sphrThree.quaternion.copy(sphrBody.quaternion)
    }

    const deltaTime = clock.getDelta()

    if (goalKeeperThree) {
        // if goal loaded
        goalMixer.update(deltaTime)
    }

    if (playerThree) {
        playerMixer.update(deltaTime)
    }

    physicsWorld.fixedStep()
    // for debug physics
    //cannonDebug.update()

    renderer.render(scene, camera)


    // stats.update()
    requestAnimationFrame(renderGame)
}

import Splide from '@splidejs/splide'
const splide = new Splide('.splide', {
    focus: 'center',
    width: '100vw',
    height: '73vh',
    gap: '10vw',
    padding: '8vw',
    start: 0
})

async function delayPressBtn(delayTime=60){
    return new Promise((res, rej)=>{
        setTimeout(()=>{res()}, delayTime)
    })
}

// control menu
function goToSelectPage() {
    loadingMenu.setAttribute('style', 'display:flex;')
    startMenu.setAttribute('style', 'display:none;')
    start()
    canvasTag.style.backgroundImage = `url(${bgSelectChar.href})`
}

let isPressPlay = false
goSelectChar.addEventListener('click', async () => {
    await delayPressBtn()
    const isFirstPlay = (Cookies.get('isPlay') == undefined) ? true : false
    if (isFirstPlay) {
        Cookies.set('isPlay', 'true', { expires: 730 })
        isPressPlay = true
        startMenu.setAttribute('style', 'display:none')
        showTutorial()
    } else {
        goToSelectPage()
    }
    if (!bgMusicPlayed) {
        bgMusic.play()
        bgMusicPlayed = true
    }

})

function showTutorial() {
    splide.mount()
    tutorialPage.setAttribute('style', 'display:flex;')
}

let beforePage = 'startMenu'
const howToPlayBtn = document.getElementById('show_how_to_play')
const iTutotialBtn = document.getElementById('i-tutorial')

howToPlayBtn.addEventListener('click', async () => {
    await delayPressBtn()
    startMenu.setAttribute('style', 'display:none')
    showTutorial()
})

iTutotialBtn.addEventListener('click', async () => {
    await delayPressBtn()
    selectCharMenu.setAttribute('style', 'display:none')
    pageName['selectCharPage'].setAttribute('style', 'display:none')
    showTutorial()
    beforePage = 'selectMenu'
})

skipBtn.addEventListener('click', async () => {
    await delayPressBtn()
    splide.destroy()
    if (beforePage == 'startMenu') {
        if (isPressPlay) {
            goToSelectPage()
        } else {
            startMenu.setAttribute('style', 'display:block')
        }
    } else if (beforePage == 'selectMenu') {
        selectCharMenu.setAttribute('style', 'display:block;')
        await renderer.dispose()
        pageName['selectCharPage'].setAttribute('style', `display:block; height: ${window.innerHeight}px; width: ${window.innerWidth}px; touch-action: none;`)
    }
    tutorialPage.setAttribute('style', 'display:none;')
})

goMainGame.addEventListener('click', async () => {
    await delayPressBtn()
    loadingGame.setAttribute('style', 'display:flex;')
    currentShow = undefined
    canvasTag.style.backgroundImage = `url(${bgGame.href})`
    pageName['selectCharPage'].setAttribute('style', 'display:none')
    selectCharMenu.setAttribute('style', 'display:none')
    document.querySelector('.game-interface').setAttribute('style', 'display: block')
    startGame()
})

playAgain.addEventListener('click', async () => {
    await delayPressBtn()
    for (let i = 0; i < 5; i++) {
        const fbDisplayDiv = document.createElement('div')
        const imgFbDisplay = document.createElement('img')
        imgFbDisplay.src = new URL('./img/FootBall.png', import.meta.url).href
        fbDisplayDiv.className = "football-display"
        fbDisplayDiv.appendChild(imgFbDisplay)
        footballLeftSection.appendChild(fbDisplayDiv)
    }
    scoreUiLower.innerHTML = 0
    totalBall = 5
    isShoot = false
    lockShoot = false
    el.setAttribute('style', 'display:flex')
    document.querySelector('.final-score-ui').setAttribute('style', 'display: none;')
})

window.onload = () => {
    window.scrollTo(0, 10);
    startMenu.addEventListener('touchend', () => {
        if (!bgMusicPlayed) {
            bgMusic.play()
            bgMusicPlayed = true
        }
    })
}
