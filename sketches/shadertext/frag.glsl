precision highp float;

uniform float time;
uniform vec2 iResolution;
varying vec2 vUv;
vec2 uv;
uniform sampler2D text;

vec3 sample(vec2 uv);

#define ITERATIONS 20

#pragma glslify: noise = require('glsl-noise/simplex/2d')
#pragma glslify: blur = require('glsl-fast-gaussian-blur/13')

float random (vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float noisey(vec2 uv){
	return (noise(vec2(uv.x / 2., (uv.y + time / 5.) * 2.)) - .5) / 20.;
}

vec2 displ(vec2 uvIn, float mult) {
	uv = vec2(uvIn.x, 1. - uvIn.y);
	float displ = noisey(uv) * mult;
	return vec2(uv.x + displ, uv.y + displ);
}

// vec3 sample(vec2 uv){
// 	// return texture2D(text, displ(uv + noisey(uv))).rgb;
// }

void main () {
	float hash = mod(floor(fract(time)*20.0) * 382.0231, 21.321);
	gl_FragColor = vec4(
		blur(text, displ(vUv, .9), iResolution.xy, vec2(noisey(vUv) * 200. * random(vUv * sin(time)))).r / 2. +
		blur(text, displ(vUv, .95), iResolution.xy, vec2(noisey(vUv.yx) * 200. * random(vUv * sin(time)))).r / 2.
		+ .05,
		blur(text, displ(vUv, 1.), iResolution.xy, vec2(noisey(vUv) * 200. * random(vUv * sin(time)))).g / 2. +
		blur(text, displ(vUv, 1.05), iResolution.xy, vec2(noisey(vUv.yx) * 200. * random(vUv * sin(time)))).g / 2.
		+ .05,
		blur(text, displ(vUv, 1.1), iResolution.xy, vec2(noisey(vUv) * 200. * random(vUv * sin(time)))).b / 2. +
		blur(text, displ(vUv, 1.15), iResolution.xy, vec2(noisey(vUv.yx) * 200. * random(vUv * sin(time)))).b / 2.
		+ .075,
		1.
	);
}