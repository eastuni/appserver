define("pfui/list", ["pfui/common", "jquery", "pfui/data"], function(t, e, i) {
    var n = t("pfui/common"),
        s = n.namespace("List");
    n.mix(s, {
        List: t("pfui/list/list"),
        ListItem: t("pfui/list/listitem"),
        SimpleList: t("pfui/list/simplelist"),
        Listbox: t("pfui/list/listbox")
    }), n.mix(s, {
        ListItemView: s.ListItem.View,
        SimpleListView: s.SimpleList.View
    }), i.exports = s
}), define("pfui/list/list", ["jquery", "pfui/common"], function(t, e, i) {
    var n = (t("jquery"), t("pfui/common")),
        s = n.Component,
        l = s.UIBase,
        r = s.Controller.extend([l.ChildList], {}, {
            ATTRS: {
                elTagName: {
                    view: !0,
                    value: "ul"
                },
                idField: {
                    value: "id"
                },
                defaultChildClass: {
                    value: "list-item"
                }
            }
        }, {
            xclass: "list"
        });
    i.exports = r
}), define("pfui/list/listitem", ["jquery", "pfui/common"], function(t, e, i) {
    var n = (t("jquery"), t("pfui/common")),
        s = n.Component,
        l = s.UIBase,
        r = s.View.extend([l.ListItemView], {}),
        a = s.Controller.extend([l.ListItem], {}, {
            ATTRS: {
                elTagName: {
                    view: !0,
                    value: "li"
                },
                xview: {
                    value: r
                },
                tpl: {
                    view: !0,
                    value: "<span>{text}</span>"
                }
            }
        }, {
            xclass: "list-item"
        });
    a.View = r, i.exports = a
}), define("pfui/list/simplelist", ["jquery", "pfui/common", "pfui/data"], function(t, e, i) {
    var n = t("jquery"),
        s = t("pfui/common"),
        l = s.Component.UIBase,
        r = s.UA,
        a = t("pfui/list/domlist"),
        u = t("pfui/list/keynav"),
        o = t("pfui/list/sortable"),
        m = s.prefix + "list-item",
        c = s.Component.View.extend([a.View], {
            setElementHover: function(t, e) {
                var i = this;
                i.setItemStatusCls("hover", t, e)
            }
        }, {
            ATTRS: {
                itemContainer: {
                    valueFn: function() {
                        return this.get("el").find(this.get("listSelector"))
                    }
                }
            }
        }, {
            xclass: "simple-list-view"
        }),
        g = s.Component.Controller.extend([a, l.Bindable, u, o], {
            bindUI: function() {
                var t = this,
                    e = t.get("itemCls"),
                    i = t.get("view").getItemContainer();
                i.delegate("." + e, "mouseover", function(e) {
                    if (!t.get("disabled")) {
                        var i = e.currentTarget,
                            n = t.getItemByElement(i);
                        t.isItemDisabled(e.item, e.currentTarget) || (r.ie && r.ie < 8 || !t.get("focusable") || "hover" !== t.get("highlightedStatus") ? t.setItemStatus(n, "hover", !0, i) : t.setHighlighted(n, i))
                    }
                }).delegate("." + e, "mouseout", function(e) {
                    if (!t.get("disabled")) {
                        var i = n(e.currentTarget);
                        t.get("view").setElementHover(i, !1)
                    }
                })
            },
            onAdd: function(t) {
                var e = this,
                    i = e.get("store"),
                    n = t.record;
                0 == e.getCount() ? e.setItems(i.getResult()) : e.addItemToView(n, t.index)
            },
            handleContextMenu: function(t) {
                var e = this,
                    i = t.target,
                    s = e.get("itemCls"),
                    l = n(i).closest("." + s),
                    r = e.getItemByElement(l),
                    a = e.fire("itemcontextmenu", {
                        element: l,
                        item: r,
                        pageX: t.pageX,
                        pageY: t.pageY,
                        domTarget: t.target,
                        domEvent: t
                    });
                a === !1 && t.preventDefault()
            },
            onRemove: function(t) {
                var e = this,
                    i = t.record;
                e.removeItem(i)
            },
            onUpdate: function(t) {
                this.updateItem(t.record)
            },
            onLocalSort: function(t) {
                this.get("frontSortable") ? this.sort(t.field, t.direction) : this.onLoad(t)
            },
            onLoad: function() {
                var t = this,
                    e = t.get("store"),
                    i = e.getResult();
                t.set("items", i)
            },
            onFiltered: function(t) {
                var e = this,
                    i = t.data;
                e.set("items", i)
            }
        }, {
            ATTRS: {
                frontSortable: {
                    value: !1
                },
                focusable: {
                    value: !1
                },
                items: {
                    view: !0,
                    value: []
                },
                itemCls: {
                    view: !0,
                    value: m
                },
                idField: {
                    value: "value"
                },
                listSelector: {
                    view: !0,
                    value: "ul"
                },
                itemTpl: {
                    view: !0,
                    value: '<li role="option" class="' + m + '">{text}</li>'
                },
                tpl: {
                    value: "<ul></ul>"
                },
                xview: {
                    value: c
                }
            }
        }, {
            xclass: "simple-list",
            prority: 0
        });
    g.View = c, i.exports = g
}), define("pfui/list/domlist", ["jquery", "pfui/common"], function(t, e, i) {
    "use strict";

    function n(t, e) {
        var i = e,
            n = i.get("itemCls"),
            s = i.get("itemStatusCls");
        return s && s[t] ? s[t] : n + "-" + t
    }

    function s(t, e) {
        var i = t.attributes,
            s = e.get("itemStatusFields"),
            a = {};
        return r.each(i, function(t) {
            var e = t.nodeName; - 1 !== e.indexOf(u) && (e = e.replace(u, ""), a[e] = t.nodeValue)
        }), a.text = l(t).text(), r.each(s, function(i, s) {
            var r = n(s, e);
            l(t).hasClass(r) && (a[i] = !0)
        }), a
    }
    var l = t("jquery"),
        r = t("pfui/common"),
        a = r.Component.UIBase.Selection,
        u = "data-",
        o = r.Component.UIBase.List,
        m = function() {};
    m.ATTRS = {
        items: {}
    }, m.prototype = {
        clearControl: function() {
            var t = this,
                e = t.getItemContainer(),
                i = t.get("itemCls");
            e.find("." + i).remove()
        },
        addItem: function(t, e) {
            return this._createItem(t, e)
        },
        getItems: function() {
            var t = this,
                e = t.getAllElements(),
                i = [];
            return r.each(e, function(e) {
                i.push(t.getItemByElement(e))
            }), i
        },
        updateItem: function(t) {
            var e, i = this,
                n = i.getItems(),
                s = r.Array.indexOf(t, n),
                a = null;
            return s >= 0 && (a = i.findElement(t), e = i.getItemTpl(t, s), a && l(a).html(l(e).html())), a
        },
        removeItem: function(t, e) {
            e = e || this.findElement(t), l(e).remove()
        },
        getItemContainer: function() {
            var t = this.get("itemContainer");
            return t.length ? t : this.get("el")
        },
        getItemTpl: function(t, e) {
            var i = this,
                n = i.get("itemTplRender"),
                s = i.get("itemTpl");
            return n ? n(t, e) : r.substitute(s, t)
        },
        _createItem: function(t, e) {
            var i = this,
                n = i.getItemContainer(),
                s = i.get("itemCls"),
                r = i.get("dataField"),
                a = i.getItemTpl(t, e),
                u = l(a);
            if (void 0 !== e) {
                var o = n.find("." + s)[e];
                o ? u.insertBefore(o) : u.appendTo(n)
            } else u.appendTo(n);
            return u.addClass(s), u.data(r, t), u
        },
        getItemStatusCls: function(t) {
            return n(t, this)
        },
        setItemStatusCls: function(t, e, i) {
            var n = this,
                s = n.getItemStatusCls(t),
                r = i ? "addClass" : "removeClass";
            e && l(e)[r](s)
        },
        hasStatus: function(t, e) {
            var i = this,
                n = i.getItemStatusCls(t);
            return l(e).hasClass(n)
        },
        setItemSelected: function(t, e, i) {
            var n = this;
            i = i || n.findElement(t), n.setItemStatusCls("selected", i, e)
        },
        getAllElements: function() {
            var t = this,
                e = t.get("itemCls"),
                i = t.get("el");
            return i.find("." + e)
        },
        getItemByElement: function(t) {
            var e = this,
                i = e.get("dataField");
            return l(t).data(i)
        },
        getFirstElementByStatus: function(t) {
            var e = this,
                i = e.getItemStatusCls(t),
                n = e.get("el");
            return n.find("." + i)[0]
        },
        getElementsByStatus: function(t) {
            var e = this,
                i = e.getItemStatusCls(t),
                n = e.get("el");
            return n.find("." + i)
        },
        getSelectedElements: function() {
            var t = this,
                e = t.getItemStatusCls("selected"),
                i = t.get("el");
            return i.find("." + e)
        },
        findElement: function(t) {
            var e = this,
                i = e.getAllElements(),
                n = null;
            return r.each(i, function(i) {
                return e.getItemByElement(i) == t ? (n = i, !1) : void 0
            }), n
        },
        isElementSelected: function(t) {
            var e = this,
                i = e.getItemStatusCls("selected");
            return t && l(t).hasClass(i)
        }
    };
    var c = function() {};
    c.ATTRS = r.merge(!0, o.ATTRS, a.ATTRS, {
        dataField: {
            view: !0,
            value: "data-item"
        },
        itemContainer: {
            view: !0
        },
        itemStatusFields: {
            value: {}
        },
        itemCls: {
            view: !0
        },
        cancelSelected: {
            value: !1
        },
        textGetter: {},
        defaultLoaderCfg: {
            value: {
                property: "items",
                dataType: "json"
            }
        },
        events: {
            value: {
                itemrendered: !0,
                itemremoved: !0,
                itemupdated: !0,
                itemsshow: !1,
                beforeitemsshow: !1,
                itemsclear: !1,
                itemdblclick: !1,
                beforeitemsclear: !1
            }
        }
    }), c.PARSER = {
        items: function(t) {
            var e = this,
                i = [],
                n = e.get("itemCls"),
                a = e.get("dataField"),
                u = t.find("." + n);
            return u.length || (u = t.children(), u.addClass(n)), r.each(u, function(t) {
                var n = s(t, e);
                i.push(n), l(t).data(a, n)
            }), i
        }
    }, r.augment(c, o, a, {
        _uiSetItems: function(t) {
            var e = this;
            (!e.get("srcNode") || e.get("rendered")) && this.setItems(t)
        },
        __bindUI: function() {
            function t(t, i) {
                var n, s = e.get("multipleSelect");
                n = e.isItemSelected(t, i), n ? s ? e.setItemSelected(t, !1, i) : e.get("cancelSelected") && e.setSelected(null) : (s || e.clearSelected(), e.setItemSelected(t, !0, i))
            }
            var e = this,
                i = e.get("selectedEvent"),
                n = e.get("itemCls"),
                s = e.get("view").getItemContainer();
            s.delegate("." + n, "click", function(n) {
                if (!e.get("disabled")) {
                    var s = l(n.currentTarget),
                        r = e.getItemByElement(s);
                    if (!e.isItemDisabled(r, s)) {
                        var a = e.fire("itemclick", {
                            item: r,
                            element: s[0],
                            domTarget: n.target,
                            domEvent: n
                        });
                        a !== !1 && "click" == i && e.isItemSelectable(r) && t(r, s)
                    }
                }
            }), "click" !== i && s.delegate("." + n, i, function(i) {
                if (!e.get("disabled")) {
                    var n = l(i.currentTarget),
                        s = e.getItemByElement(n);
                    e.isItemDisabled(s, n) || e.isItemSelectable(s) && t(s, n)
                }
            }), s.delegate("." + n, "dblclick", function(t) {
                if (!e.get("disabled")) {
                    var i = l(t.currentTarget),
                        n = e.getItemByElement(i);
                    e.isItemDisabled(n, i) || e.fire("itemdblclick", {
                        item: n,
                        element: i[0],
                        domTarget: t.target
                    })
                }
            }), e.on("itemrendered itemupdated", function(t) {
                var i = t.item,
                    n = t.element;
                e._syncItemStatus(i, n)
            })
        },
        getValueByField: function(t, e) {
            return t && t[e]
        },
        _syncItemStatus: function(t, e) {
            var i = this,
                n = i.get("itemStatusFields");
            r.each(n, function(n, s) {
                null != t[n] && i.get("view").setItemStatusCls(s, e, t[n])
            })
        },
        getStatusValue: function(t, e) {
            var i = this,
                n = i.get("itemStatusFields"),
                s = n[e];
            return t[s]
        },
        getCount: function() {
            var t = this.getItems();
            return t ? t.length : 0
        },
        getStatusField: function(t) {
            var e = this,
                i = e.get("itemStatusFields");
            return i[t]
        },
        setStatusValue: function(t, e, i) {
            var n = this,
                s = n.get("itemStatusFields"),
                l = s[e];
            l && (t[l] = i)
        },
        getItemText: function(t) {
            var e = this,
                i = e.get("textGetter");
            return t ? i ? i(t) : l(e.findElement(t)).text() : ""
        },
        removeItem: function(t) {
            var e, i = this,
                n = i.get("items"),
                s = i.findElement(t);
            e = r.Array.indexOf(t, n), -1 !== e && n.splice(e, 1), i.get("view").removeItem(t, s), i.fire("itemremoved", {
                item: t,
                domTarget: l(s)[0],
                element: s
            })
        },
        addItemAt: function(t, e) {
            var i = this,
                n = i.get("items");
            return void 0 === e && (e = n.length), n.splice(e, 0, t), i.addItemToView(t, e), t
        },
        addItemToView: function(t, e) {
            var i = this,
                n = i.get("view").addItem(t, e);
            return i.fire("itemrendered", {
                item: t,
                domTarget: l(n)[0],
                element: n
            }), n
        },
        updateItem: function(t) {
            var e = this,
                i = e.get("view").updateItem(t);
            e.fire("itemupdated", {
                item: t,
                domTarget: l(i)[0],
                element: i
            })
        },
        setItems: function(t) {
            var e = this;
            t != e.getItems() && e.setInternal("items", t), e.clearControl(), e.fire("beforeitemsshow"), r.each(t, function(t, i) {
                e.addItemToView(t, i)
            }), e.fire("itemsshow")
        },
        getItems: function() {
            return this.get("items")
        },
        getItemByElement: function(t) {
            return this.get("view").getItemByElement(t)
        },
        getSelected: function() {
            var t = this,
                e = t.get("view").getFirstElementByStatus("selected");
            return t.getItemByElement(e) || null
        },
        getItemsByStatus: function(t) {
            var e = this,
                i = e.get("view").getElementsByStatus(t),
                n = [];
            return r.each(i, function(t) {
                n.push(e.getItemByElement(t))
            }), n
        },
        findElement: function(t) {
            var e = this;
            return r.isString(t) && (t = e.getItem(t)), this.get("view").findElement(t)
        },
        findItemByField: function(t, e) {
            var i = this,
                n = i.get("items"),
                s = null;
            return r.each(n, function(i) {
                return null != i[t] && i[t] == e ? (s = i, !1) : void 0
            }), s
        },
        setItemSelectedStatus: function(t, e, i) {
            var n = this;
            i = i || n.findElement(t), n.setItemStatus(t, "selected", e, i)
        },
        setAllSelection: function() {
            var t = this,
                e = t.getItems();
            t.setSelection(e)
        },
        isItemSelected: function(t, e) {
            var i = this;
            return e = e || i.findElement(t), i.get("view").isElementSelected(e)
        },
        isItemDisabled: function(t, e) {
            return this.hasStatus(t, "disabled", e)
        },
        setItemDisabled: function(t, e) {
            var i = this;
            i.setItemStatus(t, "disabled", e)
        },
        getSelection: function() {
            var t = this,
                e = t.get("view").getSelectedElements(),
                i = [];
            return r.each(e, function(e) {
                i.push(t.getItemByElement(e))
            }), i
        },
        clearControl: function() {
            this.fire("beforeitemsclear"), this.get("view").clearControl(), this.fire("itemsclear")
        },
        hasStatus: function(t, e, i) {
            if (!t) return !1; {
                var n = this;
                n.getStatusField(e)
            }
            return i = i || n.findElement(t), n.get("view").hasStatus(e, i)
        },
        setItemStatus: function(t, e, i, n) {
            var s = this;
            t && (n = n || s.findElement(t)), s.isItemDisabled(t, n) && "disabled" !== e || (t && ("disabled" === e && i && s.clearItemStatus(t), s.setStatusValue(t, e, i), s.get("view").setItemStatusCls(e, n, i), s.fire("itemstatuschange", {
                item: t,
                status: e,
                value: i,
                element: n
            })), "selected" === e && s.afterSelected(t, i, n))
        },
        clearItemStatus: function(t, e, i) {
            var n = this,
                s = n.get("itemStatusFields");
            i = i || n.findElement(t), e ? n.setItemStatus(t, e, !1, i) : (r.each(s, function(e, s) {
                n.setItemStatus(t, s, !1, i)
            }), s.selected || n.setItemSelected(t, !1), n.setItemStatus(t, "hover", !1))
        }
    }), c.View = m, i.exports = c
}), define("pfui/list/keynav", ["jquery", "pfui/common"], function(t, e, i) {
    "use strict";
    var n = t("jquery"),
        s = t("pfui/common"),
        l = function() {};
    l.ATTRS = {
        highlightedStatus: {
            value: "hover"
        }
    }, s.augment(l, {
        setHighlighted: function(t, e) {
            if (!this.hasStatus(t, "hover", e)) {
                var i = this,
                    n = i.get("highlightedStatus"),
                    s = i._getHighLightedElement(),
                    l = s ? i.getItemByElement(s) : null;
                l !== t && (l && this.setItemStatus(l, n, !1, s), this.setItemStatus(t, n, !0, e), i._scrollToItem(t, e))
            }
        },
        _getHighLightedElement: function() {
            var t = this,
                e = t.get("highlightedStatus"),
                i = t.get("view").getFirstElementByStatus(e);
            return i
        },
        getHighlighted: function() {
            var t = this,
                e = t.get("highlightedStatus"),
                i = t.get("view").getFirstElementByStatus(e);
            return t.getItemByElement(i) || null
        },
        getColumnCount: function() {
            var t = this,
                e = t.getFirstItem(),
                i = t.findElement(e),
                s = n(i);
            return i ? parseInt(s.parent().width() / s.outerWidth(), 10) : 1
        },
        getRowCount: function(t) {
            var e = this;
            return t = t || e.getColumnCount(), (this.getCount() + t - 1) / t
        },
        _getNextItem: function(t, e, i) {
            var n, s = this,
                l = s._getCurrentIndex(),
                r = s.getCount(),
                a = t ? 1 : -1;
            return -1 === l ? t ? s.getFirstItem() : s.getLastItem() : (t || (e *= a), n = (l + e + i) % i, n > r - 1 && (t ? n -= r - 1 : n += e), s.getItemAt(n))
        },
        _getLeftItem: function() {
            var t = this,
                e = t.getCount(),
                i = t.getColumnCount();
            return !e || 1 >= i ? null : t._getNextItem(!1, 1, e)
        },
        _getCurrentItem: function() {
            return this.getHighlighted()
        },
        _getCurrentIndex: function() {
            var t = this,
                e = t._getCurrentItem();
            return this.indexOfItem(e)
        },
        _getRightItem: function() {
            var t = this,
                e = t.getCount(),
                i = t.getColumnCount();
            return !e || 1 >= i ? null : this._getNextItem(!0, 1, e)
        },
        _getDownItem: function() {
            var t = this,
                e = t.getColumnCount(),
                i = t.getRowCount(e);
            return 1 >= i ? null : this._getNextItem(!0, e, e * i)
        },
        getScrollContainer: function() {
            return this.get("el")
        },
        isScrollVertical: function() {
            var t = this,
                e = t.get("el"),
                i = t.get("view").getItemContainer();
            return e.height() < i.height()
        },
        _scrollToItem: function(t, e) {
            var i = this;
            if (i.isScrollVertical()) {
                e = e || i.findElement(t);
                var s = i.getScrollContainer(),
                    l = n(e).position().top,
                    r = s.position().top,
                    a = s.height(),
                    u = l - r,
                    o = n(e).height(),
                    m = s.scrollTop();
                (0 > u || u > a - o) && s.scrollTop(m + u)
            }
        },
        _getUpperItem: function() {
            var t = this,
                e = t.getColumnCount(),
                i = t.getRowCount(e);
            return 1 >= i ? null : this._getNextItem(!1, e, e * i)
        },
        handleNavUp: function() {
            var t = this,
                e = t._getUpperItem();
            t.setHighlighted(e)
        },
        handleNavDown: function() {
            this.setHighlighted(this._getDownItem())
        },
        handleNavLeft: function() {
            this.setHighlighted(this._getLeftItem())
        },
        handleNavRight: function() {
            this.setHighlighted(this._getRightItem())
        },
        handleNavEnter: function() {
            var t, e = this,
                i = e._getCurrentItem();
            i && (t = e.findElement(i), n(t).trigger("click"))
        },
        handleNavEsc: function() {
            this.setHighlighted(null)
        },
        handleNavTab: function() {
            this.setHighlighted(this._getRightItem())
        }
    }), i.exports = l
}), define("pfui/list/sortable", ["jquery", "pfui/common", "pfui/data"], function(t, e, i) {
    var n = t("jquery"),
        s = t("pfui/common"),
        l = t("pfui/data").Sortable,
        r = function() {};
    r.ATTRS = s.merge(!0, l.ATTRS, {}), s.augment(r, l, {
        compare: function(t, e, i, s) {
            var l, r = this;
            return i = i || r.get("sortField"), s = s || r.get("sortDirection"), i && s ? (l = "ASC" === s ? 1 : -1, n.isPlainObject(t) || (t = r.getItemByElement(t)), n.isPlainObject(e) || (e = r.getItemByElement(e)), r.get("compareFunction")(t[i], e[i]) * l) : 1
        },
        getSortData: function() {
            return n.makeArray(this.get("view").getAllElements())
        },
        sort: function(t, e) {
            var i = this,
                l = i.sortData(t, e),
                r = i.get("view").getItemContainer();
            i.get("store") || i.sortData(t, e, i.get("items")), s.each(l, function(t) {
                n(t).appendTo(r)
            })
        }
    }), i.exports = r
}), define("pfui/list/listbox", ["jquery", "pfui/common", "pfui/data"], function(t, e, i) {
    var n = t("jquery"),
        s = t("pfui/list/simplelist"),
        l = s.extend({
            bindUI: function() {
                var t = this;
                t.on("selectedchange", function(t) {
                    var e = t.item,
                        i = n(t.domTarget),
                        s = i.find("input");
                    e && s.attr("checked", t.selected)
                })
            }
        }, {
            ATTRS: {
                itemTpl: {
                    value: '<li><span class="x-checkbox"></span>{text}</li>'
                },
                multipleSelect: {
                    value: !0
                }
            }
        }, {
            xclass: "listbox"
        });
    i.exports = l
});