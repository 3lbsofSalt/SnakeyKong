MyGame.screens["high-scores"] = (function (manager) {
    "use strict";

    function initialize() {
        document
            .getElementById("id-high-scores-back")
            .addEventListener("click", function () {
                manager.showScreen("main-menu");
            });
    }

    function run() {
        if (localStorage.getItem("scores")) {
            let scoresList = localStorage.getItem("scores").split(" ");

            // Get the ul element by its id
            let listContainer = document.getElementById("scores-list");

            while (listContainer.firstChild) {
                listContainer.removeChild(listContainer.firstChild);
            }

            // Iterate through the list and create li elements for each item
            scoresList.forEach((item) => {
                // Create a new li element
                const listItem = document.createElement("li");

                // Set the text content of the li element
                listItem.textContent = item;

                // Append the li element to the ul element
                listContainer.appendChild(listItem);
            });
        }
    }

    return {
        initialize: initialize,
        run: run,
    };
})(MyGame.manager);
