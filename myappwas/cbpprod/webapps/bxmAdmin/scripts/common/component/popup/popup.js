define(
    function() {
        var Popup = Backbone.View.extend({

            tagName: 'section',
            className: 'bw-modal',

            initialize: function() {
                $('body').append(this.$el);
            },

            render: function() { },

            setDraggable: function() {
                this.$el.find('.modal-wrap').draggable({
                    cancel: '.bx-no-draggable',
                    containment: '#dim',
                    cursor: 'auto',
                    stop: function (event) {
                        $(event.target).css({width: '', height: ''});
                    }
                });
            },

            setResizable: function() {
                this.$el.find('.modal-wrap').resizable();
            },

            show: function() {
                this.$el.show();
            },

            close: function() {
                this.$el.hide();
            }

        });

        return Popup;
    }
);
