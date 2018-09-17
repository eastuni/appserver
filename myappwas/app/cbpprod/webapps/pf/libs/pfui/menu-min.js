define("pfui/menu", ["pfui/common", "jquery"], function(e, n, t) {
    var i = e("pfui/common"),
        u = i.namespace("Menu");
    i.mix(u, {
        Menu: e("pfui/menu/menu"),
        MenuItem: e("pfui/menu/menuitem"),
        ContextMenu: e("pfui/menu/contextmenu"),
        PopMenu: e("pfui/menu/popmenu"),
        SideMenu: e("pfui/menu/sidemenu")
    }), u.ContextMenuItem = u.ContextMenu.Item, t.exports = u
}), define("pfui/menu/menu", ["pfui/common", "jquery"], function(e, n, t) {
    var i = e("pfui/common"),
        u = i.Component,
        a = u.UIBase,
        l = u.Controller.extend([a.ChildList], {
            bindUI: function() {
                var e = this;
                e.on("click", function(n) {
                    var t = n.target,
                        i = e.get("multipleSelect");
                    e != t && (i || !e.get("clickHide") || t.get("subMenu") || e.getTopAutoHideMenu().hide())
                }), e.on("afterOpenChange", function(n) {
                    var t = n.target,
                        u = n.newVal,
                        a = e.get("children");
                    u && i.each(a, function(e) {
                        e !== t && e.get("open") && e.set("open", !1)
                    })
                }), e.on("afterVisibleChange", function(n) {
                    n.newVal, e.get("parentMenu");
                    e._clearOpen()
                })
            },
            getTopAutoHideMenu: function() {
                var e = this,
                    n = e.get("parentMenu");
                return n && n.get("autoHide") ? n.getTopAutoHideMenu() : e.get("autoHide") ? e : null
            },
            _clearOpen: function() {
                var e = this,
                    n = e.get("children");
                i.each(n, function(e) {
                    e.set && e.set("open", !1)
                })
            },
            findItemById: function(e) {
                return this.findItemByField("id", e)
            },
            _uiSetSelectedItem: function(e) {
                e && _self.setSelected(e)
            }
        }, {
            ATTRS: {
                elTagName: {
                    view: !0,
                    value: "ul"
                },
                idField: {
                    value: "id"
                },
                isDecorateChild: {
                    value: !0
                },
                defaultChildClass: {
                    value: "menu-item"
                },
                selectedItem: {},
                parentMenu: {}
            }
        }, {
            xclass: "menu",
            priority: 0
        });
    t.exports = l
}), define("pfui/menu/menuitem", ["jquery", "pfui/common"], function(e, n, t) {
    var i = e("jquery"),
        u = e("pfui/common"),
        a = u.Component,
        l = a.UIBase,
        s = (u.prefix, "x-caret"),
        o = "data-id",
        c = a.View.extend([l.ListItemView, l.CollapsableView], {
            _uiSetOpen: function(e) {
                var n = this,
                    t = n.getStatusCls("open");
                e ? n.get("el").addClass(t) : n.get("el").removeClass(t)
            }
        }, {
            ATTRS: {}
        }, {
            xclass: "menu-item-view"
        }),
        r = a.Controller.extend([l.ListItem, l.Collapsable], {
            renderUI: function() {
                var e = this,
                    n = e.get("el"),
                    t = e.get("id");
                t || (t = u.guid("menu-item"), e.set("id", t)), n.attr(o, t)
            },
            handleMouseEnter: function(e) {
                this.get("subMenu") && this.get("openable") && this.set("open", !0), r.superclass.handleMouseEnter.call(this, e)
            },
            handleMouseLeave: function(e) {
                if (this.get("openable")) {
                    var n = this,
                        t = n.get("subMenu"),
                        i = e.toElement || e.relatedTarget;
                    i && t && t.containsElement(i) ? n.set("open", !0) : n.set("open", !1)
                }
                r.superclass.handleMouseLeave.call(this, e)
            },
            containsElement: function(e) {
                var n, t = this,
                    i = r.superclass.containsElement.call(t, e);
                return i || (n = t.get("subMenu"), i = n && n.containsElement(e)), i
            },
            _uiSetOpen: function(e) {
                if (this.get("openable")) {
                    var n = this,
                        t = n.get("subMenu"),
                        i = n.get("subMenuAlign");
                    if (t)
                        if (e) i.node = n.get("el"), t.set("align", i), t.show();
                        else {
                            var u = t.get("align");
                            u && u.node != n.get("el") || t.hide()
                        }
                }
            },
            _uiSetSubMenu: function(e) {
                if (e) {
                    var n = this,
                        t = n.get("el"),
                        u = n.get("parent");
                    e.get("parentMenu") || (e.set("parentMenu", u), u.get("autoHide") && ("click" == u.get("autoHideType") ? e.set("autoHide", !1) : e.set("autoHideType", "leave"))), i(n.get("arrowTpl")).appendTo(t)
                }
            },
            destructor: function() {
                var e = this,
                    n = e.get("subMenu");
                n && n.destroy()
            }
        }, {
            ATTRS: {
                elTagName: {
                    value: "li"
                },
                xview: {
                    value: c
                },
                open: {
                    view: !0,
                    value: !1
                },
                openable: {
                    value: !0
                },
                subMenu: {
                    view: !0
                },
                subMenuAlign: {
                    valueFn: function() {
                        return {
                            points: ["tr", "tl"],
                            offset: [-5, 0]
                        }
                    }
                },
                arrowTpl: {
                    value: '<span class="' + s + " " + s + '-left"></span>'
                },
                events: {
                    value: {
                        afterOpenChange: !0
                    }
                },
                subMenuType: {
                    value: "pop-menu"
                }
            },
            PARSER: {
                subMenu: function(e) {
                    var n, t = e.find("ul"),
                        i = this.get("subMenuType");
                    return t && t.length && (n = u.Component.create({
                        srcNode: t,
                        xclass: i
                    }), "pop-menu" == i ? (t.appendTo("body"), n.setInternal({
                        autoHide: !0,
                        autoHideType: "leave"
                    })) : this.get("children").push(n)), n
                }
            }
        }, {
            xclass: "menu-item",
            priority: 0
        }),
        m = r.extend({}, {
            ATTRS: {
                focusable: {
                    value: !1
                },
                selectable: {
                    value: !1
                },
                handleMouseEvents: {
                    value: !1
                }
            }
        }, {
            xclass: "menu-item-sparator"
        });
    r.View = c, r.Separator = m, t.exports = r
}), define("pfui/menu/contextmenu", ["pfui/common", "jquery"], function(e, n, t) {
    var i = e("pfui/common"),
        u = e("pfui/menu/menuitem"),
        a = e("pfui/menu/popmenu"),
        l = i.prefix,
        s = l + "menu-item-link",
        o = l + "menu-item-icon",
        c = i.Component,
        r = (c.UIBase, u.extend({
            bindUI: function() {
                var e = this;
                e.get("el").delegate("." + s, "click", function(e) {
                    e.preventDefault()
                })
            },
            _uiSetIconCls: function(e, n) {
                var t = this,
                    i = n.prevVal,
                    u = t.get("el").find("." + o);
                u.removeClass(i), u.addClass(e)
            }
        }, {
            ATTRS: {
                text: {
                    veiw: !0,
                    value: ""
                },
                iconCls: {
                    sync: !1,
                    value: ""
                },
                tpl: {
                    value: '<a class="' + s + '" href="#">      <span class="' + o + ' {iconCls}"></span><span class="' + l + 'menu-item-text">{text}</span></a>'
                }
            }
        }, {
            xclass: "context-menu-item"
        })),
        m = a.extend({}, {
            ATTRS: {
                defaultChildClass: {
                    value: "context-menu-item"
                },
                align: {
                    value: null
                }
            }
        }, {
            xclass: "context-menu"
        });
    m.Item = r, t.exports = m
}), define("pfui/menu/popmenu", ["pfui/common", "jquery"], function(e, n, t) {
    var i = e("pfui/common"),
        u = i.Component.UIBase,
        a = e("pfui/menu/menu"),
        l = i.Component.View.extend([u.PositionView], {}),
        s = a.extend([u.Position, u.Align, u.AutoShow, u.AutoHide], {}, {
            ATTRS: {
                clickHide: {
                    value: !0
                },
                align: {
                    value: {
                        points: ["bl", "tl"],
                        offset: [0, 0]
                    }
                },
                visibleMode: {
                    value: "visibility"
                },
                autoHide: {
                    value: !0
                },
                visible: {
                    value: !1
                },
                xview: {
                    value: l
                }
            }
        }, {
            xclass: "pop-menu"
        });
    t.exports = s
}), define("pfui/menu/sidemenu", ["jquery", "pfui/common"], function(e, n, t) {
    var i = e("jquery"),
        u = e("pfui/common"),
        a = e("pfui/menu/menu"),
        l = (u.Component, u.prefix + "menu-title"),
        s = "menu-leaf",
        o = a.extend({
            initializer: function() {
                var e = this,
                    n = e.get("items"),
                    t = e.get("children");
                u.each(n, function(n) {
                    var i = e._initMenuCfg(n);
                    t.push(i)
                })
            },
            bindUI: function() {
                var e = this,
                    n = e.get("children");
                u.each(n, function(e) {
                    var n = e.get("children")[0];
                    n && n.publish("click", {
                        bubbles: 1
                    })
                }), e.get("el").delegate("a", "click", function(e) {
                    e.preventDefault()
                }), e.on("itemclick", function(n) {
                    var t = n.item,
                        u = i(n.domTarget).closest("." + e.get("collapsedCls"));
                    if (u.length) {
                        var a = t.get("collapsed");
                        t.set("collapsed", !a)
                    } else t.get("el").hasClass(s) && (e.fire("menuclick", {
                        item: t
                    }), e.clearSelection(), e.setSelected(t))
                })
            },
            getItems: function() {
                var e = this,
                    n = [],
                    t = e.get("children");
                return u.each(t, function(e) {
                    var t = e.get("children")[0];
                    n = n.concat(t.get("children"))
                }), n
            },
            _initMenuCfg: function(e) {
                var n = this,
                    t = e.items,
                    i = [],
                    a = {
                        selectable: !1,
                        children: [{
                            xclass: "menu",
                            children: i
                        }]
                    };
                return u.mix(a, {
                    xclass: "menu-item",
                    elCls: "menu-second"
                }, e), u.each(t, function(e) {
                    var t = n._initSubMenuCfg(e);
                    i.push(t)
                }), a
            },
            _initSubMenuCfg: function(e) {
                var n = this,
                    t = {
                        xclass: "menu-item",
                        elCls: "menu-leaf",
                        tpl: n.get("subMenuItemTpl")
                    };
                return u.mix(t, e)
            }
        }, {
            ATTRS: {
                defaultChildCfg: {
                    value: {
                        subMenuType: "menu",
                        openable: !1,
                        arrowTpl: ""
                    }
                },
                autoInitItems: {
                    value: !1
                },
                itemTpl: {
                    value: '<div class="' + l + '"><s></s><span class="' + l + '-text">{text}</span></div>'
                },
                subMenuItemTpl: {
                    value: '<a href="{href}"><em>{text}</em></a>'
                },
                collapsedCls: {
                    value: l
                },
                events: {
                    value: {
                        menuclick: !1
                    }
                }
            }
        }, {
            xclass: "side-menu"
        });
    t.exports = o
});