//import GUI from 'lil-gui'
import * as THREE from 'three';

// Canvas
const canvas = document.querySelector('particle_scene') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

// Handle resize
window.addEventListener('resize', () => 
{
  // updating sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  
  // updating camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  
  // updating renderer
  renderer.setSize(sizes.width, sizes.height);
});

// Camera
const fov = 75;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, near, far);
camera.position.z = 3;
scene.add(camera);

// Geometries
const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
const sphereGeometry = new THREE.SphereGeometry(0.6, 32, 32);

// Material 
const material = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true
});
material.color.set('#eaeded');

// Particle systems
const boxParticles = new THREE.Points(boxGeometry, material);
const sphereParticles = new THREE.Points(sphereGeometry, material);
const particles = new THREE.Points(boxGeometry.clone(), material);

// Initially, only add box particles to the scene
scene.add(particles);

// Flag to track state
let isTransforming = false;
let isCurrentlySphere = false;

// Function to handle the transformation to sphere
function transformToSphere(): void {
  if (isTransforming) return;
  isTransforming = true;

  const duration = 3000; // Duration of animation in milliseconds
  const startTime = performance.now();

  function animate(currentTime: number): void {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Interpolate between box and sphere geometries
    const positionAttribute = particles.geometry.getAttribute('position');
    const boxPositionAttribute = boxGeometry.getAttribute('position');
    const spherePositionAttribute = sphereGeometry.getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i++) {
      const index = i * 3;
      for (let j = 0; j < 3; j++) {
        positionAttribute.array[index + j] = 
          (1 - progress) * boxPositionAttribute.array[index + j] + 
          progress * spherePositionAttribute.array[index + j];
      }
    }

    positionAttribute.needsUpdate = true;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isTransforming = false;
      isCurrentlySphere = true;
    }
  }

  requestAnimationFrame(animate);
}

// Function to handle the transformation back to box
function transformToBox(): void {
  // ... (similar changes as in transformToSphere)
}

// Function to handle click events
function handleClick(): void {
  if (isCurrentlySphere) {
    transformToBox();
  } else {
    transformToSphere();
  }
}

// Add click event listener to the renderer's DOM element
renderer.domElement.addEventListener('click', handleClick);

// Animate loop
const tick = (): void => 
{
  // update cube rotation
  particles.rotation.x += 0.005;
  particles.rotation.y += 0.005;
  
  // RAF
  window.requestAnimationFrame(tick);
  
  // renderer
  renderer.render(scene, camera);
};

tick();
