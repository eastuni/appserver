define(
    [
        'common/config',
        'common/util',
        'common/main/header',
        'common/main/main-menu'
    ],
    function(
        commonConfig,
        commonUtil,
        HeaderView,
        MainMenuView
    ) {
        return Backbone.View.extend({

            el: 'body',

            initialize: function() {
                this.header = new HeaderView();
                this.mainMenu = new MainMenuView();
            },

            loadMain: function() {
                var that = this,
                    requestParam;

                // JSON 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'MainService', 'getMain', 'MainOMM'
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var mainOMM = response.MainOMM;

                        // render main menu
                        that.mainMenu.renderMainMenu(mainOMM.menuList);

                        // proceed extraOptions
                        if (mainOMM['extraOption']) {
                        	commonConfig.extraOption = {};
                        	
                        	mainOMM['extraOption'].forEach(function (item) {
                        		commonConfig.extraOption[item.key] = item.value;
                        		
                        		if (item.key === 'batchTypeExtraOption') {
                        			var batchTypeOption = JSON.parse(item.value);
                        			delete batchTypeOption.key;
                        			mainOMM.comCdList.push(batchTypeOption);
                        		}
                        		
//                        		if(item.key === 'schedulerUseYn') {
//                        			commonConfig.scheduleDate = mainOMM.scheduleDt;
//                        		}
                        		
                        	});
                        }

                        // render header info
                        that.header.renderHeaderInfo({
                            bizDt: mainOMM.bizDt,
                            systemDesc: mainOMM.systemDesc,
                            userId: mainOMM.userId,
                            userNm: mainOMM.userNm,
                            roleNm: mainOMM.roleNm,
                            useBizDt: mainOMM.useBizDt,
                            domain: mainOMM.domain
                        });

                        // save common code
                        commonConfig.comCdList = commonUtil.getCommonCodeListObj(mainOMM.comCdList);

                        //영업일 저장
                        commonConfig.bizDate = mainOMM.bizDt;
                        
                        // 거래 코드 사용 유무 설정
                        commonConfig.useTrxCd = mainOMM.useTrxCd;
                        commonConfig.useBizDt = mainOMM.useBizDt;
                        
                        commonConfig.locale = mainOMM.locale;

                        // remove init loading bar
                        $('#bx-init-loading-bar').remove();

                        // start page
                        that.startPage($.cookie('currentPageId') || commonConfig.defaultPageInfo);
                    }
                });

                // WebSocket connect
//                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
//                    'PromptExecutionService', 'getWebSocketUrl', 'EmptyOMM'
//                ), {
//                    success: function (response) {
//                        window.bxWebSocket.connect(response['PromptExecutionUrlOMM']['webSocketUrl'],
//                            function (sourceId) {
//                                commonConfig.webSocketId = sourceId;
//                            },
//                            function (message) {
//                                swal({type: '', title: '', text: message});
//                            });
//                    }
//                });
            },

            startPage: function(pageId) {
                if(!pageId) {
                   return;
                }

                if(location.href.indexOf('#MENU') !== -1){
                    return;
                }

                commonUtil.redirectRoutePage(pageId);
            }

        });
    }
);

