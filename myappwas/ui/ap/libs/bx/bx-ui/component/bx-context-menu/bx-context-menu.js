define(
    [
        'bx/common/active-state',
        'bx-component/popup/popup',
        'text!bx-component/bx-context-menu/bx-context-menu-tpl.html'
    ],
    function(
        activeState,
        Popup,
        tpl
    ) {
        var BxContextMenu = Popup.extend({

            className: 'bx-context-menu',

            templates: {
                tpl: tpl
            },

            events: {
                'click .cancel-btn': 'close',
                'click .bx-context-menu-item': 'clickContextMenuHandler'
            },

            /**
             *
             * @param initParam {
             *  menuItems,
             *  item,
             *  itemId,
             *  itemData,
             *  currentTarget,
             *  e
             *  }
             */
            initialize: function(initParam) {

                $.extend(this, initParam);

                // Set Page
                this.$el.html(this.tpl({menuItems: this.menuItems}));

                this.$el.height(this.menuItems.length * 20);

                this.$el.css({top: this.e.pageY, left: this.e.pageX})

                activeState.registLayer(this);

                // Dom Element Cache
                this.$transDim = $('.bx-layer-transparent-dim');
            },

            render: function() {
                this.show();
            },

            clickContextMenuHandler: function(e) {
                var menuIdx = $(e.currentTarget).attr('data-idx'),
                    menuFunc = this.menuItems[menuIdx].handler;

                this.close();
                (typeof menuFunc === 'function') && menuFunc.call(null, this.itemId, this.itemData, this.currentTarget, this.e);
            },

            show: function() {
                this.$transDim.show();
                this.$el.show();
            },

            close: function() {
                this.$el.hide();
                this.$transDim.hide();

                typeof this.afterClose === 'function' && this.afterClose();
            },

            afterClose: function() {
                this.remove();
            }
        });

        return BxContextMenu;
    }
)