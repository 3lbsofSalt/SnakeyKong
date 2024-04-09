// ------------------------------------------------------------------
// 
// This is the overall game state management object.  It initializes
// the menu screens and provides the 'showScreen' method used to change
// the menu state by all other screens.
//
// ------------------------------------------------------------------

MyGame.manager = (function(screens) {
    'use strict';
    
    //------------------------------------------------------------------
    //
    // This function is used to change to a new active screen.
    //
    //------------------------------------------------------------------
    function showScreen(id) {
        let screen = 0;
        let active = null;
        //
        // Remove the active state from all screens.  There should only be one...
        active = document.getElementsByClassName('active');
        for (screen = 0; screen < active.length; screen++) {
            active[screen].classList.remove('active');
        }
        //
        // Tell the screen to start actively running
        screens[id].run();
        //
        // Then, set the new screen to be active
        document.getElementById(id).classList.add('active');
    }

    //------------------------------------------------------------------
    //
    // This function performs the one-time game initialization.
    //
    //------------------------------------------------------------------
    function initialize() {
        let screen = null;
        //
        // Go through each of the screens and tell them to initialize
        for (screen in screens) {
            if (screens.hasOwnProperty(screen)) {
                screens[screen].initialize();
            }
        }
        
        //
        // Make the main-menu screen the active one
        showScreen('main-menu');
    }
    
    return {
        initialize : initialize,
        showScreen : showScreen
    };
}(MyGame.screens));
