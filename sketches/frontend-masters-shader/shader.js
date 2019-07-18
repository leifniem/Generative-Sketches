const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
	context: 'webgl',
  // animate: true
};

// Your glsl code
const frag = glsl(/* glsl */`
  precision highp float;

  uniform float time;
  varying vec2 vUv;
	uniform float aspect;

	#pragma glslify: noise = require('glsl-noise/simplex/3d')

  void main () {
		vec2 center = vUv - 0.5;
		center.x *= aspect;
		float dist = length(center);

		float alpha = smoothstep(.252, .25, dist);

		float n = noise(vec3(vUv.xy * 1.5, time * 0.5));

		vec3 colorA = cos(time * 2.0) + vec3(1.0, .2 + sin(time) / 2.0, .2) * n;
		vec3 colorB = sin(time * 0.5) + vec3(.3, .2, cos(time) / 2.0) * n;

		vec3 color = mix(colorA, colorB, vec3(n));
    gl_FragColor = vec4(vec3(color), alpha);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
		clearColor: '#222222',
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
			time: ({ time }) => time,
			aspect: ({width, height}) => width/height
    }
  });
};

canvasSketch(sketch, settings);
