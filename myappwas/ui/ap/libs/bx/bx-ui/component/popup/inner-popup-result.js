define(
    [
        'text!bx-component/popup/inner-popup-tpl.html'
    ],
    function(tpl) {

        var InnerPopup = Backbone.View.extend({
            tagName: 'section',
            className: 'inner-popup-wrap',

            events: {
                'click .bx-popup-closer': 'close',
                'click .cancel-btn': 'close',
                'mousedown .inner-popup': 'popupBodyDragStart',
                'mousedown .bx-popup-header': 'headerDragStart'
            },

            initialize: function(option) {
                var that = this;

                that.$el.html(tpl);

                that.$popupContent = that.$el.find('.inner-popup');
                that.$workspace = $('.workspace');
                that.$body = $('body');

                $.extend(that, option);
            },

            render: function() { },

            popupBodyDragStart: function(e) {
                if(e.currentTarget === e.target) {
                    this.dragStart(e);
                }
            },

            headerDragStart: function(e) {
                e.stopPropagation();
                this.dragStart(e);
            },

            dragStart: function(e) {
                this.correctX = e.clientX - this.$popupContent.offset().left;
                this.correctY = e.clientY - this.$popupContent.offset().top;

                this.$body.on('mousemove', this.drag.bind(this));
                this.$body.on('mouseup', this.dragEnd.bind(this));
            },

            dragEnd: function() {
                this.$body.off('mousemove');
                this.$body.off('mouseup');
            },

            drag: function(e) {
                var moveToLeft = e.clientX - this.correctX,
                    moveToTop = e.clientY - this.correctY,
                    parentLeft = this.$el.offset().left,
                    parentTop = this.$el.offset().top;

                moveToLeft = (parentLeft > moveToLeft)? parentLeft : moveToLeft;
                moveToTop = (parentTop > moveToTop)? parentTop : moveToTop;

                this.$popupContent.offset({left: moveToLeft, top: moveToTop});
            },

            show: function(contentTpl, isPack) {
                var popupStyle,
                    $popupParent = $('.workspace > .bx-container.is-active');

                $popupParent.append(this.$el);

                this.$popupContent.html(contentTpl);

                if(isPack) {
                    popupStyle = {
                        top: '50px',
                        left: '100px',
                        height: $popupParent.height() - 300 + 'px'
                    };
                }else {
                    popupStyle = {
                        'left': 500 - (this.$popupContent.width() / 2) + 'px',
                        'top': '50%',
                        'margin-top': - (this.$popupContent.height() / 2),
                    };
                }

                this.$popupContent.css(popupStyle);
            },

            close: function() {
                this.remove();
            }

        });

        return InnerPopup;
    }
);
