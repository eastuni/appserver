define(
    [
        'bx-component/popup/popup',
        'text!bx-component/message/message-confirm-tpl.html'
    ],
    function(Popup, tpl) {
        var MessageConfirm = Popup.extend({

            className: 'confirm-message-popup',

            events: {
                'click .confirm-ok-btn': 'okProcess',
                'click .confirm-no-btn': 'noProcess'
            },

            templates: {
                tpl: tpl
            },

            initialize: function() {
                this.$el.html(this.tpl());
                this.$message = this.$el.find('.confirm-message');
                this.$dim = $('#dim');
            },

            render: function(message, okFn, noFn) {
                this.$message.text(message);
                this.okFn = okFn;
                this.noFn = noFn;
                this.show();
            },

            show: function() {
                var self = this,
                    $el = self.$el,
                    marginLeft = $el.outerWidth() / -2,
                    marginTop = $el.outerHeight() / -2;

                $el.css({
                    'margin-left': marginLeft,
                    'margin-top': marginTop
                });

                $el.show();
                this.$dim.show();
            },

            okProcess: function() {
                (typeof this.okFn === 'function') && this.okFn();
                this.close();
            },

            noProcess: function() {
                (typeof this.noFn === 'function') && this.noFn();
                this.close();
            },

            close: function() {
                this.$el.hide();
                this.$dim.hide();
            }
        });

        return new MessageConfirm();
    }
);
