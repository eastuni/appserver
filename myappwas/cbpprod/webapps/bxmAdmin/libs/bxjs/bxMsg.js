/**
 * Created by gim-yang-gwi on 2014. 6. 18..
 */
(function(global) {
    var bxMsg = function(messagePath) {
        var message,
            varMarker,
            messageKeys;

        if(typeof messagePath !== 'string') {
            throw '전달된 메시지 패스가 부적절합니다.';
        }

        messageKeys = messagePath.split('.');
        message = bxMsg.messageMap[bxMsg.locale];

        for (var key in messageKeys){
            message = message[messageKeys[key]];
        }

        // 메시지 내부 변수 치환
        for(var i = 1; i < arguments.length; i++) {
            varMarker = '{{'+ (i-1) +'}}';

            if(message.indexOf(varMarker) !== -1) {
                message = message.replace(varMarker, arguments[i])
            }
        }

        return message;
    };

    $.extend(bxMsg, {

        messagesRootPath: './',

        messageMap: { },
        messageFilePaths: [ ],
        locale: 'ko',

        setRootPath: function(path) {
            messagesRootPath = path;
        },

        addMessageFile: function(newMessageFilePaths) {

            if(!newMessageFilePaths) {
                throw '필수 파라미터가 잘못되었습니다.';
            }

            if(typeof newMessageFilePaths === 'string') {
                newMessageFilePaths = [newMessageFilePaths];
            }

            messageFilePaths = _.union(messageFilePaths, newMessageFilePaths);
        },

        init: function(option) {
            this.messagesRootPath = option.messageRoot;
            this.locale = option.locale;
            this.messageFilePaths = option.messageList;
            this.messageMap[this.locale] = {};
            this.load();
        },

        load: function() {
            var self = this;

            self.messageFilePaths.forEach(function(path) {
                var requestURL = self.messagesRootPath + '/' + self.locale + '/' + path+'.json';

                $.ajax({
                    url: requestURL,
                    dataType: 'json',
                    success: function (messageInfo) {
                        if (messageInfo.namespace in self.messageMap[self.locale]) {
                            throw '등록하려는 Message Namespace 가 이미 존재합니다.';
                            return false;
                        }
                        self.messageMap[self.locale][messageInfo.namespace] = messageInfo.messages;
                    }
                });
            });
        }
    });

    global.bxMsg = bxMsg;

})(window);