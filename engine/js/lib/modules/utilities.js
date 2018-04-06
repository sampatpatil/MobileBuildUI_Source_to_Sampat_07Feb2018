define(['lib/modules/FileSaver', 'lib/modules/blob'], function (saveAs, BlobBuilder) {
    var invokeAsync = function (deletgate, context, args, delay) {
        delay = delay || 10;
        var clearHold = deletgate ? setInterval($.proxy(function () {
            clearInterval(clearHold);
            deletgate.apply(this, args);
        }, context), delay) : null;
        return clearHold;
    }, loopAsync = function (array, next, error, stopOnError, delay) {
        var done = null, err = null, cbs = {
            done: function (d) {
                done = d;
                return cbs;
            }, error: function (e) { err = e; return cbs; }
        }, clear = function () { done = null; err = null, cbs = null };
        if (!array || array.length == 0 || !next) { invokeAsync(done); return cbs; }
        var i = -1, moveNext = function () {
            if (++i < array.length) {
                var nh = function () {
                    next(array[i], moveNext, function (e) {
                        if (stopOnError) { if (err) err(e); clear(); return; }
                        else if (err) { if (err) err(e); }
                        moveNext();
                    });
                };
                delay ? invokeAsync(nh, this, null, delay) : nh();
            }
            else { if (done) done(); clear(); }
        };
        invokeAsync(moveNext);
        return cbs;
    }, saveToFile = function (fileName, content, contentType) {
        if (!window.saveAs || !BlobBuilder) return;

        /*base64 = encoders.base64.encode(content);
        byteString = atob(base64);

        // convert binary to array buff so we can construct a blob later
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var intArray = new Uint8Array(arrayBuffer);

        for (i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i);
        }

        // construct blob
        var blob = new Blob([intArray.buffer], { type: contentType });*/

        //var blob = new Blob([content], { type: contentType });
        var blb = new BlobBuilder();
        blb.append(content);
        window.saveAs(blb.getBlob(contentType), fileName);
    };
    return {
        invokeAsync: invokeAsync, loopAsync: loopAsync, saveToFile: saveToFile
    }
});