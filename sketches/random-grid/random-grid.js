const canvasSketch = require('canvas-sketch')
const {lerp} = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const palettes = require('nice-color-palettes')


const seed = random.getRandomSeed()

const settings = {
	dimensions: [1440, 3000],
	name: "Test",
	suffix: random.getSeed()
	// dimensions: 'A4',
	// units: 'cm',
	// pixelsPerInch: 300
}

const createGrid = (x, y, colors) =>{
	const count = x * y
	let points = []
	for (let i = 0; i < count; i++) {
		const u =(i % x) /  (x - 1)
		const v = ~~(i / y) / (y - 1)
		points.push( {
			position: [ u,v * 0.8 ],
			color: random.pick(colors),
			radius: Math.abs(random.noise2D(u,v,.7,1.5)) + 0.2,
			shape: lerp(0, 1, Math.abs(random.noise2D(u,v,.7,1.5)))
		} )
	}
	return points
}

const sketch = () => {
	const offset = 250
	random.setSeed(seed)
	// const palette = random.pick(palettes)
	const palette = require("../delta.json")
	let points = createGrid(15,30, palette)
	const size = 10

  return ({ context, width, height }) => {
		context.fillStyle = "#222"
		context.fillRect(0,0, width, height)

		points.forEach(point => {
			const {position, color, radius, shape} = point
			const [u,v] = position
			const x = lerp(offset, width-offset, u)
			const y = lerp(offset, height-offset, v)
			// let shape = random.value()

			context.save()

			context.beginPath()
			context.fillStyle=color

			if (shape < 0.3){
				context.rect(x - size * radius, y - size * radius, size * radius * 2, size * radius * 2)
			} else if (shape >= 0.3 && shape <= 0.6) {
				for (let side = 0; side < 7; side++) {
					context.lineTo(x + size * radius * Math.cos(side * 2 * Math.PI / 6), y + size * radius * Math.sin(side * 2 * Math.PI / 6));
				}
			} else if (shape > 0.6){
				context.arc(x, y, size * radius, 0, Math.PI*2, false)
			}
			context.fill()

		})
  }
}

canvasSketch(sketch, settings)
