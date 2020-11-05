const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const { lerp } = require('canvas-sketch-util/math')
const loadAsset = require('load-asset')
const palettes = require('nice-color-palettes')
// const palettes = require('../palettes.json')

const settings = {
	dimensions: [2160, 4720],
	duration: 5,
	// animate: true
}

// const rs = random.getRandomSeed()
const rs = "245617"
random.setSeed(rs)
const palette = [
	...random.pick(palettes),
	...random.pick(palettes),
	...random.pick(palettes),
]
const bg = random.pick(palette)
palette.splice(palette.indexOf(bg), 1)
// const bg = '#242732'
const padding = 0
const centerBias = 2

random.setSeed(random.getRandomSeed())

function displace(dispMap, context, width, height, scale, time) {
	let src = context.getImageData(0, 0, width, height).data
	let dispValues = []
	let newVals = []
	let newPos, x, y, angle, newx, newy
	for (let i = 0; i < dispMap.length; i += 4) {
		dispValues.push(
			(dispMap[i] + dispMap[i + 1] + dispMap[i + 2]) / 765 // /3 /255 to normalize
		)
	}

	for (let i = 0; i < src.length; i += 4) {
		angle = (dispValues[i / 4] + time / 10) * Math.PI * 2
		x = (i / 4) % width
		y = ~~(i / width / 4)
		newy = y + Math.floor(Math.sin(angle) * scale)
		newx = x + Math.floor(Math.cos(angle) * scale)
		newy < height ? (newy > 0 ? (y = newy) : (y = 0)) : (y = height - 1)
		newx < width ? (newx > 0 ? (x = newx) : (x = 0)) : (x = width - 1)
		newPos = y * width * 4 + x * 4

		// if (i !== newPos) {
		// src[i] = src[newPos]
		// src[i + 1] = src[newPos + 1]
		// src[i + 2] = src[newPos + 2]
		newVals[i] = src[newPos]
		newVals[i + 1] = src[newPos + 1]
		newVals[i + 2] = src[newPos + 2]
		newVals[i + 3] = 255
		// }
	}

	// context.putImageData(new ImageData(src, width), 0, 0)
	context.putImageData(
		new ImageData(new Uint8ClampedArray(newVals), width),
		0,
		0
	)
}

let x, y, size, rot, side, shape

function drawElement(color, secondary, context, width, height) {
	context.lineWidth = random.rangeFloor(10, 100)
	context.beginPath()
	x =
		width / 2 +
		random.rangeFloor(
			-(width - padding) / centerBias,
			(width - padding) / centerBias
		)
	y =
		height / 3 +
		random.rangeFloor(
			-(width - padding) / centerBias,
			(width - padding) / centerBias
		)
	// random.rangeFloor(-(width - padding) / centerBias, 0)
	size = lerp(padding, width - padding, +random.value()) / 3.5
	if (random.value < 0.5) {
		context.fillStyle = color
		context.strokeStyle = color
	} else {
		const grad = context.createLinearGradient(x, y, x + size, y + size)
		grad.addColorStop(0, color)
		grad.addColorStop(1, secondary)
		context.fillStyle = grad
		context.strokeStyle = grad
	}
	shape = random.value()
	if (shape > 0.7) {
		context.arc(x, y, size, 0, Math.PI * 2)
	} else if (shape < 0.3) {
		rot = random.value() * Math.PI
		context.save()
		context.translate(x, y)
		context.rotate(rot)
		context.rect(0, 0, size, size)
		context.restore()
	} else {
		rot = random.value() * Math.PI
		context.save()
		context.translate(x, y)
		context.rotate(rot)
		for (side = 0; side < 7; side++) {
			context.lineTo(
				x + size * Math.cos((side * 2 * Math.PI) / 6),
				y + size * Math.sin((side * 2 * Math.PI) / 6)
			)
		}
		context.restore()
	}
	random.value() > 0.5 ? context.fill() : context.stroke()
}

const sketch = async () => {
	// const image = await loadAsset('./ic_splash_screen.png')
	// texture = await loadAsset('./disp.jpg')
	let scaleTex
	const minTex = Math.min(texture.width, texture.height)
	minTex === texture.width
		? (scaleTex = settings.dimensions[0] / texture.width)
		: (scaleTex = settings.dimensions[1] / texture.height)
	return ({ context, width, height, time, playhead }) => {
		context.drawImage(
			texture,
			(width - texture.width * scaleTex) / 2,
			(height - texture.height * scaleTex) / 2,
			texture.width * scaleTex,
			texture.height * scaleTex
		)
		context.lineWidth = 30
		const dispMap = context.getImageData(0, 0, width, height).data
		context.fillStyle = bg
		context.fillRect(0, 0, width, height)
		// palette.map(color => {
		// 	drawElement(color, context, width, height)
		// })
		for (let element = 0; element < 20; element++) {
			drawElement(
				random.pick(palette),
				random.pick(palette),
				context,
				width,
				height
			)
		}
		// let scale = 2
		// context.drawImage(
		// 	image,
		// 	(width - image.width * scale) / 2,
		// 	(height - image.height * scale) / 2,
		// 	image.width * scale,
		// 	image.height * scale
		// )
		displace(dispMap, context, width, height, 50, 0)
		// // Trnasition animation
		// context.globalAlpha = playhead
		// context.drawImage(
		// 	magenta,
		// 	(width - image.width * scale) / 2,
		// 	(height - image.height * scale) / 2,
		// 	image.width * scale,
		// 	image.height * scale
		// )
		// context.globalAlpha = 1
	}
}

let texture = new Image()
texture.crossOrigin = 'Anonymous'

texture.onload = () => {
	canvasSketch(sketch, settings)
}

async function loadImage() {
	try {
		let data = await fetch(
			`https://source.unsplash.com/collection/8249707/${
				settings.dimensions[0]
			}x${settings.dimensions[1]}`
		)

		id = data.url.match(
			/https:\/\/images\.unsplash\.com\/photo-([\da-f]+-[\da-f]+)/
		)[1]
		texture.src = data.url
		return id
	} catch (error) {
		console.error(error)
	}
}

loadImage().then((seed) => {
	settings.prefix = seed
})
