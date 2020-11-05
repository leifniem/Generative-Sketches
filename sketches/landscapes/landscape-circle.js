const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const { lerp } = require('canvas-sketch-util/math')
const palettes = require('nice-color-palettes')

const seed = random.getRandomSeed()
// const seed = 106366

random.setSeed(seed)
console.log(random.getSeed())

const settings = {
	dimensions: [1440, 2560],
	name: 'landscape',
	suffix: seed,
	fps: 10,
	// animate: true,
	duration: 10
}

const paddinginPixels = 200
const padding = [
	paddinginPixels / settings.dimensions[0],
	paddinginPixels / settings.dimensions[1]
]

let noiseoffset = [random.value(), random.value()]
peakBias = 0.5

const createGrid = (numX, numY) => {
	let points = {}
	for (let y = 0; y < numY; y++) {
		for (let x = 0; x < numX; x++) {
			let u = x / (numX - 1)
			let v = y / (numY - 1)
			u = lerp(padding[0], 1 - padding[0], u)
			v = lerp(padding[1], 1 - padding[1], v)
			points[[y, x]] = {
				u,
				v,
				visited: false
			}
		}
	}
	return points
}

const applyNoise = (point, time) => {
	const timeOffsetX = Math.sin(Math.PI * 2 * time)
	const timeOffsetY = Math.cos(Math.PI * 2 * time)
	const secondarynoise =
		Math.pow(
			random.noise2D(point.u + timeOffsetX, point.v + timeOffsetY, 1.8) +
				0.2,
			4
		) * 2
	const tertiarynoise = Math.pow(
		random.noise2D(point.u + timeOffsetX, point.v + timeOffsetY, 10, 1.2),
		3
	)
	let noise =
		random.noise2D(point.u + timeOffsetX, point.v + timeOffsetY, 0.3) -
		secondarynoise
	secondarynoise > 0
		? (noise += (secondarynoise + 0.2) * tertiarynoise) * 0.5
		: noise
	point.v = point.v + noise * 0.05
	return point
}

const drawLine = (context, points, width, height, x, y) => {
	let point = points[[y, x]]
	;(tempi = y), (tempj = x)
	context.beginPath()
	context.moveTo(point.u * width, point.v * height - 500)
	while (tempi < gridY && tempj < gridX && !point.visited) {
		point.visited = true
		tempi++
		tempj++
		// if (!(tempi < gridY && tempj < gridX && tempi > 0 && tempj > 0)) {
		// 	break
		// }
		if (!([tempi, tempj] in points)) {
			break
		}
		point = points[[tempi, tempj]]
		context.lineTo(
			point.u * width,
			point.v * height - 500
			// ((points[[tempi * gridX, tempj]].u + points[(tempi - 1) * gridX + (tempj - 1)].u) / 2) * width,
			// ((points[[tempi * gridX, tempj]].v + points[(tempi - 1) * gridX + (tempj - 1)].v) / 2) * height
		)
	}
	context.stroke()
	context.lineTo(point.u * width, height * 2)
	context.lineTo(point.u * width, height * 2)
}

const inCircle = (x, y, centerX, centerY, radius) => {
	const dist = { x: x - centerX, y: y - centerY }
	return dist.x * dist.x + dist.y * dist.y <= radius * radius
}

gridX = 80
gridY = 80
// const palette = random.pick(palettes)
// const bg = random.pick(palette)
const bg = "#222"
const palette = require("../delta.json")
// palette.splice(palette.indexOf(bg), 1)
color = random.pick(palette)
// palette.splice(palette.indexOf(color), 1)
// color2 = random.pick(palette)

centerX = settings.dimensions[0] / 2
centerY = settings.dimensions[1] / 2
const offset = noiseoffset[1]
const offsetY = noiseoffset[0]

const sketch = () => {
	return ({ context, width, height, playhead }) => {
		noiseoffset[0] = playhead + offsetY
		noiseoffset[1] = playhead + offset
		let points = createGrid(gridX, gridY, playhead)
		Object.values(points).forEach(point => {
			point = applyNoise(point, playhead)
		})
		Object.entries(points).forEach(point => {
			const [key, values] = point
			if (
				!inCircle(
					values.u * width,
					values.v * height,
					centerX,
					centerY,
					width / 2 - paddinginPixels + 8
				)
			) {
				delete points[key]
			}
		})
		context.fillStyle = bg
		context.fillRect(0, 0, width, height)
		context.strokeStyle = color
		context.lineWidth = 4
		context.lineJoin = 'round'

		Object.entries(points).forEach(element => {
			let [key, point] = element
			key = key.match(/(\d*),(\d*)/)
			context.strokeStyle = random.pick(palette)
			drawLine(context, points, width, height, key[2], key[1])
		})
	}
}

canvasSketch(sketch, settings)
