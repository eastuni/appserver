(function (global) {
    if (!jws) {
        throw 'jWebSocket must be loaded first.';
    }

    global.bxWebSocket = {
        init: function () {
            this.lWSC = new jws.jWebSocketJSONClient();
            this.username = "wsclient";
            this.password = "wsclient";
        },

        /**
         * connect WebSocket
         * @param url                   접속할 WebSocket URL
         * @param onConnectCallback     연결 성공 시 실행할 콜백
         * @param onSendCallback        서버에서 메세지를 받았을 때 실행할 콜백
         */
        connect: function (url, onConnectCallback, onSendCallback) {
            var that = this;

            // try to establish connection to jWebSocket server
            that.lWSC.logon( url, that.username, that.password, {

                // OnOpen callback
                OnOpen: function( aEvent ) {

                },

                // OnMessage callback
                OnMessage: function( aEvent, aToken ) {
                    if( that.lWSC.isLoggedIn() ) {
                        //alert("login")
                    }

                    if( aToken ) {
                        // Connect 성공 시 onConnectCallback으로 연결된 세션의 ID를 보내준다.
                        if( aToken.type == "welcome" ){
                            typeof onConnectCallback === 'function' && onConnectCallback(aToken.sourceId);
                        }
                        else if( aToken.type == "response" ) {

                        } else if( aToken.type == "event" ) {

                        } else if( aToken.type == "goodBye" ) {

                        } else if( aToken.type == "broadcast" ) {
                            if( aToken.data ) {

                            }
                        } else if( aToken.type == "send" ) {
                            // 메세지가 들어올 시 실행할 function을(ex. alert) onSendCallback에 등록해둔다.
                            if( aToken.data ) {
                                typeof onSendCallback === 'function' && onSendCallback(aToken.data);
                            }
                        }
                    }
                },

                // OnClose callback
                OnClose: function( aEvent ) {
                    that.lWSC.stopKeepAlive();
                }
            });
        },

        send: function (targetId, message) {
            this.lWSC.sendText(targetId, message);
        }
    };

    global.bxWebSocket.init();
})(window);
