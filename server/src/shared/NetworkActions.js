// Record<string, string>
(function (exports) {
    const NetworkAction = {
        CONNECT_ACK: "connect",
        CLIENT_JOIN: "client_join",
        CLIENT_JOIN_REQUEST: "join_request",
        INPUT: "input",
        CONNECT_OTHER: "new_guy",
        DISCONNECT_OTHER: "gone_guy",
        KILL_OTHER: "dead_guy",
        MOVE_LEFT: "left",
        MOVE_RIGHT: "right",
        MOVE_UP: "up",
        MOVE_DOWN: "down",
    };

    exports.NetworkAction = NetworkAction;
})(typeof exports === "undefined" ? (this["NetworkIds"] = {}) : exports);
