(function (exports) {
    exports.createQueue = function () {
        const queue = {
            queue: [],
        };

        queue.push = function (value) {
            this.queue.push(value);
        };

        queue.pop = function () {
            return this.queue.shift();
        };

        queue.peek = function () {
            return this.queue[0];
        };

        queue.empty = function () {
            return this.queue.length === 0;
        };

        return queue;
    };
})(typeof exports === "undefined" ? (this["Queue"] = {}) : exports);
