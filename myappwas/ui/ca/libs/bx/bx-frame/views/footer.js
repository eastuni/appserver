define(
    [
        'bx/common/config'
    ],
    function(
        config
    ) {

        var HeaderView = Backbone.View.extend({
            el: '#footer',

            events: {
                'click .cbb-toggle-log-btn': 'toggleLogArea',
                'click .cbb-clear-log-btn': 'clearLogArea',
                'click .cbb-refresh-btn': 'refresh'	

            },

            initialize: function() {
                this.$errorConsole = this.$el.find('.cbb-log-message-area');
            },

            toggleLogArea: function() {
                $('body').toggleClass('footer-expanded');
            },

            clearLogArea: function() {
                this.$el.find('.cbb-log-message-area').empty();
            },
            
            refresh: function() {
            	javascript:history.go(0);
            },

            printError: function(errorMsg) {
                var $errorMsgEl = $('<p class="cbb-log-message">').text(errorMsg);
                this.$errorConsole.append($errorMsgEl);
            }

        });

        return HeaderView;
    }
);