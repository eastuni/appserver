/**
 * Created by yanggwi on 14. 11. 11..
 */

define(
    [
        'text!bx-component/bx-list/bx-list-item-tpl.html'
    ],
    function (itemTpl) {

        var BXList = Backbone.View.extend({

            tagName: 'ul',
            className: 'bx-list',

            events: {
                'click .bx-list-item': 'clickItemHandler',
                'dblclick .bx-list-item': 'dblclickItemHandler',
                'click .bx-list-delete-btn': 'itemDeleteHandler'
            },

            templates: {
                itemTpl: itemTpl
            },

            listeners: { },

            itemConfig: { },

            /**
             *
             * @param config { listeners(clickItem, deleteItem), checkAble, deleteAble}
             */

            initialize: function (initConfig) {
                $.extend(this, initConfig);

                if(initConfig) {
                    initConfig.attrs && this.$el.attr(initConfig.attrs);
                }
            },

            render: function() {
                this.itemConfig.viewId = this.cid;
                return this.$el;
            },

            renderItem: function(listData) {
                var that = this,
                    listHTML = [];

                if(!listData) { return; }

                listData.forEach(function(data) {
                    var itemData = {id: data[that.fields.id], value: data[that.fields.value]},
                        itemHTML = that.itemTpl($.extend(true, that.itemConfig, itemData));

                    listHTML.push($(itemHTML).data('obj', data));
                });

                that.$el.html(listHTML);
            },

            commonHandler: function(handlerName, $item, eventTarget, e) {
                var handler = this.listeners[handlerName],
                    processDefault;

                if(typeof handler === 'function') {
                    processDefault = handler.call(this, $item.data('id'),  $item.data('obj'), eventTarget, e);
                }

                return !(processDefault === false);
            },

            clickItemHandler: function(e) {
                var eventTarget = e.currentTarget,
                    $item = $(eventTarget);

                if(!this.commonHandler('clickItem', $item, eventTarget, e)) {
                    return;
                }

                // 중복 선택
                if(!this.itemConfig.multySelectAble) {
                    this.$el.find('.bx-list-item.is-selected').removeClass('is-selected');
                }

                $item.find('.bx-list-selector').prop('checked', true);

                // 토글
                if($item.hasClass('is-selected')) {
                    $item.removeClass('is-selected')
                                .find('.bx-list-selector').prop('checked', false);
                }else {
                    $item.addClass('is-selected')
                                .find('.bx-list-selector').prop('checked', true);
                }
            },

            dblclickItemHandler: function(e) {
                var eventTarget = e.currentTarget,
                    $item = $(eventTarget);

                if(!this.commonHandler('dblclickItem', $item, eventTarget, e)) {
                    return;
                }
            },

            itemDeleteHandler: function(e) {
                var eventTarget = e.currentTarget,
                    $item = $(eventTarget).parent();

                e.stopPropagation();

                if(!this.commonHandler('deleteItem', $item, eventTarget, e)) {
                    return;
                }
            },

            selectItem: function(idList, isTriggerClickItem) {
                var that = this,
                    idList = $.isArray(idList)? idList:[idList];

                that.$el.find('.bx-list-item.is-selected').removeClass('is-selected')
                        .find('.bx-list-selector').prop('checked', false);

                idList.forEach(function(id) {
                    var $listItem = that.$el.find('.bx-list-item[data-id="'+id+'"]');

                    $listItem.addClass('is-selected')
                             .find('.bx-list-selector').prop('checked', true);

                    if(isTriggerClickItem) {
                        $listItem.click();
                    }
                });
            },

            markItem: function(idList) {
                var that = this,
                    idList = $.isArray(idList)? idList:[idList];

                that.$el.find('.bx-list-item.is-marked').removeClass('is-marked');

                idList.forEach(function(id) {
                    var $listItem = that.$el.find('.bx-list-item[data-id="'+id+'"]');
                    $listItem.addClass('is-marked');
                });
            },

            deselectedAll: function () {
                this.$el.find('.bx-list-item.is-selected').removeClass('is-selected');
            },

            demarkedAll: function () {
                this.$el.find('.bx-list-item.is-marked').removeClass('is-marked');
            },

            changeMode: function(mode) {
                this.$el.attr('data-mode', mode);
                this.mode = mode;
            },

            getSelectedItem: function() {
                var selectedItemData = [];

                this.$el.find('.bx-list-item.is-selected').each(function(i, item) {
                    selectedItemData.push($(item).data('obj'));
                });

                return selectedItemData;
            },

            getSelectedItemId: function() {
                var selectedItemIdData = [];

                this.$el.find('.bx-list-item.is-selected').each(function(i, item) {
                    selectedItemIdData.push($(item).attr('data-id'));
                });

                return selectedItemIdData;
            },

            deleteItem: function(itemId) {
                this.$el.find('.bx-list-item[data-id="'+itemId+'"]').remove();
            }

        });

        return BXList;


    }
);