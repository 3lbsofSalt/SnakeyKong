let scoreboardImage = new Image();
scoreboardImage.src = "assets/scoreboard.png";
scoreboardImage.ready = false;
scoreboardImage.onload = function () {
    this.ready = true;
};

function renderScoreboard(playerSnake, scores) {
    if (scoreboardImage.ready) {
        MyGame.graphics.drawTexture(scoreboardImage, { x: 1070, y: 130 }, 0, {
            x: 250,
            y: 250,
        });
        MyGame.graphics.drawText(
            1070,
            25,
            "Score: " + playerSnake.score,
            "white",
        );

        if (scores.length > 0) {
            for (let i = 0; i < 5; i++) {
                if (!scores[i]) break;
                MyGame.graphics.drawText(
                    1140,
                    100 + i * 25,
                    (i + 1).toString() +
                        " - " +
                        scores[i].name +
                        " - " +
                        scores[i].score.toString(),
                    "white",
                    "15px",
                    "left",
                );
            }
        } else {
            MyGame.graphics.drawText(
                1165,
                100,
                "Nobody is in the room",
                "white",
                "15px",
                "left",
            );
        }
    }
}
