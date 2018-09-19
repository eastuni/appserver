define(
		[
		 ],
    function() {
        var Popup = Backbone.View.extend({
            tagName: 'div'
            , className: 'bw-modal-popup'

            , events: {
                'click #btn-popup-cancel': 'close',
                'mousedown': 'popupBodyDragStart',
            	'mousedown .bx-popup-header-area': 'headerDragStart'
            },

            initialize: function(option) {
                var that = this;
                
                that.$el.css({
                    'left': '50%'
                    , 'top': '50%'
                    , 'margin-left': - (that.$el.width() / 2) 
                    , 'margin-top': - (that.$el.height() / 2)
                });

                $.extend(that, option);

                that.$dim = $('#dim');
                that.$body = $('#main-body');

                that.$body.append(that.$el);
            },

            popupBodyDragStart: function(e) {
                if(e.delegateTarget === e.target) {
                    this.dragStart(e);
                }
            },

            headerDragStart: function(e) {
                e.stopPropagation();
                this.dragStart(e);
            },

            dragStart: function(e) {
                this.correctX = e.clientX - this.$el.offset().left;
                this.correctY = e.clientY - this.$el.offset().top;
                
                this.$body.on('mousemove', this.drag.bind(this));
                this.$body.on('mouseup', this.dragEnd.bind(this));
            },

            dragEnd: function() {
                this.$body.off('mousemove');
                this.$body.off('mouseup');
            },

            drag: function(e) {
            	
                this.$el.offset({left: e.clientX - this.correctX, top: e.clientY - this.correctY});
            },

            render: function() { 

            },

            show: function() {
                this.$el.show();
                this.enableDim && this.$dim.show();
            },

            close: function() {
            	
                this.$el.hide();
                
                this.enableDim && this.$dim.hide();

                typeof this.afterClose === 'function' && this.afterClose();
            }

        });

        return Popup;
    }
);
