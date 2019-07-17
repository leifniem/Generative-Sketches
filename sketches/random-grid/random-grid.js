const canvasSketch = require('canvas-sketch')
const {lerp} = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const palettes = require('nice-color-palettes')


const seed = random.getRandomSeed()

const settings = {
	dimensions: [2048, 2048],
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
			position: [ u,v ],
			color: random.pick(colors),
			radius: Math.abs(random.noise2D(u,v)) * 0.1,
			rotation: Math.abs(random.noise2D(u,v))
		} )
	}
	return points
}

const sketch = () => {
	const offset = 300
	random.setSeed(seed)
	const palette = random.pick(palettes)
	let points = createGrid(50,50, palette.slice(0,4)).filter(() => random.value() > 0.5)

  return ({ context, width, height }) => {
		context.fillStyle = palette[4]
		context.fillRect(0,0, width, height)

		points.forEach(point => {
			const {position, color, radius, rotation} = point
			const [u,v] = position
			const x = lerp(offset, width-offset, u)
			const y = lerp(offset, height-offset, v)

			context.save()

			// context.beginPath()
			// context.arc(x, y, radius * width, 0, Math.PI*2, false)
			// context.font=`${radius * width}px "Fantasque Sans Mono"`
			context.fillStyle=color
			context.translate(x, y)
			context.rotate(rotation)
			// context.fill()
			context.fillText("–", 0, 0)

			context.restore()
		})
  }
}

canvasSketch(sketch, settings)
