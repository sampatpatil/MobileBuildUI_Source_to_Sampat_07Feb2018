/**
 * An even better animation frame.
 *
 * @copyright Oleg Slobodskoi 2013
 * @website https://github.com/kof/animationFrame
 * @license MIT
 */

(function(window) {
'use strict';

var now = Date.now,
    setTimeout = window.setTimeout,
    nativeRequestAnimationFrame,
    nativeCancelAnimationFrame,
    hasNative = false;

(function() {
    var i,
        vendors = ['ms', 'moz', 'webkit', 'o'];

    // Grab the native implementation.
    for (i = 0; i < vendors.length && !nativeRequestAnimationFrame; i++) {
        nativeRequestAnimationFrame = top[vendors[i] + 'RequestAnimationFrame'] || top['requestAnimationFrame'];
        nativeCancelAnimationFrame = top[vendors[i] + 'CancelAnimationFrame'] ||
            top[vendors[i] + 'CancelRequestAnimationFrame'];
    }

    // Test if native implementation works.
    // There are some issues on ios6
    // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6
    // https://gist.github.com/KrofDrakula/5318048
    nativeRequestAnimationFrame && nativeRequestAnimationFrame(function() {
        hasNative = true;
    });
}());

function AnimationFrame(frameRate) {
    if (!(this instanceof AnimationFrame)) return new AnimationFrame(frameRate);
    this.frameRate = frameRate || AnimationFrame.FRAME_RATE;
    this._frameLength = 1000 / this.frameRate;
    this._isCustomFrameRate = this.frameRate !== AnimationFrame.FRAME_RATE;
    this._timeoutId = null;
    this._callbacks = {};
    this._lastTickTime = 0;
    this._tickCounter = 0;
}

/**
 * Default frame rate used for shim implementation. Native implementation
 * will use the screen frame rate, but js have no way to detect it.
 *
 * If you know your target device, define it manually.
 *
 * @type {Number}
 * @api public
 */
AnimationFrame.FRAME_RATE = 60;

/**
 * Replace the globally defined implementation or define it globally.
 *
 * @param {Number} [frameRate] optional frame rate
 * @api public
 */
AnimationFrame.shim = function(frameRate) {
    var animationFrame = new AnimationFrame(frameRate);

    window.requestAnimationFrame = function(callback) {
        return animationFrame.request(callback);
    };
    window.cancelAnimationFrame = function(id) {
        return animationFrame.cancel(id);
    };

    return animationFrame;
};


/**
 * Request animation frame.
 * We will use the native raf as soon as we know it does works.
 *
 * @param {Function} callback
 * @return {Number} timeout id or requested animation frame id
 * @api public
 */
AnimationFrame.prototype.request = function(callback) {
    var self = this,
        delay;

    // Alawys inc counter to ensure it never has a conflict with the native counter.
    // After the feature test phase we don't know exactly which implementation has been used.
    // Therefore on #cancel we do it for both.
    ++this._tickCounter;

    if (hasNative && !this._isCustomFrameRate) return nativeRequestAnimationFrame(callback);
    if (!callback) throw new TypeError('Not enough arguments');

    if (this._timeoutId == null) {
        // Much faster than Math.max
        // http://jsperf.com/math-max-vs-comparison/3
        // http://jsperf.com/date-now-vs-date-gettime/11
        delay = this._frameLength + this._lastTickTime - (now ? now() : (new Date).getTime());
        if (delay < 0) delay = 0;
        
        this._timeoutId = setInterval(function() {
            window.clearInterval(self._timeoutId);
            self._timeoutId = null;
            var id;

            self._lastTickTime = now ? now() : (new Date).getTime();
            
            ++self._tickCounter;

            for (id in self._callbacks) {
                if (self._callbacks[id]) {
                    if (hasNative) {
                        nativeRequestAnimationFrame(self._callbacks[id]);
                    } else {
                        self._callbacks[id](self._lastTickTime);
                    }
                    delete self._callbacks[id];
                }
            }
        }, delay);
    }

    this._callbacks[this._tickCounter] = callback;
    return this._tickCounter;
};

/**
 * Cancel animation frame.
 *
 * @param {Number} timeout id or requested animation frame id
 *
 * @api public
 */
AnimationFrame.prototype.cancel = function(id) {
    if (hasNative) nativeCancelAnimationFrame(id);
    delete this._callbacks[id];
};

// Support commonjs wrapper, amd define and plain window.
if (typeof exports == 'object' && typeof module == 'object') {
    module.exports = AnimationFrame;
} else if (typeof define == 'function' && define.amd) {
    define(function() { return AnimationFrame; });
} else {
    window.AnimationFrame = AnimationFrame;
}

}(window));
