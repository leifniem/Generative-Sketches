precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
uniform float time;

#pragma glslify: noise = require('glsl-noise/simplex/2d')

void main () {
	gl_FragColor = vec4(
		noise(vUv + vec2(time /6., time / 12.)),
		noise(vUv.yx / 3. + time/ 8.),
		noise(vec2(time / 10.)),
		1.) * vec4(.25) + vec4(vec3(.7), 1.);
}