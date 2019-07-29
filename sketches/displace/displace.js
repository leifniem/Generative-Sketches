const canvasSketch = require('canvas-sketch')
// const random = require('canvas-sketch-util/random')
const loadAsset = require('load-asset')

const settings = {
	dimensions: [800, 800],
	duration: 5,
	animate: true
}

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
		x = i / 4 % width
		y = ~~(i / width / 4)
		newy = y + Math.floor(Math.sin(angle) * scale)
		newx = x + Math.floor(Math.cos(angle) * scale)
		newy < height ? (newy > 0 ? (y = newy) : y = 0) : y = height - 1
		newx < width ? (newx > 0 ? (x = newx) : x = 0) : x = width - 1
		newPos = y * width * 4+ x * 4

		// if (i !== newPos) {
			src[i] = src[newPos]
			src[i + 1] = src[newPos + 1]
			src[i + 2] = src[newPos + 2]
			// newVals[i] = src[newPos]
			// newVals[i + 1] = src[newPos + 1]
			// newVals[i + 2] = src[newPos + 2]
			// newVals[i + 3] = 255
		// }
	}

	context.putImageData(new ImageData(src, width), 0, 0)
	// context.putImageData(new ImageData(new Uint8ClampedArray(newVals), width), 0, 0)
}




const sketch = async () => {
	const image = await loadAsset('./avatar.jpg')
	const magenta = await loadAsset('./magenta.jpg')
	texture = await loadAsset('./disp.jpg')
	let scale, scaleTex
	const min = Math.min(image.width, image.height)
	const minTex = Math.min(texture.width, texture.height)
	min === image.width
	? (scale = settings.dimensions[0] / image.width)
	: (scale = settings.dimensions[1] / image.height)
	minTex === texture.width
	? (scaleTex = settings.dimensions[0] / texture.width)
	: (scaleTex = settings.dimensions[1] / texture.height)
	return ({ context, width, height, time, playhead }) => {
		context.fillStyle = 'black'
		context.fillRect(0, 0, width, height)
		context.drawImage(
			texture,
			(width - texture.width * scaleTex) / 2,
			(height - texture.height * scaleTex) / 2,
			texture.width * scaleTex,
			texture.height * scaleTex
		)
		const dispMap = context.getImageData(0, 0, width, height).data
		context.drawImage(
			image,
			(width - image.width * scale) / 2,
			(height - image.height * scale) / 2,
			image.width * scale,
			image.height * scale
		)
		context.globalAlpha = playhead
		context.drawImage(
			magenta,
			(width - image.width * scale) / 2,
			(height - image.height * scale) / 2,
			image.width * scale,
			image.height * scale
		)
		context.globalAlpha = 1
		displace(dispMap, context, width, height, 1, playhead * 10)
	}
}

let texture = new Image()
texture.crossOrigin = 'Anonymous'

async function loadImage() {
	try {
		let data = await fetch(`https://source.unsplash.com/collection/8249707/${settings.dimensions[0]}x${settings.dimensions[1]}`)
		// // use instead of fetch for specific displacement map
		// data = {
		// 	url: `https://images.unsplash.com/photo-1561222015-1862bf2f483a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=${settings.dimensions[1] / 2}&ixlib=rb-1.2.1&q=80&w=${settings.dimensions[0] / 2}`
		// }

		id = data.url.match(
			/https:\/\/images\.unsplash\.com\/photo-([\da-f]+-[\da-f]+)/
		)[1]
		texture.src = data.url
		return id
	} catch (error) {
		console.error(error)
	}
}

loadImage().then(seed => {
	settings.prefix = seed
	canvasSketch(sketch, settings)
})