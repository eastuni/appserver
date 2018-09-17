define("pfui/overlay", ["pfui/common", "jquery"], function(e, t, i) {
    var n = e("pfui/common"),
        o = n.namespace("Overlay");
    n.mix(o, {
        Overlay: e("pfui/overlay/overlay"),
        Dialog: e("pfui/overlay/dialog"),
        Message: e("pfui/overlay/message")
    }), n.mix(o, {
        OverlayView: o.Overlay.View,
        DialogView: o.Dialog.View
    }), n.Message = n.Overlay.Message, i.exports = o
}), define("pfui/overlay/overlay", ["jquery", "pfui/common"], function(e, t, i) {
    var n = e("jquery"),
        o = e("pfui/common"),
        a = o.Component,
        l = "x-align-arrow",
        s = a.UIBase,
        r = a.View.extend([s.PositionView, s.CloseView]),
        c = a.Controller.extend([s.Position, s.Align, s.Close, s.AutoShow, s.AutoHide], {
            renderUI: function() {
                var e = this,
                    t = e.get("el"),
                    i = e.get("arrowContainer"),
                    o = i ? t.one(i) : t;
                e.get("showArrow") && n(e.get("arrowTpl")).appendTo(o)
            },
            show: function() {
                function e() {
                    "visibility" === o ? n.css({
                        display: "block"
                    }) : t.set("visible", !0), i.callback && i.callback.call(t);
                    var e = t.get("autoHideDelay"),
                        a = t.get("delayHandler");
                    e && (a && clearTimeout(a), a = setTimeout(function() {
                        t.hide(), t.set("delayHandler", null)
                    }, e), t.set("delayHandler", a))
                }
                var t = this,
                    i = t.get("effect"),
                    n = t.get("el"),
                    o = t.get("visibleMode"),
                    a = i.effect,
                    l = i.duration;
                switch (t.get("rendered") || (t.set("visible", !0), t.render(), t.set("visible", !1), n = t.get("el")), "visibility" === o && (t.set("visible", !0), n.css({
                    display: "none"
                })), a) {
                    case "linear":
                        n.show(l, e);
                        break;
                    case "fade":
                        n.fadeIn(l, e);
                        break;
                    case "slide":
                        n.slideDown(l, e);
                        break;
                    default:
                        e()
                }
            },
            hide: function() {
                function e() {
                    "visibility" === t.get("visibleMode") && n.css({
                        display: "block"
                    }), t.set("visible", !1), i.callback && i.callback.call(t)
                }
                var t = this,
                    i = t.get("effect"),
                    n = t.get("el"),
                    o = i.effect,
                    a = i.duration;
                switch (o) {
                    case "linear":
                        n.hide(a, e);
                        break;
                    case "fade":
                        n.fadeOut(a, e);
                        break;
                    case "slide":
                        n.slideUp(a, e);
                        break;
                    default:
                        e()
                }
            }
        }, {
            ATTRS: {
                effect: {
                    value: {
                        effect: "none",
                        duration: 0,
                        callback: null
                    }
                },
                autoHideDelay: {},
                closeable: {
                    value: !1
                },
                showArrow: {
                    value: !1
                },
                arrowContainer: {
                    view: !0
                },
                arrowTpl: {
                    value: '<s class="' + l + '"><s class="' + l + '-inner"></s></s>'
                },
                visibleMode: {
                    value: "visibility"
                },
                visible: {
                    value: !1
                },
                xview: {
                    value: r
                }
            }
        }, {
            xclass: "overlay"
        });
    c.View = r, i.exports = c
}), define("pfui/overlay/dialog", ["jquery", "pfui/common"], function(e, t, i) {
    var n = e("jquery"),
        o = e("pfui/overlay/overlay"),
        a = PFUI.Component.UIBase,
        l = "header-title",
        s = PFUI.prefix,
        r = 20,
        c = o.View.extend([a.StdModView, a.MaskView], {
            getContentElement: function() {
                return this.get("body")
            },
            _uiSetTitle: function(e) {
                var t = this,
                    i = t.get("el");
                i.find("." + l).html(e)
            },
            _uiSetContentId: function(e) {
                var t = this,
                    i = t.get("body"),
                    o = n("#" + e).children();
                o.appendTo(i)
            },
            _uiSetHeight: function(e) {
                var t = this,
                    i = e,
                    n = t.get("header"),
                    o = t.get("body"),
                    a = t.get("footer");
                i -= n.outerHeight() + a.outerHeight(), i -= 2 * r, o.height(i)
            },
            _removeContent: function() {
                var e = this,
                    t = e.get("body"),
                    i = e.get("contentId");
                i ? t.children().appendTo(n("#" + i)) : t.children().remove()
            }
        }, {
            xclass: "dialog-view"
        }),
        u = o.extend([a.StdMod, a.Mask, a.Drag], {
            show: function() {
                var e = this;
                align = e.get("align"), u.superclass.show.call(this), e.set("align", align)
            },
            bindUI: function() {
                var e = this;
                e.on("closeclick", function() {
                    return e.onCancel()
                })
            },
            onCancel: function() {
                var e = this,
                    t = e.get("cancel");
                return t.call(this)
            },
            _uiSetButtons: function(e) {
                var t = this,
                    i = t.get("footer");
                i.children().remove(), PFUI.each(e, function(e) {
                    t._createButton(e, i)
                })
            },
            _createButton: function(e, t) {
            	var o = '';
            	if(e.elStyle) {
            		o = '<button class="' + e.elCls + '" style="' + e.elStyle + '">' + e.text + "</button>";
            	}
            	else {
            		o = '<button class="' + e.elCls + '">' + e.text + "</button>";
            	}
                var i = this,
                    a = n(o).appendTo(t);
                a.on("click", function() {
                    e.handler.call(i, i, this)
                })
            },
            destructor: function() {
                var e = this,
                    t = e.get("contentId"),
                    i = e.get("body"),
                    n = e.get("closeAction");
                "destroy" == n && (e.hide(), t && i.children().appendTo("#" + t))
            }
        }, {
            ATTRS: {
                closeTpl: {
                    view: !0,
                    value: '<a tabindex="0" href=javascript:void() role="button" class="' + s + 'ext-close" style=""><span class="' + s + 'ext-close-x x-icon x-icon-normal">\xd7</span></a>'
                },
                buttons: {
                    value: [{
                        text: "ok",
                        elCls: "button button-primary",
                        handler: function() {
                            var e = this,
                                t = e.get("success");
                            t && t.call(e)
                        }
                    }, {
                        text: "cancel",
                        elCls: "button button-primary",
                        handler: function() {
                            this.onCancel() !== !1 && this.close()
                        }
                    }]
                },
                contentId: {
                    view: !0
                },
                success: {
                    value: function() {
                        this.close()
                    }
                },
                cancel: {
                    value: function() {}
                },
                dragNode: {
                    valueFn: function() {
                        return this.get("header")
                    }
                },
                defaultLoaderCfg: {
                    valueFn: function() {
                        var e = this;
                        return {
                            property: "bodyContent",
                            autoLoad: !1,
                            lazyLoad: {
                                event: "show"
                            },
                            loadMask: {
                                el: e.get("body")
                            }
                        }
                    }
                },
                title: {
                    view: !0,
                    value: ""
                },
                align: {
                    value: {
                        node: window,
                        points: ["cc", "cc"]
                    }
                },
                mask: {
                    value: !0
                },
                maskShared: {
                    value: !1
                },
                headerContent: {
                    value: '<div class="' + l + '">title</div>'
                },
                footerContent: {},
                closeable: {
                    value: !0
                },
                xview: {
                    value: c
                }
            }
        }, {
            xclass: "dialog"
        });
    u.View = c, i.exports = u
}), define("pfui/overlay/message", ["jquery", "pfui/common"], function(e, t, i) {
    function n(e, t) {
        return function(i, n, a) {
            return PFUI.isString(n) && (a = n, n = null), a = a || t, n = n || l, o({
                buttons: e,
                icon: a,
                msg: i,
                success: n
            }), s
        }
    }

    function o(e) {
        s || (s = new v({
            icon: "info",
            title: ""
        })), s.set(e), s.show()
    }

    function a() {
        var e = this,
            t = e.get("success");
        t && (t.call(e), e.hide())
    }

    function l() {
        this.hide()
    }
    var s, r = e("jquery"),
        c = e("pfui/overlay/dialog"),
        u = PFUI.prefix,
        d = {
            info: "i",
            error: "\xd7",
            success: '<i class="icon-ok icon-white"></i>',
            question: "?",
            warning: "!"
        },
        v = c.extend({
            renderUI: function() {
                this._setContent()
            },
            bindUI: function() {
                var e = this,
                    t = e.get("body");
                e.on("afterVisibleChange", function(i) {
                    if (i.newVal && PFUI.UA.ie < 8) {
                        var n = t.outerWidth();
                        6 == PFUI.UA.ie && (n = n > 350 ? 350 : n), e.get("header").width(n - 20), e.get("footer").width(n)
                    }
                })
            },
            _setContent: function() {
                var e = this,
                    t = e.get("body"),
                    i = PFUI.substitute(e.get("contentTpl"), {
                        msg: e.get("msg"),
                        iconTpl: e.get("iconTpl")
                    });
                t.empty(), r(i).appendTo(t)
            },
            _uiSetIcon: function() {
                this.get("rendered") && this._setContent()
            },
            _uiSetMsg: function() {
                this.get("rendered") && this._setContent()
            }
        }, {
            ATTRS: {
                icon: {},
                msg: {},
                iconTpl: {
                    getter: function() {
                        var e = this,
                            t = e.get("icon");
                        return '<div class="x-icon x-icon-' + t + '">' + d[t] + "</div>"
                    }
                },
                contentTpl: {
                    value: '{iconTpl}<div class="' + u + 'message-content">{msg}</div>'
                }
            }
        }, {
            xclass: "message",
            priority: 0
        }),
        g = n([{
            text: "determine",
            elCls: "button button-primary",
            handler: a
        }], "info"),
        h = n([{
            text: "determine",
            elCls: "button button-primary",
            handler: a
        }, {
            text: "cancel",
            elCls: "button",
            handler: l
        }], "question");
    v.Alert = g, v.Confirm = h, v.Show = o, i.exports = v
});