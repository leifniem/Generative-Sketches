uniform float time;
uniform sampler2D normalMap;
uniform sampler2D roughness;
varying vec2 vUv;
varying vec3 vNormal;

#pragma glslify: noise = require('glsl-noise/simplex/3d')

void main () {
	vec3 col = vec3(
		sin(vNormal.x * noise(vec3( time * .2, vNormal.y, vNormal.z))),
		tan(vNormal.y * noise(vec3( vNormal.x, time * .2, vNormal.z))),
		tan(vNormal.z * noise(vec3( vNormal.x, vNormal.y, time * .2))) + .5
	);
	gl_FragColor = vec4(col + .3, 1.);
}