define(
    ['bx/common/active-state'],
    function(activeState) {
        var SelectLayer = Backbone.View.extend({
            tagName: 'section',
            className: 'bx-select-layer',

            events: {

            },

            initialize: function($parent, option) {
                var that = this,
                    parentOffset = $parent.offset();

                $.extend(that, option);

                that.$el.offset({
                    top: parentOffset.top + $parent.height(),
                    left: parentOffset.left
                });

                $('body').append(that.$el);

                activeState.registLayer(that);
                that.$transDim = $('.bx-layer-transparent-dim');
            },

            render: function() {
                this.show();
            },

            show: function() {
                this.$el.show();
                this.$transDim.show();
            },

            setParent: function($parent) {
                var parentOffset = $parent.offset();

                this.$el.offset({
                    top: parentOffset.top + $parent.height(),
                    left: parentOffset.left
                });
            },

            close: function() {
                this.$el.hide();
                this.$transDim.hide();

                typeof this.afterClose === 'function' && this.afterClose();
            }

        });

        return SelectLayer;
    }
);
