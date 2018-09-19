define(
    [
        'common/config'
    ],
    function (
        commonConfig
    ) {
        return {
            /**
             * config.js의 설정값을 참조하여 BXM framework 사용여부를 리턴
             * @returns {boolean} 사용여부
             */
            isBxm: function () {
                return commonConfig.isBxm && commonConfig.isBxm === true;
            },

            /**
             * Framework Service 호출시 전달할 파라미터 객체 리턴 메소드
             *
             * service : string ,호출할 서비스의 service명 **필수입력
             * operation : string ,호출할 서비스의 operation명 **필수입력
             * bodyName : string ,업무서비스의 input omm class name **필수입력
             * bodyParam: {} .업무 서비스의 input omm class name에 대한 데이터
             */
            getBxmReqData: function (service, operation, bodyName, bodyParam, application) {
                var jsonObj = {
                    header: {
                        application: application || 'bxmAdmin',
                        langCd: $.cookie('bxm-admin-locale') || 'ko'
                    }
                };

                service && (jsonObj.header.service = service);
                operation && (jsonObj.header.operation = operation);
                bodyName && (jsonObj[bodyName] = {});

                if (bodyParam) {
                    for (var key in bodyParam) {
                        if (bodyParam.hasOwnProperty(key)) {
                            jsonObj[bodyName][key] = bodyParam[key];
                        }
                    }
                }

                return jsonObj;
            },

            /**
             * Framework Service 호출 메소드
             *
             * data : {} .서비스 호출 파라미터 객체 **필수입력
             * callback : {
             *     beforeSend : fn .서비스 호출 전 실행 메소드
             *     success fn .서비스 호출 후 성공시 콜백 메소드
             *     error: fn .서비스 호출 후 실패시 실행 메소드
             *     complete: fn .서비스 호출 후 실행 메소드
             * }
             * isLogin : boolean .로그인 여부
             */
            requestBxmAjax: function (data, callback, isLogin) {
                var that = this,
                    url;

                url = 'http://' + window.location.hostname + ':' + window.location.port + '/bxmAdmin/json';
                isLogin && (url += '/login');

                $.ajax({
                    type: 'POST',
                    processData: false,
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    timeout: (3 * 60 * 1000),
                    url: url,
                    beforeSend: function () {
                        callback && callback.beforeSend && callback.beforeSend();
                    },
                    success: function (response) {
                        var detailMessage,
                            messageText,
                            header = response.header;

                        if (header.returnCode == 0) {
                            // 정상
                            callback && callback.success && callback.success(response);
                        } else {
                            // 에러
                            if (header.detailMessageCount > 0) {

                                detailMessage = '';
                                header.detailMessages.forEach(function (message) {
                                    detailMessage += message;
                                    detailMessage += '\n';
                                });

                                messageText = detailMessage;
                            } else {
                                messageText = '';
                            }

                            swal({
                                    type: 'error', title: header.messages, text: messageText
                                },
                                function () {
                                    // 세션 에러
                                    if (header.returnCode == 2 && response.ResponseCode && response.ResponseCode.code === 104) {
                                        that.redirectLoginPage();
                                    }
                                });
                        }
                    },
                    error: function (request, status, error) {
                        swal({
                            type: 'error', title: request.status, html: true,
                            text: '<div> message : ' + request.responseText + '</div><div> error : ' + error + '</div>'
                        });

                        callback && callback.error && callback.error();
                    },
                    complete: function () {
                        callback && callback.complete && callback.complete();
                    }
                });
            },

            /**
             * 엑셀 다운로드 메소드
             *
             * url : string .엑셀 다운로드 요청 url **필수입력
             * data : {} .엑셀 다운로드 요청 파라미터 객체
             * method : string .엑셀 다운로드 요청 method
             */
            downloadFile: function (url, data, method) {
                $('#file-form').remove();
                $('#file-frame').remove();

                $('body').append('<form id="file-form" name="file-form" target="file-frame" method="' + (method || 'post') + '" action="' + url + '" style="display: none;"></form>');
                if (data) {
                    for (var key in data) {
                        var $input = $('<input>');
                        $input.attr('name', key);
                        $input.attr('value', data[key]);

                        $('#file-form').append($input);
                    }
                }

                $('body').append('<iframe id="file-frame" name="file-frame" style="display: none;"></iframe>');
                $('#file-form').submit();
            },

            /**
             *
             * @param option ( url*, fileInput*(DOM), param, afterUploadFn)
             */
            uploadFile: function (option) {
                var fileList = Array.prototype.slice.apply(option.fileInput.files),
                    uploadIdx = 0;

                uploadNext();

                function upload(file) {
                    // prepare XMLHttpRequest
                    var xhr = new XMLHttpRequest(), formData;

                    formData = new FormData();

                    xhr.open('POST', option.url);
                    formData.append('file', file);

                    if (option.param) {
                        $.each(option.param, function (key, value) {
                            formData.append(key, value);
                        });
                    }

                    xhr.onload = function () {
//                   var responseData = JSON.parse(this.response);

                        uploadNext();

                        $(option.fileInput).val('');
                        typeof option.afterUploadFn === 'function' && option.afterUploadFn(this.response);
                    };

                    xhr.onerror = function () {
                        Ext.Msg.alert('Error', this.responseText);
                    };

                    xhr.send(formData);
                }

                // upload next file
                function uploadNext() {

                    if (fileList.length) {
                        var nextFile = fileList.shift();
                        if (nextFile.size >= 10 * 1024 * 1024 * 1024) {     // 10GB
                            Ext.Msg.alert('Error', bxMsg('common.filesize-error-msg'));
                        } else {
                            upload(nextFile);
                            uploadIdx++;
                        }
                    }
                }
            },

            /**
             * 폼 파라미터 가져오는 메소드
             *
             * $form : jQuery Obj .파라미터를 가져올 엘리먼트 **필수입력
             */
            makeParamFromForm: function ($form, option) {
                var $formItems = $form.find('[data-form-param]'),
                    param = {},
                    option = option || {};

                $formItems.each(function (i, formItem) {
                    var $formItem = $(formItem),
                        value = $formItem.attr('data-value') || $formItem.val();

                    if (option.ignoreEmpty && !value) {
                        return;
                    }

                    if ($formItem.is('[type="radio"]') || $formItem.is('[type="checkbox"]')) {
                        if (!($formItem.is(':checked'))) {
                            return;
                        }
                    }

                    var paramKey = $formItem.attr('data-form-param');
                    if ($formItem.is('[type="checkbox"]')) {
                        if (param[paramKey]) {
                            param[paramKey].push(value);
                        } else {
                            param[paramKey] = [value];
                        }
                    } else {
                        param[paramKey] = value;
                    }
                });

                return (option.isStringfy) ? JSON.stringify(param) : param;
            },

            /**
             * 폼 파라미터 셋팅하는 메소드
             *
             * $form : jQuery Obj .파라미터를 셋팅할 엘리먼트 **필수입력
             * formParam : {} .셋팅할 파라미터 **필수입력
             */
            makeFormFromParam: function ($form, formParam) {
                for (var key in formParam) {
                    if (formParam.hasOwnProperty(key)) {
                        var $formItem = $form.find('[data-form-param="' + key + '"]'),
                            code = $formItem.attr('data-code'),
                            value = formParam[key];

                        if ($formItem.is('[type="radio"]')) {
                            $formItem.each(function (i, item) {
                                var $item = $(item);
                                $item.val() === value && $item.attr('checked', true);
                            });
                        } else if ($formItem.is('span')) {
                            $formItem.each(function (i, item) {
                                $(item).text(value);
                            });
                        } else {
                            if (code) {
                                $formItem.val(commonConfig.comCdList[code][value]).attr('data-value', value);
                            } else {
                                $formItem.val(value);
                            }
                        }
                    }
                }
            },

            /**
             * Array를 Object로 변환
             * Array = [Object, Object, ...] 구조에서 Object에 어떤 값(objectKey)을 key로 하는 Object로 변환
             * BXM OMM의 구조가 위와 같으므로 OMM을 object로 변환이 필요할 시 사용
             *
             * @param array - 파라미터를 셋팅할 엘리먼트
             * @param objectKey - 셋팅할 파라미터 객체
             * @returns {{}} 변환된 Object
             */
            convertArrayToObject: function (array, objectKey) {
                var object = {};

                array.forEach(function (item) {
                    var key = item[objectKey];
                    delete item[objectKey];
                    object[key] = item;
                });

                return object;
            },

            /**
             * Object를 Array로 변환
             * Object를 [{key: key, value: value}, Object, ...] 구조의 Array로 변환
             *
             * @param object 변환한 Object
             * @param keyFunc 있을 경우 key에 적용할 function
             * @returns {Array} 변환된 Array
             */
            convertObjectToKeyValueArray: function (object, keyFunc) {
                var array = [];

                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        array.push({
                            key: keyFunc ? keyFunc(key) : key,
                            value: object[key]
                        });
                    }
                }

                return array;
            },

            convertStringToDaysOfWeek: function (string) {
                var days = string.split(','),
                    dayString = bxMsg('common.days-of-week'),
                    result = [];

                days.forEach(function (day) {
                    result.push(dayString[day]);
                });

                return result;
            },

            convertStringToMonthAndDay: function (string) {
                var dates = string.split(','),
                    monthAndDayString = bxMsg('common.month-and-day'),
                    result = [];

                dates.forEach(function (date) {
                    date = date.split('-');
                    result.push(Ext.String.format(monthAndDayString, date[0], date[1]));
                });

                return result;
            },

            getScheduleRegistrationDetail: function (data) {
                switch (data['scheduleTypeCd']) {
                    case 'CLN':     // Calender
                        switch (data['scheduleSubCd']) {
                            case 'DAY':     // Everyday
                                return bxMsg('common.DAY') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'WEEK':    // Every week
                                return bxMsg('common.WEEK') + ' '
                                    + this.convertStringToDaysOfWeek(data['schedule1Val']) + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'MONTH':   // Every month
                                return bxMsg('common.MONTH') + ' '
                                    + data['schedule1Val'] + bxMsg('common.day') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'YEAR':    // Every year
                                return bxMsg('common.YEAR') + ' '
                                    + this.convertStringToMonthAndDay(data['schedule1Val']) + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'BDAY':    // Business day
                                return bxMsg('common.BDAY') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'HDAY':    // Holiday
                                return bxMsg('common.HDAY') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'WDAYS':   // Weekdays
                                return bxMsg('common.WDAYS') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'WEND':    // Weekend
                                return bxMsg('common.WEND') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            case 'MEND':    // The end of the month
                                return bxMsg('common.MEND') + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']);
                            default:
                        }
                        break;
                    case 'RPT':     // Repeat
                        switch (data['scheduleSubCd']) {
                            case 'RHOUR':
                                return Ext.String.format(bxMsg('common.RHOUR'), data['schedule1Val']) + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']) + '~'
                                    + this.changeStringToTimeString(data['schedule3Val']);
                            case 'MIN':
                                return Ext.String.format(bxMsg('common.MIN'), data['schedule1Val']) + ' '
                                    + this.changeStringToTimeString(data['schedule2Val']) + '~'
                                    + this.changeStringToTimeString(data['schedule3Val']);
                            default:
                        }
                        break;
                    case 'PRE':     // 선스케줄유형종속
                    case 'RMT':     // Remote
                    default:
                }
            },

            /**
             * 공통 코드 포맷 변경후(화면 사용 용이하게) 공통 코드 객체 리턴 메소드
             *
             * comCdList : [] .공통 코드 리스트 객체 **필수입력
             */
            getCommonCodeListObj: function (comCdList) {
                var comCdObj = {};

                comCdList.forEach(function (comCd) {
                    comCdObj[comCd.cdId] = {};

                    comCd.cdList.forEach(function (cd) {
                        comCdObj[comCd.cdId][cd.cdVal] = cd.cdDesc;
                    });
                });

                return comCdObj;
            },

            /**
             * 공통 코드 옵션 태그 리스트 리턴 메소드
             *
             * commonCodeObj : {}/[] .공통 코드 Object/Array **필수입력,
             * isAllSelectable : boolean .전체 옵션 여부
             * allFieldName : String 전체 옵션의 표시되는 이름
             * key: commonCodeObj의 key 값이 'key'가 아닐 경우 지정 가능
             * name: commonCodeObj의 name 값이 'name'이 아닐 경우 지정 가능
             */
            getCommonCodeOptionTag: function (commonCodeObj, isAllSelectable, allFieldName, key, name) {
                var optionList = [];
                key = key || 'key';
                name = name || 'name';
                allFieldName = allFieldName || bxMsg('common.all');

                isAllSelectable && optionList.push('<option value="" data-name="' + allFieldName + '">' + allFieldName + '</option>');

                if (!Array.isArray(commonCodeObj)) {
                    for (var keyName in commonCodeObj) {
                        if (commonCodeObj.hasOwnProperty(keyName)) {
                            var option =
                                '<option value="' + keyName + '" data-name="' + commonCodeObj[keyName] + '">' +
                                commonCodeObj[keyName] +
                                '</option>';

                            optionList.push(option);
                        }
                    }
                } else {
                    commonCodeObj.forEach(function (item) {
                        optionList.push('<option value="' + (item[key] || item) + '" data-name="' + (item[name] || item) + '">' +
                            (item[name] || item) +
                            '</option>');
                    })
                }

                return optionList;
            },

            /**
             * 아코디언(멀티 펼치기 가능)을 셋팅하는 메소드
             *
             * $element : jQuery Obj .아코디언을 셋팅할 엘리먼트 **필수입력
             * slideFn : fn array 슬라이드 관련 Fn
             */
            setExpandAccordion: function ($element, slideFn) {
                !slideFn && (slideFn = {});

                $element.accordion({
                    collapsible: true,
                    active: false,
                    heightStyle: "content",
                    beforeActivate: function (event, ui) {
                        var currHeader,
                            currContent;
                        // The accordion believes a panel is being opened
                        if (ui.newHeader[0]) {
                            currHeader = ui.newHeader;
                            currContent = currHeader.next('.ui-accordion-content');
                            // The accordion believes a panel is being closed
                        } else {
                            currHeader = ui.oldHeader;
                            currContent = currHeader.next('.ui-accordion-content');
                        }
                        // Since we've changed the default behavior, this detects the actual status
                        var isPanelSelected = currHeader.attr('aria-selected') == 'true';

                        // Toggle the panel's header
                        currHeader.toggleClass('ui-corner-all', isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top', !isPanelSelected).attr('aria-selected', ((!isPanelSelected).toString()));

                        // Toggle the panel's icon
                        currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e', isPanelSelected).toggleClass('ui-icon-triangle-1-s', !isPanelSelected);

                        // Toggle the panel's content
                        currContent.toggleClass('accordion-content-active', !isPanelSelected);
                        if (isPanelSelected) {
                            currContent.slideUp({
                                complete: function () {
                                    currContent.trigger('doneSlideUp', currHeader);
                                    slideFn.slideUpFn && slideFn.slideUpFn({
                                        currHeader: currHeader,
                                        currContent: currContent
                                    });
                                }
                            });
                        } else {
                            currContent.slideDown({
                                complete: function () {
                                    currContent.trigger('doneSlideDown', currHeader);
                                    slideFn.slideDownFn && slideFn.slideDownFn({
                                        currHeader: currHeader,
                                        currContent: currContent
                                    });
                                }
                            });
                        }

                        return false; // Cancels the default action
                    }
                });
            },

            /**
             * 데이터피커을 셋팅하는 메소드
             *
             * $element : jQuery Obj .데이터 피커를 셋팅할 엘리먼트 **필수입력,
             * dateFormat : date format 디폴트 yymmdd
             */
            setDatePicker: function ($element, dateFormat) {
                !dateFormat && (dateFormat = 'yymmdd');

                $element.datepicker({
                    changeYear: true,
                    changeMonth: true,
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    dateFormat: dateFormat
                });
            },

            /**
             * 타임피커를 셋팅하는 메소드
             *
             * $element : jQuery Obj .타임 피커를 셋팅할 엘리먼트 **필수입력,
             * timeFormat : time format 디폴트 yymmdd
             */
            setTimePicker: function ($element, extraOptions) {
                $element.timepicker($.extend({}, {
                    className: 'a-center',
                    scrollDefault: 'now',
                    timeFormat: 'H:i'
                }, extraOptions));
            },

            /**
             * 로그인 화면으로 리다이렉트하는 메소드
             */
            redirectLoginPage: function () {
                location.href = this.getLocationUrl();
            },

            /**
             * 메인 화면으로 리다이렉트하는 메소드
             */
            redirectMainPage: function () {
                location.href = this.getLocationUrl() + 'main.html';
            },

            /**
             * 라우팅 화면으로 리다이렉트하는 메소드
             */
            redirectRoutePage: function (pageId, param) {
                var href;

                href = this.getLocationUrl() + 'main.html#' + pageId;
                param && (href = href + '?' + $.param(param));

                location.href = href;
            },

            /**
             * 라우팅시 전달 파라미터 parse 메소드
             */
            parseParam: function(str) {
                return str.split('&').reduce(function (params, param) {
                    var paramSplit = param.split('=').map(function (value) {
                        return decodeURIComponent(value.replace('+', ' '));
                    });
                    params[paramSplit[0]] = paramSplit[1];
                    return params;
                }, {});
            },
            
            /**
             * location url을 가져오는 메소드
             */
            getLocationUrl: function () {
                var hashRemovedHref = location.href.substring(0, location.href.indexOf('#'));
                return hashRemovedHref.substring(0, hashRemovedHref.lastIndexOf('/') + 1);
            },

            getParameterByName: function (name, uri) {
                uri = uri || window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(uri);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            },

            updateQueryStringParameter: function (key, value, uri) {
                uri = uri || window.location.href;
                var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
                var separator = uri.indexOf('?') !== -1 ? "&" : "?";
                if (uri.match(re)) {
                    window.location.href = uri.replace(re, '$1' + key + "=" + value + '$2');
                }
                else {
                    window.location.href = uri + separator + key + "=" + value;
                }
            },

            /**
             * a=100;b=100; 포맷을 [{a: 100}, {b: 100}]의 포맷으로 변환해주는 메소드
             */
            changeQueryStringToArray: function (string) {
                var array = string.split(';'),
                    resultArray = [];

                array.forEach(function (string) {
                    var tempArray,
                        obj;

                    if (string && (typeof string === 'string')) {
                        tempArray = string.split('=');

                        obj = {};
                        obj[tempArray[0]] = tempArray[1];

                        resultArray.push(obj);
                    }
                });

                return resultArray;
            },

            /**
             * 툴팁을 hide 시키는 메소드
             */
            closeTooltip: function () {
                $('body').children('div.ui-tooltip').hide();
            },

            /**
             * 시간 포맷(HH:mm)을 확인하는 메소드
             */
            isTimeFormat: function (value) {
                return /^([0-2][0-9]:[0-5][0-9])$/.test(value.trim());
            },

            /**
             * '20120202' -> '2012-02-02'
             */
            changeStringToDateString: function (string) {
                return string && string.substr(0, 4) + '-' + string.substr(4, 2) + '-' + string.substr(6, 2);
            },

            /**
             * '2012-02-02' -> '20120202'
             */
            changeDateStringToString: function (value) {
                return value.replace(/\-|\:|\.|:/g, '');
            },

            /**
             * '200202' -> '20:02:02'
             */
            changeStringToTimeString: function (string, isAddMS) {
                var timeString,
                    millisecond;

                timeString = string && (string.substr(0, 2) + ':' + string.substr(2, 2) + ':' + string.substr(4, 2));

                if (isAddMS) {
                    millisecond = string.substr(6, 3);
                    timeString += '.' + millisecond;
                }

                return timeString;
            },

            /**
             * '20:02:02' -> '200202'
             */
            changeTimeStringToString: function (value) {
                var timeString,
                    hour = value.substring(0, 2),
                    minute = value.substring(3, 5),
                    second = value.substring(6, 8);

                timeString = hour + minute + second;

                return timeString;
            },

            /**
             * 20160810 174308209 -> 2016-08-10 17:43:08 OR 2016-08-10 17:43:08.209
             */
            changeStringToFullTimeString: function (value, isAddMS) {
                if (!value) {
                    return;
                }

                var dateString,
                    year = parseInt(value.substring(0, 4)),
                    month = parseInt(value.substring(4, 6)) - 1,
                    day = parseInt(value.substring(6, 8)),
                    timeString,
                    hour,
                    minute,
                    second,
                    millisecond;

                if (value.indexOf(' ') !== -1) {
                    hour = value.substring(9, 11);
                    minute = value.substring(11, 13);
                    second = value.substring(13, 15);
                } else {
                    hour = value.substring(8, 10);
                    minute = value.substring(10, 12);
                    second = value.substring(12, 14);
                }

                dateString = new XDate(year, month, day).toString('yyyy-MM-dd');

                timeString = hour + ':' + minute + ':' + second;

                if (isAddMS) {
                    millisecond = value.substring(6, 9);
                    timeString += '.' + millisecond;
                }

                return dateString + ' ' + timeString;
            },

            numberWithCommas: function (number) {
                number = number.toString();
                var pattern = /(-?\d+)(\d{3})/;
                while (pattern.test(number))
                    number = number.replace(pattern, "$1,$2");
                return number;
            },

            /**
             * query string을 Object로 변환
             *
             * a=1&b=2 -> {a:1, b:2}
             */
            queryStringToObject: function (queryString) {
                var queryStringObj = {},
                    queryStringList = queryString.split('&');

                queryStringList.forEach(function (item, idx) {
                    var queryStringItem = item.split('=');
                    queryStringObj[queryStringItem[0]] = queryStringItem[1];
                });

                return queryStringObj;
            },

            /**
             * Object가 key에 해당하는 value를 가지고 있는 지(true) key만 있거나 존재하지 않는지(false) 확인
             *
             * @param object
             * @returns {boolean}
             */
            doesObjectHasValues: function (object) {
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        if (object[property]) return true;
                    }
                }

                return false;
            },

            /**
             * 명칭(코드) 포맷을 만들어주는 메소드
             */
            makeNameCodeFormat: function (name, code) {
                var result;

                if (name === null) {
                    result = '(' + code + ')';
                }
                else {
                    result = name + '(' + code + ')';
                }

                return result;
            },

            /**
             * 팝업 지속시간의 디폴트 값을 config.js를 참조해 리턴한다.
             *
             * @returns {number}
             */
            getPopupDuration: function () {
                return commonConfig.sysConfig.popupDuration;
            },

            // getPopupDuration과 같음 (deprecated)
            // Todo: It'd rather be replaced with 'getPopupDuration' since the name 'timer' is too general.
            timer: function () {
                return 1000;
            },

            /**
             * 특정값 입력 시 발생한 타겟이 regex를 만족하는 지 확인하고 만족하지 않을 시 에러팝업을 발생시키고 이전값으로 표시
             *
             * @param event
             * @param regex
             */
            validateInput: function (event, regex) {
                event.stopPropagation();
                var that = this,
                    target = $(event.currentTarget),
                    prevValue = target.val();

                setTimeout(function () {
                    if (!regex.test(target.val())) {
                        target.val(prevValue);
                        swal({
                            type: 'error',
                            title: '',
                            text: bxMsg('common.invalid-value-error'),
                            timer: that.getPopupDuration(),
                            showConfirmButton: false
                        });
                    }
                }, 0);
            },

            /**
             * 숫자 3자리마다 , 표시
             * */
            convertNumberFormat: function (value) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },

            /**
             * Priority Key를 변경 시 확인하는 공통 팝업
             *
             * option { title, text, placeHoldre, validFn }
             * url, param, that
             **/
            makeChangeKeyAlert: function (option, url, param, that) {
                var util = this;

                $("button.cancel").before($("button.confirm"));
                swal({
                    title: option.title + "<br/>",
                    text: option.text,
                    customClass: 'sweet-alert-key-alert',
                    type: "prompt",
                    confirmButtonText: bxMsg('common.edit'),
                    cancelButtonText: bxMsg('common.cancel'),
                    showCancelButton: true,
                    closeOnConfirm: false,
                    html: true,
                    showLoaderOnConfirm: true,
                    inputPlaceholder: "e.g )" + option.placeHolder
                }, function (inputValue) {

                    if (inputValue === false) {
                        return false;
                    }
                    else if (inputValue === "" || (option.validFn && !option.validFn(inputValue))) {
                        swal.showInputError(bxMsg('common.invalid-value-error'));
                        return false;
                    }

                    param.chngKey = inputValue;

                    // Ajax 요청
                    bxProxy.post(url, param, {
                        jsonSetting: true,
                        success: function (responseData) {
                            $("button.confirm").before($("button.cancel"));
                            if (responseData === 1) {
                                swal({
                                    type: 'success',
                                    title: '',
                                    text: bxMsg('common.save-success-msg'),
                                    timer: util.getPopupDuration(),
                                    showConfirmButton: false
                                });
                                that.trigger('change-key', inputValue);
                                that.reloadKey(inputValue);
                            } else if (responseData === -1) {
                                swal({
                                    type: 'error',
                                    title: '',
                                    text: bxMsg('common.save-fail-msg'),
                                    timer: util.getPopupDuration(),
                                    showConfirmButton: false
                                });
                            } else if (responseData === -2) {
                                swal({
                                    type: 'error',
                                    title: '',
                                    text: bxMsg('common.same-val-msg'),
                                    timer: util.getPopupDuration(),
                                    showConfirmButton: false
                                });
                            }
                        },
                        error: function (errorCode) {

                            if (errorCode.status === 403) {
                                console.log(errorCode);
                                swal({
                                    type: 'error',
                                    title: '',
                                    text: bxMsg('common.edit') + bxMsg('common.permission-denied-msg'),
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                            }
                            else {
                                swal({
                                    type: 'error',
                                    title: '',
                                    text: bxMsg('common.save-fail-msg'),
                                    timer: util.getPopupDuration(),
                                    showConfirmButton: false
                                });
                            }

                            $("button.confirm").before($("button.cancel"));
                        }
                    });

                });
            },

            /**
             * 공통적으로 사용하는 삭제시 확인 팝업
             *
             * option { titleList, dataList }
             * func,
             */
            makeDeleteCheckAlert: function (option, func) {

                var i, title = "", textVal = "";

                for (i = 0; i < option.titleList.length; i++) {
                    title += option.titleList[i] + " : " + option.dataList[i] + "</br>";
                }

                textVal = bxMsg('common.delete-check-text') + "</br>" + bxMsg('common.together') + ' ' + bxMsg('common.delete-msg');

                swal({
                    title: title,
                    text: textVal,
                    type: 'warning',
                    showCancelButton: true,
                    closeOnConfirm: false,
                    html: true
                }, function () {

                    func && $.isFunction(func) && func();

                });
            },

            /**
             * 브라우저 파편화 처리를 위한 IE 여부 리턴
             *
             * @returns {boolean}
             */
            isIe: function () {
                return /Trident/.test(navigator.userAgent);
            },

            makeBxfTitleWrap: function (value) {
                return "(" + value + ")";
            },
        }
    });
