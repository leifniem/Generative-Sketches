const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const color = require('canvas-sketch-util/color')
const { lerp } = require('canvas-sketch-util/math')

const img = new Image()
img.crossOrigin = 'Anonymous'

const numX = 10
const numY = 10
const points = createGrid(numX, numY)
const padding = 400

function createGrid(numX, numY) {
	let points = []
	for (let y = 0; y < numY; y++) {
		for (let x = 0; x < numX; x++) {
			const u = x / (numX - 1)
			const v = y / (numY - 1)
			points.push({ u, v, x, y, visited: false })
		}
	}
	return points
}


function sampleColors(context, points, width, height, padding) {
	for (let point of points) {
		point.color = color.parse([
			...context.getImageData(
				lerp(padding, width - padding, point.u),
				lerp(padding, height - padding, point.v),
				1,
				1
			).data
		])
	}
	return points
}

function nextPoint(point, dir) {
	let next = (point.y + dir) * numX + point.x + dir
	return next
}

function drawStuff(context, points, width, height, padding) {
	context.lineWidth = 20
	context.lineJoin = 'round'
	context.lineCap = 'round'

	color.contrastRatio(random.pick(points).color.rgb, "#ffffff") < 4.5
	? context.fillStyle = "white"
	: context.fillStyle = "black"
	context.fillRect(0, 0, width, height)
	let linecount = numY

	let point, next, startx, starty, nextx, nexty, dist, dir
	while (linecount) {
		point = random.pick(points)
		context.beginPath()
		dist = random.rangeFloor(1, 6)
		dir = random.sign()
		next = points[nextPoint(point, dir)]
		while (
			next &&
			dist &&
			point.x !== 0 &&
			point.x !== numX - 1 &&
			!point.visited &&
			!next.visited
		) {
			startx = lerp(padding, width - padding, point.u)
			starty = lerp(padding, height - padding, point.v)
			nextx = lerp(padding, width - padding, next.u)
			nexty = lerp(padding, height - padding, next.v)
			context.moveTo(startx, starty)
			context.lineTo(nextx, nexty)
			const grad = context.createLinearGradient(
				startx,
				starty,
				nextx,
				nexty
			)
			grad.addColorStop(0, point.color.hex)
			grad.addColorStop(1, next.color.hex)
			context.strokeStyle = grad
			context.stroke()
			// points.splice(points.indexOf(point), 1)
			point.visited = true
			point = next
			next = points[nextPoint(point, dir)]
			dist--
		}
		// points.splice(points.indexOf(point), 1)
		linecount--
	}

	while (points.length) {
		point = random.pick(points)
		if (!point.visited) {
			context.beginPath()
			context.fillStyle = point.color.hex
			context.arc(
				lerp(padding, width - padding, point.u),
				lerp(padding, height - padding, point.v),
				context.lineWidth / 2,
				0,
				Math.PI * 2
			)
			context.fill()
		}
		points.splice(points.indexOf(point), 1)
	}
}

async function loadImage() {
	try {
		let data = await fetch('https://source.unsplash.com/random/2048x2048')
		// fetch('https://source.unsplash.com/random/2048x2048').then(data => {
		id = data.url.match(
			/https:\/\/images\.unsplash\.com\/photo-([\da-f]+-[\da-f]+)/
		)[1]
		img.src = data.url
		return id
		// })
	} catch (error) {
		console.error(error)
	}
}

const sketch = () => {
	return {
		render({ context, width, height }) {
			img.onload = () => {
				context.drawImage(img, 0, 0, width, height)
				const sampled = sampleColors(
					context,
					points,
					width,
					height,
					padding
				)
				drawStuff(context, sampled, width, height, padding)
			}
		}
	}
}

let settings = {
	dimensions: [2048, 2048],
	name: 'trails',
}

loadImage().then((seed) => {
	settings.suffix = seed
	random.setSeed(seed)
	canvasSketch(sketch, settings)
})



