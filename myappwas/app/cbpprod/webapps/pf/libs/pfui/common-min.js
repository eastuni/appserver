define("pfui/common", ["jquery"], function(e, t, n) {
    var i = e("pfui/common/util");
    i.mix(i, {
        UA: e("pfui/common/ua"),
        JSON: e("pfui/common/json"),
        Date: e("pfui/common/date"),
        Array: e("pfui/common/array"),
        KeyCode: e("pfui/common/keycode"),
        Observable: e("pfui/common/observable"),
        Base: e("pfui/common/base"),
        Component: e("pfui/common/component/component")
    }), n.exports = i
}), define("pfui/common/util", ["jquery"], function(e, t, n) {
    function i(e, t) {
        for (var n in t) t.hasOwnProperty(n) && (e[n] = e[n] || {}, r(e[n], t[n]))
    }

    function r(e, t) {
        for (var n in t) t.hasOwnProperty(n) && ("value" == n ? PFUI.isObject(t[n]) ? (e[n] = e[n] || {}, PFUI.mix(e[n], t[n])) : PFUI.isArray(t[n]) ? (e[n] = e[n] || [], e[n] = e[n].concat(t[n])) : e[n] = t[n] : e[n] = t[n])
    }
    var o = e("jquery");
    ! function(e) {
        e.fn && (e.fn.on = e.fn.on || e.fn.bind, e.fn.off = e.fn.off || e.fn.unbind)
    }(o);
    var a = window,
        s = document,
        u = Object.prototype,
        l = u.toString,
        c = "body",
        d = "documentElement",
        f = "scroll",
        h = f + "Width",
        g = f + "Height",
        m = "ATTRS",
        v = "PARSER",
        p = "guid";
    window.PFUI = window.PFUI || {}, o.extend(PFUI, {
        version: "1.1.0",
        isFunction: function(e) {
            return "function" == typeof e
        },
        isArray: "isArray" in Array ? Array.isArray : function(e) {
            return "[object Array]" === l.call(e)
        },
        isDate: function(e) {
            return "[object Date]" === l.call(e)
        },
        isObject: "[object Object]" === l.call(null) ? function(e) {
            return null !== e && void 0 !== e && "[object Object]" === l.call(e) && void 0 === e.ownerDocument
        } : function(e) {
            return "[object Object]" === l.call(e)
        },
        isNumeric: function(e) {
            return !isNaN(parseFloat(e)) && isFinite(e)
        },
        augment: function(e) {
            if (!PFUI.isFunction(e)) return e;
            for (var t = 1; t < arguments.length; t++) PFUI.mix(e.prototype, arguments[t].prototype || arguments[t]);
            return e
        },
        cloneObject: function(e) {
            var t = PFUI.isArray(e) ? [] : {};
            return PFUI.mix(!0, t, e)
        },
        error: function(e) {
            if (PFUI.debug) throw e
        },
        extend: function(e, t, n, i) {
            PFUI.isFunction(t) || (n = t, t = e, e = function() {});
            var r = Object.create ? function(e, t) {
                    return Object.create(e, {
                        constructor: {
                            value: t
                        }
                    })
                } : function(e, t) {
                    function n() {}
                    n.prototype = e;
                    var i = new n;
                    return i.constructor = t, i
                },
                o = r(t.prototype, e);
            return e.prototype = PFUI.mix(o, e.prototype), e.superclass = r(t.prototype, t), PFUI.mix(o, n), PFUI.mix(e, i), e
        },
        guid: function() {
            var e = {};
            return function(t) {
                return t = t || PFUI.prefix + p, e[t] ? e[t] += 1 : e[t] = 1, t + e[t]
            }
        }(),
        isString: function(e) {
            return "string" == typeof e
        },
        isNumber: function(e) {
            return "number" == typeof e
        },
        isBoolean: function(e) {
            return "boolean" == typeof e
        },
        log: function(e) {
            PFUI.debug && a.console && a.console.log && a.console.log(e)
        },
        merge: function() {
            var e = o.makeArray(arguments),
                t = e[0];
            return PFUI.isBoolean(t) ? (e.shift(), e.unshift({}), e.unshift(t)) : e.unshift({}), PFUI.mix.apply(null, e)
        },
        mix: function() {
            return o.extend.apply(null, arguments)
        },
        app: function(e) {
            return window[e] || (window[e] = {
                namespace: function(t) {
                    return PFUI.namespace(t, window[e])
                }
            }), window[e]
        },
        mixAttrs: i,
        mixAttr: r,
        mixin: function(e, t, n) {
            n = n || [m, v];
            var r = t;
            if (r) {
                e.mixins = r;
                var o = {},
                    a = r.concat(e);
                PFUI.each(a, function(e) {
                    e && PFUI.each(n, function(t) {
                        e[t] && (o[t] = o[t] || {}, "ATTRS" == t ? i(o[t], e[t]) : PFUI.mix(o[t], e[t]))
                    })
                }), PFUI.each(o, function(t, n) {
                    e[n] = t
                });
                var s = {};
                PFUI.each(a, function(e) {
                    if (e) {
                        var t = e.prototype;
                        for (var n in t) t.hasOwnProperty(n) && (s[n] = t[n])
                    }
                }), PFUI.each(s, function(t, n) {
                    e.prototype[n] = t
                })
            }
            return e
        },
        namespace: function(e, t) {
            if (t = t || PFUI, !e) return t;
            for (var n = e.split("."), i = t, r = 0; r < n.length; r++) {
                var o = n[r];
                i[o] || (i[o] = {}), i = i[o]
            }
            return i
        },
        prefix: "pfui-",
        substitute: function(e, t, n) {
            return PFUI.isString(e) && (PFUI.isObject(t) || PFUI.isArray(t)) ? e.replace(n || /\\?\{([^{}]+)\}/g, function(e, n) {
                return "\\" === e.charAt(0) ? e.slice(1) : void 0 === t[n] ? "" : t[n]
            }) : e
        },
        unparam: function(e) {
            if ("string" != typeof e || !(e = o.trim(e))) return {};
            for (var t, n = e.split("&"), i = {}, r = n.length - 1; r >= 0; r--) t = n[r].split("="), i[t[0]] = decodeURIComponent(t[1]);
            return i
        },
        ucfirst: function(e) {
            return e += "", e.charAt(0).toUpperCase() + e.substring(1)
        },
        isInView: function(e) {
            var t = e.left,
                n = e.top,
                i = PFUI.viewportWidth(),
                r = PFUI.viewportHeight(),
                o = PFUI.scrollTop(),
                a = PFUI.scrollLeft();
            return a > t || t > a + i ? !1 : o > n || n > o + r ? !1 : !0
        },
        isInVerticalView: function(e) {
            var t = PFUI.viewportHeight(),
                n = PFUI.scrollTop();
            return n > e || e > n + t ? !1 : !0
        },
        isInHorizontalView: function(e) {
            var t = PFUI.viewportWidth(),
                n = PFUI.scrollLeft();
            return n > e || e > n + t ? !1 : !0
        },
        viewportWidth: function() {
            return o(window).width()
        },
        viewportHeight: function() {
            return o(window).height()
        },
        scrollLeft: function() {
            return o(window).scrollLeft()
        },
        scrollTop: function() {
            return o(window).scrollTop()
        },
        docWidth: function() {
            return Math.max(this.viewportWidth(), s[d][h], s[c][h])
        },
        docHeight: function() {
            return Math.max(this.viewportHeight(), s[d][g], s[c][g])
        },
        each: function(e, t) {
            e && o.each(e, function(e, n) {
                return t(n, e)
            })
        },
        wrapBehavior: function(e, t) {
            return e["__pfui_wrap_" + t] = function(n) {
                e.get("disabled") || e[t](n)
            }
        },
        getWrapBehavior: function(e, t) {
            return e["__pfui_wrap_" + t]
        },
        getControl: function(e) {
            return PFUI.Component.Manager.getComponent(e)
        }
    });
    var y = {
        serializeToObject: function(e) {
            var t = o(e).serializeArray(),
                n = {};
            return PFUI.each(t, function(e) {
                var t = e.name;
                n[t] ? (PFUI.isArray(n[t]) || (n[t] = [n[t]]), n[t].push(e.value)) : n[t] = e.value
            }), n
        },
        setFields: function(e, t) {
            for (var n in t) t.hasOwnProperty(n) && PFUI.FormHelper.setField(e, n, t[n])
        },
        clear: function(e) {
            var t = o.makeArray(e.elements);
            PFUI.each(t, function(e) {
                "checkbox" === e.type || "radio" === e.type ? o(e).attr("checked", !1) : o(e).val(""), o(e).change()
            })
        },
        setField: function(e, t, n) {
            var i = e.elements[t];
            i && i.type ? formHelper._setFieldValue(i, n) : (PFUI.isArray(i) || i && i.length) && PFUI.each(i, function(e) {
                formHelper._setFieldValue(e, n)
            })
        },
        _setFieldValue: function(e, t) {
            "checkbox" === e.type ? e.value == "" + t || PFUI.isArray(t) && -1 !== PFUI.Array.indexOf(e.value, t) ? o(e).attr("checked", !0) : o(e).attr("checked", !1) : "radio" === e.type ? e.value == "" + t ? o(e).attr("checked", !0) : o(e).attr("checked", !1) : o(e).val(t)
        },
        getField: function(e, t) {
            return PFUI.FormHelper.serializeToObject(e)[t]
        }
    };
    PFUI.FormHelper = y, n.exports = PFUI
}), define("pfui/common/ua", ["jquery"], function(e, t, n) {
    function i(e) {
        var t = 0;
        return parseFloat(e.replace(/\./g, function() {
            return 0 === t++ ? "." : ""
        }))
    }

    function r(e) {
        e = e.toLowerCase();
        var t = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [],
            n = {
                browser: t[1] || "",
                version: t[2] || "0"
            },
            i = {};
        return n.browser && (i[n.browser] = !0, i.version = n.version), i.chrome ? i.webkit = !0 : i.webkit && (i.safari = !0), i
    }
    var o = e("jquery"),
        a = o.UA || function() {
            var e = o.browser || r(navigator.userAgent),
                t = i(e.version),
                n = {
                    ie: e.msie && t,
                    webkit: e.webkit && t,
                    opera: e.opera && t,
                    mozilla: e.mozilla && t
                };
            return n
        }();
    n.exports = a
}), define("pfui/common/json", ["jquery"], function(e, t, n) {
    function i(e) {
        return 10 > e ? "0" + e : e
    }

    function r(e) {
        return g.lastIndex = 0, g.test(e) ? '"' + e.replace(g, function(e) {
            var t = m[e];
            return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + e + '"'
    }

    function o(e, t) {
        var n, i, a, s, u, l = d,
            c = t[e];
        switch (c && "object" == typeof c && "function" == typeof c.toJSON && (c = c.toJSON(e)), "function" == typeof h && (c = h.call(t, e, c)), typeof c) {
            case "string":
                return r(c);
            case "number":
                return isFinite(c) ? String(c) : "null";
            case "boolean":
            case "null":
                return String(c);
            case "object":
                if (!c) return "null";
                if (d += f, u = [], "[object Array]" === Object.prototype.toString.apply(c)) {
                    for (s = c.length, n = 0; s > n; n += 1) u[n] = o(n, c) || "null";
                    return a = 0 === u.length ? "[]" : d ? "[\n" + d + u.join(",\n" + d) + "\n" + l + "]" : "[" + u.join(",") + "]", d = l, a
                }
                if (h && "object" == typeof h)
                    for (s = h.length, n = 0; s > n; n += 1) i = h[n], "string" == typeof i && (a = o(i, c), a && u.push(r(i) + (d ? ": " : ":") + a));
                else
                    for (i in c) Object.hasOwnProperty.call(c, i) && (a = o(i, c), a && u.push(r(i) + (d ? ": " : ":") + a));
                return a = 0 === u.length ? "{}" : d ? "{\n" + d + u.join(",\n" + d) + "\n" + l + "}" : "{" + u.join(",") + "}", d = l, a
        }
    }

    function a(e) {
        try {
            return new Function("return " + e + ";")()
        } catch (t) {
            throw "Json parse error!"
        }
    }
    var s = e("jquery"),
        u = e("pfui/common/ua"),
        l = window,
        c = l.JSON;
    (!c || u.ie < 9) && (c = l.JSON = {}), "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function() {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + i(this.getUTCMonth() + 1) + "-" + i(this.getUTCDate()) + "T" + i(this.getUTCHours()) + ":" + i(this.getUTCMinutes()) + ":" + i(this.getUTCSeconds()) + "Z" : null
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
        return this.valueOf()
    });
    var d, f, h, g = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        m = {
            "\b": "\\b",
            "	": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        };
    "function" != typeof c.stringify && (c.stringify = function(e, t, n) {
        var i;
        if (d = "", f = "", "number" == typeof n)
            for (i = 0; n > i; i += 1) f += " ";
        else "string" == typeof n && (f = n);
        if (h = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
        return o("", {
            "": e
        })
    });
    var c = {
        parse: s.parseJSON,
        looseParse: a,
        stringify: c.stringify
    };
    n.exports = c
}), define("pfui/common/date", [], function(e, t, n) {
    function i(e, t) {
        if (e instanceof Date) return e;
        if ("undefined" == typeof t || null == t || "" == t) {
            for (var n = new Array("y-m-d", "yyyy-mm-dd", "yyyy-mm-dd HH:MM:ss", "H:M:s"), r = 0; r < n.length; r++) {
                var o = i(e, n[r]);
                if (null != o) return o
            }
            return null
        }
        e += "";
        var a, s, u = 0,
            l = 0,
            c = "",
            d = "",
            f = new Date,
            h = f.getYear(),
            g = f.getMonth() + 1,
            m = 1,
            v = 0,
            p = 0,
            y = 0;
        for (this.isInteger = function(e) {
                return /^\d*$/.test(e)
            }, this.getInt = function(e, t, n, i) {
                for (var r = i; r >= n; r--) {
                    var o = e.substring(t, t + r);
                    if (o.length < n) return null;
                    if (this.isInteger(o)) return o
                }
                return null
            }; l < t.length;) {
            for (c = t.charAt(l), d = ""; t.charAt(l) == c && l < t.length;) d += t.charAt(l++);
            if ("yyyy" == d || "yy" == d || "y" == d) {
                if ("yyyy" == d && (a = 4, s = 4), "yy" == d && (a = 2, s = 2), "y" == d && (a = 2, s = 4), h = this.getInt(e, u, a, s), null == h) return null;
                u += h.length, 2 == h.length && (h = h > 70 ? 1900 + (h - 0) : 2e3 + (h - 0))
            } else if ("mm" == d || "m" == d) {
                if (g = this.getInt(e, u, d.length, 2), null == g || 1 > g || g > 12) return null;
                u += g.length
            } else if ("dd" == d || "d" == d) {
                if (m = this.getInt(e, u, d.length, 2), null == m || 1 > m || m > 31) return null;
                u += m.length
            } else if ("hh" == d || "h" == d) {
                if (v = this.getInt(e, u, d.length, 2), null == v || 1 > v || v > 12) return null;
                u += v.length
            } else if ("HH" == d || "H" == d) {
                if (v = this.getInt(e, u, d.length, 2), null == v || 0 > v || v > 23) return null;
                u += v.length
            } else if ("MM" == d || "M" == d) {
                if (p = this.getInt(e, u, d.length, 2), null == p || 0 > p || p > 59) return null;
                u += p.length
            } else if ("ss" == d || "s" == d) {
                if (y = this.getInt(e, u, d.length, 2), null == y || 0 > y || y > 59) return null;
                u += y.length
            } else {
                if (e.substring(u, u + d.length) != d) return null;
                u += d.length
            }
        }
        if (u != e.length) return null;
        if (2 == g)
            if (h % 4 == 0 && h % 100 != 0 || h % 400 == 0) {
                if (m > 29) return null
            } else if (m > 28) return null;
        return (4 == g || 6 == g || 9 == g || 11 == g) && m > 30 ? null : new Date(h, g - 1, m, v, p, y)
    }

    function r(e, t, n) {
        var i = new Date(n);
        switch (isNaN(i) && (i = new Date), t = parseInt(t, 10), e) {
            case "s":
                i = new Date(i.getTime() + 1e3 * t);
                break;
            case "n":
                i = new Date(i.getTime() + 6e4 * t);
                break;
            case "h":
                i = new Date(i.getTime() + 36e5 * t);
                break;
            case "d":
                i = new Date(i.getTime() + 864e5 * t);
                break;
            case "w":
                i = new Date(i.getTime() + 6048e5 * t);
                break;
            case "m":
                i = new Date(i.getFullYear(), i.getMonth() + t, i.getDate(), i.getHours(), i.getMinutes(), i.getSeconds());
                break;
            case "y":
                i = new Date(i.getFullYear() + t, i.getMonth(), i.getDate(), i.getHours(), i.getMinutes(), i.getSeconds())
        }
        return i
    }
    var o = /^(?:(?!0000)[0-9]{4}([-/.]+)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2\2(?:29))(\s+([01]|([01][0-9]|2[0-3])):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9]))?$/,
        a = function() {
            var e = /w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                t = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                n = /[^-+\dA-Z]/g,
                i = function(e, t) {
                    for (e = String(e), t = t || 2; e.length < t;) e = "0" + e;
                    return e
                },
                r = {
                    "default": "ddd mmm dd yyyy HH:MM:ss",
                    shortDate: "m/d/yy",
                    longDate: "mmmm d, yyyy",
                    fullDate: "dddd, mmmm d, yyyy",
                    shortTime: "h:MM TT",
                    longTime: "h:MM:ss TT Z",
                    isoDate: "yyyy-mm-dd",
                    isoTime: "HH:MM:ss",
                    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                    isoUTCDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
                    localShortDate: "yy\u5e74mm\u6708dd\u65e5",
                    localShortDateTime: "yy\u5e74mm\u6708dd\u65e5 hh:MM:ss TT",
                    localLongDate: "yyyy\u5e74mm\u6708dd\u65e5",
                    localLongDateTime: "yyyy\u5e74mm\u6708dd\u65e5 hh:MM:ss TT",
                    localFullDate: "yyyy\u5e74mm\u6708dd\u65e5 w",
                    localFullDateTime: "yyyy\u5e74mm\u6708dd\u65e5 w hh:MM:ss TT"
                },
                o = {
                    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "\u661f\u671f\u65e5", "\u661f\u671f\u4e00", "\u661f\u671f\u4e8c", "\u661f\u671f\u4e09", "\u661f\u671f\u56db", "\u661f\u671f\u4e94", "\u661f\u671f\u516d"],
                    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                };
            return function(a, s, u) {
                if (1 !== arguments.length || "[object String]" !== Object.prototype.toString.call(a) || /\d/.test(a) || (s = a, a = void 0), a = a ? new Date(a) : new Date, isNaN(a)) throw SyntaxError("invalid date");
                s = String(r[s] || s || r["default"]), "UTC:" === s.slice(0, 4) && (s = s.slice(4), u = !0);
                var l = u ? "getUTC" : "get",
                    c = a[l + "Date"](),
                    d = a[l + "Day"](),
                    f = a[l + "Month"](),
                    h = a[l + "FullYear"](),
                    g = a[l + "Hours"](),
                    m = a[l + "Minutes"](),
                    v = a[l + "Seconds"](),
                    p = a[l + "Milliseconds"](),
                    y = u ? 0 : a.getTimezoneOffset(),
                    b = {
                        d: c,
                        dd: i(c, void 0),
                        ddd: o.dayNames[d],
                        dddd: o.dayNames[d + 7],
                        w: o.dayNames[d + 14],
                        m: f + 1,
                        mm: i(f + 1, void 0),
                        mmm: o.monthNames[f],
                        mmmm: o.monthNames[f + 12],
                        yy: String(h).slice(2),
                        yyyy: h,
                        h: g % 12 || 12,
                        hh: i(g % 12 || 12, void 0),
                        H: g,
                        HH: i(g, void 0),
                        M: m,
                        MM: i(m, void 0),
                        s: v,
                        ss: i(v, void 0),
                        l: i(p, 3),
                        L: i(p > 99 ? Math.round(p / 10) : p, void 0),
                        t: 12 > g ? "a" : "p",
                        tt: 12 > g ? "am" : "pm",
                        T: 12 > g ? "A" : "P",
                        TT: 12 > g ? "AM" : "PM",
                        Z: u ? "UTC" : (String(a).match(t) || [""]).pop().replace(n, ""),
                        o: (y > 0 ? "-" : "+") + i(100 * Math.floor(Math.abs(y) / 60) + Math.abs(y) % 60, 4),
                        S: ["th", "st", "nd", "rd"][c % 10 > 3 ? 0 : (c % 100 - c % 10 !== 10) * c % 10]
                    };
                return s.replace(e, function(e) {
                    return e in b ? b[e] : e.slice(1, e.length - 1)
                })
            }
        }(),
        s = {
            add: function(e, t, n) {
                return r(e, t, n)
            },
            addHour: function(e, t) {
                return r("h", e, t)
            },
            addMinute: function(e, t) {
                return r("n", e, t)
            },
            addSecond: function(e, t) {
                return r("s", e, t)
            },
            addDay: function(e, t) {
                return r("d", e, t)
            },
            addWeek: function(e, t) {
                return r("w", e, t)
            },
            addMonths: function(e, t) {
                return r("m", e, t)
            },
            addYear: function(e, t) {
                return r("y", e, t)
            },
            isDateEquals: function(e, t) {
                return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate()
            },
            isEquals: function(e, t) {
                return e == t ? !0 : e && t && e.getTime && t.getTime ? e.getTime() == t.getTime() : !1
            },
            isDateString: function(e) {
                return o.test(e)
            },
            format: function(e, t, n) {
                return a(e, t, n)
            },
            parse: function(e, t) {
                return PFUI.isString(e) && (e = e.replace("/", "-")), i(e, t)
            },
            today: function() {
                var e = new Date;
                return new Date(e.getFullYear(), e.getMonth(), e.getDate())
            },
            getDate: function(e) {
                return new Date(e.getFullYear(), e.getMonth(), e.getDate())
            }
        };
    n.exports = s
}), define("pfui/common/array", ["jquery"], function(e, t, n) {
    var i = e("pfui/common/util"),
        r = {
            peek: function(e) {
                return e[e.length - 1]
            },
            indexOf: function(e, t, n) {
                for (var i = null == n ? 0 : 0 > n ? Math.max(0, t.length + n) : n, r = i; r < t.length; r++)
                    if (r in t && t[r] === e) return r;
                return -1
            },
            contains: function(e, t) {
                return r.indexOf(e, t) >= 0
            },
            each: i.each,
            equals: function(e, t) {
                if (e == t) return !0;
                if (!e || !t) return !1;
                if (e.length != t.length) return !1;
                for (var n = !0, i = 0; i < e.length; i++)
                    if (e[i] !== t[i]) {
                        n = !1;
                        break
                    }
                return n
            },
            filter: function(e, t) {
                var n = [];
                return r.each(e, function(e, i) {
                    t(e, i) && n.push(e)
                }), n
            },
            map: function(e, t) {
                var n = [];
                return r.each(e, function(e, i) {
                    n.push(t(e, i))
                }), n
            },
            find: function(e, t) {
                var n = r.findIndex(e, t);
                return 0 > n ? null : e[n]
            },
            findIndex: function(e, t) {
                var n = -1;
                return r.each(e, function(e, i) {
                    return t(e, i) ? (n = i, !1) : void 0
                }), n
            },
            isEmpty: function(e) {
                return 0 == e.length
            },
            add: function(e, t) {
                e.push(t)
            },
            addAt: function(e, t, n) {
                r.splice(e, n, 0, t)
            },
            empty: function(e) {
                if (!(e instanceof Array))
                    for (var t = e.length - 1; t >= 0; t--) delete e[t];
                e.length = 0
            },
            remove: function(e, t) {
                var n, i = r.indexOf(t, e);
                return (n = i >= 0) && r.removeAt(e, i), n
            },
            removeAt: function(e, t) {
                return 1 == r.splice(e, t, 1).length
            },
            slice: function(e, t, n) {
                return arguments.length <= 2 ? Array.prototype.slice.call(e, t) : Array.prototype.slice.call(e, t, n)
            },
            splice: function(e) {
                return Array.prototype.splice.apply(e, r.slice(arguments, 1))
            }
        };
    n.exports = r
}), define("pfui/common/keycode", [], function(e, t, n) {
    var i = {
        BACKSPACE: 8,
        TAB: 9,
        NUM_CENTER: 12,
        ENTER: 13,
        RETURN: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        PRINT_SCREEN: 44,
        INSERT: 45,
        DELETE: 46,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        CONTEXT_MENU: 93,
        NUM_ZERO: 96,
        NUM_ONE: 97,
        NUM_TWO: 98,
        NUM_THREE: 99,
        NUM_FOUR: 100,
        NUM_FIVE: 101,
        NUM_SIX: 102,
        NUM_SEVEN: 103,
        NUM_EIGHT: 104,
        NUM_NINE: 105,
        NUM_MULTIPLY: 106,
        NUM_PLUS: 107,
        NUM_MINUS: 109,
        NUM_PERIOD: 110,
        NUM_DIVISION: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123
    };
    n.exports = i
}), define("pfui/common/observable", ["jquery"], function(e, t, n) {
    function i() {
        return new s
    }
    var r = e("jquery"),
        o = e("pfui/common/util"),
        a = e("pfui/common/array"),
        s = function() {
            this._init()
        };
    o.augment(s, {
        _functions: null,
        _init: function() {
            var e = this;
            e._functions = []
        },
        add: function(e) {
            this._functions.push(e)
        },
        remove: function(e) {
            var t = this._functions;
            index = a.indexOf(e, t), index >= 0 && t.splice(index, 1)
        },
        empty: function() {
            var e = this._functions.length;
            this._functions.splice(0, e)
        },
        pause: function() {
            this._paused = !0
        },
        resume: function() {
            this._paused = !1
        },
        fireWith: function(e, t) {
            var n, i = this;
            if (!i._paused) return o.each(i._functions, function(i) {
                return n = i.apply(e, t), n === !1 ? !1 : void 0
            }), n
        }
    });
    var u = function(e) {
        this._events = [], this._eventMap = {}, this._bubblesEvents = [], this._initEvents(e)
    };
    o.augment(u, {
        _events: [],
        _eventMap: {},
        _bubblesEvents: [],
        _bubbleTarget: null,
        _getCallbacks: function(e) {
            var t = this,
                n = t._eventMap;
            return n[e]
        },
        _initEvents: function(e) {
            var t = this,
                n = null;
            if (e && (n = e.listeners || {}, e.handler && (n.click = e.handler), n))
                for (var i in n) n.hasOwnProperty(i) && t.on(i, n[i])
        },
        _isBubbles: function(e) {
            return a.indexOf(e, this._bubblesEvents) >= 0
        },
        addTarget: function(e) {
            this._bubbleTarget = e
        },
        addEvents: function(e) {
            function t(e) {
                -1 === a.indexOf(e, r) && (s[e] = i(), r.push(e))
            }
            var n = this,
                r = n._events,
                s = n._eventMap;
            o.isArray(e) ? o.each(e, function(e) {
                t(e)
            }) : t(e)
        },
        clearListeners: function() {
            var e = this,
                t = e._eventMap;
            for (var n in t) t.hasOwnProperty(n) && t[n].empty()
        },
        fire: function(e, t) {
            var n, i = this,
                o = i._getCallbacks(e),
                a = r.makeArray(arguments);
            if (t || (t = {}, a.push(t)), t.target || (t.target = i), o && (n = o.fireWith(i, Array.prototype.slice.call(a, 1))), i._isBubbles(e)) {
                var s = i._bubbleTarget;
                s && s.fire && s.fire(e, t)
            }
            return n
        },
        pauseEvent: function(e) {
            var t = this,
                n = t._getCallbacks(e);
            n && n.pause()
        },
        resumeEvent: function(e) {
            var t = this,
                n = t._getCallbacks(e);
            n && n.resume()
        },
        on: function(e, t) {
            var n = e.split(" "),
                i = this,
                r = null;
            return n.length > 1 ? o.each(n, function(e) {
                i.on(e, t)
            }) : (r = i._getCallbacks(e), r ? r.add(t) : (i.addEvents(e), i.on(e, t))), i
        },
        off: function(e, t) {
            if (!e && !t) return this.clearListeners(), this;
            var n = this,
                i = n._getCallbacks(e);
            return i && (t ? i.remove(t) : i.empty()), n
        },
        publish: function(e, t) {
            var n = this,
                i = n._bubblesEvents;
            if (t.bubbles) - 1 === o.Array.indexOf(e, i) && i.push(e);
            else {
                var r = o.Array.indexOf(e, i); - 1 !== r && i.splice(r, 1)
            }
        }
    }), n.exports = u
}), define("pfui/common/base", ["jquery"], function(e, t, n) {
    function i(e, t, n) {
        var i = e[t] || {};
        return n && (e[t] = i), i
    }

    function r(e, t) {
        return PFUI.isString(t) ? e[t] : t
    }

    function o(e, t, n, i, r) {
        var o = n;
        return e.fire(t + PFUI.ucfirst(n) + "Change", {
            attrName: o,
            prevVal: i,
            newVal: r
        })
    }

    function a(e, t, n, i) {
        i = i || {};
        var r, a;
        return a = e.get(t), u.isPlainObject(n) || PFUI.isArray(n) || a !== n ? i.silent || !1 !== o(e, "before", t, a, n) ? (r = e._set(t, n, i), r === !1 ? r : (i.silent || (n = e.__attrVals[t], o(e, "after", t, a, n)), e)) : !1 : void 0
    }

    function s(e) {
        if (!e._attrs && e != d) {
            var t = e.superclass.constructor;
            t && !t._attrs && s(t), e._attrs = {}, PFUI.mixAttrs(e._attrs, t._attrs), PFUI.mixAttrs(e._attrs, e.ATTRS)
        }
    }
    var u = e("jquery"),
        l = {},
        c = e("pfui/common/observable"),
        d = function(e) {
            var t = this,
                n = t.constructor,
                i = [];
            for (this.__attrs = {}, this.__attrVals = {}, c.apply(this, arguments); n;) i.push(n), n.extensions && (PFUI.mixin(n, n.extensions), delete n.extensions), n = n.superclass ? n.superclass.constructor : null;
            var r = t.constructor;
            s(r), t._initStaticAttrs(r._attrs), t._initAttrs(e)
        };
    d.INVALID = l, PFUI.extend(d, c), PFUI.augment(d, {
        _initStaticAttrs: function(e) {
            var t, n = this;
            t = n.__attrs = {};
            for (var i in e)
                if (e.hasOwnProperty(i)) {
                    var r = e[i];
                    r.shared === !1 || r.valueFn ? (t[i] = {}, PFUI.mixAttr(t[i], e[i])) : t[i] = e[i]
                }
        },
        addAttr: function(e, t) {
            var n = this,
                i = n.__attrs,
                r = i[e];
            r || (r = i[e] = {});
            for (var o in t) t.hasOwnProperty(o) && ("value" == o ? PFUI.isObject(t[o]) ? (r[o] = r[o] || {}, PFUI.mix(r[o], t[o])) : PFUI.isArray(t[o]) ? (r[o] = r[o] || [], PFUI.mix(r[o], t[o])) : r[o] = t[o] : r[o] = t[o]);
            return n
        },
        addAttrs: function(e, t, n) {
            var i = this;
            return e ? ("boolean" == typeof t && (n = t, t = null), PFUI.each(e, function(e, t) {
                i.addAttr(t, e, n)
            }), t && i.set(t), i) : i
        },
        hasAttr: function(e) {
            return e && this.__attrs.hasOwnProperty(e)
        },
        getAttrs: function() {
            return this.__attrs
        },
        getAttrVals: function() {
            return this.__attrVals
        },
        get: function(e) {
            var t, n, o, a = this,
                s = a.__attrVals;
            return t = i(a.__attrs, e), n = t.getter, o = e in s ? s[e] : a._getDefAttrVal(e), n && (n = r(a, n)) && (o = n.call(a, o, e)), o
        },
        clearAttrVals: function() {
            this.__attrVals = {}
        },
        removeAttr: function(e) {
            var t = this;
            return t.hasAttr(e) && (delete t.__attrs[e], delete t.__attrVals[e]), t
        },
        set: function(e, t, n) {
            var i = this;
            if (u.isPlainObject(e)) {
                n = t;
                var r = Object(e);
                for (e in r) r.hasOwnProperty(e) && a(i, e, r[e], n);
                return i
            }
            return a(i, e, t, n)
        },
        setInternal: function(e, t, n) {
            return this._set(e, t, n)
        },
        _getDefAttrVal: function(e) {
            var t, n = this,
                o = n.__attrs,
                a = i(o, e),
                s = a.valueFn;
            return s && (s = r(n, s)) && (t = s.call(n), void 0 !== t && (a.value = t), delete a.valueFn, o[e] = a), a.value
        },
        _set: function(e, t) {
            var n, o = this,
                a = i(o.__attrs, e, !0),
                s = a.setter;
            return s && (s = r(o, s)) && (n = s.call(o, t, e)), n === l ? !1 : (void 0 !== n && (t = n), o.__attrVals[e] = t, o)
        },
        _initAttrs: function(e) {
            var t = this;
            if (e)
                for (var n in e) e.hasOwnProperty(n) && t._set(n, e[n])
        }
    }), n.exports = d
}), define("pfui/common/component/component", ["jquery"], function(e, t, n) {
    function i(e, t) {
        var n, i;
        return e && (i = e.xclass) && (t && !e.prefixCls && (e.prefixCls = t.get("prefixCls")), n = r.Manager.getConstructorByXClass(i), n || PFUI.error("can not find class by xclass desc : " + i), e = new n(e)), e
    }
    var r = {};
    PFUI.mix(r, {
        Manager: e("pfui/common/component/manage"),
        UIBase: e("pfui/common/component/uibase/uibase"),
        View: e("pfui/common/component/view"),
        Controller: e("pfui/common/component/controller")
    }), r.create = i, n.exports = r
}), define("pfui/common/component/manage", ["jquery"], function(e, t, n) {
    function i(e) {
        for (var t, n = e.split(/\s+/), i = -1, r = null, o = 0; o < n.length; o++) {
            var a = u[n[o]];
            a && (t = a.priority) > i && (i = t, r = a.constructor)
        }
        return r
    }

    function r(e) {
        for (var t in u) {
            var n = u[t];
            if (n.constructor == e) return t
        }
        return 0
    }

    function o(e, t) {
        PFUI.isFunction(t) ? u[e] = {
            constructor: t,
            priority: 0
        } : (t.priority = t.priority || 0, u[e] = t)
    }

    function a(e) {
        for (var t = s.trim(e).split(/\s+/), n = 0; n < t.length; n++) t[n] && (t[n] = this.get("prefixCls") + t[n]);
        return t.join(" ")
    }
    var s = e("jquery"),
        u = {},
        l = {},
        c = {
            __instances: l,
            addComponent: function(e, t) {
                l[e] = t
            },
            removeComponent: function(e) {
                delete l[e]
            },
            eachComponent: function(e) {
                PFUI.each(l, e)
            },
            getComponent: function(e) {
                return l[e]
            },
            getCssClassWithPrefix: a,
            getXClassByConstructor: r,
            getConstructorByXClass: i,
            setConstructorByXClass: o
        };
    n.exports = c
}), define("pfui/common/component/uibase/uibase", ["jquery"], function(e, t, n) {
    var i = e("pfui/common/component/uibase/base");
    PFUI.mix(i, {
        Align: e("pfui/common/component/uibase/align"),
        AutoShow: e("pfui/common/component/uibase/autoshow"),
        AutoHide: e("pfui/common/component/uibase/autohide"),
        Close: e("pfui/common/component/uibase/close"),
        Collapsable: e("pfui/common/component/uibase/collapsable"),
        Drag: e("pfui/common/component/uibase/drag"),
        KeyNav: e("pfui/common/component/uibase/keynav"),
        List: e("pfui/common/component/uibase/list"),
        ListItem: e("pfui/common/component/uibase/listitem"),
        Mask: e("pfui/common/component/uibase/mask"),
        Position: e("pfui/common/component/uibase/position"),
        Selection: e("pfui/common/component/uibase/selection"),
        StdMod: e("pfui/common/component/uibase/stdmod"),
        Decorate: e("pfui/common/component/uibase/decorate"),
        Tpl: e("pfui/common/component/uibase/tpl"),
        ChildCfg: e("pfui/common/component/uibase/childcfg"),
        Bindable: e("pfui/common/component/uibase/bindable"),
        Depends: e("pfui/common/component/uibase/depends")
    }), PFUI.mix(i, {
        CloseView: i.Close.View,
        CollapsableView: i.Collapsable.View,
        ChildList: i.List.ChildList,
        ListItemView: i.ListItem.View,
        MaskView: i.Mask.View,
        PositionView: i.Position.View,
        StdModView: i.StdMod.View,
        TplView: i.Tpl.View
    }), n.exports = i
}), define("pfui/common/component/uibase/base", ["jquery"], function(e, t, n) {
    function i(e) {
        r(e, "initializer", "constructor")
    }

    function r(e, t, n) {
        for (var i, r, o, a, s = e.constructor, u = []; s;) {
            if (a = [], o = s.mixins)
                for (var l = 0; l < o.length; l++) i = o[l], i && ("constructor" != n && (i = i.prototype.hasOwnProperty(n) ? i.prototype[n] : null), i && a.push(i));
            s.prototype.hasOwnProperty(t) && (r = s.prototype[t]) && a.push(r), a.length && u.push.apply(u, a.reverse()), s = s.superclass && s.superclass.constructor
        }
        for (l = u.length - 1; l >= 0; l--) u[l] && u[l].call(e)
    }

    function o(e) {
        for (var t, n, i, r = e.constructor; r;) {
            if (r.prototype.hasOwnProperty("destructor") && r.prototype.destructor.apply(e), t = r.mixins)
                for (i = t.length - 1; i >= 0; i--) n = t[i] && t[i].prototype.__destructor, n && n.apply(e);
            r = r.superclass && r.superclass.constructor
        }
    }

    function a(e) {
        e && PFUI.each(e, function(t, n) {
            PFUI.isFunction(t) && (e[n] = new t)
        })
    }

    function s(e, t, n) {
        t && PFUI.each(t, function(t) {
            t[n] && t[n](e)
        })
    }

    function u() {}

    function l(e) {
        var t, n, i = e.getAttrs();
        for (var r in i)
            if (i.hasOwnProperty(r)) {
                var o = h + g(r);
                (n = e[o]) && i[r].sync !== !1 && void 0 !== (t = e.get(r)) && n.call(e, t)
            }
    }

    function c(e) {
        for (var t = []; e.base;) t.push(e), e = e.base;
        for (var n = t.length - 1; n >= 0; n--) {
            var i = t[n];
            PFUI.mix(i.prototype, i.px), PFUI.mix(i, i.sx), i.base = null, i.px = null, i.sx = null
        }
    }
    var d = e("jquery"),
        f = e("pfui/common/component/manage"),
        h = "_uiSet",
        g = PFUI.ucfirst,
        m = d.noop,
        v = e("pfui/common/base"),
        p = function(e) {
            var t = this;
            v.apply(t, arguments), t.setInternal("userConfig", e), i(t, e);
            var n = t.get("plugins");
            a(n);
            var r = t.get("xclass");
            r && (t.__xclass = r), s(t, n, "initializer"), e && e.autoRender && t.render()
        };
    p.ATTRS = {
        userConfig: {},
        autoRender: {
            value: !1
        },
        listeners: {
            value: {}
        },
        plugins: {},
        rendered: {
            value: !1
        },
        xclass: {
            valueFn: function() {
                return f.getXClassByConstructor(this.constructor)
            }
        }
    }, PFUI.extend(p, v), PFUI.augment(p, {
        create: function() {
            var e = this;
            return e.get("created") || (e.fire("beforeCreateDom"), r(e, "createDom", "__createDom"), e._set("created", !0), e.fire("afterCreateDom"), s(e, e.get("plugins"), "createDom")), e
        },
        render: function() {
            var e = this;
            if (!e.get("rendered")) {
                var t = e.get("plugins");
                e.create(void 0), e.set("created", !0), e.fire("beforeRenderUI"), r(e, "renderUI", "__renderUI"), e.fire("afterRenderUI"), s(e, t, "renderUI"), e.fire("beforeBindUI"), u(e), r(e, "bindUI", "__bindUI"), e.set("binded", !0), e.fire("afterBindUI"), s(e, t, "bindUI"), e.fire("beforeSyncUI"), l(e), r(e, "syncUI", "__syncUI"), e.fire("afterSyncUI"), s(e, t, "syncUI"), e._set("rendered", !0)
            }
            return e
        },
        createDom: m,
        renderUI: m,
        bindUI: m,
        syncUI: m,
        destroy: function() {
            var e = this;
            return e.destroyed ? e : (e.fire("beforeDestroy"), s(e, e.get("plugins"), "destructor"), o(e), e.fire("afterDestroy"), e.off(), e.clearAttrVals(), e.destroyed = !0, e)
        }
    }), PFUI.mix(p, {
        define: function(e, t, n, i) {
            function r() {
                var e = this.constructor;
                e.base && c(e), p.apply(this, arguments)
            }
            return d.isPlainObject(t) && (i = n, n = t, t = []), PFUI.extend(r, e), r.base = e, r.px = n, r.sx = i, t.length && (r.extensions = t), r
        },
        extend: function y() {
            var e, t = d.makeArray(arguments),
                n = t[t.length - 1];
            if (t.unshift(this), n.xclass && (t.pop(), t.push(n.xclass)), e = p.define.apply(p, t), n.xclass) {
                var i = n.priority || (this.priority ? this.priority + 1 : 1);
                f.setConstructorByXClass(n.xclass, {
                    constructor: e,
                    priority: i
                }), e.__xclass = n.xclass, e.priority = i, e.toString = function() {
                    return n.xclass
                }
            }
            return e.extend = y, e
        }
    }), n.exports = p
}), define("pfui/common/component/uibase/align", ["jquery"], function(e, t, n) {
    function i(e) {
        var t, n = e.ownerDocument,
            i = n.body,
            r = m(e).css("position"),
            o = "fixed" == r || "absolute" == r;
        if (!o) return "html" == e.nodeName.toLowerCase() ? null : e.parentNode;
        for (t = e.parentNode; t && t != i; t = t.parentNode)
            if (r = m(t).css("position"), "static" != r) return t;
        return null
    }

    function r(e) {
        var t, n, r, o, a = {
                left: 0,
                right: 1 / 0,
                top: 0,
                bottom: 1 / 0
            },
            s = e.ownerDocument,
            u = s.body,
            l = s.documentElement;
        for (t = e; t = i(t);)
            if ((!v.ie || 0 != t.clientWidth) && t != u && t != l && "visible" != m(t).css("overflow")) {
                var c = m(t).offset();
                c.left += t.clientLeft, c.top += t.clientTop, a.top = Math.max(a.top, c.top), a.right = Math.min(a.right, c.left + t.clientWidth), a.bottom = Math.min(a.bottom, c.top + t.clientHeight), a.left = Math.max(a.left, c.left)
            }
        return n = m(y).scrollLeft(), r = m(y).scrollTop(), a.left = Math.max(a.left, n), a.top = Math.max(a.top, r), o = {
            width: PFUI.viewportWidth(),
            height: PFUI.viewportHeight()
        }, a.right = Math.min(a.right, n + o.width), a.bottom = Math.min(a.bottom, r + o.height), a.top >= 0 && a.left >= 0 && a.bottom > a.top && a.right > a.left ? a : null
    }

    function o(e, t, n, i) {
        var r, o, a, s;
        return r = {
            left: e.left,
            top: e.top
        }, a = h(t, n[0]), s = h(e, n[1]), o = [s.left - a.left, s.top - a.top], {
            left: r.left - o[0] + +i[0],
            top: r.top - o[1] + +i[1]
        }
    }

    function a(e, t, n) {
        return e.left < n.left || e.left + t.width > n.right
    }

    function s(e, t, n) {
        return e.top < n.top || e.top + t.height > n.bottom
    }

    function u(e, t, n, i) {
        var r = PFUI.cloneObject(e),
            o = {
                width: t.width,
                height: t.height
            };
        return i.adjustX && r.left < n.left && (r.left = n.left), i.resizeWidth && r.left >= n.left && r.left + o.width > n.right && (o.width -= r.left + o.width - n.right), i.adjustX && r.left + o.width > n.right && (r.left = Math.max(n.right - o.width, n.left)), i.adjustY && r.top < n.top && (r.top = n.top), i.resizeHeight && r.top >= n.top && r.top + o.height > n.bottom && (o.height -= r.top + o.height - n.bottom), i.adjustY && r.top + o.height > n.bottom && (r.top = Math.max(n.bottom - o.height, n.top)), PFUI.mix(r, o)
    }

    function l(e, t, n) {
        var i = [];
        return m.each(e, function(e, r) {
            i.push(r.replace(t, function(e) {
                return n[e]
            }))
        }), i
    }

    function c(e, t) {
        return e[t] = -e[t], e
    }

    function d() {}

    function f(e) {
        var t, n, i;
        return e.length && !m.isWindow(e[0]) ? (t = e.offset(), n = e.outerWidth(), i = e.outerHeight()) : (t = {
            left: PFUI.scrollLeft(),
            top: PFUI.scrollTop()
        }, n = PFUI.viewportWidth(), i = PFUI.viewportHeight()), t.width = n, t.height = i, t
    }

    function h(e, t) {
        var n, i, r = t.charAt(0),
            o = t.charAt(1),
            a = e.width,
            s = e.height;
        return n = e.left, i = e.top, "c" === r ? i += s / 2 : "b" === r && (i += s), "c" === o ? n += a / 2 : "r" === o && (n += a), {
            left: n,
            top: i
        }
    }

    function g(e) {
        var t = e.attr("class"),
            n = new RegExp("s?" + p + "[a-z]{2}-[a-z]{2}", "ig"),
            i = n.exec(t);
        i && e.removeClass(i.join(" "))
    }
    var m = e("jquery"),
        v = e("pfui/common/ua"),
        p = "x-align-",
        y = window;
    d.__getOffsetParent = i, d.__getVisibleRectForElement = r, d.ATTRS = {
        align: {
            shared: !1,
            value: {}
        }
    }, d.prototype = {
        _uiSetAlign: function(e) {
            var t, n, i = "";
            e && e.points && (this.align(e.node, e.points, e.offset, e.overflow), this.set("cachePosition", null), t = this.get("el"), g(t), n = e.points.join("-"), i = p + n, t.addClass(i))
        },
        __bindUI: function() {
            var e = this,
                t = PFUI.wrapBehavior(e, "handleWindowResize");
            e.on("show", function() {
                m(window).on("resize", t)
            }), e.on("hide", function() {
                m(window).off("resize", t)
            })
        },
        handleWindowResize: function() {
            var e = this,
                t = e.get("align");
            e.set("align", t)
        },
        align: function(e, t, n, i) {
            e = m(e || y), n = n && [].concat(n) || [0, 0], i = i || {};
            var d = this,
                h = d.get("el"),
                g = 0,
                v = r(h[0]),
                p = f(h),
                b = f(e),
                I = o(p, b, t, n),
                w = PFUI.merge(p, I);
            if (v && (i.adjustX || i.adjustY)) {
                a(I, p, v) && (g = 1, t = l(t, /[lr]/gi, {
                    l: "r",
                    r: "l"
                }), n = c(n, 0)), s(I, p, v) && (g = 1, t = l(t, /[tb]/gi, {
                    t: "b",
                    b: "t"
                }), n = c(n, 1)), g && (I = o(p, b, t, n), PFUI.mix(w, I));
                var C = {};
                C.adjustX = i.adjustX && a(I, p, v), C.adjustY = i.adjustY && s(I, p, v), (C.adjustX || C.adjustY) && (w = u(I, p, v, C))
            }
            return w.left != p.left && (d.setInternal("x", null), d.get("view").setInternal("x", null), d.set("x", w.left)), w.top != p.top && (d.setInternal("y", null), d.get("view").setInternal("y", null), d.set("y", w.top)), w.width != p.width && h.width(h.width() + w.width - p.width), w.height != p.height && h.height(h.height() + w.height - p.height), d
        },
        center: function(e) {
            var t = this;
            return t.set("align", {
                node: e,
                points: ["cc", "cc"],
                offset: [0, 0]
            }), t
        }
    }, n.exports = d
}), define("pfui/common/component/uibase/autoshow", ["jquery"], function(e, t, n) {
    function i() {}
    var r = e("jquery");
    i.ATTRS = {
        trigger: {},
        delegateTigger: {
            getter: function() {
                this.get("delegateTrigger")
            },
            setter: function(e) {
                this.set("delegateTrigger", e)
            }
        },
        delegateTrigger: {
            value: !1
        },
        autoAlign: {
            value: !0
        },
        autoFocused: {
            value: !0
        },
        triggerActiveCls: {},
        curTrigger: {},
        triggerCallback: {},
        triggerEvent: {
            value: "click"
        },
        triggerHideEvent: {},
        events: {
            value: {
                triggerchange: !1
            }
        }
    }, i.prototype = {
        __createDom: function() {
            this._setTrigger()
        },
        __bindUI: function() {
            var e = this,
                t = e.get("triggerActiveCls");
            t && e.on("hide", function() {
                var n = e.get("curTrigger");
                n && n.removeClass(t)
            })
        },
        _setTrigger: function() {
            function e(e) {
                if (!n.get("disabled")) {
                    var t = n.get("curTrigger"),
                        i = r(l ? e.currentTarget : this),
                        o = n.get("align");
                    t && t[0] == i[0] || (t && t.removeClass(s), n.set("curTrigger", i), n.fire("triggerchange", {
                        prevTrigger: t,
                        curTrigger: i
                    })), i.addClass(s), n.get("autoAlign") && (o.node = i), n.set("align", o), n.show(), a && a(e)
                }
            }

            function t(e) {
                var t = e.toElement || e.relatedTarget;
                t && n.containsElement(t) || n.hide()
            }
            var n = this,
                i = n.get("triggerEvent"),
                o = n.get("triggerHideEvent"),
                a = n.get("triggerCallback"),
                s = n.get("triggerActiveCls") || "",
                u = n.get("trigger"),
                l = n.get("delegateTrigger"),
                c = r(u);
            i && (l && PFUI.isString(u) ? r(document).delegate(u, i, e) : c.on(i, e)), o && (l && PFUI.isString(u) ? r(document).delegate(u, o, t) : c.on(o, t))
        },
        __renderUI: function() {
            var e = this,
                t = e.get("align");
            t && !t.node && (t.node = e.get("render") || e.get("trigger"))
        }
    }, n.exports = i
}), define("pfui/common/component/uibase/autohide", ["jquery"], function(e, t, n) {
    function i(e, t) {
        var n = e.get("hideExceptNode");
        return n && n.length ? o.contains(n[0], t) : !1
    }

    function r() {}
    var o = e("jquery"),
        a = PFUI.wrapBehavior,
        s = PFUI.getWrapBehavior;
    r.ATTRS = {
        autoHideType: {
            value: "click"
        },
        autoHide: {
            value: !1
        },
        hideExceptNode: {},
        events: {
            value: {
                autohide: !1
            }
        }
    }, r.prototype = {
        __bindUI: function() {
            var e = this;
            e.on("afterVisibleChange", function(t) {
                var n = t.newVal;
                e.get("autoHide") && (n ? e._bindHideEvent() : e._clearHideEvent())
            })
        },
        handleMoveOuter: function(e) {
            var t = this,
                n = e.toElement || e.relatedTarget;
            t.containsElement(n) || i(t, n) || t.fire("autohide") !== !1 && t.hide()
        },
        handleDocumentClick: function(e) {
            var t = this,
                n = e.target;
            t.containsElement(n) || i(t, n) || t.fire("autohide") !== !1 && t.hide()
        },
        _bindHideEvent: function() {
            var e = this,
                t = e.get("curTrigger"),
                n = e.get("autoHideType");
            "click" === n ? o(document).on("mousedown", a(e, "handleDocumentClick")) : (e.get("el").on("mouseleave", a(e, "handleMoveOuter")), t && o(t).on("mouseleave", a(e, "handleMoveOuter")))
        },
        _clearHideEvent: function() {
            var e = this,
                t = e.get("curTrigger"),
                n = e.get("autoHideType");
            "click" === n ? o(document).off("mousedown", s(e, "handleDocumentClick")) : (e.get("el").off("mouseleave", s(e, "handleMoveOuter")), t && o(t).off("mouseleave", s(e, "handleMoveOuter")))
        }
    }, n.exports = r
}), define("pfui/common/component/uibase/close", ["jquery"], function(e, t, n) {
    function i(e) {
        return a(e.get("closeTpl"))
    }

    function r() {}

    function o() {}
    var a = e("jquery"),
        s = PFUI.prefix + "ext-";
    r.ATTRS = {
        closeTpl: {
            value: '<a tabindex="0" href=\'javascript:void()\' role="button" class="' + s + 'close"><span class="' + s + 'close-x">close</span></a>'
        },
        closeable: {
            value: !0
        },
        closeBtn: {}
    }, r.prototype = {
        _uiSetCloseable: function(e) {
            var t = this,
                n = t.get("closeBtn");
            e ? (n || t.setInternal("closeBtn", n = i(t)), n.appendTo(t.get("el"), void 0)) : n && n.remove()
        }
    };
    var u = "hide";
    o.ATTRS = {
        closeTpl: {
            view: !0
        },
        closeable: {
            view: 1
        },
        closeBtn: {
            view: 1
        },
        closeAction: {
            value: u
        }
    };
    var l = {
        hide: u,
        destroy: "destroy",
        remove: "remove"
    };
    o.prototype = {
        _uiSetCloseable: function(e) {
            var t = this;
            e && !t.__bindCloseEvent && (t.__bindCloseEvent = 1, t.get("closeBtn").on("click", function(e) {
                t.fire("closeclick", {
                    domTarget: e.target
                }) !== !1 && t.close(), e.preventDefault()
            }))
        },
        __destructor: function() {
            var e = this.get("closeBtn");
            e && e.detach()
        },
        close: function() {
            var e = this,
                t = l[e.get("closeAction") || u];
            e.fire("closing", {
                action: t
            }) !== !1 && (e.fire("beforeclosed", {
                action: t
            }), "remove" == t ? e[t](!0) : e[t](), e.fire("closed", {
                action: t
            }))
        }
    }, o.View = r, n.exports = o
}), define("pfui/common/component/uibase/collapsable", [], function(e, t, n) {
    var i = function() {};
    i.ATTRS = {
        collapsed: {}
    }, i.prototype = {
        _uiSetCollapsed: function(e) {
            var t = this,
                n = t.getStatusCls("collapsed"),
                i = t.get("el");
            e ? i.addClass(n) : i.removeClass(n)
        }
    };
    var r = function() {};
    r.ATTRS = {
        collapsable: {
            value: !1
        },
        collapsed: {
            view: !0,
            value: !1
        },
        events: {
            value: {
                expanded: !0,
                collapsed: !0
            }
        }
    }, r.prototype = {
        _uiSetCollapsed: function(e) {
            var t = this;
            t.fire(e ? "collapsed" : "expanded")
        }
    }, r.View = i, n.exports = r
}), define("pfui/common/component/uibase/drag", ["jquery"], function(e, t, n) {
    function i() {
        var e = r(s).css("opacity", 0).prependTo("body");
        return e
    }
    var r = e("jquery"),
        o = PFUI.guid("drag"),
        a = function() {};
    a.ATTRS = {
        dragNode: {},
        draging: {
            setter: function(e) {
                return e === !0 ? {} : void 0
            },
            value: null
        },
        constraint: {},
        dragBackEl: {
            getter: function() {
                return r("#" + o)
            }
        }
    };
    var s = '<div id="' + o + '" style="background-color: red; position: fixed; left: 0px; width: 100%; height: 100%; top: 0px; cursor: move; z-index: 999999; display: none; "></div>';
    a.prototype = {
        __bindUI: function() {
            function e(e) {
                var t = o.get("draging");
                t && (e.preventDefault(), o._dragMoveTo(e.pageX, e.pageY, t, a))
            }

            function t(e) {
                if (1 == e.which) {
                    o.set("draging", !1);
                    var t = o.get("dragBackEl");
                    t && t.hide(), i()
                }
            }

            function n() {
                r(document).on("mousemove", e), r(document).on("mouseup", t)
            }

            function i() {
                r(document).off("mousemove", e), r(document).off("mouseup", t)
            }
            var o = this,
                a = o.get("constraint"),
                s = o.get("dragNode");
            s && s.on("mousedown", function(e) {
                1 == e.which && (e.preventDefault(), o.set("draging", {
                    elX: o.get("x"),
                    elY: o.get("y"),
                    startX: e.pageX,
                    startY: e.pageY
                }), n())
            })
        },
        _dragMoveTo: function(e, t, n, r) {
            var o = this,
                a = o.get("dragBackEl"),
                n = n || o.get("draging"),
                s = n.startX - e,
                u = n.startY - t;
            a.length || (a = i()), a.css({
                cursor: "move",
                display: "block"
            }), o.set("xy", [o._getConstrainX(n.elX - s, r), o._getConstrainY(n.elY - u, r)])
        },
        _getConstrainX: function(e, t) {
            var n = this,
                i = n.get("el").outerWidth(),
                r = e + i,
                o = n.get("x");
            if (t) {
                var a = t.offset();
                return a.left >= e ? a.left : a.left + t.width() < r ? a.left + t.width() - i : e
            }
            return PFUI.isInHorizontalView(e) && PFUI.isInHorizontalView(r) ? e : o
        },
        _getConstrainY: function(e, t) {
            var n = this,
                i = n.get("el").outerHeight(),
                r = e + i,
                o = n.get("y");
            if (t) {
                var a = t.offset();
                return a.top > e ? a.top : a.top + t.height() < r ? a.top + t.height() - i : e
            }
            return PFUI.isInVerticalView(e) && PFUI.isInVerticalView(r) ? e : o
        }
    }, n.exports = a
}), define("pfui/common/component/uibase/keynav", ["jquery"], function(e, t, n) {
    var i = e("jquery"),
        r = e("pfui/common/keycode"),
        o = PFUI.wrapBehavior,
        a = PFUI.getWrapBehavior,
        s = function() {};
    s.ATTRS = {
        allowKeyNav: {
            value: !0
        },
        navEvent: {
            value: "keydown"
        },
        ignoreInputFields: {
            value: !0
        }
    }, s.prototype = {
        __bindUI: function() {},
        _uiSetAllowKeyNav: function(e) {
            var t = this,
                n = t.get("navEvent"),
                i = t.get("el");
            e ? i.on(n, o(t, "_handleKeyDown")) : i.off(n, a(t, "_handleKeyDown"))
        },
        _handleKeyDown: function(e) {
            var t = this,
                n = t.get("ignoreInputFields"),
                o = e.which;
            if (!n || !i(e.target).is("input,select,textarea")) switch (o) {
                case r.UP:
                    t.handleNavUp(e);
                    break;
                case r.DOWN:
                    t.handleNavDown(e);
                    break;
                case r.RIGHT:
                    t.handleNavRight(e);
                    break;
                case r.LEFT:
                    t.handleNavLeft(e);
                    break;
                case r.ENTER:
                    t.handleNavEnter(e);
                    break;
                case r.ESC:
                    t.handleNavEsc(e);
                    break;
                case r.TAB:
                    t.handleNavTab(e)
            }
        },
        handleNavUp: function() {},
        handleNavDown: function() {},
        handleNavLeft: function() {},
        handleNavRight: function() {},
        handleNavEnter: function() {},
        handleNavEsc: function() {},
        handleNavTab: function() {}
    }, n.exports = s
}), define("pfui/common/component/uibase/list", ["jquery"], function(e, t, n) {
    function i(e, t) {
        var n = t.isController ? t.getAttrVals() : t,
            i = e.get("itemTpl"),
            o = e.get("itemStatusCls"),
            a = e.get("itemTplRender");
        if (i && !n.tpl && r(t, "tpl", i), a && !n.tplRender && r(t, "tplRender", a), o) {
            var s = n.statusCls || t.isController ? t.get("statusCls") : {};
            PFUI.each(o, function(e, t) {
                e && !s[t] && (s[t] = e)
            }), r(t, "statusCls", s)
        }
    }

    function r(e, t, n) {
        e.isController ? e.set(t, n) : e[t] = n
    }
    var o = e("jquery"),
        a = e("pfui/common/component/uibase/selection"),
        s = function() {};
    s.ATTRS = {
        items: {
            shared: !1,
            view: !0
        },
        idField: {
            value: "id"
        },
        itemTpl: {
            view: !0
        },
        itemTplRender: {
            view: !0
        },
        itemStatusCls: {
            view: !0,
            value: {}
        },
        events: {
            value: {
                itemclick: !0
            }
        }
    }, s.prototype = {
        getItemCount: function() {
            return this.getItems().length
        },
        getValueByField: function() {},
        getItems: function() {},
        getFirstItem: function() {
            return this.getItemAt(0)
        },
        getLastItem: function() {
            return this.getItemAt(this.getItemCount() - 1)
        },
        getItemAt: function(e) {
            return this.getItems()[e] || null
        },
        getItem: function(e) {
            var t = this.get("idField");
            return this.findItemByField(t, e)
        },
        indexOfItem: function(e) {
            return PFUI.Array.indexOf(e, this.getItems())
        },
        addItems: function(e) {
            var t = this;
            PFUI.each(e, function(e) {
                t.addItem(e)
            })
        },
        addItemsAt: function(e, t) {
            var n = this;
            PFUI.each(e, function(e, i) {
                n.addItemAt(e, t + i)
            })
        },
        updateItem: function() {},
        addItem: function(e) {
            return this.addItemAt(e, this.getItemCount())
        },
        addItemAt: function() {},
        findItemByField: function() {},
        getItemText: function() {},
        clearItems: function() {
            var e = this,
                t = e.getItems();
            t.splice(0), e.clearControl()
        },
        removeItem: function() {},
        removeItems: function(e) {
            var t = this;
            PFUI.each(e, function(e) {
                t.removeItem(e)
            })
        },
        removeItemAt: function(e) {
            this.removeItem(this.getItemAt(e))
        },
        clearControl: function() {}
    };
    var u = function() {
        this.__init()
    };
    u.ATTRS = PFUI.merge(!0, s.ATTRS, a.ATTRS, {
        items: {
            sync: !1
        },
        autoInitItems: {
            value: !0
        },
        isDecorateChild: {
            value: !0
        },
        defaultLoaderCfg: {
            value: {
                property: "children",
                dataType: "json"
            }
        }
    }), PFUI.augment(u, s, a, {
        __init: function() {
            var e = this,
                t = e.get("items");
            t && e.get("autoInitItems") && e.addItems(t), e.on("beforeRenderUI", function() {
                e._beforeRenderUI()
            })
        },
        _uiSetItems: function(e) {
            var t = this;
            t.clearControl(), t.addItems(e)
        },
        _beforeRenderUI: function() {
            {
                var e = this,
                    t = e.get("children");
                e.get("items")
            }
            PFUI.each(t, function(t) {
                i(e, t)
            })
        },
        __bindUI: function() {
            var e = this,
                t = e.get("selectedEvent");
            e.on(t, function(t) {
                var n = t.target;
                n.get("selectable") && (n.get("selected") ? e.get("multipleSelect") && e.clearSelected(n) : e.setSelected(n))
            }), e.on("click", function(t) {
                t.target !== e && e.fire("itemclick", {
                    item: t.target,
                    domTarget: t.domTarget,
                    domEvent: t
                })
            }), e.on("beforeAddChild", function(t) {
                i(e, t.child)
            }), e.on("beforeRemoveChild", function(t) {
                var n = t.child,
                    i = n.get("selected");
                i && (e.get("multipleSelect") ? e.clearSelected(n) : e.setSelected(null)), n.set("selected", !1)
            })
        },
        clearControl: function() {
            this.removeChildren(!0)
        },
        getItems: function() {
            return this.get("children")
        },
        updateItem: function(e) {
            var t = this,
                n = t.get("idField"),
                i = t.findItemByField(n, e[n]);
            return i && i.setTplContent(), i
        },
        removeItem: function(e) {
            var t = this,
                n = t.get("idField");
            e instanceof PFUI.Component.Controller || (e = t.findItemByField(n, e[n])), this.removeChild(e, !0)
        },
        addItemAt: function(e, t) {
            return this.addChild(e, t)
        },
        findItemByField: function(e, t, n) {
            n = n || this;
            var i = this,
                r = n.get("children"),
                a = null;
            return o(r).each(function(n, r) {
                return r.get(e) == t ? a = r : r.get("children").length && (a = i.findItemByField(e, t, r)), a ? !1 : void 0
            }), a
        },
        getItemText: function(e) {
            return e.get("el").text()
        },
        getValueByField: function(e, t) {
            return e && e.get(t)
        },
        setItemSelectedStatus: function(e, t) {
            var n = this,
                i = null;
            e && (e.set("selected", t), i = e.get("el")), n.afterSelected(e, t, i)
        },
        isItemSelected: function(e) {
            return e ? e.get("selected") : !1
        },
        setAllSelection: function() {
            var e = this,
                t = e.getItems();
            e.setSelection(t)
        },
        getSelection: function() {
            var e = this,
                t = e.getItems(),
                n = [];
            return PFUI.each(t, function(t) {
                e.isItemSelected(t) && n.push(t)
            }), n
        }
    }), s.ChildList = u, n.exports = s
}), define("pfui/common/component/uibase/selection", ["jquery"], function(e, t, n) {
    var i = e("jquery"),
        r = function() {};
    r.ATTRS = {
        selectedEvent: {
            value: "click"
        },
        events: {
            value: {
                selectedchange: !1,
                beforeselectedchange: !1,
                itemselected: !1,
                itemunselected: !1
            }
        },
        idField: {
            value: "id"
        },
        multipleSelect: {
            value: !1
        }
    }, r.prototype = {
        clearSelection: function() {
            var e = this,
                t = e.getSelection();
            PFUI.each(t, function(t) {
                e.clearSelected(t)
            })
        },
        getSelection: function() {},
        getSelected: function() {
            return this.getSelection()[0]
        },
        getSelectedValue: function() {
            var e = this,
                t = e.get("idField"),
                n = e.getSelected();
            return e.getValueByField(n, t)
        },
        getSelectionValues: function() {
            var e = this,
                t = e.get("idField"),
                n = e.getSelection();
            return i.map(n, function(n) {
                return e.getValueByField(n, t)
            })
        },
        getSelectionText: function() {
            var e = this,
                t = e.getSelection();
            return i.map(t, function(t) {
                return e.getItemText(t)
            })
        },
        clearSelected: function(e) {
            var t = this;
            e = e || t.getSelected(), e && t.setItemSelected(e, !1)
        },
        getSelectedText: function() {
            var e = this,
                t = e.getSelected();
            return e.getItemText(t)
        },
        setSelection: function(e) {
            var t = this;
            e = PFUI.isArray(e) ? e : [e], PFUI.each(e, function(e) {
                t.setSelected(e)
            })
        },
        setSelected: function(e) {
            var t = this,
                n = t.get("multipleSelect");
            if (t.isItemSelectable(e)) {
                if (!n) {
                    var i = t.getSelected();
                    e != i && t.clearSelected(i)
                }
                t.setItemSelected(e, !0)
            }
        },
        isItemSelected: function() {},
        isItemSelectable: function() {
            return !0
        },
        setItemSelected: function(e, t) {
            var n, i = this;
            e && (n = i.isItemSelected(e), n == t) || i.fire("beforeselectedchange", {
                item: e,
                selected: t
            }) !== !1 && i.setItemSelectedStatus(e, t)
        },
        setItemSelectedStatus: function() {},
        setAllSelection: function() {},
        setSelectedByField: function(e, t) {
            t || (t = e, e = this.get("idField"));
            var n = this,
                i = n.findItemByField(e, t);
            n.setSelected(i)
        },
        setSelectionByField: function(e, t) {
            t || (t = e, e = this.get("idField"));
            var n = this;
            PFUI.each(t, function(t) {
                n.setSelectedByField(e, t)
            })
        },
        afterSelected: function(e, t, n) {
            var i = this;
            t ? (i.fire("itemselected", {
                item: e,
                domTarget: n
            }), i.fire("selectedchange", {
                item: e,
                domTarget: n,
                selected: t
            })) : (i.fire("itemunselected", {
                item: e,
                domTarget: n
            }), i.get("multipleSelect") && i.fire("selectedchange", {
                item: e,
                domTarget: n,
                selected: t
            }))
        }
    }, n.exports = r
}), define("pfui/common/component/uibase/listitem", [], function(e, t, n) {
    function i() {}

    function r() {}
    i.ATTRS = {
        selected: {}
    }, i.prototype = {
        _uiSetSelected: function(e) {
            var t = this,
                n = t.getStatusCls("selected"),
                i = t.get("el");
            e ? i.addClass(n) : i.removeClass(n)
        }
    }, r.ATTRS = {
        selectable: {
            value: !0
        },
        selected: {
            view: !0,
            sync: !1,
            value: !1
        }
    }, r.prototype = {}, r.View = i, n.exports = r
}), define("pfui/common/component/uibase/mask", ["jquery"], function(e, t, n) {
    function i(e) {
        return e.get("prefixCls") + "ext-mask"
    }

    function r() {
        return f ? PFUI.docWidth() + "px" : "100%"
    }

    function o() {
        return f ? PFUI.docHeight() + "px" : "100%"
    }

    function a(e) {
        var t = l('<div  style="width:' + r() + ";left:0;top:0;height:" + o() + ";position:" + (f ? "absolute" : "fixed") + ';" class="' + e + '">' + (f ? '<iframe style="position:absolute;left:0;top:0;background:white;width: expression(this.parentNode.offsetWidth);height: expression(this.parentNode.offsetHeight);filter:alpha(opacity=0);z-index:-1;"></iframe>' : "") + "</div>").prependTo("body");
        return t.on("mousedown", function(e) {
            e.preventDefault()
        }), t
    }

    function s() {}

    function u() {}
    var l = e("jquery"),
        c = e("pfui/common/ua"),
        d = {},
        f = 6 == c.ie;
    s.ATTRS = {
        maskShared: {
            value: !0
        }
    }, s.prototype = {
        _maskExtShow: function() {
            var e, t = this,
                n = i(t),
                r = d[n],
                o = t.get("maskShared"),
                s = t.get("maskNode");
            s || (o ? r ? s = r.node : (s = a(n), r = d[n] = {
                num: 0,
                node: s
            }) : s = a(n), t.setInternal("maskNode", s)), (e = t.get("zIndex")) && s.css("z-index", e - 1), o && r.num++, o && 1 != r.num || s.show(), l("body").addClass("x-masked-relative")
        },
        _maskExtHide: function() {
            var e = this,
                t = i(e),
                n = d[t],
                r = e.get("maskShared"),
                o = e.get("maskNode");
            r && n ? (n.num = Math.max(n.num - 1, 0), 0 == n.num && o.hide()) : o && o.hide(), l("body").removeClass("x-masked-relative")
        },
        __destructor: function() {
            var e = this,
                t = e.get("maskShared"),
                n = e.get("maskNode");
            e.get("maskNode") && (t ? e.get("visible") && e._maskExtHide() : n.remove())
        }
    }, u.ATTRS = {
        mask: {
            value: !1
        },
        maskNode: {
            view: 1
        },
        maskShared: {
            view: 1
        }
    }, u.prototype = {
        __bindUI: function() {
            {
                var e = this,
                    t = e.get("view");
                t._maskExtShow, t._maskExtHide
            }
            e.get("mask") && (e.on("show", function() {
                t._maskExtShow()
            }), e.on("hide", function() {
                t._maskExtHide()
            }))
        }
    }, u = u, u.View = s, n.exports = u
}), define("pfui/common/component/uibase/position", ["jquery"], function(e, t, n) {
    function i() {}

    function r() {}
    var o = e("jquery");
    i.ATTRS = {
        x: {
            valueFn: function() {
                var e = this;
                return e.get("el") && e.get("el").offset().left
            }
        },
        y: {
            valueFn: function() {
                var e = this;
                return e.get("el") && e.get("el").offset().top
            }
        },
        zIndex: {},
        visibleMode: {
            value: "visibility"
        }
    }, i.prototype = {
        __createDom: function() {
            this.get("el").addClass(PFUI.prefix + "ext-position")
        },
        _uiSetZIndex: function(e) {
            this.get("el").css("z-index", e)
        },
        _uiSetX: function(e) {
            null != e && this.get("el").offset({
                left: e
            })
        },
        _uiSetY: function(e) {
            null != e && this.get("el").offset({
                top: e
            })
        },
        _uiSetLeft: function(e) {
            null != e && this.get("el").css({
                left: e
            })
        },
        _uiSetTop: function(e) {
            null != e && this.get("el").css({
                top: e
            })
        }
    }, r.ATTRS = {
        x: {
            view: 1
        },
        y: {
            view: 1
        },
        left: {
            view: 1
        },
        top: {
            view: 1
        },
        xy: {
            setter: function(e) {
                var t = this,
                    n = o.makeArray(e);
                return n.length && (n[0] && t.set("x", n[0]), n[1] && t.set("y", n[1])), e
            },
            getter: function() {
                return [this.get("x"), this.get("y")]
            }
        },
        zIndex: {
            view: 1
        },
        visible: {
            view: !0,
            value: !0
        }
    }, r.prototype = {
        move: function(e, t) {
            var n = this;
            return PFUI.isArray(e) && (t = e[1], e = e[0]), n.set("xy", [e, t]), n
        },
        _uiSetX: function(e) {
            if (null != e) {
                var t = this,
                    n = t.get("el");
                t.setInternal("left", n.position().left), -999 != e && this.set("cachePosition", null)
            }
        },
        _uiSetY: function(e) {
            if (null != e) {
                var t = this,
                    n = t.get("el");
                t.setInternal("top", n.position().top), -999 != e && this.set("cachePosition", null)
            }
        },
        _uiSetLeft: function(e) {
            var t = this,
                n = t.get("el");
            null != e && t.setInternal("x", n.offset().left)
        },
        _uiSetTop: function(e) {
            var t = this,
                n = t.get("el");
            null != e && t.setInternal("y", n.offset().top)
        }
    }, r.View = i, n.exports = r
}), define("pfui/common/component/uibase/stdmod", ["jquery"], function(e, t, n) {
    function i() {}

    function r(e, t) {
        var n = e.get("contentEl"),
            i = e.get(t);
        i || (i = s('<div class="' + u + t + '"  ></div>'), i.appendTo(n), e.setInternal(t, i))
    }

    function o(e, t, n) {
        t = e.get(t), PFUI.isString(n) ? t.html(n) : t.html("").append(n)
    }

    function a() {}
    var s = e("jquery"),
        u = PFUI.prefix + "stdmod-";
    i.ATTRS = {
        header: {},
        body: {},
        footer: {},
        bodyStyle: {},
        footerStyle: {},
        headerStyle: {},
        headerContent: {},
        bodyContent: {},
        footerContent: {}
    }, i.PARSER = {
        header: function(e) {
            return e.one("." + u + "header")
        },
        body: function(e) {
            return e.one("." + u + "body")
        },
        footer: function(e) {
            return e.one("." + u + "footer")
        }
    }, i.prototype = {
        __renderUI: function() {
            r(this, "header"), r(this, "body"), r(this, "footer")
        },
        _uiSetBodyStyle: function(e) {
            this.get("body").css(e)
        },
        _uiSetHeaderStyle: function(e) {
            this.get("header").css(e)
        },
        _uiSetFooterStyle: function(e) {
            this.get("footer").css(e)
        },
        _uiSetBodyContent: function(e) {
            o(this, "body", e)
        },
        _uiSetHeaderContent: function(e) {
            o(this, "header", e)
        },
        _uiSetFooterContent: function(e) {
            o(this, "footer", e)
        }
    }, a.ATTRS = {
        header: {
            view: 1
        },
        body: {
            view: 1
        },
        footer: {
            view: 1
        },
        bodyStyle: {
            view: 1
        },
        footerStyle: {
            view: 1
        },
        headerStyle: {
            view: 1
        },
        headerContent: {
            view: 1
        },
        bodyContent: {
            view: 1
        },
        footerContent: {
            view: 1
        }
    }, a.View = i, n.exports = a
}), define("pfui/common/component/uibase/decorate", ["jquery"], function(e, t, n) {
    function i(e, t) {
        if (t[e]) return !0;
        var n = new RegExp("^" + m);
        return e !== v && n.test(e) ? !0 : !1
    }

    function r(e) {
        for (var t = [], n = e.constructor; n;) t.push(n), n = n.superclass && n.superclass.constructor;
        return t
    }

    function o(e) {
        return e.toLowerCase().replace(b, function(e, t) {
            return (t + "").toUpperCase()
        })
    }

    function a(e) {
        if (e = f.trim(e), "false" === e.toLowerCase()) e = !1;
        else if ("true" === e.toLowerCase()) e = !0;
        else if (I.test(e)) e = h.looseParse(e);
        else if (/\d/.test(e) && /[^a-z]/i.test(e)) {
            var t = parseFloat(e);
            t + "" === e && (e = t)
        }
        return e
    }

    function s(e, t) {
        var n = e.userConfig || {};
        for (var i in t) i in n || e.setInternal(i, t[i])
    }

    function u(e, t) {
        var n, i, r = this,
            o = r.userConfig || {};
        for (n in t) n in o || (i = t[n], PFUI.isFunction(i) ? r.setInternal(n, i.call(r, e)) : "string" == typeof i ? r.setInternal(n, e.find(i)) : PFUI.isArray(i) && i[0] && r.setInternal(n, e.find(i[0])))
    }

    function l(e, t) {
        var n, i, o, a = e.constructor;
        for (o = r(e), n = o.length - 1; n >= 0; n--) a = o[n], (i = a[p]) && u.call(e, t, i)
    }

    function c(e) {
        var t, n, i = e,
            r = i.get("srcNode");
        r && (r = f(r), i.setInternal("el", r), i.setInternal("srcNode", r), t = i.get("userConfig"), n = i.getDecorateConfig(r), s(e, n), i.get("isDecorateChild") && i.decorateInternal && i.decorateInternal(r), l(e, r))
    }

    function d() {
        c(this)
    }
    var f = e("jquery"),
        h = (e("pfui/common/array"), e("pfui/common/json")),
        g = PFUI.prefix,
        m = "data-",
        v = m + "cfg",
        p = "PARSER",
        y = e("pfui/common/component/manage"),
        b = /-([a-z])/g,
        I = /^[\{\[]/;
    d.ATTRS = {
        srcNode: {
            view: !0
        },
        isDecorateChild: {
            value: !1
        },
        decorateCfgFields: {
            value: {
                id: !0,
                name: !0,
                value: !0,
                title: !0
            }
        }
    }, d.prototype = {
        getDecorateConfig: function(e) {
            if (!e.length) return null;
            var t = this,
                n = e[0],
                r = n.attributes,
                s = t.get("decorateCfgFields"),
                u = {},
                l = t._getStautsCfg(e);
            return PFUI.each(r, function(e) {
                var t = e.nodeName;
                try {
                    if (t === v) {
                        var n = a(e.nodeValue);
                        PFUI.mix(u, n)
                    } else if (i(t, s)) {
                        var r = e.nodeValue; - 1 !== t.indexOf(m) && (t = t.replace(m, ""), t = o(t), r = a(r)), u[t] && PFUI.isObject(r) ? PFUI.mix(u[t], r) : u[t] = r
                    }
                } catch (l) {
                    PFUI.log("parse field error,the attribute is:" + t)
                }
            }), PFUI.mix(u, l)
        },
        _getStautsCfg: function(e) {
            var t = this,
                n = {},
                i = t.get("statusCls");
            return PFUI.each(i, function(t, i) {
                e.hasClass(t) && (n[i] = !0)
            }), n
        },
        getDecorateElments: function() {
            var e = this,
                t = e.get("el"),
                n = e.get("childContainer");
            return n ? t.find(n).children() : t.children()
        },
        decorateInternal: function(e) {
            var t = this;
            t.decorateChildren(e)
        },
        findXClassByNode: function(e, t) {
            var n = this,
                i = e.attr("class") || "",
                r = n.get("defaultChildClass");
            i = i.replace(new RegExp("\\b" + g, "ig"), "");
            var o = y.getConstructorByXClass(i) || y.getConstructorByXClass(r);
            return o || t || (PFUI.log(e), PFUI.error("can not find ui " + i + " from this markup")), y.getXClassByConstructor(o)
        },
        decorateChildrenInternal: function(e, t) {
            var n = this,
                i = n.get("children");
            i.push({
                xclass: e,
                srcNode: t
            })
        },
        decorateChildren: function() {
            var e = this,
                t = e.getDecorateElments();
            PFUI.each(t, function(t) {
                var n = e.findXClassByNode(f(t));
                e.decorateChildrenInternal(n, f(t))
            })
        }
    }, n.exports = d
}), define("pfui/common/component/uibase/tpl", ["jquery"], function(e, t, n) {
    function i() {}

    function r() {}
    e("jquery");
    i.ATTRS = {
        tpl: {},
        tplEl: {}
    }, i.prototype = {
        __renderUI: function() {
            var e, t = this,
                n = t.get("childContainer");
            n && (e = t.get("el").find(n), e.length && t.set("contentEl", e))
        },
        getTpl: function(e) {
            var t = this,
                n = t.get("tpl"),
                i = t.get("tplRender");
            return e = e || t.getAttrVals(), i ? i(e) : n ? PFUI.substitute(n, e) : ""
        },
        setTplContent: function(e) {
            var t = this,
                n = t.get("el"),
                i = t.get("content"),
                r = (t.get("tplEl"), t.getTpl(e));
            !i && r && (n.empty(), n.html(r))
        }
    }, r.ATTRS = {
        tpl: {
            view: !0,
            sync: !1
        },
        tplRender: {
            view: !0,
            value: null
        },
        childContainer: {
            view: !0
        }
    }, r.prototype = {
        __renderUI: function() {
            this.get("srcNode") || this.setTplContent()
        },
        updateContent: function() {
            this.setTplContent()
        },
        setTplContent: function() {
            var e = this,
                t = e.getAttrVals();
            e.get("view").setTplContent(t)
        },
        _uiSetTpl: function() {
            this.setTplContent()
        }
    }, r.View = i, n.exports = r
}), define("pfui/common/component/uibase/childcfg", ["jquery"], function(e, t, n) {
    var i = e("jquery"),
        r = function() {
            this._init()
        };
    r.ATTRS = {
        defaultChildCfg: {}
    }, r.prototype = {
        _init: function() {
            var e = this,
                t = e.get("defaultChildCfg");
            t && e.on("beforeAddChild", function(e) {
                var n = e.child;
                i.isPlainObject(n) && PFUI.each(t, function(e, t) {
                    null == n[t] && (n[t] = e)
                })
            })
        }
    }, n.exports = r
}), define("pfui/common/component/uibase/bindable", [], function(e, t, n) {
    function i() {}
    i.ATTRS = {
        store: {},
        loadMask: {
            value: !1
        }
    }, PFUI.augment(i, {
        __bindUI: function() {
            var e = this,
                t = e.get("store"),
                n = e.get("loadMask");
            t && (t.on("beforeload", function(t) {
                e.onBeforeLoad(t), n && n.show && n.show()
            }), t.on("load", function(t) {
                e.onLoad(t), n && n.hide && n.hide()
            }), t.on("exception", function(t) {
                e.onException(t), n && n.hide && n.hide()
            }), t.on("add", function(t) {
                e.onAdd(t)
            }), t.on("remove", function(t) {
                e.onRemove(t)
            }), t.on("update", function(t) {
                e.onUpdate(t)
            }), t.on("localsort", function(t) {
                e.onLocalSort(t)
            }), t.on("filtered", function(t) {
                e.onFiltered(t)
            }))
        },
        __syncUI: function() {
            var e = this,
                t = e.get("store");
            t && t.hasData() && e.onLoad()
        },
        onBeforeLoad: function() {},
        onLoad: function() {},
        onException: function() {},
        onAdd: function() {},
        onRemove: function() {},
        onUpdate: function() {},
        onLocalSort: function() {},
        onFiltered: function() {}
    }), n.exports = i
}), define("pfui/common/component/uibase/depends", ["jquery"], function(e, t, n) {
    function i(e) {
        var t = l.exec(e),
            n = t[1],
            i = t[2],
            r = a(n);
        return {
            source: r,
            eventType: i
        }
    }

    function r(e, t, n) {
        var r, o = i(t),
            a = o.source,
            s = o.eventType;
        return a && n && s && (PFUI.isFunction(n) ? r = n : PFUI.isArray(n) && (r = function() {
            PFUI.each(n, function(t) {
                e[t] && e[t]()
            })
        })), r ? (o.callbak = r, a.on(s, r), o) : null
    }

    function o(e) {
        var t = e.source,
            n = e.eventType,
            i = e.callbak;
        t.off(n, i)
    }

    function a(e) {
        var t = c.getComponent(e);
        return t || (t = u("#" + e), t.length || (t = null)), t
    }

    function s() {}
    var u = e("jquery"),
        l = /^#(.*):(.*)$/,
        c = e("pfui/common/component/manage");
    s.ATTRS = {
        depends: {},
        dependencesMap: {
            shared: !1,
            value: {}
        }
    }, s.prototype = {
        __syncUI: function() {
            this.initDependences()
        },
        initDependences: function() {
            var e = this,
                t = e.get("depends");
            PFUI.each(t, function(t, n) {
                e.addDependence(n, t)
            })
        },
        addDependence: function(e, t) {
            var n, i = this,
                o = i.get("dependencesMap");
            i.removeDependence(e), n = r(i, e, t), n && (o[e] = n)
        },
        removeDependence: function(e) {
            var t = this,
                n = t.get("dependencesMap"),
                i = n[e];
            i && (o(i), delete n[e])
        },
        clearDependences: function() {
            var e = this,
                t = e.get("dependencesMap");
            PFUI.each(t, function(e) {
                o(e)
            }), e.set("dependencesMap", {})
        },
        __destructor: function() {
            this.clearDependences()
        }
    }, n.exports = s
}), define("pfui/common/component/view", ["jquery"], function(e, t, n) {
    var i = e("jquery"),
        r = e("pfui/common/component/manage"),
        o = e("pfui/common/component/uibase/uibase"),
        a = document,
        s = o.extend([o.TplView], {
            getComponentCssClassWithState: function(e) {
                var t = this,
                    n = t.get("ksComponentCss");
                return e = e || "", t.getCssClassWithPrefix(n.split(/\s+/).join(e + " ") + e)
            },
            getCssClassWithPrefix: r.getCssClassWithPrefix,
            getKeyEventTarget: function() {
                return this.get("el")
            },
            getContentElement: function() {
                return this.get("contentEl") || this.get("el")
            },
            getStatusCls: function(e) {
                var t = this,
                    n = t.get("statusCls"),
                    i = n[e];
                return i || (i = t.getComponentCssClassWithState("-" + e)), i
            },
            renderUI: function() {
                var e = this;
                if (!e.get("srcNode")) {
                    var t = e.get("render"),
                        n = e.get("el"),
                        i = e.get("elBefore");
                    i ? n.insertBefore(i, void 0) : t ? n.appendTo(t, void 0) : n.appendTo(a.body, void 0)
                }
            },
            createDom: function() {
                var e = this,
                    t = e.get("contentEl"),
                    n = e.get("el");
                e.get("srcNode") || (n = i("<" + e.get("elTagName") + ">"), t && n.append(t), e.setInternal("el", n)), n.addClass(e.getComponentCssClassWithState()), t || e.setInternal("contentEl", n)
            },
            _uiSetHighlighted: function(e) {
                var t = this,
                    n = t.getStatusCls("hover"),
                    i = t.get("el");
                i[e ? "addClass" : "removeClass"](n)
            },
            _uiSetDisabled: function(e) {
                var t = this,
                    n = t.getStatusCls("disabled"),
                    i = t.get("el");
                i[e ? "addClass" : "removeClass"](n).attr("aria-disabled", e), e && t.get("highlighted") && t.set("highlighted", !1), t.get("focusable") && t.getKeyEventTarget().attr("tabIndex", e ? -1 : 0)
            },
            _uiSetActive: function(e) {
                var t = this,
                    n = t.getStatusCls("active");
                t.get("el")[e ? "addClass" : "removeClass"](n).attr("aria-pressed", !!e)
            },
            _uiSetFocused: function(e) {
                var t = this,
                    n = t.get("el"),
                    i = t.getStatusCls("focused");
                n[e ? "addClass" : "removeClass"](i)
            },
            _uiSetElAttrs: function(e) {
                this.get("el").attr(e)
            },
            _uiSetElCls: function(e) {
                this.get("el").addClass(e)
            },
            _uiSetElStyle: function(e) {
                this.get("el").css(e)
            },
            _uiSetRole: function(e) {
                e && this.get("el").attr("role", e)
            },
            _uiSetWidth: function(e) {
                this.get("el").width(e)
            },
            _uiSetHeight: function(e) {
                var t = this;
                t.get("el").height(e)
            },
            _uiSetContent: function(e) {
                var t, n = this;
                n.get("srcNode") && !n.get("rendered") || (t = n.get("contentEl"), "string" == typeof e ? t.html(e) : e && t.empty().append(e))
            },
            _uiSetVisible: function(e) {
                var t = this,
                    n = t.get("el"),
                    i = t.get("visibleMode");
                "visibility" === i ? n.css("visibility", e ? "visible" : "hidden") : n.css("display", e ? "" : "none")
            },
            set: function(e, t) {
                var n, r, o, a = this,
                    u = a.__attrs[e];
                if (!u || !a.get("binded")) return s.superclass.set.call(this, e, t), a;
                var l = s.superclass.get.call(this, e);
                return i.isPlainObject(t) || PFUI.isArray(t) || l !== t ? (s.superclass.set.call(this, e, t), t = a.__attrVals[e], n = {
                    attrName: e,
                    prevVal: l,
                    newVal: t
                }, r = PFUI.ucfirst(e), o = "_uiSet" + r, a[o] && a[o](t, n), a) : a
            },
            destructor: function() {
                var e = this.get("el");
                e && e.remove()
            }
        }, {
            xclass: "view",
            priority: 0
        });
    s.ATTRS = {
        el: {
            setter: function(e) {
                return i(e)
            }
        },
        elCls: {},
        elStyle: {},
        role: {},
        width: {},
        height: {},
        statusCls: {
            value: {}
        },
        elTagName: {
            value: "div"
        },
        elAttrs: {},
        content: {},
        elBefore: {},
        render: {},
        visible: {
            value: !0
        },
        visibleMode: {
            value: "display"
        },
        cachePosition: {},
        contentEl: {
            valueFn: function() {
                return this.get("el")
            }
        },
        prefixCls: {
            value: PFUI.prefix
        },
        focusable: {
            value: !0
        },
        focused: {},
        active: {},
        disabled: {},
        highlighted: {}
    }, n.exports = s
}), define("pfui/common/component/controller", ["jquery"], function(e, t, n) {
    "use strict";

    function i(e, t, n) {
        e.create();
        var i = e.getContentElement(),
            r = e.get("defaultChildClass");
        return t.xclass || t instanceof g || (t.xclass = t.xtype ? r + "-" + t.xtype : r), t = PFUI.Component.create(t, e), t.setInternal("parent", e), t.set("render", i), t.set("elBefore", n), t.create(void 0), t
    }

    function r(e) {
        var t, n, i, r, a = {},
            s = e.get("xview");
        t = e.getAttrs();
        for (i in t) t.hasOwnProperty(i) && (n = t[i], n.view && void 0 !== (r = e.get(i)) && (a[i] = r));
        return delete a.autoRender, a.ksComponentCss = o(e), new s(a)
    }

    function o(e) {
        for (var t, n = e.constructor, i = []; n && n !== g;) t = l.getXClassByConstructor(n), t && i.push(t), n = n.superclass && n.superclass.constructor;
        return i.join(" ")
    }

    function a(e, t) {
        var n = e.relatedTarget;
        return n && (n === t[0] || s.contains(t, n))
    }
    var s = e("jquery"),
        u = e("pfui/common/component/uibase/uibase"),
        l = e("pfui/common/component/manage"),
        c = e("pfui/common/component/view"),
        d = e("pfui/common/component/loader"),
        f = PFUI.wrapBehavior,
        h = PFUI.getWrapBehavior,
        g = u.extend([u.Decorate, u.Tpl, u.ChildCfg, u.KeyNav, u.Depends], {
            isController: !0,
            getCssClassWithPrefix: l.getCssClassWithPrefix,
            initializer: function() {
                var e = this;
                e.get("id") || e.set("id", e.getNextUniqueId()), l.addComponent(e.get("id"), e);
                var t = r(e);
                e.setInternal("view", t), e.__view = t
            },
            getNextUniqueId: function() {
                var e = this,
                    t = l.getXClassByConstructor(e.constructor);
                return PFUI.guid(t)
            },
            createDom: function() {
                var e = this,
                    t = e.get("view");
                t.create(void 0)
            },
            renderUI: function() {
                var e = this,
                    t = e.get("loader");
                e.get("view").render(), e._initChildren(), t && e.setInternal("loader", t)
            },
            _initChildren: function(e) {
                var t, e, n, i = this;
                for (e = e || i.get("children").concat(), i.get("children").length = 0, t = 0; t < e.length; t++) n = i.addChild(e[t]), n.render()
            },
            bindUI: function() {
                var e = this,
                    t = e.get("events");
                this.on("afterVisibleChange", function(e) {
                    this.fire(e.newVal ? "show" : "hide")
                }), PFUI.each(t, function(t, n) {
                    e.publish(n, {
                        bubbles: t
                    })
                })
            },
            containsElement: function(e) {
                var t = this,
                    n = t.get("el"),
                    i = t.get("children"),
                    r = !1;
                return t.get("rendered") ? (s.contains(n[0], e) || n[0] === e ? r = !0 : PFUI.each(i, function(t) {
                    return t.containsElement(e) ? (r = !0, !1) : void 0
                }), r) : !1
            },
            isChildrenElement: function(e) {
                var t = this,
                    n = t.get("children"),
                    i = !1;
                return PFUI.each(n, function(t) {
                    return t.containsElement(e) ? (i = !0, !1) : void 0
                }), i
            },
            show: function() {
                var e = this;
                return e.render(), e.set("visible", !0), e
            },
            hide: function() {
                var e = this;
                return e.set("visible", !1), e
            },
            toggle: function() {
                return this.set("visible", !this.get("visible")), this
            },
            _uiSetFocusable: function(e) {
                var t, n = this,
                    i = n.getKeyEventTarget();
                e ? i.attr("tabIndex", 0).attr("hideFocus", !0).on("focus", f(n, "handleFocus")).on("blur", f(n, "handleBlur")).on("keydown", f(n, "handleKeydown")).on("keyup", f(n, "handleKeyUp")) : (i.removeAttr("tabIndex"), (t = h(n, "handleFocus")) && i.off("focus", t), (t = h(n, "handleBlur")) && i.off("blur", t), (t = h(n, "handleKeydown")) && i.off("keydown", t), (t = h(n, "handleKeyUp")) && i.off("keyup", t))
            },
            _uiSetHandleMouseEvents: function(e) {
                var t, n = this,
                    i = n.get("el");
                e ? i.on("mouseenter", f(n, "handleMouseEnter")).on("mouseleave", f(n, "handleMouseLeave")).on("contextmenu", f(n, "handleContextMenu")).on("mousedown", f(n, "handleMouseDown")).on("mouseup", f(n, "handleMouseUp")).on("dblclick", f(n, "handleDblClick")) : (t = h(n, "handleMouseEnter") && i.off("mouseenter", t), t = h(n, "handleMouseLeave") && i.off("mouseleave", t), t = h(n, "handleContextMenu") && i.off("contextmenu", t), t = h(n, "handleMouseDown") && i.off("mousedown", t), t = h(n, "handleMouseUp") && i.off("mouseup", t), t = h(n, "handleDblClick") && i.off("dblclick", t))
            },
            _uiSetFocused: function(e) {
                e && this.getKeyEventTarget()[0].focus()
            },
            _uiSetVisible: function(e) {
                var t = this,
                    n = (t.get("el"), t.get("visibleMode"));
                if ("visibility" === n) {
                    if (e) {
                        var i = t.get("cachePosition");
                        i && t.set("xy", i)
                    }
                    if (!e) {
                        var i = [t.get("x"), t.get("y")];
                        t.set("cachePosition", i), t.set("xy", [-999, -999])
                    }
                }
            },
            _uiSetChildren: function(e) {
                var t = this,
                    n = PFUI.cloneObject(e);
                t._initChildren(n)
            },
            enable: function() {
                return this.set("disabled", !1), this
            },
            disable: function() {
                return this.set("disabled", !0), this
            },
            focus: function() {
                this.get("focusable") && this.set("focused", !0)
            },
            getContentElement: function() {
                return this.get("view").getContentElement()
            },
            getKeyEventTarget: function() {
                return this.get("view").getKeyEventTarget()
            },
            addChild: function(e, t) {
                var n, r = this,
                    o = r.get("children");
                return void 0 === t && (t = o.length), r.fire("beforeAddChild", {
                    child: e,
                    index: t
                }), n = o[t] && o[t].get("el") || null, e = i(r, e, n), o.splice(t, 0, e), r.get("rendered") && e.render(), r.fire("afterAddChild", {
                    child: e,
                    index: t
                }), e
            },
            remove: function(e) {
                var t = this,
                    n = t.get("parent");
                return n ? n.removeChild(t, e) : e && t.destroy(), t
            },
            removeChild: function(e, t) {
                var n = this,
                    i = n.get("children"),
                    r = PFUI.Array.indexOf(e, i);
                if (-1 !== r) return n.fire("beforeRemoveChild", {
                    child: e,
                    destroy: t
                }), -1 !== r && i.splice(r, 1), t && e.destroy && e.destroy(), n.fire("afterRemoveChild", {
                    child: e,
                    destroy: t
                }), e
            },
            removeChildren: function(e) {
                var t, n = this,
                    i = [].concat(n.get("children"));
                for (t = 0; t < i.length; t++) n.removeChild(i[t], e)
            },
            getChildAt: function(e) {
                var t = this.get("children");
                return t[e] || null
            },
            getChild: function(e, t) {
                return this.getChildBy(function(t) {
                    return t.get("id") === e
                }, t)
            },
            getChildBy: function(e, t) {
                return this.getChildrenBy(e, t)[0] || null
            },
            getAppendHeight: function() {
                var e = this.get("el");
                return e.outerHeight() - e.height()
            },
            getAppendWidth: function() {
                var e = this.get("el");
                return e.outerWidth() - e.width()
            },
            getChildrenBy: function(e, t) {
                var n = this,
                    i = [];
                return e ? (n.eachChild(function(n) {
                    e(n) ? i.push(n) : t && (i = i.concat(n.getChildrenBy(e, t)))
                }), i) : i
            },
            eachChild: function(e) {
                PFUI.each(this.get("children"), e)
            },
            handleDblClick: function(e) {
                this.performActionInternal(e), this.isChildrenElement(e.target) || this.fire("dblclick", {
                    domTarget: e.target,
                    domEvent: e
                })
            },
            handleMouseOver: function(e) {
                var t = this,
                    n = t.get("el");
                a(e, n) || t.handleMouseEnter(e)
            },
            handleMouseOut: function(e) {
                var t = this,
                    n = t.get("el");
                a(e, n) || t.handleMouseLeave(e)
            },
            handleMouseEnter: function(e) {
                var t = this;
                this.set("highlighted", !!e), t.fire("mouseenter", {
                    domTarget: e.target,
                    domEvent: e
                })
            },
            handleMouseLeave: function(e) {
                var t = this;
                t.set("active", !1), t.set("highlighted", !e), t.fire("mouseleave", {
                    domTarget: e.target,
                    domEvent: e
                })
            },
            handleMouseDown: function(e) {
                var t, n, i = this,
                    r = (s(e.target), 1 === e.which);
                r && (n = i.getKeyEventTarget(), i.get("activeable") && i.set("active", !0), i.get("focusable") && i.setInternal("focused", !0), i.get("allowTextSelection") || (t = e.target.nodeName, t = t && t.toLowerCase(), "input" !== t && "textarea" !== t && e.preventDefault()), i.isChildrenElement(e.target) || i.fire("mousedown", {
                    domTarget: e.target,
                    domEvent: e
                }))
            },
            handleMouseUp: function(e) {
                var t = this,
                    n = t.isChildrenElement(e.target);
                t.get("active") && 1 === e.which && (t.performActionInternal(e), t.set("active", !1), n || t.fire("click", {
                    domTarget: e.target,
                    domEvent: e
                })), n || t.fire("mouseup", {
                    domTarget: e.target,
                    domEvent: e
                })
            },
            handleContextMenu: function() {},
            handleFocus: function(e) {
                this.set("focused", !!e), this.fire("focus", {
                    domEvent: e,
                    domTarget: e.target
                })
            },
            handleBlur: function(e) {
                this.set("focused", !e), this.fire("blur", {
                    domEvent: e,
                    domTarget: e.target
                })
            },
            handleKeyEventInternal: function(e) {
                var t = this,
                    n = t.isChildrenElement(e.target);
                return 13 === e.which ? (n || t.fire("click", {
                    domTarget: e.target,
                    domEvent: e
                }), this.performActionInternal(e)) : void(n || t.fire("keydown", {
                    domTarget: e.target,
                    domEvent: e
                }))
            },
            handleKeydown: function(e) {
                var t = this;
                return t.handleKeyEventInternal(e) ? (e.halt(), !0) : void 0
            },
            handleKeyUp: function(e) {
                var t = this;
                t.isChildrenElement(e.target) || t.fire("keyup", {
                    domTarget: e.target,
                    domEvent: e
                })
            },
            performActionInternal: function() {},
            destructor: function() {
                var e, t, n = this,
                    i = n.get("children");
                for (e = n.get("id"), t = 0; t < i.length; t++) i[t].destroy && i[t].destroy();
                n.get("view").destroy(), l.removeComponent(e)
            },
            set: function(e, t, n) {
                var i, r, o, a = this,
                    u = a.__view,
                    l = a.__attrs[e];
                if (PFUI.isObject(e) && (n = t, PFUI.each(e, function(e, t) {
                        a.set(t, e, n)
                    })), !u || !l || n && n.silent) return g.superclass.set.call(this, e, t, n), a;
                var c = g.superclass.get.call(this, e);
                return s.isPlainObject(t) || PFUI.isArray(t) || c !== t ? (i = PFUI.ucfirst(e), o = "_uiSet" + i, a.fire("before" + i + "Change", {
                    attrName: e,
                    prevVal: c,
                    newVal: t
                }), a.setInternal(e, t), t = a.__attrVals[e], u && l.view && u.set(e, t), r = {
                    attrName: e,
                    prevVal: c,
                    newVal: t
                }, a.fire("after" + i + "Change", r), a.get("binded") && a[o] && a[o](t, r), a) : a
            },
            get: function(e) {
                var t = this,
                    n = t.__view,
                    i = t.__attrs[e],
                    r = g.superclass.get.call(this, e);
                return void 0 !== r ? r : n && i && i.view ? n.get(e) : r
            }
        }, {
            ATTRS: {
                content: {
                    view: 1
                },
                elTagName: {
                    view: !0,
                    value: "div"
                },
                defaultChildClass: {},
                xtype: {},
                id: {
                    view: !0
                },
                width: {
                    view: 1
                },
                height: {
                    view: 1
                },
                elCls: {
                    view: 1
                },
                elStyle: {
                    view: 1
                },
                elAttrs: {
                    view: 1
                },
                elBefore: {
                    view: 1
                },
                el: {
                    view: 1
                },
                events: {
                    value: {
                        click: !0,
                        dblclick: !0,
                        mouseenter: !0,
                        mouseleave: !0,
                        keydown: !0,
                        keyup: !0,
                        focus: !1,
                        blur: !1,
                        mousedown: !0,
                        mouseup: !0,
                        show: !1,
                        hide: !1
                    }
                },
                render: {
                    view: 1
                },
                role: {
                    view: 1
                },
                statusCls: {
                    view: !0,
                    value: {}
                },
                visibleMode: {
                    view: 1,
                    value: "display"
                },
                visible: {
                    value: !0,
                    view: 1
                },
                handleMouseEvents: {
                    value: !0
                },
                focusable: {
                    value: !1,
                    view: 1
                },
                defaultLoaderCfg: {
                    value: {
                        property: "content",
                        autoLoad: !0
                    }
                },
                loader: {
                    getter: function(e) {
                        var t, n = this;
                        return e && !e.isLoader && (e.target = n, t = n.get("defaultLoaderCfg"), e = new d(PFUI.merge(t, e)), n.setInternal("loader", e)), e
                    }
                },
                allowTextSelection: {
                    value: !0
                },
                activeable: {
                    value: !0
                },
                focused: {
                    view: 1
                },
                active: {
                    view: 1
                },
                highlighted: {
                    view: 1
                },
                children: {
                    sync: !1,
                    shared: !1,
                    value: []
                },
                prefixCls: {
                    value: PFUI.prefix,
                    view: 1
                },
                parent: {
                    setter: function(e) {
                        this.addTarget(e)
                    }
                },
                disabled: {
                    view: 1,
                    value: !1
                },
                xview: {
                    value: c
                }
            },
            PARSER: {
                visible: function(e) {
                    var t = this,
                        n = e.css("display"),
                        i = e.css("visibility"),
                        r = t.get("visibleMode");
                    return "none" == n && "display" == r || "hidden" == i && "visibility" == r ? !1 : !0
                },
                disabled: function(e) {
                    var t = this,
                        n = t.get("prefixCls") + t.get("xclass") + "-disabled";
                    return e.hasClass(n)
                }
            }
        }, {
            xclass: "controller",
            priority: 0
        });
    n.exports = g
}), define("pfui/common/component/loader", ["jquery"], function(e, t, n) {
    "use strict";
    var i = e("jquery"),
        r = e("pfui/common/util"),
        o = e("pfui/common/base"),
        a = function(e) {
            a.superclass.constructor.call(this, e), this._init()
        };
    a.ATTRS = {
        url: {},
        target: {},
        hasLoad: {
            value: !1
        },
        autoLoad: {},
        lazyLoad: {},
        property: {},
        renderer: {
            value: function(e) {
                return e
            }
        },
        loadMask: {
            value: !1
        },
        dataType: {
            value: "text"
        },
        ajaxOptions: {
            value: {
                type: "get",
                cache: !1
            }
        },
        params: {},
        appendParams: {},
        lastParams: {
            shared: !1,
            value: {}
        },
        callback: {},
        failure: {}
    }, r.extend(a, o), r.augment(a, {
        isLoader: !0,
        _init: function() {
            var e = this,
                t = e.get("autoLoad"),
                n = e.get("params");
            e._initMask(), t ? e.load(n) : (e._initParams(), e._initLazyLoad())
        },
        _initLazyLoad: function() {
            var e = this,
                t = e.get("target"),
                n = e.get("lazyLoad");
            t && n && n.event && t.on(n.event, function() {
                (!e.get("hasLoad") || n.repeat) && e.load()
            })
        },
        _initMask: function() {
            var t = this,
                n = t.get("target"),
                o = t.get("loadMask");
            n && o && e.async("pfui/mask", function(e) {
                var a = i.isPlainObject(o) ? o : {};
                o = new e.LoadMask(r.mix({
                    el: n.get("el")
                }, a)), t.set("loadMask", o)
            })
        },
        _initParams: function() {
            var e = this,
                t = e.get("lastParams"),
                n = e.get("params");
            r.mix(t, n)
        },
        load: function(e) {
            var t = this,
                n = t.get("url"),
                o = t.get("ajaxOptions"),
                a = t.get("lastParams"),
                s = t.get("appendParams");
            e = e || a, e = r.merge(s, e), t.set("lastParams", e), n && (t.onBeforeLoad(), t.set("hasLoad", !0), i.ajax(r.mix({
                dataType: t.get("dataType"),
                data: e,
                url: n,
                success: function(n) {
                    t.onload(n, e)
                },
                error: function(n, i, r) {
                    t.onException({
                        jqXHR: n,
                        textStatus: i,
                        errorThrown: r
                    }, e)
                }
            }, o)))
        },
        onBeforeLoad: function() {
            var e = this,
                t = e.get("loadMask");
            t && t.show && t.show()
        },
        onload: function(e, t) {
            var n = this,
                i = n.get("loadMask"),
                o = n.get("property"),
                a = n.get("callback"),
                s = n.get("renderer"),
                u = n.get("target");
            r.isString(e) && u.set(o, ""), u.set(o, s.call(n, e)), i && i.hide && i.hide(), a && a.call(this, e, t)
        },
        onException: function(e, t) {
            var n = this,
                i = n.get("failure");
            i && i.call(this, e, t)
        }
    }), n.exports = a
});