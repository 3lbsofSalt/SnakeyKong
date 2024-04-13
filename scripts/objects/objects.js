//------------------------------------------------------------------
//
// Creates a Food model based upon the passed in specification.
//
//------------------------------------------------------------------
MyGame.objects.Food = function (spec) {

    let api = {
        get size() {
            return spec.size;
        },
        get center() {
            return spec.center;
        },
        get rotation() {
            return spec.rotation;
        }
    };

    return api;
};
