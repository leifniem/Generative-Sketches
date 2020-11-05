const canvasSketch = require('canvas-sketch');
const shader = require('canvas-sketch-util/shader');
const loadAsset = require('load-asset');
const vert = require('./vert.glsl')
const frag = require('./frag.glsl')

const settings = {
	dimensions: [2048, 2048],
	context: 'webgl',
	animate: true,
	duration: 10,
};

const sketch = async ({ gl }) => {
	const tex = await loadAsset("./text.jpg")
	return shader({
		gl,
		frag,
		vert,
		uniforms: {
			tex,
			time: ({ playhead }) => playhead,
		}
	})
};

canvasSketch(sketch, settings);
