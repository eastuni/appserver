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
            return request('GET', url, param, option);
        },

        'post': function(url, param, option) {
            return request('POST', url, param, option);
        },

        'delete': function(url, param, option) {
            return request('DELETE', url, param, option);
        },

        'put': function(url, param, option) {
            return request('PUT', url, param, option);
        },
        'all': function(requestDataList, option) {
            var requestCount = 0,
                successFn = option.success;

            requestDataList.forEach(function(requestData, i) {
                request('POST', requestData.url, requestData.param, {
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
        var requestOption,
            requestURL = url,
            deferred = Q.defer(),
            $loading = $('#loading-dim');

        if(!option) {

            if(!param) {
                option = {};
                param = null;
            }else {
                option = param;
                param = null;
            }
        }

        option = option || param;

        requestOption = {
            type: method,
            url: url,
            cache: false,
            data: param
        };

        option.contentType && (requestOption.contentType = option.contentType);

//        if(!option.permitSameRequest && requestMap[url]) {
//            return;
//        }

        requestMap[url] = true;


//        if(requestURL.indexOf('?') !== -1) {
//            requestURL = requestURL.split('?').join(('/P' + new XDate().toString('yyyyMMddmm')) + '?');
//        }else {
//            requestURL += ('/P' + new XDate().toString('yyyyMMddmm'));
//        }

        option.cache && (requestOption.cache = option.cache);

        // 처리중
        requestOption.beforeSend = function() {
            if(typeof preOption.commonBeforeRequest === 'function' && preOption.commonBeforeRequest() === false) {
                return;
            }

            if(option.enableLoading) {
                $loading.show();
            }

            typeof option.beforeSend === 'function' && option.beforeSend();
        };

        // 정상
        requestOption.success = function(response) {
            if(typeof preOption.commonSuccessHandler === 'function' && preOption.commonSuccessHandler(response) === false) {
                return;
            }
            
            response = (typeof response === 'string')? JSON.parse(response) : response; 
            
            deferred.resolve(response);
            typeof option.success === 'function' && option.success(response);
        };

        // 에러
        requestOption.error = function(jqXHR, textStatus) {
            if(typeof preOption.commonErrorHandler === 'function' && preOption.commonErrorHandler(jqXHR, textStatus) === false) {
                return;
            }
            deferred.reject({status: textStatus, jqXHR: jqXHR});
            typeof option.error === 'function' && option.error(jqXHR, textStatus);
        };
        
        // 전송완료
        requestOption.complete = function(jqXHR, textStatus) {
            if(typeof preOption.commonCompleteHandler === 'function' && preOption.commonCompleteHandler(jqXHR, textStatus) === false) {
                    return;
            }

            if(option.enableLoading) {
                $loading.hide();
            }

            typeof option.complete === 'function' && option.complete(jqXHR, textStatus);
            delete requestMap[url];
        };

        $.ajax(requestURL, requestOption);

        return deferred.promise;
    }

})(window);