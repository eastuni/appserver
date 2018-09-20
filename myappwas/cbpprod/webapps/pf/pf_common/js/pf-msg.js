/**
 * @fileOverview Search multI-language information to create an object for message processing.
 * @author BankwareGlobal ProductFactory Team
 */

// bxMsg
(function(global) {
    var localeMap = {
        'ko' : '01',
        'cn' : '02',
        'en' : '03',
        'ja' : '04'
    };

    /**
     * The Function is Menu Click Event 
     * @param {String} messageCode - multi-language item key
     * @return {String} - multi-language item value
     */
    var bxMsg = function(messageCode) {
        var message,
            varMarker;

        if(typeof messageCode !== 'string') {
            throw '전달된 메시지 패스가 부적절합니다.';
        }

        message = bxMsg.messageMap[bxMsg.locale][messageCode];

        // 다국어등록이 안된경우 코드로 표시되도록
        if(!message || message == null || message.length == 0){
        	message = messageCode;	//bxMsg.messageMap['ko'][messageCode];
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

        messagesPath: '/',

        messageMap: { },
        locale: getCookie('lang'),

        /**
         * initialize
	     * @param {bxMsgInitOption} option - configuration object
         * @return {void}
         */
        init: function(option) {
            this.messagesPath = option.messageRoot;
            this.locale = option.locale;
            this.messageMap[this.locale] = {};
            this.load();
        },

        /**
         * load
         * @return {void}
         */
        load: function() {
            var that = this;

            if(parent.bxMsg && parent.bxMsg.messageMap && parent.bxMsg.messageMap[parent.bxMsg.locale]){
                that.messageMap[that.locale] = parent.bxMsg.messageMap[that.locale];
                return;
            }

            var requestParam = {
                languageDscd : localeMap[that.locale],
                applyStartDt : commonConfig.currentXDate.toString('yyyy-MM-dd hh:mm:ss'),
                tntInstId    : getCookie('tntInstId')
            };
            
            if(g_serviceType == g_springService) {
                requestParam.lstItemDscd = '02,03,04,05';
                requestParam.commonHeaderMessage = '{"loginTntInstId" : "' + getCookie('tntInstId') + '",' +
                    ' "motherTntInstId" : "' + getCookie('motherTntInstId') + '",' +
                    ' "lastModifier"   : "' + getCookie('loginId') + '"}';

                $.ajax({
                    type: 'get',
                    url: '/multilanguage/getListMultilanguage.json',
                    headers: {
                        'Accept-Language': that.locale
                    },
                    cache: false,
                    async: false,
                    data: requestParam, // JSON.stringify(requestParam),
                    contentType: 'application/json; charset=UTF-8',
                    success: function (responseData) {
                        if(responseData.responseMessage && responseData.responseMessage.length > 0) {
                            responseData.responseMessage.forEach(function (el, index) {
                                that.messageMap[that.locale][el.itemKeyValue] = el.itemValue;
                            });
                        }
                    }
                });
            }else if(g_serviceType == g_bxmService){

                requestParam.lstItemDscd = [];
                requestParam.lstItemDscd.push('02');
                requestParam.lstItemDscd.push('03');
                requestParam.lstItemDscd.push('04');
                requestParam.lstItemDscd.push('05');

                requestParam.commonHeader = {
                    loginTntInstId : getCookie('tntInstId'),
                    motherTntInstId : getCookie('motherTntInstId'),
                    lastModifier : getCookie('loginId')
                }

                var bxmParam = {
                    header : {
                        application: 'PF_Factory',
                        service: 'MultiLanguageItemManagementMasterService',
                        operation: 'queryListMultiLanguageItemManagementMaster',
                        locale: that.locale
                    },
                    input: requestParam
                };


                $.ajax({
                    type: 'post',
                    url: '/serviceEndpoint/json/request.json',
                    headers: {
                        'Accept-Language': that.locale
                    },
                    cache: false,
                    async: false,
                    data: JSON.stringify(bxmParam),
                    contentType: 'application/json; charset=UTF-8',
                    success: function (responseData) {
                    	responseData = (typeof responseData === 'string') ? JSON.parse(responseData) : responseData;
                        if(responseData.ModelMap.responseMessage && responseData.ModelMap.responseMessage.length > 0) {
                            responseData.ModelMap.responseMessage.forEach(function (el, index) {
                                that.messageMap[that.locale][el.itemKeyValue] = el.itemValue;
                            });
                        }
                    }
                });
            }
        }
    });

    Handlebars.registerHelper('bxMsg', function(keyword) {
        return bxMsg(keyword) || keyword;
    });

    bxMsg.init({
        messageRoot: '/scripts/locale-message',
        locale: getCookie('lang')
    });

    global.bxMsg = bxMsg;

    /**
     * Getting the Cookie
     * @param {String} cName - Cookie name
     * @return {String} Cookie value
     */
    function getCookie(cName) {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if(start != -1){
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if(end == -1)end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }

    var calendarLang = getCookie('lang') == 'cn' ? 'zh' : getCookie('lang');
    if($.datetimepicker) {
        $.datetimepicker.setLocale(calendarLang);
    }
})(window);

/**
 * bxMsg initialize  option
 * @typedef {Object} bxMsgInitOption
 * @property {String} messageRoot - message path 
 * @property {String} locale - 'ko', 'cn', 'en', 'ja'
 */