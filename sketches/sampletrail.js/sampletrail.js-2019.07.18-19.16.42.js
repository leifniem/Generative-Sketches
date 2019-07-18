const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const color = require('canvas-sketch-util/color')
const { lerp } = require('canvas-sketch-util/math')
const fs = require('fs')

const settings = {
	dimensions: [2048, 2048],
	name: 'trails',
	suffix: random.getSeed()
}

const img = new Image()
img.crossOrigin = 'Anonymous'

function createGrid(numX, numY) {
	let points = []
	const count = numX * numY
	for (let i = 0; i < count; i++) {
		const u = (i % numX) / (numX - 1)
		const v = ~~(i / numY) / (numY - 1)
		points.push({ u, v })
	}
	return points
}

const numX = 10
const numY = 10

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

function drawStuff(context, points, width, height, padding) {
	context.lineWidth = 10
	context.lineJoin = 'round'
	context.fillRect(0, 0, width, height)

	let point, end, startx, starty, endx, endy
	while (points.length) {
		point = random.pick(points)
		context.beginPath()
		if (random.value() > 0.5) {
			end = random.pick(points)
			startx = lerp(padding, width - padding, point.u)
			starty = lerp(padding, height - padding, point.v)
			endx = lerp(padding, width - padding, end.u),
			endy = lerp(padding, height - padding, end.v)
			context.moveTo(startx, starty)
			context.lineTo(
				endx,
				endy
			)
			const grad = context.createLinearGradient(
				startx,
				starty,
				endx,
				endy
			)
			grad.addColorStop(0, point.color.hex)
			grad.addColorStop(1, end.color.hex)
			context.strokeStyle = grad
			context.stroke()
			points.splice(points.indexOf(point), 1)
			points.splice(points.indexOf(end), 1)
		} else {
			context.fillStyle = point.color.hex
			context.arc(
				lerp(padding, width - padding, point.u),
				lerp(padding, height - padding, point.v),
				context.lineWidth,
				0,
				Math.PI * 2
			)
			context.fill()
			points.splice(points.indexOf(point), 1)
		}
	}
}

const sketch = () => {
	const points = createGrid(numX, numY)
	const padding = 300
	try {
		fetch('https://source.unsplash.com/random/2048x2048').then(data => {
			random.setSeed(
				data.url.match(
					/https:\/\/images\.unsplash\.com\/photo-([\da-f]+-[\da-f]+)/
				)[1]
			)
			img.src = data.url
		})
	} catch (error) {
		console.error(error)
	}
	return ({ context, width, height }) => {
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

canvasSketch(sketch, settings)
