precision highp float;

attribute vec3 position;
varying vec2 vUv;

void main () {
  gl_Position = vec4(position.xyz, 1.);
  vUv = vec2(gl_Position.x, gl_Position.y * -1.) * .5 + .5;
}