define(
    [
        'bx-component/popup/popup',
        'text!bx-component/message/message-error-log-tpl.html'
    ],
    function(Popup, tpl) {
        var ErrorLog = Popup.extend({

            className: 'error-log-popup',

            events: {
                'click .detail-view-btn': 'toggleDetailLog'
            },

            templates: {
                tpl: tpl
            },

            initialize: function() {
                this.$el.html(this.tpl());
                this.$title = this.$el.find('.error-title');
                this.$detailLog = this.$el.find('.error-detail-log');
            },

            render: function(title, detailLog) {
                this.$el.removeAttr('style');
                this.show(title, detailLog);
            },

            show: function(title, detailLog) {
                var marginLeft = this.$el.outerWidth() / -2;

                this.$title.text(title);
                this.$detailLog.html(detailLog);

                this.$el.show();
                this.$el.css('margin-left', marginLeft);
            },

            toggleDetailLog: function() {
                this.$el.toggleClass('detail-view-mode');
            }
        });

        return new ErrorLog();
    }
);
