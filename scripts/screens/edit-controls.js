MyGame.screens['edit-controls'] = (function(manager) {
    'use strict';

    let controlsList;
    let upText;
    let downText;
    let leftText;
    let rightText;



    function initialize() {
        document.getElementById('id-controls-back').addEventListener(
            'click',
            function() {manager.showScreen('main-menu'); });

        document.getElementById('up').addEventListener(
            'click',
            function() {editControl('up'); });
        document.getElementById('down').addEventListener(
            'click',
            function() {editControl('down'); });
        document.getElementById('left').addEventListener(
            'click',
            function() {editControl('left'); });
        document.getElementById('right').addEventListener(
            'click',
            function() {editControl('right'); });
    }

    function editControl(direction) {
        document.getElementById('instructions').textContent = 'Press a key to register'
        document.getElementById(direction).style.color = 'red'
    }

    function run() {
        let running = true;
        if (localStorage.getItem('controls')) {
            controlsList = localStorage.getItem('controls').split(' ')
        }
        else {
            controlsList = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
        }

        upText = controlsList[0]
        downText = controlsList[1]
        leftText = controlsList[2]
        rightText = controlsList[3]

        document.getElementById('up').textContent = upText
        document.getElementById('down').textContent = downText
        document.getElementById('left').textContent = leftText
        document.getElementById('right').textContent = rightText

    }

    return {
        initialize : initialize,
        run : run
    };
}(MyGame.manager));
