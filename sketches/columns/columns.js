const canvasSketch = require('canvas-sketch')
const palettes = require('nice-color-palettes')
const random = require('canvas-sketch-util/random')
const glsl = require('glslify')

random.setSeed(random.getRandomSeed())

global.THREE = require('three')

require('three/examples/js/controls/OrbitControls')

const settings = {
	context: 'webgl',
	dimensions: [1440, 2560],
	name: 'isoCube',
	suffix: random.getSeed(),
	attributes: { antialias: true },
	animate: false
}

// palette = random.pick(palettes)
palette = require("../delta.json")
bg = random.pick(palette)
// bg = 'black'
palette.splice(palette.indexOf(bg), 1)

const sketch = ({ context, width, height, playhead }) => {
	const renderer = new THREE.WebGLRenderer({
		context,
		premultipliedAlpha: true
	})

	renderer.setClearColor(bg, 1)

	const camera = new THREE.OrthographicCamera()
	const scene = new THREE.Scene()

	const box = new THREE.BoxGeometry(1, 1, 1)

	const blackMat = new THREE.MeshStandardMaterial({
		color: `hsl(0,0%, 10%)`
	})

	const fragmentShader = glsl(/* glsl */ `
		varying vec2 vUv;
		varying vec3 vNorm;
		uniform float time;
		uniform vec3 colorA;
		uniform vec3 colorB;

		#pragma glslify: noise = require('glsl-noise/simplex/3d')

		void main() {
			// float n = noise(vec3(vUv.yy, time * 0.5));

			// vec3 color = mix(colorA, colorB, vUv.y + vUv.x * 0.5);
			vec3 color = mix(colorA, colorB, vUv.y);
			gl_FragColor = vec4(color, 1.0);
		}
	`)

	const vertexShader = glsl(/* glsl */ `
		varying vec2 vUv;
		varying vec3 vNorm;
		void main () {
			vUv = uv;
			vNorm = position.xyz;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`)

	const colorA = random.pick(palette)
	palette.splice(palette.indexOf(colorA), 1)
	const colorB = random.pick(palette)

	const iridescentMat = new THREE.ShaderMaterial({
		fragmentShader,
		vertexShader,
		// time: { type: "f", value:  }
		uniforms: {
			time: { type: "f", value: playhead },
			colorA: { type: "f", value: new THREE.Color(colorA)},
			colorB: { type: "f", value: new THREE.Color(colorB)},
		}
	})

	for (let i = 0; i < 100; i++) {
		const mesh = new THREE.Mesh(
			box,
			random.value() > 0.8 ? iridescentMat : blackMat
		)
		// mesh.castShadow = true
		// mesh.receiveShadow = true
		mesh.position.set(
			random.range(-5, 5),
			random.range(20, 25),
			random.range(-5, 5)
		)
		const size = random.range(0.25, 0.75)
		mesh.scale.set(size, size * 2.5, size)
		scene.add(mesh)
	}

	// renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.PCFSoftShadowMap

	const light = new THREE.PointLight('white', 4, 60)
	const fill = new THREE.PointLight('white', 1, 60)
	const ambient = new THREE.AmbientLight('white', 0.3)
	light.position.set(-20, 40, 15)
	fill.position.set(15, 8, 5)
	// scene.add(light)
	// scene.add(fill)
	scene.add(ambient)
	// light.castShadow = true
	// fill.castShadow = true

	// light.shadow.mapSize.width = 2048;  // default
	// light.shadow.mapSize.height = 2048; // default
	// light.shadow.camera.near = 0.5;       // default
	// light.shadow.camera.far = 500      // default

	// fill.shadow.mapSize.width = 2048;  // default
	// fill.shadow.mapSize.height = 2048; // default
	// fill.shadow.camera.near = 0.5;       // default
	// fill.shadow.camera.far = 500      // default

	return {
		resize({ pixelRatio, viewportWidth, viewportHeight }) {
			renderer.setPixelRatio(pixelRatio)
			renderer.setSize(viewportWidth, viewportHeight)
			const aspect = viewportWidth / viewportHeight
			const zoom = 6

			camera.left = -zoom * aspect
			camera.right = zoom * aspect
			camera.top = zoom
			camera.bottom = -zoom

			camera.near = -100
			camera.far = 100

			camera.position.set(zoom, zoom * -3, zoom)
			camera.lookAt(new THREE.Vector3(0, 7, 0))
			camera.updateProjectionMatrix()
		},
		render({ time }) {
			renderer.render(scene, camera)
		},
		unload() {
			renderer.dispose()
		}
	}
}

canvasSketch(sketch, settings)
