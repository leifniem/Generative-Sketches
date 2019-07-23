const canvasSketch = require('canvas-sketch')
const createShader = require('canvas-sketch-util/shader')
const glsl = require('glslify')

// Setup our sketch
const settings = {
	dimensions: [2048, 2048],
	context: 'webgl',
	animate: true,
	duration: 5,
	fps: 24
}

// Your glsl code
const frag = glsl(/* glsl */ `
  precision highp float;
  varying vec2 vUv;
	float multiplier = 3.0;
	float lightDist = 0.3;
	float PI = 3.1415926535897932384626433832795;
	uniform float playhead;

	#pragma glslify: noise = require('glsl-noise/simplex/2d')

  void main () {
		vec2 lightPos = vec2(vUv.x - sin((playhead -0.5) * PI * 1.2) / 2.0 - 0.5, vUv.y - cos((playhead -0.5) * PI * 1.2) / 2.0);
		vec2 center = vec2(vUv.x - 0.5, vUv.y);
		float dist = length(center);
		float lightradius = length(lightPos);

		float n = noise(vUv.xy * 513.0) + 0.5;
		float circle = smoothstep(.495, .5, dist);
		float ring = smoothstep( .1, .5, dist);

		float alpha = (lightDist * n - (pow(lightradius, 0.5)) * 0.5)  * (circle + 3.0) * ring;
		alpha = alpha > 0.0 ? alpha : 0.0;
		alpha = pow(alpha, 4.0);

    vec3 color = vec3(1.0) * (alpha + 0.15 + (n * 0.01));
    gl_FragColor = vec4(color, 1.0);
  }
`)

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
	// Create the shader and return it
	return createShader({
		// Pass along WebGL context
		gl,
		// Specify fragment and/or vertex shader strings
		frag,
		// Specify additional uniforms to pass down to the shaders
		uniforms: {
			// Expose props from canvas-sketch
			// time: ({ time }) => time
			playhead: ({ playhead }) => playhead
		}
	})
}

canvasSketch(sketch, settings)
