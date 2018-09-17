define("pfui/tree", ["pfui/common", "jquery", "pfui/list", "pfui/data"], function(e, t, n) {
    var i = e("pfui/common"),
        d = i.namespace("Tree");
    i.mix(d, {
        TreeList: e("pfui/tree/treelist"),
        Mixin: e("pfui/tree/treemixin"),
        TreeMenu: e("pfui/tree/treemenu")
    }), n.exports = d
}), define("pfui/tree/treelist", ["pfui/common", "jquery", "pfui/list", "pfui/data"], function(e, t, n) {
    var i = e("pfui/common"),
        d = e("pfui/list"),
        a = e("pfui/tree/treemixin"),
        o = e("pfui/tree/selection"),
        s = d.SimpleList.extend([a, o], {}, {
            ATTRS: {
                itemCls: {
                    value: i.prefix + "tree-item"
                },
                itemTpl: {
                    value: "<li>{text}</li>"
                },
                idField: {
                    value: "id"
                }
            }
        }, {
            xclass: "tree-list"
        });
    n.exports = s
}), define("pfui/tree/treemixin", ["jquery", "pfui/common", "pfui/data"], function(e, t, n) {
    function i(e, t) {
        return a.isString(t) && (t = e.findNode(t)), t
    }
    var d = e("jquery"),
        a = e("pfui/common"),
        o = e("pfui/data"),
        s = "expanded",
        l = "loading",
        c = "checked",
        r = "partial-checked",
        u = {
            NONE: "none",
            ALL: "all",
            CUSTOM: "custom",
            ONLY_LEAF: "onlyLeaf"
        },
        h = "x-tree-icon",
        f = "x-tree-elbow",
        p = "x-tree-show-line",
        v = f + "-",
        g = h + "-wraper",
        m = v + "line",
        _ = v + "end",
        C = v + "empty",
        k = v + "expander",
        x = h + "-checkbox",
        N = h + "-radio",
        I = k + "-end",
        b = function() {};
    b.ATTRS = {
        store: {
            getter: function(e) {
                if (!e) {
                    var t = this,
                        n = new o.TreeStore({
                            root: t.get("root"),
                            data: t.get("nodes")
                        });
                    return t.setInternal("store", n), n
                }
                return e
            }
        },
        root: {},
        nodes: {
            sync: !1
        },
        iconContainer: {},
        iconWraperTpl: {
            value: '<span class="' + g + '">{icons}</span>'
        },
        showLine: {
            value: !1
        },
        showIcons: {
            value: !0
        },
        iconTpl: {
            value: '<span class="x-tree-icon {cls}"></span>'
        },
        leafCls: {
            value: v + "leaf"
        },
        dirCls: {
            value: v + "dir"
        },
        checkType: {
            value: "custom"
        },
        cascadeCheckd: {
            value: !0
        },
        accordion: {
            value: !1
        },
        multipleCheck: {
            value: !0
        },
        checkedField: {
            valueFn: function() {
                return this.getStatusField("checked")
            }
        },
        checkableField: {
            value: "checkable"
        },
        itemStatusFields: {
            value: {
                expanded: "expanded",
                disabled: "disabled",
                checked: "checked"
            }
        },
        dirSelectable: {
            value: !0
        },
        showRoot: {
            value: !1
        },
        events: {
            value: {
                expanded: !1,
                collapsed: !1,
                checkedchange: !1
            }
        },
        expandEvent: {
            value: "itemdblclick"
        },
        expandAnimate: {
            value: !1
        },
        collapseEvent: {
            value: "itemdblclick"
        },
        startLevel: {
            value: 1
        }
    }, a.augment(b, {
        collapseAll: function() {
            var e = this,
                t = e.get("view").getAllElements();
            a.each(t, function(t) {
                var n = e.getItemByElement(t);
                n && e._collapseNode(n, t, !0)
            })
        },
        collapseNode: function(e) {
            var t, n = this;
            a.isString(e) && (e = n.findNode(e)), e && (t = n.findElement(e), n._collapseNode(e, t))
        },
        expandAll: function() {
            var e = this,
                t = e.get("view").getAllElements();
            a.each(t, function(t) {
                var n = e.getItemByElement(t);
                e._expandNode(n, t, !0)
            })
        },
        expandNode: function(e, t) {
            var n, i = this;
            a.isString(e) && (e = i.findNode(e)), e && (e.parent && !i.isExpanded(e.parent) && i.expandNode(e.parent), n = i.findElement(e), i._expandNode(e, n, t))
        },
        expandPath: function(e, t, n) {
            if (e) {
                n = n || 0;
                var i, d, a, o, s = this,
                    l = s.get("store"),
                    c = e.split(",");
                for (i = s.findNode(c[n]), a = n + 1; a < c.length; a++)
                    if (o = c[a], d = s.findNode(o, i), i && d) s.expandNode(i), i = d;
                    else if (i && t) {
                    l.load({
                        id: i.id
                    }, function() {
                        d = s.findNode(o, i), d && s.expandPath(e, t, a)
                    });
                    break
                }
            }
        },
        findNode: function(e, t) {
            return this.get("store").findNode(e, t)
        },
        getCheckedLeaf: function(e) {
            var t = this,
                n = t.get("store");
            return n.findNodesBy(function(e) {
                return e.leaf && t.isChecked(e)
            }, e)
        },
        getCheckedNodes: function(e) {
            var t = this,
                n = t.get("store");
            return n.findNodesBy(function(e) {
                return t.isChecked(e)
            }, e)
        },
        isItemSelectable: function(e) {
            var t = this,
                n = t.get("dirSelectable"),
                i = e;
            return !i || n || i.leaf ? !0 : !1
        },
        isExpanded: function(e) {
            if (!e || e.leaf) return !1;
            var t, n = this;
            return n._isRoot(e) && !n.get("showRoot") ? !0 : (a.isString(e) && (item = n.getItem(e)), t = n.findElement(e), this._isExpanded(e, t))
        },
        isChecked: function(e) {
            return e ? !!e[this.get("checkedField")] : !1
        },
        toggleExpand: function(e) {
            var t, n = this;
            a.isString(e) && (item = n.getItem(e)), t = n.findElement(e), n._toggleExpand(e, t)
        },
        setNodeChecked: function(e, t, n) {
            if (n = null == n ? !0 : n, e) {
                var d, o, s = this,
                    l = s.get("multipleCheck"),
                    r = s.get("cascadeCheckd");
                if (e = i(this, e), e && (d = e.parent, s.isCheckable(e))) {
                    if (s.isChecked(e) !== t || s.hasStatus(e, "checked") !== t) {
                        if (o = s.findElement(e), r ? (o ? (s.setItemStatus(e, c, t, o), l ? s._resetPatialChecked(e, t, t, o) : t && d && s.isChecked(d) != t && s.setNodeChecked(d, t, !1)) : s.isItemDisabled(e) || s.setStatusValue(e, c, t), d && (s.isChecked(d) != t ? s._resetParentChecked(d) : l && s._resetPatialChecked(d, null, null, null, !0))) : s.isItemDisabled(e) || (o ? s.setItemStatus(e, c, t, o) : s.setStatusValue(e, c, t)), t && !l && (s.isChecked(d) || d == s.get("root") || !r)) {
                            var u = d.children;
                            a.each(u, function(t) {
                                t !== e && s.isChecked(t) && s.setNodeChecked(t, !1)
                            })
                        }
                        s.fire("checkedchange", {
                            node: e,
                            element: o,
                            checked: t
                        })
                    }!e.leaf && n && r && a.each(e.children, function(e, i) {
                        (l || !t || !l && 0 == i) && s.setNodeChecked(e, t, n)
                    })
                }
            }
        },
        setChecked: function(e) {
            this.setNodeChecked(e, !0)
        },
        clearAllChecked: function() {
            var e = this,
                t = e.getCheckedNodes();
            a.each(t, function(t) {
                e.setNodeChecked(t, !1)
            })
        },
        _initRoot: function() {
            var e, t, n = this,
                i = n.get("store"),
                d = n.get("showRoot");
            i && (e = i.get("root"), n.setInternal("root", e), t = d ? [e] : e.children, a.each(t, function(e) {
                n._initChecked(e, !0)
            }), n.clearItems(), n.addItems(t))
        },
        _initChecked: function(e, t) {
            var n, i = this,
                d = i.get("checkType"),
                o = i.get("checkedField"),
                s = i.get("multipleCheck"),
                l = i.get("checkableField"),
                c = i.get("cascadeCheckd");
            return d === u.NONE ? (e[l] = !1, void(e[o] = !1)) : d === u.ONLY_LEAF ? void(e.leaf ? e[l] = !0 : (e[l] = !1, e[o] = !1, t && a.each(e.children, function(e) {
                i._initChecked(e, t)
            }))) : (d === u.CUSTOM && null == e[l] && (e[l] = null != e[o]), d === u.ALL && (e[l] = !0), void(e && i.isCheckable(e) && (n = e.parent, !i.isChecked(e) && c && (n && i.isChecked(n) && (s || !i._hasChildChecked(n)) && i.setStatusValue(e, "checked", !0), (e.children && e.children.length && i._isAllChildrenChecked(e) || !s && i._hasChildChecked(e)) && i.setStatusValue(e, "checked", !0)), t && a.each(e.children, function(e) {
                i._initChecked(e, t)
            }))))
        },
        _resetPatialChecked: function(e, t, n, i, d) {
            if (!e || e.leaf) return !0;
            var n, a = this;
            return (t = null == t ? a.isChecked(e) : t) ? void a.setItemStatus(e, r, !1, i) : (n = null == n ? a._hasChildChecked(e) : n, a.setItemStatus(e, r, n, i), void(d && e.parent && a._resetPatialChecked(e.parent, !1, n ? n : null, null, d)))
        },
        _resetParentChecked: function(e) {
            if (this.isCheckable(e)) {
                var t = this,
                    n = t.get("multipleCheck"),
                    i = n ? t._isAllChildrenChecked(e) : t._hasChildChecked(e);
                t.setStatusValue(e, "checked", i), t.setNodeChecked(e, i, !1), n && t._resetPatialChecked(e, i, null, null, !0)
            }
        },
        __bindUI: function() {
            var e = this,
                t = (e.get("el"), e.get("multipleCheck"));
            e.on("itemclick", function(t) {
                var n = d(t.domTarget),
                    i = t.element,
                    a = t.item;
                if (n.hasClass(k)) return e._toggleExpand(a, i), !1;
                if (n.hasClass(x)) {
                    var o = e.isChecked(a);
                    e.setNodeChecked(a, !o)
                } else n.hasClass(N) && e.setNodeChecked(a, !0)
            }), e.on("itemrendered", function(n) {
                var i = n.item,
                    d = n.domTarget;
                e._resetIcons(i, d), e.isCheckable(i) && t && e.get("cascadeCheckd") && e._resetPatialChecked(i, null, null, d), e._isExpanded(i, d) && e._showChildren(i)
            }), e._initExpandEvent()
        },
        _initExpandEvent: function() {
            function e(e) {
                return function(n) {
                    var i = d(n.domTarget),
                        a = n.element,
                        o = n.item;
                    i.hasClass(k) || t[e](o, a)
                }
            }
            var t = this,
                n = (t.get("el"), t.get("expandEvent")),
                i = t.get("collapseEvent");
            n == i ? t.on(n, e("_toggleExpand")) : (n && t.on(n, e("_expandNode")), i && t.on(i, e("_collapseNode")))
        },
        _isForceChecked: function() {
            var e = this,
                t = e.get("multipleCheck");
            return t ? e._isAllChildrenChecked() : _isForceChecked()
        },
        _isAllChildrenChecked: function(e) {
            if (!e || e.leaf) return !1;
            var t = this,
                n = e.children,
                i = !0;
            return a.each(n, function(e) {
                return i = i && t.isChecked(e), i ? void 0 : !1
            }), i
        },
        _hasChildChecked: function(e) {
            if (!e || e.leaf) return !1;
            var t = this;
            return 0 != t.getCheckedNodes(e).length
        },
        _isRoot: function(e) {
            var t = this,
                n = t.get("store");
            return n && n.get("root") == e ? !0 : !1
        },
        _setLoadStatus: function(e, t, n) {
            var i = this;
            i.setItemStatus(e, l, n, t)
        },
        _beforeLoadNode: function(e) {
            var t, n = this;
            a.isString(e) && (e = n.findNode(e)), t = n.findElement(e), t ? (n._collapseNode(e, t), n._setLoadStatus(e, t, !0)) : e && a.each(e.children, function(e) {
                n._removeNode(e)
            })
        },
        onBeforeLoad: function(e) {
            var t = this,
                n = e.params,
                i = n.id,
                d = t.findNode(i) || t.get("root");
            t._beforeLoadNode(d)
        },
        _addNode: function(e, t) {
            var n, i, d, a = this,
                o = e.parent;
            a._initChecked(e, !0), o ? (a.isExpanded(o) && (n = o.children.length, d = a._getInsetIndex(e), a.addItemAt(e, d), t == n - 1 && t > 0 && (i = o.children[t - 1], a._updateIcons(i))), a._updateIcons(o)) : (d = a._getInsetIndex(e), a.addItemAt(e, d), i = a.get("nodes")[t - 1], a._updateIcons(i))
        },
        _getInsetIndex: function(e) {
            var t, n = this;
            return t = n._getNextItem(e), t ? n.indexOfItem(t) : n.getItemCount()
        },
        _getNextItem: function(e) {
            var t, n, i = this,
                d = e.parent,
                o = null;
            return d ? (t = d.children, n = a.Array.indexOf(e, t), o = t[n + 1], o || i._getNextItem(d)) : null
        },
        onAdd: function(e) {
            var t = this,
                n = e.node,
                i = e.index;
            t._addNode(n, i)
        },
        _updateNode: function(e) {
            var t = this;
            t.updateItem(e), t._updateIcons(e)
        },
        onUpdate: function(e) {
            var t = this,
                n = e.node;
            t._updateNode(n)
        },
        _removeNode: function(e, t) {
            var n, i, d = this,
                a = e.parent;
            d.collapseNode(e), a && (d.removeItem(e), d.isExpanded(a) && (n = a.children.length, n == t && 0 !== t && (i = a.children[t - 1], d._updateIcons(i))), d._updateIcons(a), d._resetParentChecked(a))
        },
        onRemove: function(e) {
            var t = this,
                n = e.node,
                i = e.index;
            t._removeNode(n, i)
        },
        _loadNode: function(e) {
            var t = this;
            t._initChecked(e, !0), t.expandNode(e), t._updateIcons(e), t.setItemStatus(e, l, !1)
        },
        __syncUI: function() {
            var e = this,
                t = e.get("store"),
                n = e.get("showRoot");
            n && !t.hasData() && e._initRoot()
        },
        onLoad: function(e) {
            var t = this,
                n = t.get("store"),
                i = n.get("root");
            e && e.node != i || t._initRoot(), e && e.node && t._loadNode(e.node)
        },
        _isExpanded: function(e, t) {
            return this.hasStatus(e, s, t)
        },
        _getIconsTpl: function(e) {
            var t, n = this,
                i = e.level,
                d = n.get("startLevel"),
                o = n.get("iconWraperTpl"),
                s = [];
            for (t = d; i > t; t += 1) s.push(n._getLevelIcon(e, t));
            return s.push(n._getExpandIcon(e)), s.push(n._getCheckedIcon(e)), s.push(n._getNodeTypeIcon(e)), a.substitute(o, {
                icons: s.join("")
            })
        },
        _getCheckedIcon: function(e) {
            var t, n = this,
                i = n.isCheckable(e);
            return i ? (t = n.get("multipleCheck") ? x : N, n._getIcon(t)) : ""
        },
        isCheckable: function(e) {
            return e[this.get("checkableField")]
        },
        _getExpandIcon: function(e) {
            var t = this,
                n = k;
            return e.leaf ? t._getLevelIcon(e) : (t._isLastNode(e) && (n = n + " " + I), t._getIcon(n))
        },
        _getNodeTypeIcon: function(e) {
            var t = this,
                n = e.cls ? e.cls : t.get(e.leaf ? "leafCls" : "dirCls");
            return t._getIcon(n)
        },
        _getLevelIcon: function(e, t) {
            var n, i = this,
                d = i.get("showLine"),
                a = C;
            return d && (e.level === t || null == t ? a = i._isLastNode(e) ? _ : f : (n = i._getParentNode(e, t), a = i._isLastNode(n) ? C : m)), i._getIcon(a)
        },
        _getParentNode: function(e, t) {
            var n = e.level,
                i = e.parent,
                d = n - 1;
            if (t >= n) return null;
            for (; d > t;) i = i.parent, d -= 1;
            return i
        },
        _getIcon: function(e) {
            var t = this,
                n = t.get("iconTpl");
            return a.substitute(n, {
                cls: e
            })
        },
        _isLastNode: function(e) {
            if (!e) return !1;
            if (e == this.get("root")) return !0;
            var t, n = this,
                i = e.parent,
                d = i ? i.children : n.get("nodes");
            return t = d.length, d[t - 1] === e
        },
        _initNodes: function(e, t, n) {
            var i = this;
            a.each(e, function(e) {
                e.level = t, null == e.leaf && (e.leaf = e.children ? !1 : !0), n && !e.parent && (e.parent = n), i._initChecked(e), e.children && i._initNodes(e.children, t + 1, e)
            })
        },
        _collapseNode: function(e, t, n) {
            var i = this;
            e.leaf || i.hasStatus(e, s, t) && (i.setItemStatus(e, s, !1, t), n ? (i._collapseChildren(e, n), i.removeItems(e.children)) : i._hideChildrenNodes(e), i.fire("collapsed", {
                node: e,
                element: t
            }))
        },
        _hideChildrenNodes: function(e) {
            var t = this,
                n = e.children,
                i = [];
            a.each(n, function(e) {
                var n = t.findElement(e);
                n && (i.push(n), t._hideChildrenNodes(e))
            }), t.get("expandAnimate") ? (i = d(i), i.animate({
                height: 0
            }, function() {
                t.removeItems(n)
            })) : t.removeItems(n)
        },
        _collapseChildren: function(e, t) {
            var n = this,
                i = e.children;
            a.each(i, function(e) {
                n.collapseNode(e, t)
            })
        },
        _expandNode: function(e, t, n) {
            var i = this,
                d = i.get("accordion"),
                o = i.get("store");
            if (!e.leaf) {
                if (!i.hasStatus(e, s, t)) {
                    if (d && e.parent) {
                        var l = e.parent.children;
                        a.each(l, function(t) {
                            t != e && i.collapseNode(t)
                        })
                    }
                    o && !o.isLoaded(e) ? i._isLoading(e, t) || o.loadNode(e) : t && (i.setItemStatus(e, s, !0, t), i._showChildren(e), i.fire("expanded", {
                        node: e,
                        element: t
                    }))
                }
                a.each(e.children, function(e) {
                    (n || i.isExpanded(e)) && i.expandNode(e, n)
                })
            }
        },
        _showChildren: function(e) {
            if (e && e.children) {
                var t, n = this,
                    i = n.indexOfItem(e),
                    d = e.children.length,
                    a = d - 1;
                for (a = d - 1; a >= 0; a--) t = e.children[a], n.getItem(t) || (n.get("expandAnimate") ? (el = n._addNodeAt(t, i + 1), el.hide(), el.slideDown()) : n.addItemAt(t, i + 1))
            }
        },
        _addNodeAt: function(e, t) {
            var n = this,
                i = n.get("items");
            return void 0 === t && (t = i.length), i.splice(t, 0, e), n.addItemToView(e, t)
        },
        _isLoading: function(e, t) {
            var n = this;
            return n.hasStatus(e, l, t)
        },
        _resetIcons: function(e, t) {
            if (this.get("showIcons")) {
                var n, i = this,
                    a = i.get("iconContainer"),
                    o = i._getIconsTpl(e);
                d(t).find("." + g).remove(), n = d(t).find(a).first(), a && n.length ? d(o).prependTo(n) : d(t).prepend(d(o))
            }
        },
        _toggleExpand: function(e, t) {
            var n = this;
            n._isExpanded(e, t) ? n._collapseNode(e, t) : n._expandNode(e, t)
        },
        _updateIcons: function(e) {
            var t = this,
                n = t.findElement(e);
            n && (t._resetIcons(e, n), t._isExpanded(e, n) && !e.leaf && a.each(e.children, function(e) {
                t._updateIcons(e)
            }))
        },
        _uiSetShowRoot: function() {
            var e = this,
                t = this.get("showRoot") ? 0 : 1;
            e.set("startLevel", t)
        },
        _uiSetNodes: function(e) {
            var t = this,
                n = t.get("store");
            n.setResult(e)
        },
        _uiSetShowLine: function(e) {
            var t = this,
                n = t.get("el");
            e ? n.addClass(p) : n.removeClass(p)
        }
    }), n.exports = b
}), define("pfui/tree/selection", ["pfui/common", "jquery", "pfui/list", "pfui/data"], function(e, t, n) {
    var i = e("pfui/common"),
        d = e("pfui/list").SimpleList,
        a = function() {};
    a.ATTRS = {}, i.augment(a, {
        getSelection: function() {
            var e, t = this,
                n = t.getStatusField("selected");
            return n ? (e = t.get("store"), e.findNodesBy(function(e) {
                return e[n]
            })) : d.prototype.getSelection.call(this)
        },
        getSelected: function() {
            var e, t = this,
                n = t.getStatusField("selected");
            return n ? (e = t.get("store"), e.findNodeBy(function(e) {
                return e[n]
            })) : d.prototype.getSelected.call(this)
        }
    }), n.exports = a
}), define("pfui/tree/treemenu", ["pfui/common", "jquery", "pfui/list", "pfui/data"], function(e, t, n) {
    var i = e("pfui/common"),
        d = e("pfui/list"),
        a = e("pfui/tree/treemixin"),
        o = e("pfui/tree/selection"),
        s = d.SimpleList.View.extend({
            getItemTpl: function(e, t) {
                var n = this,
                    d = n.get("itemTplRender"),
                    a = n.get(e.leaf ? "leafTpl" : "dirTpl");
                return d ? d(e, t) : i.substitute(a, e)
            }
        }, {
            xclass: "tree-menu-view"
        }),
        l = d.SimpleList.extend([a, o], {}, {
            ATTRS: {
                itemCls: {
                    value: i.prefix + "tree-item"
                },
                dirSelectable: {
                    value: !1
                },
                expandEvent: {
                    value: "itemclick"
                },
                itemStatusFields: {
                    value: {
                        selected: "selected"
                    }
                },
                collapseEvent: {
                    value: "itemclick"
                },
                xview: {
                    value: s
                },
                dirTpl: {
                    view: !0,
                    value: '<li class="{cls}"><a href="#">{text}</a></li>'
                },
                leafTpl: {
                    view: !0,
                    value: '<li class="{cls}"><a href="{href}">{text}</a></li>'
                },
                idField: {
                    value: "id"
                }
            }
        }, {
            xclass: "tree-menu"
        });
    l.View = s, n.exports = l
});