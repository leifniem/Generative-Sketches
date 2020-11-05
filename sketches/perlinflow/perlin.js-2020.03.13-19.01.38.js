const canvasSketch = require('canvas-sketch')
const { random, color } = require('canvas-sketch-util')
const palettes = require('nice-color-palettes')

const seed = random.getRandomSeed()
// const seed = '469931'
random.setSeed(seed)

const settings = {
	dimensions: [1440, 2560],
	suffix: seed
}

const interpolation = 100
const steps = 100
const lineWidth = 2
// let palette = random.pick(palettes)
// palette = ['#5e9fa3', '#dcd1b4', '#fab87f', '#f87e7b', '#b05574']
const palette = require("../delta.json")
// const background = random.pick(palette)
const background = '#121416'
// palette.splice(palette.indexOf(background), 1)
// const countLines = 1000
const numX = 28
const numY = 50
const aspect = settings.dimensions[0] / settings.dimensions[1]
const noiseSize = random.range(.5, 1)

let points = []

for (let y = 0; y < numY; y++) {
	for (let x = 0; x < numX; x++) {
		points.push([x / numX, y / numY])
	}
}


const noiseFunc = (x, y) => {
	return random.noise2D(x, y / aspect, 2, noiseSize)
}

const transparency = (x, y) => {
	return Math.sin(random.noise2D(x, y / aspect, 2, random.value()))
}

let point, k, j
const drawLines = (ctx, width, height) => {
	for (k = 0; k < points.length; k++) {
		point = random.pick(points)
		lineCol = color.parse(random.pick(palette))
		ctx.lineWidth = lineWidth
		// let [x, y] = point
		points.splice(points.indexOf(point), 1)
		let x = random.range(-.2,1.2)
		let y = random.range(-.2,1.2)
		ctx.beginPath()
		ctx.moveTo(x * width, y * height)
		ctx.strokeStyle = lineCol.hex
		if (random.value() < 0.33) {
			ctx.strokeStyle = lineCol.hex
			for (j = 0; j <= steps; j++) {
				ctx.arc(x * width, y * height, 1, 0, Math.PI * 2)
				val = noiseFunc(x, y)
				x += Math.sin(val) / interpolation / 3
				y += Math.cos(val) / interpolation / 3
				ctx.stroke()
				ctx.beginPath()
			}
		} else {
			for (j = 0; j <= steps * random.range(.5, 2); j++) {
				ctx.strokeStyle = "rgba(" + lineCol.rgb.join(',')+"," + transparency(x, y) + ")"
				ctx.lineTo(x * width, y * height)
				val = noiseFunc(x, y)
				x -= Math.sin(val) / interpolation
				y -= Math.cos(val) / interpolation
				ctx.stroke()
			}
		}
	}
}

let lineCol = '#000000'

const sketch = () => {
	return ({ context, width, height }) => {
		context.fillStyle = background
		context.lineJoin = 'round'
		context.lineCap = 'round'
		context.fillRect(0, 0, width, height)
		drawLines(context, width, height)
	}
}

canvasSketch(sketch, settings)
