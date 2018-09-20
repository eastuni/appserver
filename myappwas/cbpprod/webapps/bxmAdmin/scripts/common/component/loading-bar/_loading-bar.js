define(
    [
        'text!common/component/loading-bar/_loading-bar-tpl.html'
    ],
    function(
        tpl
    ) {

        var LoadingBar = Backbone.View.extend({

            tagName: 'section',
            className: 'bw-modal bx-loading-bar',

            initialize: function() {
            	this.$el.html(tpl);
            },

            render: function() {
                return this.$el;
            },

            show: function() {
            	this.$el.show();
            },
            
            hide: function() {
            	if(this.$el.attr('style').match('block')){
            		this.$el.hide();
            	}
            }

        });

        return LoadingBar;
    }
);