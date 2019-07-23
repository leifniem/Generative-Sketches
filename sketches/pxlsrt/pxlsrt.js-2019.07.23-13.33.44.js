const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const loadAsset = require('load-asset')

const settings = {
	dimensions: [2048, 2048]
}

const limit = 100

function pixelSort(context, width, height) {
	const pixels = context.getImageData(0, 0, width, height).data

	// bring into "3d" structure
	let newPix = []
	let row = []
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			row.push({
				r: pixels[(y * width * 4) + x * 4],
				g: pixels[(y * width * 4) + x * 4 + 1],
				b: pixels[(y * width * 4) + x * 4 + 2],
				a: pixels[(y * width * 4) + x * 4 + 3],
				visited: false
			})
		}
		newPix.push(row)
		row = []
	}

	let trailLength
	let interval, positions, tempX, tempY, angle
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (!newPix[y][x].visited){
				interval = []
				positions = []
				trailLength = random.range(10, limit)
				tempX = x
				tempY = y

				// gather pixels for sorting
				while(trailLength && tempX < width && tempY < height && tempX > 0 && tempY > 0){
					positions.push([tempY, tempX])
					interval.push(newPix[tempY][tempX])
					angle = random.noise2D(
						tempX / width,
						tempY / height,
					) * Math.PI * 2
					Math.cos(angle) > 0 ? tempX += 1 : (Math.cos(angle) !== 0 ? tempX -= 1 : tempX)
					Math.sin(angle) > 0 ? tempY += 1 : (Math.sin(angle) !== 0 ? tempY -= 1 : tempY)
					trailLength--
				}

				interval.sort((a, b) => {
					return (a.r + a.g + a.b) > (b.r + b.g + b.b) ? 1 : -1
				})

				for(let p = 0; p < positions.length; p++){
					interval[p].visited = true
					newPix[positions[p][0]][positions[p][1]] = interval[p]
				}
			}
		}
	}

	// flatten down
	const newFlat = newPix.flat(2)
	let flatOut = []
	for (pixel of newFlat){
		flatOut.push(pixel.r, pixel.g, pixel.b, pixel.a)
	}

	const newImg = new ImageData(new Uint8ClampedArray(flatOut), width)
	context.putImageData(newImg, 0, 0)
}

const sketch = async ({ update }) => {
	const img = await loadAsset('assets/avatar.jpg')

	update({
		dimensions: [img.width, img.height]
	})

	return ({ context, width, height }) => {
		context.drawImage(img, 0, 0, width, height)
		pixelSort(context, width, height)
	}
}

canvasSketch(sketch, settings)
