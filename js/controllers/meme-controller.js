
let gElCavnas
let gCtx

function onInit() {
    gElCavnas = document.querySelector('.main-content .gallery .main-canvas')
    gCtx = gElCavnas.getContext('2d')
    console.log(gElCavnas)
    console.log(gCtx)
}

function renderImage() {
    const img = new Image()
    img.src = 'img/meme-imgs(square)'
}