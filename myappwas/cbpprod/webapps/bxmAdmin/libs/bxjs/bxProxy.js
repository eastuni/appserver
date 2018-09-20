/**
 * Created by gim-yang-gwi on 2014. 5. 22..
 */

(function(global) {

    var requestMap = {},
        preOption = {
            commonBeforeRequest: null,
            commonSuccessHandler: null,
            commonErrorHandler: null,
            commonCompleteHandler: null
        };

    if(!$) {
        throw 'jQuery 가 먼저 로드되어 있어야함';
    }

    global.bxProxy = {
        'get': function(url, param, option) {
            request('GET', url, param, option);
        },

        'post': function(url, param, option) {
            request('POST', url, param, option);
        },

        'delete': function(url, param, option) {
            request('DELETE', url, param, option);
        },

        'put': function(url, param, option) {
            request('PUT', url, param, option);
        },

        'all': function(requestDataList, option) {
            var requestCount = 0,
                successFn = option.success;

            requestDataList.forEach(function(requestData, i) {
                request(option.method, requestData.url, requestData.param, {
                    success: function(response) {
                        // each request callback
                        requestData.success(response);

                        // all request callback
                        if(--requestCount === 0) {
                            typeof successFn === 'function' && successFn();
                        }
                    }
                });

                requestCount++;
            });

        },

        'longpoll': function(url, param, option) {
            if(!option) {
                option = param;
                param = null;
            }

            (function poll() {
                $.ajax({
                    url: url,
                    dataType: 'json',
                    timeout: 600000,
                    success: function(data) {
                        option.success(data);
                        poll();
                    },
                    error: function(responseError) {
                        console.log('longpoll error');
                    }
                });
            })();
        },

        /**
         * [중복 요청 동기여부]
         * permitSameRequest
         *
         * [preOprions]
         * commonBeforeRequest
         * commonSuccessHandler
         * commonErrorHandler
         * commonCompleteHandler
         */
        'preSet': function(option) {
            $.extend(preOption, option);
        }
    };

    function request(method, url, param, option) {
        var requestOption = {},
            requestURL = url;

        if(!option) {
            option = param;
            param = null;
        }
        option = option || param;

        if(method === 'POST'){
            param = JSON.stringify(param);
            requestOption.contentType = 'application/json';
        }

        requestOption.type = method;
        requestOption.url = url;
        requestOption.cache = false;
        requestOption.data = param;

        requestMap[url] = true;

        option.cache && (requestOption.cache = option.cache);

        requestOption.beforeSend = function() {
            if(typeof preOption.commonBeforeRequest === 'function') {

                if(preOption.commonBeforeRequest() === false) {
                    return;
                }
            }

            typeof option.beforeSend === 'function' && option.beforeSend();
        };

        requestOption.success = function(response) {
            if(typeof preOption.commonSuccessHandler === 'function') {

                if(preOption.commonSuccessHandler(response) === false &&
                    option.preventCommonSuccessHandler === undefined) {
                    return;
                }
            }

            typeof option.success === 'function' && option.success(response);
        };

        requestOption.error = function(jqXHR, textStatus) {
            if(typeof preOption.commonErrorHandler === 'function') {

                if(preOption.commonErrorHandler(jqXHR, textStatus) === false) {
                    return;
                }
            }

            typeof option.error === 'function' && option.error(jqXHR, textStatus);
        };

        requestOption.complete = function(jqXHR, textStatus) {
            if(typeof preOption.commonCompleteHandler === 'function') {

                if(preOption.commonCompleteHandler(jqXHR, textStatus) === false) {
                    return;
                }
            }

            typeof option.complete === 'function' && option.complete(jqXHR, textStatus);
            delete requestMap[url];
        };

        $.ajax(requestURL, requestOption);
    }

})(window);