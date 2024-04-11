MyGame.screens['setup'] = (function(manager) {
    'use strict';

    function initialize() {

        document.getElementById('id-next').addEventListener(
            'click',
            function() {
                let name = document.getElementById("name").value;
                localStorage.setItem('name', name);
                manager.showScreen('game-play');
            });

        document.getElementById('id-setup-back').addEventListener(
            'click',
            function() {
                let name = document.getElementById("name").value;
                localStorage.setItem('name', name);
                manager.showScreen('main-menu');
            });
    }

    function run() {
        if (localStorage.getItem("name")){
            document.getElementById("name").value = localStorage.getItem("name");
        }
    }

    return {
        initialize : initialize,
        run : run
    };
}(MyGame.manager));
