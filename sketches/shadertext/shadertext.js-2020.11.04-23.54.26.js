const canvasSketch = require('canvas-sketch');
const shader = require('canvas-sketch-util/shader');
const loadAsset = require('load-asset');
const frag = require('./frag.glsl')

const settings = {
	dimensions: [1024, 1024],
	context: 'webgl',
	animate: true,
	// duration: 10,
};

const sketch = async ({ gl }) => {
	const text = await loadAsset("./text.jpg")
	return shader({
		gl,
		frag,
		uniforms: {
			text,
			time: ({ time }) => time,
			iResolution: ({width, height}) => [width, height]
		}
	})
}

canvasSketch(sketch, settings);
