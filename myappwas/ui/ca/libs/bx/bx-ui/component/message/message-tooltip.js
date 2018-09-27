define(
    [
        'text!bx-component/message/message-tooltip-tpl.html'
    ],
    function(tpl) {
        var MessageTooltip = Backbone.View.extend({
            tagName: 'section',
            className: 'tooltip',

            templates: {
                tpl: tpl
            },

            initialize: function() {
                this.$el.html(tpl);
                this.$message = this.$el.find('.tooltip-message');
                $('body').append(this.$el);
            },

            render: function(message) {

            },

            show: function(message, posX, posY) {
                this.$message.text(message);
                this.$el.removeAttr('style');

                this.$el.css({top: posY, left: posX}).show();
            },

            hide: function() {

                if(!this.$el.is(':visible')) {
                    return;
                }

                this.$el.hide();
            }
        });

        return new MessageTooltip();
    }
);
