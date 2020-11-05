const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const { lerp } = require('canvas-sketch-util/math')
const { parse, blend } = require('canvas-sketch-util/color')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed())

const settings = {
	dimensions: [1440, 2560],
	name: 'landscape',
	suffix: random.getSeed(),
	fps: 24,
	// animate: true,
	duration: 10
}

const paddinginPixels = 200
const padding = [
	paddinginPixels / settings.dimensions[0],
	paddinginPixels / settings.dimensions[1]
]
// const palette = random.pick(palettes)
const palette = require('../delta.json')
// let bg = parse(random.pick(palette))
// palette.splice(palette.indexOf(bg), 1)
// bg = blend('#121212', bg, 0.8).hex
const bg = "121212"
color = random.pick(palette)

let noiseoffset = [random.value(), random.value()]
peakBias = 0.5

const createGrid = (numX, numY, time) => {
	const timeOffsetX = Math.sin(Math.PI * 2 * time)
	const timeOffsetY = Math.cos(Math.PI * 2 * time)
	// console.log(timeOffsetX)
	let points = []
	for (let y = 0; y < numY; y++) {
		for (let x = 0; x < numX; x++) {
			let u = x / (numX - 1)
			let v = y / (numY - 1)
			const secondarynoise =
				Math.pow(
					random.noise2D(u + timeOffsetX, v + timeOffsetY, 1.3) + 0.2,
					4
				) * 2
			const tertiarynoise = Math.pow(
				random.noise2D(u + timeOffsetX, v + timeOffsetY, 10, 0.9),
				3
			)
			let noise =
				random.noise2D(u + timeOffsetX, v + timeOffsetY, 0.2) -
				secondarynoise
			secondarynoise > 0
				? (noise += (secondarynoise + 0.2) * tertiarynoise) * 0.5
				: noise
			v = v + noise * 0.05
			u = lerp(padding[0], 1 - padding[0], u)
			v = lerp(padding[1], 0.6 - padding[1], v)
			points.push({
				u,
				v,
				visited: false
			})
		}
	}
	return points
}

const drawLine = (context, points, width, height, x, y) => {
	context.strokeStyle = random.pick(palette)
	let point = points[y * gridX + x]
	;(tempi = y), (tempj = x)
	context.beginPath()
	context.moveTo(
		points[y * gridX + x].u * width,
		points[y * gridX + x].v * height
	)
	while (tempi < gridY && tempj < gridX && !point.visited) {
		point.visited = true
		tempi++
		tempj--
		if (!(tempi < gridY && tempj < gridX && tempi > 0 && tempj > 0)) {
			break
		}
		point = points[tempi * gridX + tempj]
		context.lineTo(
			points[tempi * gridX + tempj].u * width,
			points[tempi * gridX + tempj].v * height
			// ((points[tempi * gridX + tempj].u + points[(tempi - 1) * gridX + (tempj - 1)].u) / 2) * width,
			// ((points[tempi * gridX + tempj].v + points[(tempi - 1) * gridX + (tempj - 1)].v) / 2) * height
		)
	}
	context.stroke()
	// console.log(tempi, tempj)
	context.lineTo(
		points[(tempi - 1) * gridX + tempj - 1].u * width,
		height * 2
	)
	context.lineTo(points[(tempi - 1) * gridX].u * width, height * 2)
	context.closePath()
	context.fill()
}

gridX = 80
gridY = 100

const sketch = () => {
	const offset = noiseoffset[1]
	const offsetY = noiseoffset[0]
	return ({ context, width, height, playhead }) => {
		noiseoffset[0] = playhead + offsetY
		noiseoffset[1] = playhead + offset
		let points = createGrid(gridX, gridY, playhead)
		context.fillStyle = bg
		context.fillRect(0, 0, width, height)
		context.strokeStyle = color
		context.lineWidth = 8
		context.lineJoin = 'round'
		// let i = 0
		// while (i < points.length) {
		// 	if (i % gridX === 0) {
		// 		context.beginPath()
		// 		context.moveTo(points[i][0] * width, points[i][1] * height)
		// 		i++
		// 	}
		// 	// context.lineTo(points[i][0] * width, points[i][1] * height)
		// 	context.quadraticCurveTo(
		// 		points[i][0] * width,
		// 		points[i][1] * height,
		// 		(points[i][0] * width + points[i + 1][0] * width) / 2,
		// 		(points[i][1] * height + points[i + 1][1] * height) / 2
		// 	)

		// 	if (i % gridX === gridX - 2) {
		// 		context.stroke()
		// 		// context.fillStyle = `hsl(0, 0%, ${~~i/gridY * 1.8}%)`
		// 		context.lineTo(points[i][0] * width, height)
		// 		context.lineTo(points[i-gridX + 2][0] * width, height)
		// 		context.closePath()
		// 		context.fill()
		// 		i++
		// 	}
		// 	i++
		// }

		for (let x = 2; x < gridX; x++) {
			drawLine(context, points, width, height, x, 0)
		}

		for (let y = 1; y < gridY; y++) {
			drawLine(context, points, width, height, gridX - 1, y)
		}
	}
}

canvasSketch(sketch, settings)
