define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/online/online-log-search/popup/svc-log-detail-popup-tpl.html'
    ],
    function (commonUtil,
              Popup,
              tpl) {

        return Popup.extend({
            className: 'md-form',

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

                'click .layout-lnb li': 'navigateLog',
                'click .ok-btn': 'close'
            },

            guid: null,
            linkSeq: null,
            opOccurDttmStart: null,
            pageNum: 1,

            pagingDisplayCount: 5,
            activePagingId: 0,
            activeBtnId: 1,

            initialize: function () {
                var that = this;
                that.$el.html(that.tpl());
                that.$leftNavBar = that.$el.find('.layout-lnb');
                that.$layoutContent = that.$el.find('.layout-content');
                that.$logMessage = that.$el.find('.log-message');
                that.$gridPaging = that.$el.find('.bx-grid-paging');
            },

            render: function (logData) {
                var that = this;

                if (that.guid !== logData.guid) {
                    that.guid = logData.guid;
                    that.linkSeq = logData.linkSeq;
                    that.opOccurDttm = logData.opOccurDttm;
                    that.activeBtnId = 1;

                    that.renderCode(that.activeBtnId, function (response) {
                        that.renderPagingBtn(response.ServiceLogDetailListOMM.totalPage);
                    }, true);
                    that.setDraggable();
                }

                that.show();
            },

            /**
             * pageNum: 렌더링할 페이지 번호
             * successCallback: 렌더링 성공 후 호출될 함수
             * needSvcTag: SvcTag 렌더링 여부. 초기 렌더링 시에만 필요하고 페이지 전환 시에는 그리지 않음
             */
            renderCode: function (pageNum, successCallback, needSvcTag) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('OnlineLogService', 'getServiceLogDetail', 'OnlineLogSearchConditionOMM',
                    {
                        guid: that.guid,
                        linkSeq: that.linkSeq,
                        opOccurDttmStart: that.opOccurDttm,
                        pageNum: pageNum,
                        needSvcTag: needSvcTag
                    });

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function (response) {
                        var serviceLogTagList = response.ServiceLogDetailListOMM.serviceLogTagList,
                            serviceLogDetailList = response.ServiceLogDetailListOMM.serviceLogDetailList,
                            renderList;

                        if (serviceLogTagList.length) {
                            renderList = [];

                            serviceLogTagList.forEach(function (logTag) {
                                renderList.push(Ext.String.format(
                                    '<li data-page="{0}" data-seq="{1}"><span class="log-icon {2}">{3}</span><p class="log-title">{4}</p></li>',
                                    logTag.pageNo,
                                    logTag.logSeq,
                                    that.getTagClass(logTag.tagTypeCd),
                                    logTag.tagTypeCd,
                                    logTag.tagNm
                                ));
                            });

                            that.$leftNavBar.find('ul').html(renderList);
                        } else if(serviceLogTagList.length === 0 && pageNum === 1){
                        	renderList = [];
                        	that.$leftNavBar.find('ul').html(renderList);
                        }

                        renderList = [];

                        serviceLogDetailList.forEach(function (logDetail) {
                            renderList.push(Ext.String.format(
                                '<p data-seq="{0}">{1}</p>',
                                logDetail.logSeq,
                                logDetail.logMessage
                            ))
                        });
                        that.$logMessage.html(renderList);

                        that.pageNum = requestParam.pageNum;

                        $.isFunction(successCallback) && successCallback(response);
                    }
                });
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
            }
        });
    }
);
