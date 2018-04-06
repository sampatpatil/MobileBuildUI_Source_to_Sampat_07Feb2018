/*!
 * Hasher <http://github.com/millermedeiros/hasher>
 * @author Miller Medeiros
 * @version 1.1.0 (2012/08/14 03:19 PM)
 * Released under the MIT License
 */
(function(a) {
    a("lib/modules/hasher", ["lib/modules/signals"], function(b) {
        var c = (function(k) {
            var o = 25, q = k.document, n = k.history, v = b.Signal, f, u, m, D, d, B, s = /#(.*)$/, j = /(\?.*)|(\#.*)/, g = /^\#/, i = (!+"\v1"), z = ("onhashchange"in k), e = i && !z, r = (k.location.protocol === "file:");
            function t(F) {
                if (!F) {
                    return ""
                }
                var E = new RegExp("^\\" + f.prependHash + "|\\" + f.appendHash + "$","g");
                return F.replace(E, "")
            }
            function C() {
                var E = s.exec(f.getURL());
                return (E && E[1]) ? decodeURIComponent(E[1]) : ""
            }
            function y() {
                return (d) ? d.contentWindow.frameHash : null
            }
            function x() {
                d = q.createElement("iframe");
                d.src = "about:blank";
                d.style.display = "none";
                q.body.appendChild(d)
            }
            function h() {
                if (d && u !== y()) {
                    var E = d.contentWindow.document;
                    E.open();
                    E.write("<html><head><title>" + q.title + '</title><script type="text/javascript">var frameHash="' + u + '";<\/script></head><body>&nbsp;</body></html>');
                    E.close()
                }
            }
            function l(E, F) {
                E = decodeURIComponent(E);
                if (u !== E) {
                    var G = u;
                    u = E;
                    if (e) {
                        if (!F) {
                            h()
                        } else {
                            d.contentWindow.frameHash = E
                        }
                    }
                    f.changed.dispatch(t(E), t(G))
                }
            }
            if (e) {
                B = function() {
                    var F = C()
                      , E = y();
                    if (E !== u && E !== F) {
                        f.setHash(t(E))
                    } else {
                        if (F !== u) {
                            l(F)
                        }
                    }
                }
            } else {
                B = function() {
                    var E = C();
                    if (E !== u) {
                        l(E)
                    }
                }
            }
            function A(G, E, F) {
                if (G.addEventListener) {
                    G.addEventListener(E, F, false)
                } else {
                    if (G.attachEvent) {
                        G.attachEvent("on" + E, F)
                    }
                }
            }
            function w(G, E, F) {
                if (G.removeEventListener) {
                    G.removeEventListener(E, F, false)
                } else {
                    if (G.detachEvent) {
                        G.detachEvent("on" + E, F)
                    }
                }
            }
            function p(F) {
                F = Array.prototype.slice.call(arguments);
                var E = F.join(f.separator);
                E = E ? f.prependHash + E.replace(g, "") + f.appendHash : E;
                if (i && r) {
                    E = E.replace(/\?/, "%3F")
                }
                return E
            }
            f = {
                VERSION: "1.1.0",
                appendHash: "",
                prependHash: "/",
                separator: "/",
                changed: new v(),
                stopped: new v(),
                initialized: new v(),
                init: function() {
                    if (D) {
                        return
                    }
                    u = C();
                    if (z) {
                        A(k, "hashchange", B)
                    } else {
                        if (e) {
                            if (!d) {
                                x()
                            }
                            h()
                        }
                        m = setInterval(B, o)
                    }
                    D = true;
                    f.initialized.dispatch(t(u))
                },
                stop: function() {
                    if (!D) {
                        return
                    }
                    if (z) {
                        w(k, "hashchange", B)
                    } else {
                        clearInterval(m);
                        m = null
                    }
                    D = false;
                    f.stopped.dispatch(t(u))
                },
                isActive: function() {
                    return D
                },
                getURL: function() {
                    return k.location.href
                },
                getBaseURL: function() {
                    return f.getURL().replace(j, "")
                },
                setHash: function(E) {
                    E = p.apply(null , arguments);
                    if (E !== u) {
                        l(E);
                        k.location.hash = "#" + encodeURI(E)
                    }
                },
                replaceHash: function(E) {
                    E = p.apply(null , arguments);
                    if (E !== u) {
                        l(E, true);
                        k.location.replace("#" + encodeURI(E))
                    }
                },
                getHash: function() {
                    return t(u)
                },
                getHashAsArray: function() {
                    return f.getHash().split(f.separator)
                },
                dispose: function() {
                    f.stop();
                    f.initialized.dispose();
                    f.stopped.dispose();
                    f.changed.dispose();
                    d = f = k.hasher = null
                },
                toString: function() {
                    return '[hasher version="' + f.VERSION + '" hash="' + f.getHash() + '"]'
                }
            };
            f.initialized.memorize = true;
            return f
        }(window));
        return c
    })
}(typeof define === "function" && define.amd ? define : function(c, b, a) {
    window[c] = a(window[b[0]])
}
));