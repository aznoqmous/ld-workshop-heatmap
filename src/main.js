import './style.css'
import firstPlaytest from "./first-playtest.log?raw"
import secondPlaytest from "./second-playtest.log?raw"
import thirdPlaytest from "./third-playtest.log?raw"

var heatmapValues
document.addEventListener("DOMContentLoaded", ()=>{
  const playtests = {
    firstPlaytest, secondPlaytest, thirdPlaytest
  }


  const config = {width: 800, height: 800, maxX: 6500, minX: -6500}
  const c = document.createElement("canvas")
  const ctx = c.getContext("2d")
  c.width = config.width
  c.height = config.height
  canvasContainer.style.width = config.width + "px"
  canvasContainer.style.height = config.height + "px"
  canvasContainer.appendChild(c)

  const c2 = document.createElement("canvas")
  const ctx2 = c2.getContext("2d")
  c2.width = config.width
  c2.height = config.height
  canvasContainer.appendChild(c2)
  c2.className = "canvas-overlay"

  const as = playtests.firstPlaytest + playtests.secondPlaytest + playtests.thirdPlaytest

  parseData(playtests[playtest.value])

  time.innerHTML = parseTime(heatmapValues.length * 0.5)


  const draw = async ()=>{
    ctx.clearRect(0, 0,  config.width, config.height)
    ctx2.clearRect(0, 0,  config.width, config.height)
    var i = 0
    for(var hv of heatmapValues){
      if(animate.checked) await sleep()
      i++
      currentTime.innerHTML = parseTime(i * 0.5)
      const pos = {
        x: (hv.x - config.minX) / (config.maxX - config.minX) * config.width,
        y: (hv.y - config.minX) / (config.maxX - config.minX) * config.height
      } 

      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, gradientSize.value/2)
      ctx.globalCompositeOperation = "lighter"
      ctx.fillStyle = gradient
      
      gradient.addColorStop(0, `rgba(${gradientStrength.value}, ${gradientStrength.value}, ${gradientStrength.value}, 1.0`)
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.0")
      ctx.fillRect(pos.x - gradientSize.value/2, pos.y - gradientSize.value/2, gradientSize.value, gradientSize.value)
      if(animate.checked) drawHeat(ctx, ctx2, pos.x - gradientSize.value/2, pos.y - gradientSize.value/2, gradientSize.value)
    }

    if(!animate.checked) drawHeat(ctx, ctx2, 0, 0, config.width)
    
  }
  
  draw()

  gradientSize.addEventListener("change", ()=> draw())
  gradientStrength.addEventListener("change", ()=> draw())
  grayscale.addEventListener("change", ()=> canvasContainer.classList.toggle("grayscale", grayscale.checked))
  playtest.addEventListener("change", ()=>{
    parseData(playtests[playtest.value])
    draw()
  })
})

const sleep = async (time)=> new Promise(res => setTimeout(res, time * 1000))
const parseTime = (seconds)=>{
  const minutes = Math.floor(seconds / 60)
  const secondsLeft = Math.floor(seconds) % 60
  return `${minutes}min ${secondsLeft}sec`
}

const drawHeat = (ctx, ctx2, base_x, base_y, size)=>{
  const imageData = ctx.getImageData(base_x, base_y, size, size)
  var x = 0
  var y = 0
  for(let i = 0; i < imageData.data.length; i += 4){
    // imageData.data[i]
    const g = imageData.data[i+1]
    // imageData.data[i+2]
    // imageData.data[i+3]
    if(g){
      ctx2.fillStyle = `hsl(${255-g}, 100%, 70%)`
      ctx2.globalAlpha = (g / 255) * 2
      ctx2.fillRect(base_x + x, base_y + y, 1, 1)
    }
    if(x >= size){
      x = 0
      y += 1
    }
    x += 1
  }
}

const parseData = (data)=>{
  heatmapValues = data.split("\r\n").filter(l => l.split("Heatmap").length > 1).map(l => {
    const g = l.match(/X=(?<x>[^ )]*) Y=(?<y>[^ )]*) Z=(?<z>[^ )]*)/).groups
    return {x: parseFloat(g.x), y: parseFloat(g.y)}
  })
}