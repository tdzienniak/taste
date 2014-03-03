(function () {
    var slice = Array.prototype.slice;
    var stack = [];
    var states = {};
    var current_state = {
        transitions: {}
    };
    var next_state ;
    var FN = 0, BINDING = 1, ARGS = 2;

    function dummy (callback) {
        callback();
    }

    function shift() {
        if (typeof stack[0] === "undefined") {
            return;
        }

        var fn = stack[0][FN] || dummy;
        var binding = stack[0][BINDING] || null;
        var args = stack[0][ARGS] || [];

        stack.shift();

        args.push(next);
        
        fn.apply(binding, args);
    }

    function next() {
        shift();
    }

    function setCurrentState (state, callback) {
        current_state = state;
        callback();
    }

    var taste = {
        feed: function (state) {
            state.initialized = false;

            states[state.name] = state;
        },
        changeState: function (name) {
            var args = slice.call(arguments, 1);
            var next_state = states[name];

            current_state.onExit && stack.push([current_state.onExit, current_state]);

            if ( ! next_state.initialized) {
                next_state.initialize && stack.push([next_state.initialize, next_state]);

                next_state.initialized = true;
            }

            if (name in current_state.transitions) {
                args.unshift(next_state);

                stack.push([
                    current_state[current_state.transitions[name]],
                    current_state,
                    args
                ]);
            }

            stack.push([setCurrentState, null, [next_state]]);

            next_state.onEnter && stack.push([next_state.onEnter, next_state]);

            shift();
        }
    };

    if (typeof define === "function" && define.amd) {
        define(function () {
            return taste;
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = taste;
    } else {
        this.taste = taste;
    }
})();