const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const color = require('canvas-sketch-util/color')

const settings = {
	dimensions: [1080, 2360],
}

let img = new Image()
img.crossOrigin = 'anonymous'

const blurRadius = 800
const numshapes = random.rangeFloor(30, 100)
// const padding = (130 - numshapes) * 3
const padding = 0

async function loadImage() {
	try {
		let data = await fetch(
			`https://source.unsplash.com/random/${~~(
				settings.dimensions[0] / 5
			)}x${~~(settings.dimensions[1] / 5)}`
		)
		// // use instead of fetch for specific wallpaper
		// data = {
		// 	url: `https://images.unsplash.com/photo-1561222015-1862bf2f483a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=${~~(settings.dimensions[1] / 5)}&ixlib=rb-1.2.1&q=80&w=${~~(settings.dimensions[0] / 5)}`
		// }

		id = data.url.match(
			/https:\/\/images\.unsplash\.com\/photo-([\da-f]+-[\da-f]+)/
		)[1]
		img.src = data.url
		return id
	} catch (error) {
		console.error(error)
	}
}

const findMax = (samples) => {
	return (x = samples.reduce(
		(iMax, x, i, samples) => (x > samples[iMax] ? i : iMax),
		0
	))
}

const buildshapes = (sampled, width, height) => {
	let reshaped = []
	for (let o = 0; o < sampled.data.length; o += 4) {
		reshaped.push([
			sampled.data[o],
			sampled.data[o + 1],
			sampled.data[o + 2],
		])
	}
	let added = reshaped.map((x) => x[0] + x[1] + x[2])

	const shapes = []
	let index, scaleX, scaleY, currRect
	for (let r = 0; r < numshapes; r++) {
		currRect = {}
		index = findMax(added)
		sample = random.pick(reshaped)
		index = reshaped.indexOf(sample)

		currRect.color1 = reshaped[index]

		currRect.startX = index % width
		currRect.startY = ~~(index / width)

		scaleX = (width / (sample[0] + sample[2])) * 10
		// scaleY = height / (sample[0] + sample[1]) * 25

		scale = random.rangeFloor(-scaleX, scaleX)
		currRect.endX = currRect.startX + scale
		currRect.endY = currRect.startY + scale

		// currRect.endX =
		// 	currRect.endX > 0
		// 		? currRect.endX < width
		// 			? currRect.endX
		// 			: width - 1
		// 		: 0
		// currRect.endY =
		// 	currRect.endY > 0
		// 		? currRect.endY < height
		// 			? currRect.endY
		// 			: height - 1
		// 		: 0

		currRect.color2 = reshaped[currRect.endY * width + currRect.endX]
		currRect.color2 = currRect.color2
			? currRect.color2
			: reshaped[currRect.endY * width + currRect.endX - 1]

		let x,
			y,
			endX,
			endY
			// blackout max value check
		;[x, endX] = [currRect.startX, currRect.endX].sort((a, b) => a - b)[
			(y, endY)
		] = [currRect.startY, currRect.endY].sort((a, b) => a - b)

		// for (let y = currRect.startY; y < currRect.endY; y++) {
		// 	for (let x = currRect.startX; x < currRect.endX; x++) {
		// 		added[y * width + x - 1] = 0
		// 	}
		// }

		shapes.push(currRect)
	}
	return shapes.sort(
		(a, b) =>
			a.color1[0] +
			a.color1[1] +
			a.color1[2] -
			(b.color1[0] + b.color1[1] + b.color1[2])
	)
}

let angle = 0

const drawshapes = (shapes, context, width, height) => {
	for (const shape of shapes) {
		console.log
		angle = random.value() * 2 * Math.PI
		console.log(shape)
		if (random.value() < 0.4) {
			context.fillStyle = color.parse(`rgb(${shape.color1})`).hex.toString()
		} else {
			const grad = context.createLinearGradient(
				// random.rangeFloor(shape.startX + padding, shape.endX + padding),
				// random.rangeFloor(shape.startY + padding, shape.endY + padding),
				// random.rangeFloor(shape.startX + padding, shape.endX + padding),
				// random.rangeFloor(shape.startY + padding, shape.endY + padding)
				Math.abs(shape.startX),
				Math.abs(shape.startY),
				Math.abs(shape.endX),
				Math.abs(shape.endY)
			)
			grad.addColorStop(0, color.parse(shape.color1).hex.toString())
			grad.addColorStop(1, color.parse(shape.color2).hex.toString())
			context.fillStyle = grad
		}

		context.save()
		context.translate(shape.startX, shape.startY)
		context.rotate(angle)
		if (random.value() < 0.5) {
			context.fillRect(
				0,
				0,
				Math.abs(shape.endX - shape.startX),
				Math.abs(shape.endX - shape.startX)
			)
		} else {
			console.log("circle")
			context.beginPath()
			context.arc(
				Math.abs(shape.startX),
				Math.abs(shape.startY),
				shape.endX - shape.startX,
				0,
				Math.PI * 2
			)
			context.fill()
		}
		context.restore()
	}
}

const sketch = () => {
	return {
		render({ context, width, height }) {
			img.onload = () => {
				context.drawImage(img, 0, 0, width, height)
				const sampled = context.getImageData(0, 0, width, height)
				context.filter = `blur(${blurRadius}px)`
				context.drawImage(
					img,
					-blurRadius * 2,
					-blurRadius * 2,
					width + 4 * blurRadius,
					height + 4 * blurRadius
				)
				context.filter = 'none'
				// averageBackground(sampled)
				const shapes = buildshapes(sampled, width, height)
				drawshapes(shapes, context, width, height)
			}
		},
	}
}

loadImage().then((seed) => {
	settings.suffix = seed
	random.setSeed(seed)
	canvasSketch(sketch, settings)
})
