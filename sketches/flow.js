const canvasSketch = require('canvas-sketch')
const createShader = require('canvas-sketch-util/shader')
const Color = require('canvas-sketch-util/color')
const palettes = require('nice-color-palettes');
const random = require('canvas-sketch-util/random')
const glslify = require('glslify')


const seed = random.getRandomSeed()
const settings = {
	dimensions: [1024, 1024],
	// animate: true,
	// duration: 5,
	fps: 24,

	context: 'webgl',

	attributes: {
		antialias: true
	},

	name: "whatever",
	suffix: seed.toString()
};

let palette = random.pick(palettes)
palette.sort((a, b) => Color.parse(a).hsl[2] - Color.parse(b).hsl[2]);
palette = palette.map(hex => Color.parse(hex).rgb.map(x => x / 255))
const randZ = random.value()
const scaleRand = random.value()
const cutOff = random.range(.1, .3)
const distortionScale = .2

const frag = glslify( /* glsl */ `
	precision highp float;
	uniform float randZ;
	uniform float distortionScale;
	uniform float scaleRand;
	uniform float cutOff;
	uniform float time;
	uniform vec3 palette[5];
	varying vec2 vUv;

	#pragma glslify: vonoise = require('glsl-voronoi-noise/3d');
	#pragma glslify: noise = require('glsl-noise/simplex/3d');

	vec3 colorLookup(float t) {
		float about = t * 4.;
		if(about < 1.) {
			return mix(palette[0] * .25, palette[0],  pow(about, 3.));
		} else if (about < 2.) {
			return mix(palette[0], palette[1], about - 1.);
		} else if (about < 3.) {
			return mix(palette[1], palette[2], about - 2.);
		}
		// else if (about < 4.) {
			return mix(palette[2], palette[3], about - 3.);
		// }
		// return mix(palette[3], palette[4], about - 4.);
	}

	float heightAt(vec3 vnoise) {
		return 1. - pow(clamp(vnoise.r, 0., 1. - cutOff) + cutOff, 5.);
	}

	void main () {
		vec3 lookup = vec3(vUv * (2. + scaleRand), randZ * 100.);
		vec3 timeOffset = vec3(0., 0., time * .5);

		// margin
		vec2 marginDist = 1. - 2. * abs(vec2(.5) - vUv);
		float marginFade = pow(smoothstep(.1, .2, marginDist.x) * smoothstep(.1, .2, marginDist.y), 3.);

		// distortion
		float disp = noise(lookup + timeOffset);
		vec3 dispLookup = lookup + disp * distortionScale + timeOffset;

		// height
		vec3 vnoise = vonoise(dispLookup);
		float base = heightAt(vnoise) * marginFade;

		// normals
		float top = pow(vonoise(dispLookup + vec3(.0, -.02, .0)).r, 3.);
		float bottom = pow(vonoise(dispLookup + vec3(.0, .02, .0)).r, 3.);
		float left = pow(vonoise(dispLookup + vec3(-.02, .0, .0)).r, 3.);
		float right = pow(vonoise(dispLookup + vec3(.02, .0, .0)).r, 3.);
		vec3 normal = vec3(8. * (left - right), 8. * (bottom - top), 1.);

		// color random
		vec3 colorShift = vec3(
			vonoise(lookup + vnoise.r).r,
			vonoise(lookup + vnoise.g).g / 2.,
			noise(lookup + vnoise.g)
		);

		gl_FragColor = vec4(pow((- normal.r + normal.g) * base, 2.) * 3. * palette[4], 1.);
		// gl_FragColor = vec4(
		// 	colorLookup(base) * .7
		// 	+ pow((- normal.r + normal.g) * base, 2.) * 3. * palette[4]
		// 	+ (colorShift * base * marginFade) * .3
		// 	+ noise(vec3(vUv * 1000., 0.) + timeOffset) * .05,
		// 	1.0
		// );
	}
`)

const sketch = ({ gl }) => {
	return createShader({
		gl,
		frag,
		uniforms: {
			randZ,
			distortionScale,
			scaleRand,
			cutOff,
			time: ({ time }) => time,
			"palette[0]": palette[0],
			"palette[1]": palette[1],
			"palette[2]": palette[2],
			"palette[3]": palette[3],
			"palette[4]": palette[4],
		}
	})
};

canvasSketch(sketch, settings);
