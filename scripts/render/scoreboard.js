let scoreboardImage = new Image()
scoreboardImage.src = "assets/scoreboard.png";
scoreboardImage.ready = false;
scoreboardImage.onload = function () {
    this.ready = true;
}

function renderScoreboard(playerSnake, otherSnakes) {
    if (scoreboardImage.ready) {
        MyGame.graphics.drawTexture(scoreboardImage, {x: 1070, y: 130}, 0, {x: 250, y: 250})
        MyGame.graphics.drawText(1070, 25, "Score: " + playerSnake.score, 'white')
    }
}
