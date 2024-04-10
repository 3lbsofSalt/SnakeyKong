MyGame.screens['edit-controls'] = (function(manager) {
    'use strict';

    let running = false;
    let controlsList;
    let image = new Image();
    image.src = 'assets/arrow-4-way.svg'
    image.isReady = false;  // Can't render until the texture is loaded

    //
    // Load the texture to use for the particle system loading and ready for rendering
    image.onload = function() {
        this.isReady = true;
    }

    function initialize() {
        document.getElementById('id-controls-back').addEventListener(
            'click',
            function() {running = false; manager.showScreen('main-menu'); });
    }

    let canvas = document.getElementById('id-controls-canvas');
    let context = canvas.getContext('2d');

    function isMouseOverText(mouseX, mouseY) {
        return mouseX + mouseY > 0;
    }

    // Mouse click event listener
    canvas.addEventListener("click", function(event) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;

        if (isMouseOverText(mouseX, mouseY)) {
            alert("Text clicked!");
            // Add your desired action here
        }
    });

    function drawText(x, y, text, color) {
        context.font = '20px Courier';
        context.fillStyle = color;
        context.textBaseline = 'top';
        context.fillText(text, x, y);
    }

    function processInput() {

    }

    function render () {
        if (image.isReady) {
            context.drawImage(image, canvas.width/2 - canvas.height/2, 0,  canvas.height, canvas.height);
        }

        let textWidth = context.measureText(controlsList[0]).width;
        drawText(canvas.width/2 - textWidth/2 - 20, 70, controlsList[0],  'white')

        textWidth = context.measureText(controlsList[1]).width;
        drawText(canvas.width/2 - textWidth/2, canvas.height - 90, controlsList[1],  'white')

        textWidth = context.measureText(controlsList[2]).width;
        drawText(canvas.width/2 - textWidth/2 - 120, canvas.height/2 - 10, controlsList[2],  'white')

        textWidth = context.measureText(controlsList[3]).width;
        drawText(canvas.width/2 - textWidth/2 + 120, canvas.height/2 - 10, controlsList[3],  'white')
    }

    function gameLoop() {
        processInput();
        render();

        if (running) {
            requestAnimationFrame(gameLoop);
        }
    };

    function run() {
        let running = true;
        if (localStorage.getItem('controls')) {
            controlsList = localStorage.getItem('controls').split(' ')
        }
        else {
            controlsList = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
        }

        requestAnimationFrame(gameLoop);
    }

    return {
        initialize : initialize,
        run : run
    };
}(MyGame.manager));
