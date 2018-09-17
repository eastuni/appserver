define("pfui/tab", ["pfui/common", "jquery", "pfui/menu"], function(e, t, n) {
    var i = e("pfui/common"),
        a = i.namespace("Tab");
    i.mix(a, {
        Tab: e("pfui/tab/tab"),
        TabItem: e("pfui/tab/tabitem"),
        NavTabItem: e("pfui/tab/navtabitem"),
        NavTab: e("pfui/tab/navtab"),
        TabPanel: e("pfui/tab/tabpanel"),
        TabPanelItem: e("pfui/tab/tabpanelitem")
    }), n.exports = a
}), define("pfui/tab/tab", ["pfui/common", "jquery"], function(e, t, n) {
    var i = e("pfui/common"),
        a = i.Component,
        l = a.UIBase,
        o = a.Controller.extend([l.ChildList], {}, {
            ATTRS: {
                elTagName: {
                    view: !0,
                    value: "ul"
                },
                defaultChildClass: {
                    value: "tab-item"
                }
            }
        }, {
            xclass: "tab"
        });
    n.exports = o
}), define("pfui/tab/tabitem", ["pfui/common", "jquery"], function(e, t, n) {
    var i = e("pfui/common"),
        a = i.Component,
        l = a.UIBase,
        o = a.View.extend([l.ListItemView], {}, {
            xclass: "tab-item-view"
        }),
        s = a.Controller.extend([l.ListItem], {}, {
            ATTRS: {
                elTagName: {
                    view: !0,
                    value: "li"
                },
                xview: {
                    value: o
                },
                tpl: {
                    view: !0,
                    value: '<span class="pfui-tab-item-text">{text}</span>'
                }
            }
        }, {
            xclass: "tab-item"
        });
    s.View = o, n.exports = s
}), define("pfui/tab/navtabitem", ["jquery", "pfui/common"], function(e, t, n) {
    var i = e("jquery"),
        a = e("pfui/common"),
        l = a.Component,
        o = "tab-item-title",
        s = "tab-item-close",
        r = "tab-item-inner",
        c = "tab-nav-actived",
        u = "tab-content",
        v = l.View.extend({
            renderUI: function() {
                var e = this,
                    t = e.get("tabContentContainer"),
                    n = e.get("tabContentTpl");
                if (t) {
                    var a = i(n).appendTo(t);
                    e.set("tabContentEl", a)
                }
            },
            _uiSetHref: function(e) {
                this._setHref(e)
            },
            _setHref: function(e) {
                var t = this,
                    n = t.get("tabContentEl");
                e = e || t.get("href"), n && i("iframe", n).attr("src", e)
            },
            resetHref: function() {
                this._setHref()
            },
            _uiSetTitle: function(e) {
                var t = this,
                    n = t.get("el");
                i("." + o, n).html(e)
            },
            _uiSetActived: function(e) {
                var t = this,
                    n = t.get("el");
                t.setTabContentVisible(e), e ? n.addClass(c) : n.removeClass(c)
            },
            destructor: function() {
                var e = this,
                    t = e.get("tabContentEl");
                t && t.remove()
            },
            setTabContentVisible: function(e) {
                var t = this,
                    n = t.get("tabContentEl");
                n && (e ? n.show() : n.hide())
            }
        }, {
            ATTRS: {
                tabContentContainer: {},
                tabContentEl: {},
                title: {},
                href: {}
            }
        }),
        f = l.Controller.extend({
            createDom: function() {
                var e = this,
                    t = e.get("parent");
                t && e.set("tabContentContainer", t.getTabContentContainer())
            },
            bindUI: function() {
                {
                    var e = this,
                        t = e.get("el");
                    e.get("events")
                }
                t.on("click", function(t) {
                    var n = i(t.target);
                    n.hasClass(s) && e.fire("closing") !== !1 && e.close()
                })
            },
            handleDblClick: function(e) {
                var t = this; /*2017.03.27 dblclick closed 주석 t.get("closeable")&&t.fire("closing")!==!1&&t.close(),t.fire("dblclick",{domTarget:e.target,domEvent:e})*/
            },
            handleContextMenu: function(e) {
                e.preventDefault(), this.fire("showmenu", {
                    position: {
                        x: e.pageX,
                        y: e.pageY
                    }
                })
            },
            setTitle: function(e) {
                this.set("title", e)
            },
            close: function() {
                this.fire("closed")
            },
            reload: function() {
                this.get("view").resetHref()
            },
            show: function(delay) {
                var e = this;
                var delayTime = 0;
                if (!delay) {
                    delayTime = 500;
                }
                e.get("el").show(delayTime, function() {
                    e.set("visible", !0)
                })
            },
            hide: function(e) {
                var t = this;
                this.get("el").hide(500, function() {
                    t.set("visible", !1), e && e()
                })
            },
            _uiSetActived: function(e) {
                var t = this,
                    n = t.get("parent");
                n && e && n._setItemActived(t)
            },
            _uiSetCloseable: function(e) {
                var t = this,
                    n = t.get("el"),
                    i = n.find("." + s);
                e ? i.show() : i.hide()
            }
        }, {
            ATTRS: {
                elTagName: {
                    value: "li"
                },
                actived: {
                    view: !0,
                    value: !1
                },
                closeable: {
                    value: !0
                },
                allowTextSelection: {
                    view: !1,
                    value: !1
                },
                events: {
                    value: {
                        click: !0,
                        closing: !0,
                        closed: !0,
                        showmenu: !0,
                        afterVisibleChange: !0
                    }
                },
                tabContentContainer: {
                    view: !0
                },
                tabContentTpl: {
                    view: !0,
                    value: '<div class="' + u + '" style="display:none;"><iframe src="" width="100%" height="100%" frameborder="0"></iframe></div>'
                },
                href: {
                    view: !0,
                    value: ""
                },
                visible: {
                    view: !0,
                    value: !0
                },
                title: {
                    view: !0,
                    value: ""
                },
                tpl: {
                    view: !0,
                    value: '<s class="l"></s><div class="' + r + '">{icon}<span class="' + o + '"></span><s class="' + s + '"></s></div><s class="r"></s>'
                },
                xview: {
                    value: v
                }
            }
        }, {
            xclass: "nav-tab-item",
            priority: 0
        });
    f.View = v, n.exports = f
}), define("pfui/tab/navtab", ["pfui/common", "jquery", "pfui/menu"], function(e, t, n) {
    var i = e("pfui/common"),
        a = e("pfui/menu"),
        l = i.Component,
        o = "tab-nav-list",
        s = "arrow-left",
        r = "arrow-right",
        c = i.prefix + "tab-force",
        u = "m_close",
        v = 160,
        f = l.View.extend({
            renderUI: function() {
                var e = this,
                    t = e.get("el"),
                    n = null;
                n = t.find("." + o), e.setInternal("listEl", n)
            },
            getContentElement: function() {
                return this.get("listEl")
            },
            getTabContentContainer: function() {
                return this.get("el").find(".tab-content-container")
            },
            _uiSetHeight: function(e) {
                var t = this,
                    n = t.get("el"),
                    i = n.find(".tab-nav-bar"),
                    a = t.getTabContentContainer();
                e && a.height(e - i.height()), n.height(e)
            },
            _uiSetForceFit: function(e) {
                var t = this,
                    n = t.get("el");
                e ? n.addClass(c) : n.removeClass(c)
            }
        }, {
            ATTRS: {
                forceFit: {}
            }
        }, {
            xclass: "nav-tab-view",
            priority: 0
        }),
        d = l.Controller.extend({
            addTab: function(e, t, showDelay) {
                var n = this,
                    a = e.id || i.guid("tab-item"),
                    l = n.get("forceFit"),
                    o = n.getItemById(a);
                if (o) {
                    var s = !1;
                    e.href && o.get("href") != e.href && (o.set("href", e.href), s = !0), n._setItemActived(o), t && !s && o.reload()
                } else e = i.mix({
                    id: a,
                    visible: !1,
                    actived: !0,
                    xclass: "nav-tab-item"
                }, e), o = n.addChild(e), l && n.forceFit();
                if (showDelay) {
                    o.show(1);
                } else {
                    o.show();
                }
                n._resetItemList();
                return o
            },
            getTabContentContainer: function() {
                return this.get("view").getTabContentContainer()
            },
            bindUI: function() {
                var e = this,
                    t = e.get("forceFit");
                t || (e._bindScrollEvent(), e.on("afterVisibleChange", function(t) {
                    var n = t.target;
                    n.get("actived") && e._scrollToItem(n)
                })), e.on("click", function(t) {
                    var n = t.target;
                    n != e && (e._setItemActived(n), e.fire("itemclick", {
                        item: n
                    }))
                }), e.on("closed", function(t) {
                    var n = t.target;
                    e._closeItem(n)
                }), e.on("showmenu", function(t) {
                    e._showMenu(t.target, t.position)
                })
            },
            _bindScrollEvent: function() {
                var e = this,
                    t = e.get("el");
                t.find(".arrow-left").on("click", function() {
                    t.hasClass(s + "-active") && e._scrollLeft()
                }), t.find(".arrow-right").on("click", function() {
                    t.hasClass(r + "-active") && e._scrllRight()
                })
            },
            _showMenu: function(e, t) {
                var n, i = this,
                    a = i._getMenu(),
                    l = e.get("closeable");
                i.set("showMenuItem", e), a.set("xy", [t.x, t.y]), a.show(), n = a.getItem(u), n && n.set("disabled", !l)
            },
            setActived: function(e) {
                var t = this,
                    n = t.getItemById(e);
                t._setItemActived(n)
            },
            getActivedItem: function() {
                var e = this,
                    t = e.get("children"),
                    n = null;
                return i.each(t, function(e) {
                    return e.get("actived") ? (n = e, !1) : void 0
                }), n
            },
            getItemById: function(e) {
                var t = this,
                    n = t.get("children"),
                    a = null;
                return i.each(n, function(t) {
                    return t.get("id") === e ? (a = t, !1) : void 0
                }), a
            },
            _getMenu: function() {
                var e = this;
                return e.get("menu") || e._initMenu()
            },
            _initMenu: function() {
                var e = this,
                    t = new a.ContextMenu({
                        children: [{
                            xclass: "context-menu-item",
                            iconCls: "icon icon-refresh",
                            text: "refresh",
                            listeners: {
                                click: function() {
                                    var t = e.get("showMenuItem");
                                    t && t.reload()
                                }
                            }
                        }, {
                            id: u,
                            xclass: "context-menu-item",
                            iconCls: "icon icon-remove",
                            text: "remove",
                            listeners: {
                                click: function() {
                                    var t = e.get("showMenuItem");
                                    t && t.close()
                                }
                            }
                        }, {
                            xclass: "context-menu-item",
                            iconCls: "icon icon-remove-sign",
                            text: "remove other",
                            listeners: {
                                click: function() {
                                    var t = e.get("showMenuItem");
                                    t && e.closeOther(t)
                                }
                            }
                        }, {
                            xclass: "context-menu-item",
                            iconCls: "icon icon-remove-sign",
                            text: "remove all",
                            listeners: {
                                click: function() {
                                    e.closeAll()
                                }
                            }
                        }]
                    });
                return e.set("menu", t), t
            },
            _closeItem: function(e) {
                var t = this,
                    n = t._getIndex(e),
                    i = t.getActivedItem(),
                    a = t.get("preItem") || t._getItemByIndex(n - 1),
                    l = t._getItemByIndex(n + 1);
                e.hide(function() {
                    t.removeChild(e, !0), t._resetItemList(), i === e ? t._setItemActived(a ? a : l) : t._scrollToItem(i), t.forceFit()
                })
            },
            closeAll: function() {
                var e = this,
                    t = e.get("children");
                i.each(t, function(e) {
                    e.get("closeable") && e.close()
                })
            },
            closeOther: function(e) {
                var t = this,
                    n = t.get("children");
                i.each(n, function(t) {
                    e !== t && t.close()
                })
            },
            _getItemByIndex: function(e) {
                var t = this,
                    n = t.get("children");
                return n[e]
            },
            _getIndex: function(e) {
                var t = this,
                    n = t.get("children");
                return i.Array.indexOf(e, n)
            },
            _resetItemList: function() {
                if (!this.get("forceFit")) {
                    var e = this,
                        t = e.getContentElement();
                    t.width(e._getTotalWidth())
                }
            },
            _getTotalWidth: function() {
                var e = this,
                    t = e.get("children");
                return t.length * e.get("itemWidth")
            },
            _getForceItemWidth: function() {
                var e = this,
                    t = e.getContentElement().width(),
                    n = e.get("children"),
                    i = e._getTotalWidth(),
                    a = e.get(a);
                return i > t && (a = t / n.length), a
            },
            forceFit: function() {
                var e = this;
                e._forceItemWidth(e._getForceItemWidth())
            },
            _forceItemWidth: function(e) {
                e = e || this.get("itemWidth");
                var t = this,
                    n = t.get("children");
                i.each(n, function(t) {
                    t.set("width", e)
                })
            },
            _scrollToItem: function(e) {
                if (!this.get("forceFit")) {
                    var t = this,
                        n = t.getContentElement(),
                        i = n.position(),
                        a = t._getDistanceToEnd(e, n, i),
                        l = t._getDistanceToBegin(e, i);
                    if (n.width() < n.parent().width()) t._scrollTo(n, 0);
                    else if (0 > l) t._scrollTo(n, i.left - l);
                    else if (a > 0) t._scrollTo(n, i.left + -1 * a);
                    else if (i.left < 0) {
                        var o = t._getLastDistance(n, i),
                            s = 0;
                        0 > o && (s = i.left - o, s = 0 > s ? s : 0, t._scrollTo(n, s))
                    }
                }
            },
            _getDistanceToBegin: function(e, t) {
            	var el = e.get("el");
            	
            	if (el !== undefined) {
            		var n = el.position();
                    return n.left + t.left
            	}
            },
            _getDistanceToEnd: function(e, t, n) {
                var i = this,
                    t = t || i.getContentElement(),
                    a = t.parent().width(),
                    n = n || t.position(),
                    l = i._getDistanceToBegin(e, n),
                    o = l + i.get("itemWidth") - a;
                return o
            },
            _getLastDistance: function(e, t) {
                var n = this,
                    i = n.get("children"),
                    a = i[i.length - 1];
                return a ? n._getDistanceToEnd(a, e, t) : 0
            },
            _scrollTo: function(e, t) {
                var n = this;
                e.animate({
                    left: t
                }, 500, function() {
                    n._setArrowStatus(e)
                })
            },
            _scrollLeft: function() {
                var e, t = this,
                    n = t.getContentElement(),
                    i = n.position(),
                    a = t._getLastDistance(n, i);
                a > 0 && (e = a > t.get("itemWidth") ? t.get("itemWidth") : a, t._scrollTo(n, i.left - e))
            },
            _scrllRight: function() {
                var e, t = this,
                    n = t.getContentElement(),
                    i = n.position();
                i.left < 0 && (e = i.left + t.get("itemWidth"), e = 0 > e ? e : 0, t._scrollTo(n, e))
            },
            _setArrowStatus: function(e, t) {
                e = e || this.getContentElement();
                var n = this,
                    i = n.get("el"),
                    a = t || e.position(),
                    l = n._getLastDistance(e, t);
                a.left < 0 ? i.addClass(r + "-active") : i.removeClass(r + "-active"), l > 0 ? i.addClass(s + "-active") : i.removeClass(s + "-active")
            },
            _setItemActived: function(e) {
                var t = this,
                    n = t.getActivedItem();
                e !== n && (n && n.set("actived", !1), t.set("preItem", n), e && (e.get("actived") || e.set("actived", !0), e.get("visible") && t._scrollToItem(e), t.fire("activeChange", {
                    item: e
                }), t.fire("activedchange", {
                    item: e
                })))
            }
        }, {
            ATTRS: {
                defaultChildClass: {
                    value: "nav-tab-item"
                },
                menu: {},
                forceFit: {
                    view: !0,
                    value: !1
                },
                itemWidth: {
                    value: v
                },
                tpl: {
                    view: !0,
                    value: '<div class="tab-nav-bar"><s class="tab-nav-arrow arrow-left"></s><div class="tab-nav-wrapper"><div class="tab-nav-inner"><ul class="' + o + '"></ul></div></div><s class="tab-nav-arrow arrow-right"></s></div><div class="tab-content-container"></div>'
                },
                xview: {
                    value: f
                },
                events: {
                    value: {
                        itemclick: !1,
                        activedchange: !1
                    }
                }
            }
        }, {
            xclass: "nav-tab",
            priority: 0
        });
    n.exports = d
}), define("pfui/tab/tabpanel", ["pfui/common", "jquery"], function(e, t, n) {
    var i = (e("pfui/common"), e("pfui/tab/tab")),
        a = e("pfui/tab/panels"),
        l = i.extend([a], {
            bindUI: function() {
                var e = this;
                e.on("beforeclosed", function(t) {
                    var n = t.target;
                    e._beforeClosedItem(n)
                })
            },
            _beforeClosedItem: function(e) {
                if (e.get("selected")) {
                    var t, n, i = this,
                        a = i.indexOfItem(e),
                        l = i.getItemCount();
                    a !== l - 1 ? (n = i.getItemAt(a + 1), i.setSelected(n)) : 0 !== a && (t = i.getItemAt(a - 1), i.setSelected(t))
                }
            }
        }, {
            ATTRS: {
                elTagName: {
                    value: "div"
                },
                childContainer: {
                    value: "ul"
                },
                tpl: {
                    value: '<div class="tab-panel-inner"><ul></ul><div class="tab-panels"></div></div>'
                },
                panelTpl: {
                    value: "<div></div>"
                },
                panelContainer: {
                    value: ".tab-panels"
                },
                defaultChildClass: {
                    value: "tab-panel-item"
                }
            }
        }, {
            xclass: "tab-panel"
        });
    n.exports = l
}), define("pfui/tab/panels", ["jquery"], function(e, t, n) {
    var i = e("jquery"),
        a = function() {};
    a.ATTRS = {
        panelTpl: {},
        panelContainer: {},
        panelCls: {}
    }, PFUI.augment(a, {
        __renderUI: function() {
            var e = this,
                t = e.get("children"),
                n = e._initPanelContainer(),
                i = e.get("panelCls"),
                a = i ? n.find("." + a) : n.children();
            PFUI.each(t, function(t, n) {
                var i = a[n];
                e._initPanelItem(t, i)
            })
        },
        __bindUI: function() {
            var e = this;
            e.on("beforeAddChild", function(t) {
                var n = t.child;
                e._initPanelItem(n)
            })
        },
        _initPanelContainer: function() {
            var e = this,
                t = e.get("panelContainer");
            return t && PFUI.isString(t) && (t = 0 == t.indexOf("#") ? i(t) : e.get("el").find(t), e.setInternal("panelContainer", t)), t
        },
        _initPanelItem: function(e, t) {
            var n = this;
            e.set ? e.get("panel") || (t = t || n._getPanel(e.get("userConfig")), e.set("panel", t)) : e.panel || (t = t || n._getPanel(e), e.panel = t)
        },
        _getPanel: function(e) {
            var t = this,
                n = t.get("panelContainer"),
                a = PFUI.substitute(t.get("panelTpl"), e);
            return i(a).appendTo(n)
        }
    }), n.exports = a
}), define("pfui/tab/tabpanelitem", ["pfui/common", "jquery"], function(e, t, n) {
    var i = e("pfui/common"),
        a = e("pfui/tab/tabitem"),
        l = e("pfui/tab/panelitem"),
        o = "pfui-tab-item-text",
        s = i.Component,
        r = a.View.extend([s.UIBase.Close.View], {
            _uiSetTitle: function(e) {
                var t = this,
                    n = t.get("el"),
                    i = n.find("." + o);
                i.text(e)
            }
        }, {
            xclass: "tab-panel-item-view"
        }),
        c = a.extend([l, s.UIBase.Close], {}, {
            ATTRS: {
                closeAction: {
                    value: "remove"
                },
                title: {
                    view: !0,
                    sync: !1
                },
                tpl: {
                    value: '<span class="' + o + '">{text}{title}</span>'
                },
                closeable: {
                    value: !1
                },
                events: {
                    value: {
                        beforeclosed: !0
                    }
                },
                xview: {
                    value: r
                }
            }
        }, {
            xclass: "tab-panel-item"
        });
    c.View = r, n.exports = c
}), define("pfui/tab/panelitem", ["jquery"], function(e, t, n) {
    var i = e("jquery"),
        a = function() {};
    a.ATTRS = {
        panel: {},
        panelContent: {},
        panelVisibleStatus: {
            value: "selected"
        },
        defaultLoaderCfg: {
            valueFn: function() {
                var e = this,
                    t = e._getVisibleEvent();
                return {
                    property: "panelContent",
                    autoLoad: !1,
                    lazyLoad: {
                        event: t
                    },
                    loadMask: {
                        el: e.get("panel")
                    }
                }
            }
        },
        panelDestroyable: {
            value: !0
        }
    }, PFUI.augment(a, {
        __renderUI: function() {
            this._resetPanelVisible()
        },
        __bindUI: function() {
            var e = this,
                t = e._getVisibleEvent();
            e.on(t, function(t) {
                e._setPanelVisible(t.newVal)
            })
        },
        _resetPanelVisible: function() {
            var e = this,
                t = e.get("panelVisibleStatus"),
                n = e.get(t);
            e._setPanelVisible(n)
        },
        _getVisibleEvent: function() {
            var e = this,
                t = e.get("panelVisibleStatus");
            return "after" + PFUI.ucfirst(t) + "Change"
        },
        _setPanelVisible: function(e) {
            var t = this,
                n = t.get("panel"),
                a = e ? "show" : "hide";
            n && i(n)[a]()
        },
        __destructor: function() {
            var e = this,
                t = e.get("panel");
            t && e.get("panelDestroyable") && i(t).remove()
        },
        _setPanelContent: function(e, t) {
            i(e);
            i(e).html(t)
        },
        _uiSetPanelContent: function(e) {
            var t = this,
                n = t.get("panel");
            t._setPanelContent(n, e)
        },
        _uiSetPanel: function(e) {
            var t = this,
                n = t.get("panelContent");
            n && t._setPanelContent(e, n), t._resetPanelVisible()
        }
    }), n.exports = a
});