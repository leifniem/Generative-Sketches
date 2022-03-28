varying vec2 vUv;
varying vec3 vNormal;
varying vec3 noisePosition;

#pragma glslify: noise = require('glsl-noise/simplex/2d')

void main() {
	vUv = uv;
	vNormal = normal;
	vec4 newPos = vec4(
		position.x + noise(vec2(sin(position.x), cos(position.y))) / 5.,
		position.y,
		position.z + noise(vec2(cos(position.x), sin(position.y))) / 5.,
		1.
	);
	gl_Position = projectionMatrix * modelViewMatrix * newPos;
	noisePosition = (projectionMatrix * modelViewMatrix * newPos) + projectionMatrix[0].xyz + modelViewMatrix[1].xyz;
}