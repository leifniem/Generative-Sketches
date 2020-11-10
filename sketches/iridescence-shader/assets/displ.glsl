uniform float time;
uniform sampler2D tDiffuse;
varying vec2 vUv;
float pi = 3.1415926535897932384626433832795;

vec4 displ(vec2 uv) {
	float effect = smoothstep(-.02, .02, 1. - uv.y - fract(time / 3.)) + .5;
	return texture2D(tDiffuse, vec2(uv.x - (sin(pi*sin(effect*pi/2.)) - .75) / 10., uv.y));
}

void main(){
	gl_FragColor = displ(vUv);
}