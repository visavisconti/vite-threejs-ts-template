//import GUI from 'lil-gui'
import {
  AmbientLight,
  //AxesHelper,
  BoxGeometry,
  SphereGeometry,
  Clock,
  LoadingManager,
  //Mesh,
  //MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Scene,
  WebGLRenderer,
  PointsMaterial,
  Points,
  TorusKnotGeometry,
  
} from 'three'
//import { DragControls } from 'three/examples/jsm/controls/DragControls'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import Stats from 'three/examples/jsm/libs/stats.module'
import * as animations from './helpers/animations'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Points
let sphere: Points
let knot: Points
let box: Points
let camera: PerspectiveCamera
//let cameraControls: OrbitControls
//let dragControls: DragControls
//let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
let clock: Clock
//let stats: Stats
//let gui: GUI
// Flag to track state

const animation = { enabled: true, play: true }

init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    //renderer.shadowMap.enabled = true
    //renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene()
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager()

    loadingManager.onStart = () => {
      console.log('loading started')
    }
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:')
      console.log(`${url} -> ${loaded} / ${total}`)
    }
    loadingManager.onLoad = () => {
      console.log('loaded!')
    }
    loadingManager.onError = () => {
      console.log('❌ error while loading')
    }
  }

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4)
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(-2, 2, 2)
    pointLight.castShadow = true
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    scene.add(pointLight)
  }

  // ===== 📦 OBJECTS =====
  {
    
  
    
   // Material 
    const cubeMaterial = new PointsMaterial({
      size: 0.02,
      sizeAttenuation: true,
      color: '#f69f1f'
    });

    const cubeGeometry = new BoxGeometry(1,1,1,10,10,10)
    cube = new Points(cubeGeometry, cubeMaterial)
    
    const sphereGeometry = new SphereGeometry(0.6, 32, 32);
    sphere = new Points(sphereGeometry, cubeMaterial)

    const knotGeometry = new TorusKnotGeometry( 0.6, 3, 64, 32 );
    knot = new Points(knotGeometry, cubeMaterial)

    box = new Points(cubeGeometry.clone(), cubeMaterial)

    scene.add(box)
  }
  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(0, 1, 3.5)
    camera.rotation.set (-0.3,0,0)
  
  }

  // ===== 🕹️ CONTROLS =====
  {

    /*
    cameraControls = new OrbitControls(camera, canvas)
    cameraControls.target = box.position.clone()
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    cameraControls.update()

    dragControls = new DragControls([box], camera, renderer.domElement)
    dragControls.addEventListener('hoveron', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('orange')
    })
    dragControls.addEventListener('hoveroff', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
    })
    dragControls.addEventListener('dragstart', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      cameraControls.enabled = false
      animation.play = false
      material.emissive.set('black')
      material.opacity = 0.7
      material.needsUpdate = true
    })
    dragControls.addEventListener('dragend', (event) => {
      cameraControls.enabled = true
      animation.play = true
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
      material.opacity = 1
      material.needsUpdate = true
    })
    dragControls.enabled = false
*/

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas)
      }
    })
    // transform on click
    window.addEventListener('click', (event) => {
      if (event.target === canvas) {
        if (isCurrentlySphere) {
          transformToBox();
        } else {
          transformToSphere();
        }
      }
    })
  }

  // ===== 🪄 HELPERS =====
  {
    //axesHelper = new AxesHelper(4)
    //axesHelper.visible = false
    //scene.add(axesHelper)

    pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
    pointLightHelper.visible = false
    scene.add(pointLightHelper)
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    //stats = new Stats()
    //document.body.appendChild(stats.dom)
  }

  // ==== 🐞 DEBUG GUI ====
  
  /*{
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

    const cubeOneFolder = gui.addFolder('Cube one')

    cubeOneFolder.add(box.position, 'x').min(-5).max(5).step(0.5).name('pos x')
    cubeOneFolder.add(box.position, 'y').min(-5).max(5).step(0.5).name('pos y')
    cubeOneFolder.add(box.position, 'z').min(-5).max(5).step(0.5).name('pos z')
    cubeOneFolder.addColor(box.material, 'color')
    
    cubeOneFolder
      .add(box.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate x')
    cubeOneFolder
      .add(box.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate y')
    cubeOneFolder
      .add(box.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate z')

    cubeOneFolder.add(animation, 'enabled').name('animated')

    const controlsFolder = gui.addFolder('Controls')
    controlsFolder.add(dragControls, 'enabled').name('drag controls')

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(pointLight, 'visible').name('point light')
    lightsFolder.add(ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(cameraControls, 'autoRotate')

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')

    gui.close()
  }*/

  //=====transformation===
  
    let isTransforming = false
    let isCurrentlySphere = false

    // Function to handle the transformation to sphere
  function transformToSphere() {
    if (isTransforming) return;
      isTransforming = true;

    const duration = 7000; // Duration of animation in milliseconds
    const startTime = performance.now();

    function animateTransformation(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

    // Interpolate between box and sphere geometries
    //changed cubeGeometry and sphereGeometry to cube.geometry and ...
    box.geometry.attributes.position.array.forEach((value, index) => {
      box.geometry.attributes.position.array[index] = 
        (1 - progress) * cube.geometry.attributes.position.array[index] + 
        progress * knot.geometry.attributes.position.array[index];
    });

    box.geometry.attributes.position.needsUpdate = true;

    if (progress < 1) {
      requestAnimationFrame(animateTransformation);
    } else {
        isTransforming = false;
        isCurrentlySphere = true;
      }
    }
  
    requestAnimationFrame(animateTransformation);
  }
  
// Function to handle the transformation back to box
function transformToBox() {
  if (isTransforming) return;
  isTransforming = true;

  const duration = 5000; // Duration of animation in milliseconds
  const startTime = performance.now();

  function animateTransformationBack(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Interpolate between sphere and box geometries
    box.geometry.attributes.position.array.forEach((value, index) => {
      box.geometry.attributes.position.array[index] = 
        (1 - progress) * knot.geometry.attributes.position.array[index] + 
        progress * cube.geometry.attributes.position.array[index];
    });

    box.geometry.attributes.position.needsUpdate = true;

    if (progress < 1) {
      requestAnimationFrame(animateTransformationBack);
    } else {
      isTransforming = false;
      isCurrentlySphere = false;
    }
  }

  requestAnimationFrame(animateTransformationBack);
}
}

//Animate loop

function animate() {
  requestAnimationFrame(animate)

  //stats.update()

  if (animation.enabled && animation.play) {
    //tick()
    animations.rotate(box, clock, Math.PI / 3)
    animations.rotate(cube, clock, Math.PI / 3)
    animations.rotate(sphere, clock, Math.PI / 3)
    animations.rotate(knot, clock, Math.PI / 3)
    //animations.bounce(cube, clock, 1, 0.5, 0.5)
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  //cameraControls.update()

  renderer.render(scene, camera)
}