'use strict'

let gElCavnas
let gCtx
let gImg
let gCurrMeme
let gCurrLineObject
let gMemeStorage = []



function onInit() {
    gElCavnas = document.querySelector('.main-content .gallery .main-canvas')
    gCtx = gElCavnas.getContext('2d')
    renderMeme()
    eventListeners()
    onIncreaseSize()
}

function renderMeme() {
    onClearCanvas()
    gCurrMeme = getMeme()
    gImg = getSelectedImg()
    gMemeStorage.push({ type: 'image', url: gImg.url, id: gImg.id, keywords: gImg.keywords })
    renderImage()
}

function renderImage() {
    const img = new Image()
    img.src = gImg.url
    const memeLines = getLines()
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCavnas.width, gElCavnas.height)
        memeLines.forEach((line, index) => {
            drawText(line.position, line.txt, line.size, line.color, line.fontFamily)
            const selectedLine = getSelectedLineIdx()
            console.log('index', index)
            console.log('selectedLineIndex', selectedLine)
            if (selectedLine === index) {
                const lineToFrame = getLine()
                drawAFrame(lineToFrame.position, lineToFrame.size, lineToFrame.txt)
            }
        })
    }

}

function drawText(pos, txt, size, color, fontFamily) {
    const { x, y } = pos
    gCtx.fillStyle = color
    gCtx.font = `${size}px ${fontFamily}`
    gCtx.fillText(txt, x, y)
    gCtx.strokeText(txt, x, y)
    gMemeStorage.push({
        pos: { x: x, y: y },
        type: 'text',
        txt: txt,
        font: `${size}px ${fontFamily}`,
        fillStyle: color
    })
}


//Change text
function onSetLineText(text) {
    setLineText(text)
    renderMeme()
}
//Change color
function onSetTextColor(color) {
    setTextColor(color)
    renderMeme()
}

//Change text size
function onIncreaseSize() {
    decreaseOrIncreaseSize(true)
    renderMeme()
}

// Decrease font size
function onDecreaseSize() {
    decreaseOrIncreaseSize(false)
    renderMeme()
}

//Add a Text Line
function onClickAddLine(event) {
    changeNewLineStarter()
    createLine()
    renderMeme()
}

//Delete a line
function onClickDelete() {
    const selectedLineIdx = getSelectedLineIdx()
    deleteLine(selectedLineIdx)
    onClickSwitchLine()
}

//Make the text bold
function onClickBold() {
    console.log('value',getLine().bold)
    if(getLine().bold){
         setLineBoldValue(false)  
    }
    else{
         setLineBoldValue(true)
    }
    addBoldToText({x : getLine().position.x, y : getLine().position.y}, getLine().fontSize, getLine().txt, getLine().fontFamily, getLine().bold)
    renderMeme()
}


function onClickAlign(value) {
    if (value === 0) {
        const currectLine = getLine()
        const pos = { x: 0, y: currectLine.position.y }
        setPositionLine(pos)
    }
    else if (value === 0.5) {
        const currectLine = getLine()
        const middleForText = gElCavnas.width / 2 - (gCtx.measureText(currectLine.text).width) + 30
        const pos = { x: middleForText, y: currectLine.position.y }
        setPositionLine(pos)
    }
    else if (value === 1) {
        const currectLine = getLine()
        const finalForText = gElCavnas.width - (gCtx.measureText(currectLine.text).width) * 2 + 44
        const pos = { x: finalForText, y: currectLine.position.y }
        setPositionLine(pos)
    }
    renderMeme()
}

function onClickCanvas(event) {
    const { offsetX, offsetY } = event
    const lines = getLines()
    lines.forEach((line, index) => {
        const textWidth = gCtx.measureText(line.txt).width
        const textHeight = line.size
        const maxX = line.position.x + textWidth
        const maxY = line.position.y + textHeight
        console.log(`minX : ${line.position.x}, minY: ${line.position.y}, maxX ${maxX}:, minY: ${maxY}`)
        if (isInRange(offsetX, line.position.x, maxX) && isInRange(offsetY, line.position.y, maxY)) {

            setSelectedLineIdx(index + 1)
            const correctLine = getSelectedLineIdx()
            handleClickOnLine(correctLine)
        }
        else return
    })
}


function handleClickOnLine() {
    const textElm = document.querySelector('.main-editor-header .text-input')
    textElm.value = textElm.value ? getLine().txt : ''
    renderMeme()

}

//This function Handle when switching line
function onClickSwitchLine() {
    const textElm = document.querySelector('.main-editor-header .text-input')
    
    const linesLength = getLinesLength()
    let correctLine = getSelectedLineIdx()
    correctLine++
    console.log(correctLine)
    if (correctLine > linesLength - 1) {
        setSelectedLineIdx(0)
        renderMeme()
    }
    else {
        setSelectedLineIdx(correctLine)
        renderMeme()
    }
    textElm.value = textElm.value ? getLine().txt : ''

    // adjust Update color value on switch line..
    gColorInputElm = document.querySelector('.main-editor-content .color-input')
    gColorInputElm.value = getLine().color
    //adjust Update text size on switch line
    const sizeValueText = document.querySelector('.main-editor-content .correctSize')
    sizeValueText.innerText = getLine().size
    
}

function addBoldToText(pos, fontSize, text, fontFamily, condition) {
    gCtx.save()
    if(condition){
        gCtx.font = `bold ${fontSize}px ${fontFamily}`
    }
    else{
        gCtx.font = `${fontSize}px ${fontFamily}`
    }
    gCtx.fillText(text, pos.x, pos.y)
    gCtx.restore()
}

// Draw a frame on the the selected line 
function drawAFrame(pos, fontSize, text) {
    gCtx.save()
    const { x, y } = pos
    const framePadding = 0
    const textWidth = gCtx.measureText(text).width
    const textHeight = -fontSize

    const extraPadding = 30
    const frameWidth = textWidth + framePadding * 2 + extraPadding
    const frameHeight = textHeight + framePadding * 2

    const frameX = x - framePadding
    const frameY = y - framePadding

    gCtx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    gCtx.fillRect(frameX, frameY, frameWidth, frameHeight)

    gCtx.strokeStyle = 'black'
    gCtx.lineWidth = 2
    gCtx.strokeRect(frameX, frameY, frameWidth, frameHeight)
    gCtx.restore()
}

// This function check where is the last line and adjust the new line position
function changeNewLineStarter() {
    const { x, y } = getLastTextPosition()
    if (y >= gElCavnas.height - 20) {
        setGPosition({ x: 80, y: 60 })
    }
}

function decreaseOrIncreaseSize(condition) {
    let modifiedSize = null
    const corrSize = getTextSize()
    if (condition) {
        modifiedSize = corrSize + 1
    }
    else {
        modifiedSize = corrSize - 1
    }
    if (modifiedSize < 1) return
    const currectSizeElement = document.querySelector('.main-editor-content .size-input .correctSize')
    setTextSize(modifiedSize)
    currectSizeElement.innerText = `${modifiedSize}`
}

function onSelectImg(id) {
    setSelectedImgId(id)
    moveImageToEditorAndRender()
}

// DOWNLOAD IMG
function onClickDownloadImg(elLink) {
    const imgContent = gElCavnas.toDataURL('image/jpeg')
    elLink.href = imgContent
}

// STORAGE HANDLE
function onClearCanvas() {
    gMemeStorage = []
    gCtx.clearRect(0, 0, gElCavnas.width, gElCavnas.height) //Fix Rendering issue
}

function onSaveCanvas() {
    console.log(gMemeStorage)
    saveToStorage('canvas', gMemeStorage)
}

function onLoadFromCavnas() {
    const storedCanvas = loadFromStorage('canvas')
    if (storedCanvas) {
        gMemeStorage = storedCanvas
        redrawCanvas()
    }
    else {
        renderMeme();
    }
}

function redrawCanvas() {
    const foundedImage = gMemeStorage.find((item) => item.type === 'image')
    if (foundedImage) {
        const img = new Image()
        img.src = foundedImage.url
        console.log(foundedImage.url)
        img.onload = () => {
            gCtx.drawImage(img, 0, 0, gElCavnas.width, gElCavnas.height)
            gMemeStorage.forEach((item) => {
                if (item.type === 'text') {
                    drawText(item.pos, item.txt, item.font, item.fillStyle)
                }
            })

        }
    }
    else {
        console.log('Error: image not found')
    }
}

