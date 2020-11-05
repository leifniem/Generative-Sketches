precision highp float;

uniform float time;
uniform vec2 iResolution;
varying vec2 vUv;
vec2 uv;
uniform sampler2D text;

vec3 sample(vec2 uv);

#define ITERATIONS 20
#define BLURSTRENGTH 20.

#pragma glslify: noise = require('glsl-noise/simplex/2d')
#pragma glslify: blur = require('glsl-fast-gaussian-blur/13')

float random (vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14 * time);
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

// vec2(-uv.y, uv.x)
vec4 blurSample(vec2 uv, float base, float off) {
	vec2 dis = displ(uv, base + off * 2.);
	return blur(text, dis, iResolution.xy, dis * vec2(random(uv) * BLURSTRENGTH)) / 2. +
	blur(text, dis, iResolution.xy, dis * vec2(random(vec2(-uv.y, uv.x)) * BLURSTRENGTH  / 2.)) / 2.;
}

void main () {
	float offset = BLURSTRENGTH / 600.;
	float base = 1.;
	gl_FragColor = vec4(
		blurSample(vUv, base, - offset).r + .1,
		blurSample(vUv, base - offset, offset).g + .08,
		blurSample(vUv, base + offset, offset).b + .1,
		1.
	);
}