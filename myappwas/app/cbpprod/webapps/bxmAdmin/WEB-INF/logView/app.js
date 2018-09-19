'use strict';

// RequireJS 설정
require.config({
    paths: {
        text: '../libs/require/text-2.0.10.min'
    }
});

// 다국어 처리
Handlebars.registerHelper('bxMsg', function (keyword) {
    return bxMsg(keyword) || keyword;
});

bxMsg.init({
    locale: $.cookie('bxm-admin-locale') || 'ko',
    messageRoot: 'scripts/messages',
    messageList: [
        'common',
        'online'
    ]
});

// 메인 시작!
require(
    [
        '../scripts/common/config',
        'text!app.html'
    ],
    function (commonConfig,
              tpl) {
        commonConfig.brand = commonConfig.brand || 'BXM WEB ADMIN';
        document.title = commonConfig.brand.toUpperCase();

        switch (commonConfig.brand) {
            case 'kyowon':
                $('body').addClass('theme-kw');
                break;
            default:

        }

        $('.main-wrap').append((function () {
            var view = new (Backbone.View.extend({
                className: 'md-form',
                tagName: 'section',

                templates: {
                    'tpl': tpl
                },

                events: {
                    'click .lnb-toggle-btn': 'toggleLeftNavBar',

                    'click .move-btn': 'movePage',
                    'click .move-first-btn': 'moveFirstPaging',
                    'click .move-prev-btn': 'movePrevPaging',
                    'click .move-next-btn': 'moveNextPaging',
                    'click .move-last-btn': 'moveLastPaging',

                    'click .layout-lnb li': 'navigateLog'
                },

                guid: null,
                opOccurDttmStart: null,
                pageNum: 1,

                pagingDisplayCount: 5,
                activePagingId: 0,
                activeBtnId: 1,

                initialize: function () {
                    var that = this;
                    that.$el.html(that.tpl());

                    that.$onlineLogDetailTitle = that.$el.find('.svc-log-detail-title');
                    that.$onlineLogDetails = that.$el.find('.svc-log-detail');

                    that.$leftNavBar = that.$el.find('.layout-lnb');
                    that.$layoutContent = that.$el.find('.layout-content');
                    that.$logMessage = that.$el.find('.log-message');
                    that.$gridPaging = that.$el.find('.bx-grid-paging');
                },

                render: function (logData) {
                    var that = this;

                    if (that.guid !== logData.globalId) {
                        that.guid = logData.globalId;
                        that.opOccurDttm = logData.opOccurDttm;
                        that.activeBtnId = 1;

                        that.renderCode(that.activeBtnId, function (response) {
                            that.renderPagingBtn(response.ServiceLogDetailListOMM.totalPage);
                        }, true);
                    }

                    return that.$el;
                },

                /**
                 * pageNum: 렌더링할 페이지 번호
                 * successCallback: 렌더링 성공 후 호출될 함수
                 * needSvcTag: SvcTag 렌더링 여부. 초기 렌더링 시에만 필요하고 페이지 전환 시에는 그리지 않음
                 */
                renderCode: function (pageNum, successCallback, needSvcTag) {
                    var that = this,
                        requestParam;

                    requestParam = that.getBxmReqData(
                        'OnlineLogService', 'getServiceLog', 'ServiceLogOMM',
                        {
                            guid: that.guid,
                            linkSeq: "0",
                            opOccurDttm: that.opOccurDttm
                        }
                    );

                    that.requestBxmAjax(requestParam, {
                        success: function (response) {
                            var onlineLogOMM = response.ServiceLogSingleOMM;

                            that.$onlineLogDetailTitle.text(bxMsg('online.service-log-detail') + ' (' + that.guid + ')');
                            that.makeFormFromParam(that.$onlineLogDetails, onlineLogOMM);
                            if (onlineLogOMM.opErrYn) {
                                that.$onlineLogDetails.find('[data-form-param="opErrYn"]').html(that.getSuccessYnIcon(onlineLogOMM.opErrYn));
                            }
                        }
                    }, true);


                    requestParam = that.getBxmReqData('OnlineLogService', 'getServiceLogDetail', 'OnlineLogSearchConditionOMM',
                        {
                            guid: that.guid,
                            opOccurDttmStart: that.opOccurDttm,
                            pageNum: pageNum,
                            needSvcTag: needSvcTag
                        });

                    that.requestBxmAjax(requestParam, {
                        success: function (response) {
                            var serviceLogTagList = response.ServiceLogDetailListOMM.serviceLogTagList,
                                serviceLogDetailList = response.ServiceLogDetailListOMM.serviceLogDetailList,
                                renderList;

                            if (serviceLogTagList.length) {
                                renderList = [];

                                serviceLogTagList.forEach(function (logTag) {
                                    renderList.push(
                                        '<li data-page="{}" data-seq="{}"><span class="log-icon {}">{}</span><p class="log-title">{}</p></li>'
                                            .replace('{}', logTag.pageNo)
                                            .replace('{}', logTag.logSeq)
                                            .replace('{}', that.getTagClass(logTag.tagTypeCd))
                                            .replace('{}', logTag.tagTypeCd)
                                            .replace('{}', logTag.tagNm)
                                    );
                                });

                                that.$leftNavBar.find('ul').html(renderList);
                            }

                            renderList = [];

                            serviceLogDetailList.forEach(function (logDetail) {
                                renderList.push(
                                    '<p data-seq="{}">{}</p>'
                                        .replace('{}', logDetail.logSeq)
                                        .replace('{}', logDetail.logMessage)
                                );
                            });
                            that.$logMessage.html(renderList);

                            that.pageNum = requestParam.pageNum;

                            $.isFunction(successCallback) && successCallback(response);
                        }
                    }, true);
                },

                getSuccessYnIcon: function (value) {
                    if (value === 'Y') {
                        return '<i class="fa fa-exclamation-circle chr-c-orange font-icon-m"></i>';
                    } else {
                        return '<i class="fa fa-check-circle chr-c-blue font-icon-m"></i>';
                    }
                },

                getTagClass: function (tagName) {
                    switch (tagName) {
                        case 'SVCST':
                            return 'l-start';
                            break;
                        case 'SVCED':
                            return 'l-end';
                            break;
                        case 'SVCIN':
                            return 'l-input';
                            break;
                        case 'SVCOT':
                            return 'l-output';
                            break;
                        case 'CALBN':
                            return 'l-bean';
                            break;
                        case 'CALDB':
                            return 'l-dbio';
                            break;
                        case 'CALSC':
                            return 'l-svc';
                            break;
                        case 'CALIF':
                            return 'l-inf';
                            break;
                        default:
                            return 'l-inf';
                    }
                },

                navigateLog: function (e) {
                    var that = this,
                        target = $(e.currentTarget),
                        page = target.attr('data-page'),
                        seq = target.attr('data-seq');

                    if (page !== that.pageNum) {
                        that.movePage(null, page, function () {
                            that.focusSeq(seq);
                        })
                    } else {
                        that.focusSeq(seq);
                    }
                },

                focusSeq: function (seq) {
                    var target = this.$logMessage.find('[data-seq="' + seq + '"]');

                    this.$layoutContent.animate({scrollTop: this.$layoutContent.scrollTop() + target.position().top}, 250,
                        function () {
                            target.animate({
                                opacity: 0
                            }, 250, function () {
                                target.animate({
                                    opacity: 1
                                }, 250);
                            });
                        });
                },

                toggleLeftNavBar: function () {
                    if (this.$leftNavBar.css("display") === "none") {
                        this.$leftNavBar.show();
                        this.$layoutContent.css('left', '250px');
                    } else {
                        this.$leftNavBar.hide();
                        this.$layoutContent.css('left', '15px');
                    }

                },

                /**
                 * e: click 이벤트로 호출 시 event object
                 * pageNum: 이동할 페이지 번호
                 * successCallback: 이동 후 호출될 함수
                 */
                movePage: function (e, pageNum, successCallback) {
                    // change paging btn active
                    this.$gridPaging.find('.move-btn.on').removeClass('on');
                    if (e) {
                        this.activeBtnId = $(e.currentTarget).addClass('on').attr('data-id');
                    } else {
                        this.$gridPaging.find('.bx-paging.on').removeClass('on');
                        this.$gridPaging.find('.move-btn[data-id="' + pageNum + '"]').addClass('on').parent().addClass('on');
                        this.activeBtnId = pageNum;
                    }

                    // load grid data
                    this.renderCode(this.activeBtnId, successCallback);
                    this.setEnableMoveBtn();
                },

                renderPagingBtn: function (pageSize) {
                    var pagingSize,
                        $pagingList,
                        $paging,
                        btnSize,
                        $btnList,
                        $btn,
                        btnId;

                    $pagingList = [];
                    pagingSize = Math.ceil(pageSize / this.pagingDisplayCount);

                    for (var i = 0; i < pagingSize; i++) {
                        $paging = $('<div class="bx-paging" data-id="' + i + '">');

                        (i === this.activePagingId) && $paging.addClass('on');

                        $btnList = [];
                        btnSize = (i === pagingSize - 1) ? pageSize % this.pagingDisplayCount : this.pagingDisplayCount;
                        (btnSize === 0) && (btnSize = this.pagingDisplayCount);

                        for (var j = 1; j <= btnSize; j++) {
                            btnId = (j + (i * this.pagingDisplayCount));
                            $btn = $('<button type="button" class="btn-paging move-btn" data-id="' + btnId + '">' + btnId + '</button>');

                            (i === this.activePagingId && btnId === this.activeBtnId) && $btn.addClass('on');

                            $btnList.push($btn);
                        }

                        $paging.html($btnList);
                        $pagingList.push($paging);
                    }

                    this.$gridPaging.find('.bx-paging-btn').html($pagingList);

                    this.setEnableMoveBtn();
                },

                setEnableMoveBtn: function () {
                    var $pagingList = this.$gridPaging.find('.bx-paging'),
                        $activePaging = $pagingList.filter('.on'),
                        totalPagingLength = $pagingList.length,
                        activePagingIndex = $pagingList.index($activePaging);

                    if (activePagingIndex === 0) {
                        // 보여지는 페이징이 첫번째인 경우
                        this.$gridPaging.find('.move-first-btn').attr('disabled', true).removeClass('on');
                        this.$gridPaging.find('.move-prev-btn').attr('disabled', true).removeClass('on');
                    } else if (activePagingIndex > 0) {
                        // 보여지는 페이징이 첫번째가 아닌 경우
                        this.$gridPaging.find('.move-first-btn').attr('disabled', false).addClass('on');
                        this.$gridPaging.find('.move-prev-btn').attr('disabled', false).addClass('on');
                    }

                    if (activePagingIndex === totalPagingLength - 1) {
                        // 보여지는 페이징이 마지막인 경우
                        this.$gridPaging.find('.move-next-btn').attr('disabled', true).removeClass('on');
                        this.$gridPaging.find('.move-last-btn').attr('disabled', true).removeClass('on');
                    } else if (activePagingIndex < totalPagingLength - 1) {
                        // 보여지는 페이징이 마지막이 아닌 경우
                        this.$gridPaging.find('.move-next-btn').attr('disabled', false).addClass('on');
                        this.$gridPaging.find('.move-last-btn').attr('disabled', false).addClass('on');
                    }
                },

                moveFirstPaging: function () {
                    var $firstPaging = this.$gridPaging.find('.bx-paging').first();

                    this.$gridPaging.find('.bx-paging.on').removeClass('on');
                    $firstPaging.addClass('on');

                    $firstPaging.find('.move-btn').first().click();

                    this.setEnableMoveBtn();
                },

                movePrevPaging: function () {
                    var $activePaging = this.$gridPaging.find('.bx-paging.on'),
                        $prevPaging = $activePaging.prev();

                    $activePaging.removeClass('on');
                    $prevPaging.addClass('on');

                    $prevPaging.find('.move-btn').last().click();

                    this.setEnableMoveBtn();
                },

                moveNextPaging: function () {
                    var $activePaging = this.$gridPaging.find('.bx-paging.on'),
                        $nextPaging = $activePaging.next();

                    $activePaging.removeClass('on');
                    $nextPaging.addClass('on');

                    $nextPaging.find('.move-btn').first().click();

                    this.setEnableMoveBtn();
                },

                moveLastPaging: function () {
                    var $lastPaging = this.$gridPaging.find('.bx-paging').last();

                    this.$gridPaging.find('.bx-paging.on').removeClass('on');
                    $lastPaging.addClass('on');

                    $lastPaging.find('.move-btn').last().click();

                    this.setEnableMoveBtn();
                },


                /**
                 * functions from util.js
                 */
                getBxmReqData: function (service, operation, bodyName, bodyParam) {
                    var jsonObj = {
                        header: {
                            application: 'bxmAdmin'
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

                                swal({type: 'error', title: header.messages, text: messageText});
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
                }
            }))();

            var url = window.location.href;
            return view.render(queryStringToObject(url.substring(url.indexOf('?') + 1)));
        })());


        function queryStringToObject(queryString) {
            var queryStringObj = {},
                queryStringList = decodeURIComponent(queryString).split('&');

            queryStringList.forEach(function (item) {
                var queryStringItem = item.split('=');
                queryStringObj[queryStringItem[0]] = queryStringItem[1];
            });

            return queryStringObj;
        }
    }
);


