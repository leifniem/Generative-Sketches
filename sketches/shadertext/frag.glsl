precision highp float;

uniform float time;
varying vec2 vUv;
uniform sampler2D tex;

#pragma glslify: noise = require('glsl-noise/simplex/2d')

vec2 getCoord(float multiplier) {
	float displ = noise(vec2(vUv.x / 2., (vUv.y + sin(time * 3.14159)) * 3.));
	float offsetX = displ * .1;
	float offsetY = displ * .025;
	return vec2(vUv.x + offsetX * multiplier, vUv.y + offsetY * multiplier);
}

void main () {
	float offset = .05;
	gl_FragColor = vec4(
		texture2D(tex, getCoord(1. - offset)).r,
		texture2D(tex, getCoord(1.)).g,
		texture2D(tex, getCoord(1. + offset)).b,
		1.
	);
}