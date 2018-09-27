/***  RequireJS(AMD) Setting  ***/
require.config({
    urlArgs: 'v=' + new Date().getTime(),
    paths: {
        'text': 'libs/bx/bx-vendor/require/text-2.0.10'
        , 'bx': 'libs/bx/bx-frame'
    	, 'bx-component': 'libs/bx/bx-ui/component'
		, 'bx-util': 'libs/bx/bx-util'
		, app: 'scripts'
    },
    baseUrl: ''
});

define(
    function () {
        function boot(initConfig) {
            /***  Handlebars(Template ENgine) Setting  ***/
            Handlebars.registerHelper('bxMsg', function (keyword) {
                return bxMsg(keyword) || keyword;
            });

            /***  Message Setting  ***/
            var messageList = _.union(['main.json'], initConfig.messageList);
            var currentLocale = $.cookie('locale');
            var messageRoot = 'scripts/messages';

            if (currentLocale == undefined) {
                currentLocale = sessionStorage.lngCd.replace(/"/gi, '');
            }

            bxMsg.init({
                locale: currentLocale,
                messageRoot: messageRoot,
                messageList: messageList
            });

            require(
                [
                    'bx/common/config',
                    'bx-component/message/message-alert',
                    'bx-component/message/message-error-log',
                    'bx/views/main',
                    'bx/common/common-info'
                ],
                function (config,
                          alertMessage,
                          errorLog,
                          MainView,
                          commonInfo) {
                    var emptyMsgTpl = Handlebars.compile($('#bxt-empty-msg-tpl').html());
                    var mainView = new MainView();

                    config.pageMap = {};
                    config.pageSrcMap = initConfig.pageSrcMap;
                    config.currentLocale = currentLocale;

                    $(window).resize(function () {
                        $('.manual-resize-component:visible').trigger('resize-component');
                    });

                    bootApp();

                    function bootApp(option) {
                        initBxProxy();
                        extendJQuery();
                        extendXDateParser();
                        startApp(option);
                    }

                    function initMenu() {
                        
                    	var param = {};
                		param.userGrpCd = $.sessionStorage('userGrpCd'); 	// 2018.04.23  keewoong.hong  제품 표준전문헤더 항목 조정
                		var linkData = {"header" : fn_getHeader("CAPSV0108404") , "CaMenuMgmtSvcGetUserFirstParentMenuIn" : param};
                		
                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                        	enableLoading: true,
                            success: function (response) {
                            	var rootMenuList = [];
                            	
                            	if(typeof response.CaMenuMgmtSvcGetUserMenuListOut != "undefined") {
                            		rootMenuList = response.CaMenuMgmtSvcGetUserMenuListOut.menuItmList;
                            	}

                                mainView.renderRootMenu(rootMenuList, initConfig.pageSrcMap);
                                commonInfo.setMenuMap(rootMenuList);
                                initMenuPageMap(rootMenuList);

                                var renderInfo = {
                                    startPage: config.userInfo.startPage,
                                    menuList: rootMenuList,
                                    custMode: sessionStorage.custMode
                                }

                                mainView.render(renderInfo);

                                $('#bxt-init-loading-wrap').remove();
                                
//                                createMenuListFile(rootMenuList);
                                
                            }
	                        , error : function(response) {
	                        	alert(response);
	                        }
                        });
                    }
                    
                    function initBxProxy() {
                        // bxProxy Setting
                        bxProxy.preSet({
                            commonSuccessHandler: function (response) {
                                var responseObj = typeof response === 'object' || JSON.parse(response),
                                    currentDateTime = '[' + XDate().toString('yyyy-MM-dd hh:mm:ss') + '] ';

                                if (responseObj.header && responseObj.header.returnCode != '0') {
                                    //mainView.printErrorLog(currentDateTime + responseObj.header);
                                    responseObj.header.errorMessages.forEach(function (errorMsg, i) {
                                        mainView.printErrorLog(currentDateTime + errorMsg.messageCode + ",\n" + errorMsg.message + ",\n" + errorMsg.detailMessage);
                                    });
                                }
                            },
                            commonErrorHandler: function (jqXHR) {
                                var currentDateTime = XDate().toString('yyyy-MM-dd hh:mm:ss'),
                                    errorTitle = jqXHR.statusText + ' Status:' + jqXHR.status,
                                    errorDetail = jqXHR.responseText;

                                // When Expired Session
                                //if(jqXHR.status === 444) {
                                //    new LoginPopup().render();
                                //    return;
                                //}
                                mainView.printErrorLog('[' + currentDateTime + '] ' + errorTitle + '-' + errorDetail);
                            }
                        });
                    }

                    function initRouter(Router) {
                        new Router();
                        Backbone.history.start();
                    }

                    function startApp(option) {
                        if (option) {
                            option.Router && initRouter(option.Router);
                        }

                        initUserInfo();
                        initMenu();
                    }

                    function initUserInfo() {
                        var startPage = initConfig.startPageByRole['default'];

                        config.userInfo = {
                            id: sessionStorage.id,
                            name: sessionStorage.name,
                            role: null, // FIXME
                            startPage: startPage,
                            locale: currentLocale
                        };
                    }

                    function initMenuPageMap(menuList) {
                        menuList.forEach(function (menu, i) {
                            var menuKey = menu.scrnNbr,
                                compositionKey = menuKey;

                            if (menuKey) {
                                if (menu.handlerArgCntnt) {
                                    compositionKey = menuKey + ':' + menu.handlerArgCntnt;
                                }

                                menu.src = initConfig.pageSrcMap[menuKey];
                                menu.name = menu.menuNm;

                                config.pageMap[compositionKey] = menu;
                            }

                            if ($.isArray(menu.children)) {
                                initMenuPageMap(menu.children);
                            }
                        });
                    }

                    function extendJQuery() {
                        $.fn.elementReady = function (afterRenderFn) {
                            checkRendering(this, afterRenderFn);
                        };

                        $.elementReady = function (selector, afterRenderFn) {
                            checkRendering(selector, afterRenderFn);
                        };

                        function checkRendering(element, afterRenderFn) {
                            var findTime = 0, checkInterval = setInterval(function () {
                                if ($(element).length > 0) {
                                    clearInterval(checkInterval);
                                    afterRenderFn();
                                    return;
                                }

                                findTime += 100;

                                if (findTime >= 2000) {
                                    clearInterval(checkInterval);
                                    throw 'DOM Ready Time Out By YG';
                                }

                            }, 100);
                        }
                    }

                    function extendXDateParser() {
                        XDate.parsers.push(function (dateStr) {
                            var targetStr = dateStr.split(' ')[0], resultStr = '';

                            for (var i = 0; i < 8; i++) {
                                resultStr += targetStr[i];

                                if (i === 3 || i === 5) {
                                    resultStr += '-';
                                }
                            }

                            return new XDate(resultStr);
                        });
                    }
                }
            );
        }

        return {boot: boot};
    }
);