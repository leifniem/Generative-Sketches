const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const loadAsset = require('load-asset')

random.setSeed(random.getRandomSeed)

const settings = {
	dimensions: [800, 800],
	suffix: random.getSeed()
}

const limit = 50

function pixelSort(context, width, height) {
	const pixels = context.getImageData(0, 0, width, height).data

	// bring into "3d" structure
	let newPix = []
	let row = []
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			row.push({
				r: pixels[y * width * 4 + x * 4],
				g: pixels[y * width * 4 + x * 4 + 1],
				b: pixels[y * width * 4 + x * 4 + 2],
				a: pixels[y * width * 4 + x * 4 + 3],
				visited: false
			})
		}
		newPix.push(row)
		row = []
	}

	let trailLength
	// const lumaLimit = 4000
	let interval, positions, tempX, tempY, angle
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (!newPix[y][x].visited) {
				interval = []
				positions = []
				// tempLuma = random.rangeFloor(0, lumaLimit)
				trailLength = random.range(10, limit)
				tempX = x
				tempY = y

				// gather pixels for sorting
				while (
					// tempLuma > 0 &&
					trailLength &&
					tempX < width &&
					tempY < height &&
					tempX > 0 &&
					tempY > 0
					&& !newPix[tempY][tempX].visited
				) {
					positions.push([tempY, tempX])
					interval.push(newPix[tempY][tempX])
					trailLength--
					// tempLuma -=
					// 	(newPix[tempY][tempX].r +
					// 		newPix[tempY][tempX].g +
					// 		newPix[tempY][tempX].b) /
					// 	3
					angle =
						random.noise2D(tempX / width, tempY / height) * Math.PI
					// tempY++
					// Math.sin(angle) > 0
					// 	? (tempX += 1)
					Math.cos(angle) > 0 ? tempX += 1 : (Math.cos(angle) !== 0 ? tempX -= 1 : tempX)
					// Math.sin(angle) > 0 ? tempY += 1 : ''
					tempY++
					// tempX += Math.round(Math.cos(angle) * 3)
					// tempY += Math.abs(Math.round(Math.sin(angle) * 3))
					// Math.cos(angle) > 0 ? tempX += 1 : tempX
					// Math.sin(angle) > 0 ? tempY += 1 : tempY
				}

				interval.sort((a, b) => {
					return (b.r + b.g + b.b) / 3 - (a.r + a.g + a.b) / 3
				})

				for (let p = 0; p < positions.length; p++) {
					interval[p].visited = true
					newPix[positions[p][0]][positions[p][1]] = interval[p]
				}
			}
		}
	}

	// flatten down
	const newFlat = newPix.flat(2)
	let flatOut = []
	for (pixel of newFlat) {
		flatOut.push(pixel.r, pixel.g, pixel.b, pixel.a)
	}

	const newImg = new ImageData(new Uint8ClampedArray(flatOut), width)
	context.putImageData(newImg, 0, 0)
}

let img = new Image()
img.crossOrigin = 'Anonymous'

async function loadImage() {
	try {
		let data = await fetch('https://source.unsplash.com/random/800x800')
		// // use instead of fetch for specific wallpaper
		// data = {
		// 	url: `https://images.unsplash.com/photo-1561222015-1862bf2f483a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=${settings.dimensions[1] / 2}&ixlib=rb-1.2.1&q=80&w=${settings.dimensions[0] / 2}`
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

const sketch = () => {
	return {
		render({ width, height, context }) {
			img.onload = () => {
				// const img = await loadAsset('assets/avatar.jpg')

				// update({
				// 	dimensions: [img.width, img.height]
				// })

				context.drawImage(img, 0, 0, width, height)
				console.log('yeah')
				pixelSort(context, width, height)
			}
		}
	}
}

loadImage().then(seed => {
	settings.suffix = seed
	random.setSeed(seed)
	canvasSketch(sketch, settings)
})
