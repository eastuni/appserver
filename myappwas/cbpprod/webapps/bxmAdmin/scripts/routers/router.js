define(
    [
	    'common/main/workspace',
        'common/config',
        'common/util'
    ],
    function (
        workspaceView,
        commonConfig,
        commonUtil
    ) {
	return Backbone.Router.extend({
		routes: {
            '*pageId/:subId?*queryString': 'openPage',
            '*pageId(/:subId)(?*queryString)': 'openPage'
        },

        openPage: function(pageId, subId, queryString) {
            var hasComCdList,
                that = this;
            $.cookie('currentPageId', pageId + (subId ? '/' + subId : '') + (queryString ? '?' + queryString : ''), { expires: 365 });

            if(commonConfig.comCdList){
                changePage();
            }else{
                // 공통코드 없으면 공통코드 로드후 페이지 로드
                hasComCdList = setInterval(function() {
                    if(commonConfig.comCdList){
                        clearInterval(hasComCdList);
                        changePage();
                    }
                }, 100);
            }

            function changePage() {
                var renderInfo;

                if (pageId && !commonConfig.authorizedMenuList[pageId]) {
                    commonUtil.redirectRoutePage(commonConfig.defaultPageInfo);
                    return;
                }

                if (commonConfig.pageInfo[pageId] && commonConfig.pageInfo[pageId].subPages && !subId) {
                    subId = commonConfig.pageInfo[pageId].currentSubId || 'SUB01';
                    that.navigate(pageId + '/' + subId, {replace: true});
                }

                //queryString이 있는 경우 renderInfo로 넘김 처리
                if(queryString) {
                    renderInfo = commonUtil.parseParam(queryString);
                }

                if (/MENU010/.test(pageId)) {
                    renderInfo = {};
                    if (/MENU010/.test(commonConfig.currentPageId)) {
                        renderInfo['enPharos'] = 'fromInside';
                    } else {
                        renderInfo['enPharos'] = 'fromOutside';
                    }
                }

                commonConfig.pageInfo[pageId] && workspaceView.changePage(pageId, renderInfo, function (pageObj) {
                    if (subId && $.isFunction(pageObj.changeSubPage)) {
                        pageObj.changeSubPage(subId, renderInfo);
                    }

                    document.title = commonConfig.brand.toUpperCase() + ' - ' + bxMsg('main-menu.' + pageId);
                    commonConfig.currentPageId = pageId;
                });
            }
        }
	});
});
