MyGame.screens['about'] = (function(manager) {
    'use strict';
    
    function initialize() {
        document.getElementById('id-about-back').addEventListener(
            'click',
            function() { manager.showScreen('main-menu'); });
    }
    
    function run() {
        //
        // I know this is empty, there isn't anything to do.
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.manager));
