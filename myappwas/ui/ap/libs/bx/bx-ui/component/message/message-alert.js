define(
    [
        'bx-component/popup/popup',
        'text!bx-component/message/message-alert-tpl.html'
    ],
    function(Popup, tpl) {
        var MessageAlert = Popup.extend({

            className: 'alert-message-popup',

            templates: {
                tpl: tpl
            },

            initialize: function() {
                this.$el.html(this.tpl());

                this.$message = this.$el.find('.alert-message');
                
                this.$el.css({
                    'top': 160
                });
            },

            render: function(message, type, isClosable) {
                var $el = this.$el;
                
                if(isClosable){ 
                	$el.addClass('closable-popup');
                } else {
                	$el.removeClass('closable-popup');
                }
                
                this.show(message, type, isClosable);
            },

            info: function(message, isClosable) {
                this.show(message, 'info', isClosable);
            },

            error: function(message, isClosable) {
                this.show(message, 'error', isClosable);
            },

            show: function(message, type, isClosable) {
                var self = this,
                    $el = this.$el;
            	
                self.$message.text(message);
                self.$el.removeAttr('style');
                
                // 메인left + 메인 화면 넓이 1000/2 - 팝업창넓이/2
                var obj = $("#main").offset();
                var left = 0;
                var top = 0;
                
                left = obj.left + (1000/2 - $el.outerWidth()/2);
                top = obj.top + parseInt($("#main").height()/4);
                
                $el.css({
                    'left': left,
                    'top': top
                });
                
                if(type === 'error') {
                    self.$el.css('border-color', '#C66767');
                }
                
                if(isClosable){ 
                	$el.addClass('closable-popup');
                } else {
                	$el.removeClass('closable-popup');
                }

                if(!isClosable){
                	setTimeout(self.close.bind(self), 3000);
                }

                self.$el.show();
            }
        });

        return new MessageAlert();
    }
);
