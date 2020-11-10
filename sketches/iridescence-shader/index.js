import canvasSketch from "canvas-sketch"
// Ensure ThreeJS is in global scope for the 'examples/'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import {FilmPass} from "three/examples/jsm/postprocessing/FilmPass"
import Fragment from './assets/frag.glsl'
import Vertex from './assets/vert.glsl'
import Displ from './assets/displ.glsl'

const settings = {
	// Make the loop animated
	animate: true,
	// Get a WebGL canvas rather than 2D
	context: "webgl",
	parent: document.querySelector('#app')
};

const sketch = ({ context }) => {
	// Create a renderer
	const renderer = new THREE.WebGLRenderer({
		canvas: context.canvas,
	});

	// WebGL background color
	// renderer.setClearColor("#000", 1);
	renderer.shadowMap.enabled = true
	renderer.shadowMap.width = 1024
	renderer.shadowMap.height = 1024
	// Setup a camera
	const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100);
	camera.position.set(-2, -1, -2);
	camera.lookAt(new THREE.Vector3(-.12, 0, 0));

	// Setup camera controller
	// const controls = new OrbitControls(camera, context.canvas);

	// Setup your scene
	const scene = new THREE.Scene();

	const loader = new GLTFLoader();
	const texLoader = new THREE.TextureLoader()


	// import normalMap from './assets/textures/defaultMat_normal.png'
	// import rgh from './assets/textures/defaultMat_metallicRoughness.png'

	let mat = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 1.0 },
			normalMap: {
				value: texLoader.load('./assets/textures/defaultMat_normal.png')
			},
			roughness: {
				value: texLoader.load('./assets/textures/defaultMat_metallicRoughness.png')
			},
		},
		fragmentShader: Fragment,
		vertexShader: Vertex,
	})

	loader.load(
		'./scene.gltf',
		(gltf) => {
			gltf.scene.name = "mask"
			gltf.scene.traverse((obj) => {
				// obj.receiveShadow = true
				obj.castShadow = true
				obj.material = mat
			})
			scene.add(gltf.scene)
		},
		// (xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded') },
		undefined,
		(error) => { console.error(error) }
	)

	const shadowCatcherGeo = new THREE.PlaneBufferGeometry(10, 10, 1, 1)
	const shadowCatcherMat = new THREE.ShadowMaterial({
		opacity: .75
	})
	const shadowCatcher = new THREE.Mesh(shadowCatcherGeo, shadowCatcherMat)
	shadowCatcher.receiveShadow = true
	shadowCatcher.rotateX(Math.PI * 1.2)
	shadowCatcher.rotateY(Math.PI / -4)
	shadowCatcher.position.set(2, 1, .75)

	scene.add(shadowCatcher)

	const light = new THREE.PointLight('#eef', 1, 1, 5)
	light.position.set(-3, .5, -4)
	light.castShadow = true
	light.shadow.radius = 25

	let d = 10;
	light.shadow.camera.left = -d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = -d;

	scene.add(light)


	const composer = new EffectComposer( renderer)
	const renderPass = new RenderPass(scene, camera)
	composer.addPass(renderPass)
	let displacementPass = new ShaderPass({
		uniforms: {
			time: { value: 0 },
			tDiffuse: { value: null }
		},
		fragmentShader: Displ,
		vertexShader: Vertex
	})
	let filmPass = new FilmPass(.5, false, false, false)
	composer.addPass(filmPass)
	composer.addPass(displacementPass)
	let glitchPass = new GlitchPass(100)
	composer.addPass(glitchPass)


	let mask = scene.getObjectByName("mask")

	// draw each frame
	return {
		// Handle resize events here
		resize({ pixelRatio, viewportWidth, viewportHeight }) {
			renderer.setPixelRatio(pixelRatio);
			renderer.setSize(viewportWidth, viewportHeight, false);
			camera.aspect = viewportWidth / viewportHeight;
			camera.updateProjectionMatrix();
		},
		// Update & render your scene here
		render({ time }) {
			mat.uniforms.time.value = time
			displacementPass.uniforms.time.value = time
			if(!mask) mask = scene.getObjectByName("mask")
			// controls.update();
			if (mask) mask.position.y = Math.sin(time)**2 / 5
			composer.render();
		},
		// Dispose of events & renderer for cleaner hot-reloading
		unload() {
			// controls.dispose();
			renderer.dispose();
		}
	};
};

canvasSketch(sketch, settings);
