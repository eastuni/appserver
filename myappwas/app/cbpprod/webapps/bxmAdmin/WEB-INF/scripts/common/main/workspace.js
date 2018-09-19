define(
    [
        'common/config',
        'common/main/main-tab'
    ],

    function(
        commonConfig,
        MainTab
    ) {

        var WorkspaceView = Backbone.View.extend({

            el: '#main',

            activePageMap: {},
            pageQueue: [],

            initialize: function() {
                var that = this;

                that.mainTab = new MainTab();

                that.listenTo(that.mainTab, 'remove-page', that.removePage);

                that.$el.on('change-page', function(e) {
                    e.stopPropagation();
                    that.changePage(e.pageId, e.pageRenderInfo);
                });

                that.$el.on('remove-page', function(e) {
                    e.stopPropagation();
                    that.removePage(e.pageId);
                });

                that.$el.on('refresh-page', function(e) {
                    e.stopPropagation();
                    that.refreshPage(e.pageId);
                });

                that.$workspace = that.$el.children('#workspace');
                that.$noDataMsg = that.$workspace.find('.empty-message').text(bxMsg('common.select-menu-msg'));
            },

            changePage: function(pageId, renderInfo, successCallback) {
                var that = this,
                    renderOption,
                    pageObj,
                    pageInitialize = renderInfo && renderInfo.pageInitialize;

                (pageInitialize) && this.mainTab.isExistItem(pageId) && this.removePage(pageId);

                if(this.mainTab.isExistItem(pageId)) {
                    this.activePage(pageId, callback, renderInfo);
                }else {

                    // renderInfo 가 있으면 데이터 레이지 로딩 옵션 셋팅
                    renderOption = (renderInfo)? {isLazyLoading: true} : null;

                    //페이지를 제일 처음 생성할 때도 renderInfo를 넘겨줘야 하는 경우가 있어서 수정.
                    // renderOption 값이 있으면 추가적인 렌더링 조건이 존재하는 것을 의미
                    this.createPage(pageId, renderOption, renderInfo, callback);
                }

                function callback() {
                    pageObj = that.activePageMap[/MENU010/.test(pageId) ? 'MENU010X' : pageId];

                    if(renderInfo && pageObj) {
                        pageObj.afterRender && pageObj.afterRender(renderInfo);
                    }

                    if (pageObj && pageObj.onChangePage) {
                        pageObj.onChangePage();
                    }

                    if(successCallback && pageObj) {
                        $.isFunction(successCallback) && successCallback(pageObj);
                    }
                }
            },

            createPage: function(pageId, renderOption, renderInfo, successCallback) {
                var that = this,
                    pageDPName,
                    pagePath;

                pagePath = commonConfig.pageInfo[pageId].src;
                pageDPName = bxMsg('main-menu.'+pageId);

                if (renderInfo && renderInfo['enPharos'] && this.activePageMap['MENU010X']) {
                    that.pageQueue.push(pageId);
                    that.mainTab.createItem({pageId: pageId, pageDPName: pageDPName});
                    that.activePage(pageId);
                    successCallback && $.isFunction(successCallback) && successCallback();
                    return;
                }

                require([pagePath], function(pageConstructor) {
                    var $pageEl, pageObj, pageInitConfig;

                    if(that.$noDataMsg.is(':visible')) {
                        that.$noDataMsg.hide();
                    }

                    // 최대 활성화 페이지 개수 제한
                    if(Object.getOwnPropertyNames(that.activePageMap).length === commonConfig.sysConfig.maxActiveTabCount) {
                        that.removePage(that.pageQueue.shift());
                        // swal({
                        //     type: 'warning',
                        //     title: '',
                        //     text: bxMsg('common.max-page-msg'),
                        //     timer: commonUtil.getPopupDuration(),
                        //     showConfirmButton: false
                        // });
                        // return;
                    }

                    if(pageConstructor) {
                        pageInitConfig = $.extend({pageId: pageId, pageDPName: pageDPName}, renderInfo);
                        pageObj = that.activePageMap[/MENU010/.test(pageId) ? 'MENU010X' : pageId] = new pageConstructor(pageInitConfig);
                        that.pageQueue.push(pageId);

                        $pageEl = pageObj.render(renderOption, renderInfo);
                        $pageEl.attr({'data-page': /MENU010/.test(pageId) ? 'MENU010X' : pageId});

                        that.$workspace.append($pageEl);

                        that.mainTab.createItem({pageId: pageId, pageDPName: pageDPName});
                        that.activePage(pageId);
                    }

                    successCallback && $.isFunction(successCallback) && successCallback();
                });
            },

            activePage: function(pageId, successCallback, renderInfo) {
                if (renderInfo && renderInfo['enPharos'] === 'fromInside') {
                    this.mainTab.activeItem(pageId);
                    successCallback && $.isFunction(successCallback) && successCallback();
                    return;
                }

                this.findActivePage().removeClass('on');
                this.findPage(/MENU010/.test(pageId) ? 'MENU010X' : pageId).addClass('on');
                this.mainTab.activeItem(pageId);

                $(window).resize();

                successCallback && $.isFunction(successCallback) && successCallback();
            },

            removePage: function(pageId) {
                var MENU010s = this.pageQueue.filter(function (item) {
                    return /MENU010/.test(item);
                });

                // 온라인 모니터링 탭이 1개 이하 열려 있을 경우만 pageObject를 삭제함
                if (!/MENU010/.test(pageId) || MENU010s.length <= 1) {
                    this.activePageMap[/MENU010/.test(pageId) ? 'MENU010X' : pageId].remove();
                    delete this.activePageMap[/MENU010/.test(pageId) ? 'MENU010X' : pageId];

                    if (/MENU010/.test(pageId)) {
                        commonConfig.enPharosRendered = false;
                    }
                }

                var pageIndex = this.pageQueue.indexOf(pageId);
                if (pageIndex !== -1) this.pageQueue.splice(pageIndex, 1);

                if(Object.getOwnPropertyNames(this.activePageMap).length === 0) {
                    this.$noDataMsg.show();
                }

                this.mainTab.removeItem(pageId);
            },

            refreshPage: function(pageId) {
                var activePage = this.activePageMap[/MENU010/.test(pageId) ? 'MENU010X' : pageId];
                if(activePage.refresh) activePage.refresh();
            },

            findActivePage: function() {
                return this.$workspace.find('.on[data-page]');
            },

            findPage: function(pageId) {
                return this.$workspace.find('[data-page='+ pageId +']');
            }
        });

        return new WorkspaceView();
    }
);