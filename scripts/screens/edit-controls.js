MyGame.screens["edit-controls"] = (function (manager) {
    "use strict";

    let controlsList;
    let upText;
    let downText;
    let leftText;
    let rightText;

    let activeDirection = null;

    function initialize() {
        document
            .getElementById("id-controls-back")
            .addEventListener("click", function () {
                activeDirection = null;
                manager.showScreen("main-menu");
            });

        document.getElementById("up").addEventListener("click", function () {
            editControl("up");
        });
        document.getElementById("down").addEventListener("click", function () {
            editControl("down");
        });
        document.getElementById("left").addEventListener("click", function () {
            editControl("left");
        });
        document.getElementById("right").addEventListener("click", function () {
            editControl("right");
        });
    }

    window.addEventListener("keydown", function (event) {
        let key;
        if (event.key === " ") {
            key = "Space";
        } else {
            key = event.key;
        }
        if (activeDirection) {
            if (activeDirection === "up") {
                controlsList[0] = key;
            }
            if (activeDirection === "down") {
                controlsList[1] = key;
            }
            if (activeDirection === "left") {
                controlsList[2] = key;
            }
            if (activeDirection === "right") {
                controlsList[3] = key;
            }
            localStorage.setItem("controls", controlsList.join(" "));
            activeDirection = null;
            run();
        }
    });

    function editControl(direction) {
        document.getElementById("instructions").textContent =
            "press a key to register";
        if (activeDirection) {
            document.getElementById(activeDirection).style.color = "black";
        }
        if (activeDirection === direction) {
            document.getElementById("instructions").textContent =
                "select a key to edit";
            activeDirection = null;
        } else {
            document.getElementById(direction).style.color = "red";
            activeDirection = direction;
        }
    }

    function run() {
        if (localStorage.getItem("controls")) {
            controlsList = localStorage.getItem("controls").split(" ");
        } else {
            controlsList = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        }

        upText = controlsList[0];
        downText = controlsList[1];
        leftText = controlsList[2];
        rightText = controlsList[3];

        document.getElementById("instructions").textContent =
            "select a key to edit";
        document.getElementById("up").textContent = upText;
        document.getElementById("down").textContent = downText;
        document.getElementById("left").textContent = leftText;
        document.getElementById("right").textContent = rightText;

        document.getElementById("up").style.color = "black";
        document.getElementById("down").style.color = "black";
        document.getElementById("left").style.color = "black";
        document.getElementById("right").style.color = "black";
    }

    return {
        initialize: initialize,
        run: run,
    };
})(MyGame.manager);
