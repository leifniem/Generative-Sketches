// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three")

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls")

const canvasSketch = require("canvas-sketch")

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
}

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
		canvas: context.canvas,
		logarithmicDepthBuffer: true,
  })

  // WebGL background color
  renderer.setClearColor("#bfc", 1)

  // Setup a camera
  const camera = new THREE.OrthographicCamera(-6, 4, -6, 2, 5, 20)
	camera.position.set(8, 12, 3)
  camera.lookAt(new THREE.Vector3(0, 5, 0))

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene()

  // Setup a geometry

  // Setup a material
  const material = new THREE.ShaderMaterial({
		fragmentShader: require('./frag.glsl'),
		vertexShader: require('./vert.glsl'),
		uniforms: {
			time: {
				value: 0
			}
		}
	})

  // Setup a mesh with geometry + material
	let clone, scale, geometry, mesh
	for (let index = 0; index < 12; index++) {
		geometry = new THREE.CylinderGeometry(.25, .25, 4, 36, 16)
		mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = Math.random() * 5
		mesh.position.y = Math.random() * 5
		mesh.position.z = Math.random() * 5
		mesh.scale.y = Math.random() * 10 + 2
		scale = Math.random() * 2
		mesh.scale.y = scale
		scene.add(mesh);
	}

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight, false)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Update & render your scene here
    render({ time }) {
			material.uniforms.time.value = time
      controls.update()
      renderer.render(scene, camera)
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose()
      renderer.dispose()
    }
  }
}

canvasSketch(sketch, settings);
