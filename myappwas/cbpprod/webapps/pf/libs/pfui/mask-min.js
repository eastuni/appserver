define("pfui/mask", ["pfui/common", "jquery"], function(e, i, s) {
    var a = (e("pfui/common"), e("pfui/mask/mask"));
    a.LoadMask = e("pfui/mask/loadmask"), s.exports = a
}), define("pfui/mask/mask", ["jquery", "pfui/common"], function(e, i, s) {
    var a = e("jquery"),
        n = e("pfui/common"),
        o = n.namespace("Mask"),
        t = n.UA,
        d = n.prefix + "ext-mask",
        m = d + "-msg";
    n.mix(o, {
        maskElement: function(e, i, s) {
            var o = a(e),
                l = o.children("." + d),
                u = null,
                r = null,
                c = null,
                h = null;
            if (!l.length && (l = a('<div class="' + d + '"></div>').appendTo(o), o.addClass("x-masked-relative x-masked"), "body" == e ? 6 == t.ie ? l.height(n.docHeight()) : l.css("position", "fixed") : 6 === t.ie && l.height(o.height()), i)) {
                u = ['<div class="' + m + '"><div>', i, "</div></div>"].join(""), r = a(u).appendTo(o), s && r.addClass(s);
                try {
                    "body" == e && 6 != t.ie ? (c = "50%", h = "50%", r.css("position", "fixed")) : (c = (l.height() - r.height()) / 2, h = (l.width() - r.width()) / 2), r.css({
                        left: h,
                        top: c
                    })
                } catch (f) {
                    n.log("mask error occurred")
                }
            }
            return l
        },
        unmaskElement: function(e) {
            var i = a(e),
                s = i.children("." + m),
                n = i.children("." + d);
            s && s.remove(), n && n.remove(), i.removeClass("x-masked-relative x-masked")
        }
    }), s.exports = o
}), define("pfui/mask/loadmask", ["jquery", "pfui/common"], function(e, i, s) {
    function a(e) {
        var i = this;
        a.superclass.constructor.call(i, e)
    }
    var n = (e("jquery"), e("pfui/mask/mask"));
    PFUI.extend(a, PFUI.Base), a.ATTRS = {
        el: {},
        msg: {
            value: "Loading..."
        },
        msgCls: {
            value: "x-mask-loading"
        },
        disabled: {
            value: !1
        }
    }, PFUI.augment(a, {
        disable: function() {
            this.set("disabled", !0)
        },
        onLoad: function() {
            n.unmaskElement(this.get("el"))
        },
        onBeforeLoad: function() {
            var e = this;
            e.get("disabled") || n.maskElement(e.get("el"), e.get("msg"), this.get("msgCls"))
        },
        show: function() {
            this.onBeforeLoad()
        },
        hide: function() {
            this.onLoad()
        },
        destroy: function() {
            this.hide(), this.clearAttrVals(), this.off()
        }
    }), s.exports = a
});