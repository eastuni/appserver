/**
 *  Singleton
 */
define(
    [
        'bx/common/config',
        'bx-component/message/message-alert',
        'bx/views/tab-menu'
    ],

    function(config, alertMessage, TabMenu) {

        var WorkspaceView = Backbone.View.extend({
            el: '#main',

            activePageMap: { },

            loadingPath: null,

            initialize: function() {
                var that = this;

                that.tabMenu = new TabMenu();

                that.listenTo(that.tabMenu, 'remove-page', that.removePage);

                that.$el.on('open-conts-page', function(e) {
                    that.openContsPage(e);
                });

                that.$el.on('change-page', function(e) {
                    that.changePage(e.pageHandler, e.pageArg, e.pageRenderInfo);
                });

                that.$el.on('remove-page', function(e) {
                    that.removePage(e.pageHandler, e.pageArg);
                });

                that.$el.on('refresh-page', function(e) {
                    that.refreshPage(e.pageHandler, e.pageArg);
                });

                that.$workspace = that.$el.find('.workspace');
                that.noDataMsg = that.$workspace.children('.empty-message-wrap');
            },

            initPages: function(startPage) {
                this.createPage(startPage)
            },

            createPage: function(pageHandler, pageArg, renderOption, renderInfo) {
                var that = this, pagePath, pageDPName, pageKey, pageInfo;
                
                // 해당화면이 있는지 확인 후 create 한다.
                // 기존에 존재 하면  만 한다.
//                var allTabMenus = that.$workspace.find("section[data-page].bx-container");
//                var allTabMenus = $('.main-tab').$('.main-tab').find('.tab-item[data-page][data-arg]');
                var allTabMenus = $('.main-tab').find('.tab-item[data-page]');
                
                var chkPage = false;
                
                $(allTabMenus).each(function(idx, data) {
                	if(pageHandler === $(data).attr("data-page") && pageArg === $(data).attr("data-arg")) {
                		chkPage = true;
                		return false;
                	}
                });
                
                if(chkPage) { // 현재 오픈할려는 페이지가 탭에 있으면 active 만 시켜 준다.
                	that.activePage(pageHandler, pageArg);
                	return;
                }
                
                pageKey = bxUtil.makePageKey(pageHandler, pageArg);

                pageInfo = config.pageMap[pageKey];

                if(!pageInfo) {
                    return;
                }

                pagePath = pageInfo.src;
                pageDPName = pageInfo.name;

                if(that.loadingPath === pagePath) {
                    return;
                }

                that.loadingPath = pagePath;

                require([pagePath], function(pageConstructor) {
                    var $pageEl,
                    	pageObj;

                    if(that.noDataMsg.is(':visible')) {
                        that.noDataMsg.hide();
                    }

                    // 최대 활성화 페이지 개수 제한 config.js 에 있음.
                    if(Object.getOwnPropertyNames(that.activePageMap).length === config.sysConfig.maxActiveTabCount) {
                        // first page close
                        var firstPage = that.activePageMap[Object.keys(that.activePageMap)[0]];
                        that.removePage(firstPage.pageHandler, firstPage.pageArg);
                    }

                    if(pageConstructor) {
                    	pageObj = that.activePageMap[pageKey] = new pageConstructor($.extend({pageHandler: pageHandler, pageDPName: pageDPName, pageArg: pageArg}, renderInfo));

                        $pageEl = pageObj.render(renderOption);

                        $pageEl.attr('data-arg', pageArg);
                        $pageEl.attr('data-page', pageHandler);

                        that.$workspace.append($pageEl);

                    	typeof pageObj.afterRender === 'function' && pageObj.afterRender();

                        that.tabMenu.createItem({pageHandler: pageHandler, pageDPName: pageDPName, pageArg: pageArg});
                        that.activePage(pageHandler, pageArg);

                        that.loadingPath = null;
                    }
                });
                
                $.sessionStorage('scrnId', pageHandler);
            },

            openContsPage: function(pageInfo) {
            	this.checkScrnRole(pageInfo.pageHandler);
                var that = this, $pageEl, $pageWrap, pageObj,
                    pageHandler = pageInfo.pageHandler,
                    renderInfo = pageInfo.pageRenderInfo,
                    pageDPName = pageInfo.pageDPName,
                    pageArg = pageInfo.pageArg,
                    pagePath = config.pageSrcMap[pageHandler],
                    pageInitialize = pageInfo.pageInitialize,
                    pageKey = bxUtil.makePageKey(pageHandler, pageArg);
                
                //같은 tab을 사용해야하는 경우가 있어서 추가했음
                (pageInitialize) && this.tabMenu.isExistItem(pageHandler, pageArg) && that.removePage(pageHandler, pageArg);

                if(this.tabMenu.isExistItem(pageHandler, pageArg)) {
                    this.activePage(pageHandler, pageArg);
                    return;
                }

                // 최대 활성화 페이지 개수 제한
                if(Object.getOwnPropertyNames(that.activePageMap).length === config.sysConfig.maxActiveTabCount) {
                    // first page close
                    var firstPage = that.activePageMap[Object.keys(that.activePageMap)[0]];
                    that.removePage(firstPage.pageHandler, firstPage.pageArg);
                }

                // 화면명정보가 파라미터로 넘어오지 않은 경우 config 정보에서 화면명 찾기 
                if(pageDPName == undefined || pageDPName == null || pageDPName == "") {
	                var pageConfigInfo = config.pageMap[pageKey];
	
	                if(pageConfigInfo) {
	                	pageDPName = pageConfigInfo.name;
	                }
	                else {
	                	pageDPName = pageHandler;
	                }
                }
                
                require([pagePath], function(pageConstructor) {
                    if (pageConstructor) {
                    	
                    	if(pageArg) {
                    		
                    		pageObj = that.activePageMap[pageKey] = new pageConstructor($.extend({pageHandler: pageHandler, pageDPName: pageDPName, pageArg: pageArg, param: renderInfo}, null));

                    		$pageEl = pageObj.render(null);

                            $pageEl.attr('data-arg', pageArg);
                            $pageEl.attr('data-page', pageHandler);
                            
                            that.$workspace.append($pageEl);
 
                        	typeof pageObj.afterRender === 'function' && pageObj.afterRender();

                            that.tabMenu.createItem({pageHandler: pageHandler, pageDPName: pageDPName, pageArg: pageArg});
                            that.activePage(pageHandler, pageArg);
                    	}
                    	else {
                    		
                    		pageObj = that.activePageMap[pageKey] = new pageConstructor({
	                            pageHandler: pageHandler,
	                            pageDPName: pageDPName,
	                            pageArg: pageArg,
	                            param: renderInfo
	                        });
	
	                        $pageEl = pageObj.render();
	                        
	                        $pageEl.attr('data-arg', pageArg);
	                        $pageEl.attr('data-page', pageHandler);
	                        
	                        if(pageInfo.newTab === false) {
	                            var $activePage = that.findActivePage();
	                            that.removePage($activePage.attr('data-page'), $activePage.attr('data-arg'));
	                        }
	
	                        that.$workspace.append($pageEl);
	                        that.tabMenu.createItem({pageHandler: pageHandler, pageDPName: pageDPName, pageArg: pageArg});
	                        that.activePage(pageHandler, pageArg);
	
	                        typeof pageObj.afterRender === 'function' && pageObj.afterRender();
                    	}
                    } else {
                        alert(bxMsg('main.no-page-msg'));
                    }
                });
            },
            checkUseYn: function(itemData){
            	//화면 열때마다 체크하기위해 함수따로만들어서 호출예정 ( 해당스태프가 해당화면에 권한이 있는지 체크 )--> checkScrnRole
            /*	if(itemData.scrnUseYn == "N") {
//            		alertMessage.info(bxMsg('cbb_err_msg.AUICME0038'));
            		window.fn_alertMessage('Error',bxMsg('cbb_err_msg.AUICME0038'))
            	}
            	else {
            		 var pageHandler = itemData.scrnNbr,
                     	pageArg = itemData.handlerArgCntnt;
            		this.changePage(pageHandler,pageArg);
            	}*/
            	this.checkScrnRole(itemData.scrnNbr);
            	
            	 var pageHandler = itemData.scrnNbr,
              	pageArg = itemData.handlerArgCntnt;
            	 this.changePage(pageHandler,pageArg);
            },
            checkScrnRole:function(scrnId){
            	
				var param = {};
        		param.staffId = $.sessionStorage('staffId');
				param.scrnId=scrnId;
				param.instCd=$.sessionStorage('instCd');

				
				//화면 권한체크
        		var linkData = {"header" : fn_getHeader("CAPCM1948402") , "CaRoleMgmtSvcGetRoleScreenRelationListIn" : param};
        		
        		bxProxy.post(sUrl, JSON.stringify(linkData), {
        			enableLoading: true,
        			success: function (response) {
        				tblNm = [];
        				
        				if(typeof response.CaRoleMgmtSvcGetRoleScreenRelationListOut != "undefined") {
        					tblNm = response.CaRoleMgmtSvcGetRoleScreenRelationListOut.tblNm;
        				}
						if(!tblNm[0]){
//							console.log(bxMsg('cbb_err_msg.AUICME0038'));
							window.fn_alertMessage('Error',bxMsg('cbb_err_msg.AUICME0038'))
						}
                        
                  }
                    , error : function(response) {
                    	alert(response);
                    }
              });
            },
            changePage: function(pageHandler, pageArg, _pageName, renderInfo) {
                var pageHandler = pageHandler,
                    renderOption,
                    pageObj,pageKey,
                    pageInitialize = renderInfo && renderInfo.pageInitialize;

                (pageInitialize) && this.tabMenu.isExistItem(pageHandler) && this.removePage(pageHandler, pageArg);
                
                if(this.tabMenu.isExistItem(pageHandler, pageArg)) {
                    this.activePage(pageHandler, pageArg);
                }else {

                    // renderInfo 가 있으면 데이터 레이지 로딩 옵션 셋팅
                    renderOption = (renderInfo)? {isLazyLoading: true} : null;

                    //페이지를 제일 처음 생성할 때도 renderInfo를 넘겨줘야 하는 경우가 있어서 수정.
                    // renderOption 값이 있으면 추가적인 렌더링 조건이 존재하는 것을 의미
                    this.createPage(pageHandler, pageArg, renderOption, renderInfo);
                }
                pageKey = bxUtil.makePageKey(pageHandler, pageArg);
                pageObj = this.activePageMap[pageKey];

                
                pageInfo = config.pageMap[pageKey];
                
              //배포과제출력여부 체크
                if(pageInfo){
                	if(pageInfo.dstbTrgtScrnYn == 'Y'){
                    	fn_headerTaskList(true);
                    } else {
                    	fn_headerTaskList(false);
                    }
                }
                
                if(renderInfo && pageObj) {
                    pageObj.afterRender && pageObj.afterRender(renderInfo);
                }
                
                $.sessionStorage('scrnId', pageHandler);
            },

            activePage: function(pageHandler, pageArg) {
                var that = this;

                that.findActivePage().removeClass('is-active');
                that.findPage(pageHandler, pageArg).addClass('is-active');
                that.tabMenu.activeItem(pageHandler, pageArg);
                $.sessionStorage('scrnId', pageHandler);
                
                $(window).resize();
            },

            removePage: function(pageHandler, pageArg) {
                var pageKey = bxUtil.makePageKey(pageHandler, pageArg);

                this.activePageMap[pageKey].remove();
                delete this.activePageMap[pageKey];

                if(Object.getOwnPropertyNames(this.activePageMap).length === 0) {
                    this.noDataMsg.show();
                }

                this.tabMenu.removeItem(pageHandler, pageArg);
            },

            refreshPage: function(pageHandler, pageArg) {
            	var pageKey = bxUtil.makePageKey(pageHandler, pageArg),
                    activePage = this.activePageMap[pageKey];

            	if(activePage.refresh) activePage.refresh();
            },

            findActivePage: function() {
                return this.$workspace.find('.is-active[data-page]');
            },

            findPage: function(pageHandler, pageArg) {
                var queryStr = '[data-page="'+pageHandler+'"]';

                if(pageArg) {
                    queryStr += '[data-arg="'+pageArg+'"]';
                }

                return this.$workspace.find(queryStr);
            },

            closeAllPage: function() {
                this.tabMenu.closeAllTab();
            }

        });

        return new WorkspaceView();
    }
);