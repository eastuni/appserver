define(
    [
     	'bx/common/config',
        'bx/common/common-info',
        'bx/common/active-state',
        'bx-component/message/message-tooltip',
        'bx/views/main-menu',
        'bx/views/header',
        'bx/views/workspace',
        'bx/common/common-message',
        'bx/views/footer'
    ],
    function (
    		config,
    		commonInfo,
    		activeState,
    		tooltip,
    		MainMenuView,
    		HeaderView,
    		workspaceView,
    		commonMessage,
    		FooterView) {

        var MainView = Backbone.View.extend({
            el: 'body',

            events: {
                'click #menu-toggler': 'toggleMainExpand'
                , 'mouseenter [data-tooltip]': 'showTooltip'
            	, 'mouseleave [data-tooltip]': 'hideTooltip'
        		, 'click .bx-layer-transparent-dim': 'closeLayer'
    			, 'click .cbb-menu-toggle-btn': 'toggleMainExpand'
				, 'click #menu_open': 'sideMenuOpen'
				, 'click #menu_close': 'sideMenuClose'
				, 'click #preMenu': 'preMoveByTab'
        		, 'click #nextMenu': 'nextMoveByTab'
//	            	, 'mousedown .bw-modal-popup': 'popupBodyDragStart',
//                , 'mousedown .bw-modal-popup-header': 'headerDragStart'
            },
            
            preMoveByTab : function() {
            	workspaceView.tabMenu.preMoveByTab();
	        },

	        nextMoveByTab : function() {
	        	workspaceView.tabMenu.nextMoveByTab();
	        },
	        
            popupBodyDragStart: function(e) {
                if(e.delegateTarget === e.target) {
                    this.dragStart(e);
                }
            },
            
            headerDragStart: function(e) {
                e.stopPropagation();
                this.dragStart(e);
            },

            dragStart: function(e) {
                this.correctX = e.clientX - this.$el.find(".bw-modal-popup").offset().left;
                this.correctY = e.clientY - this.$el.find(".bw-modal-popup").offset().top;

                this.$el.find(".bw-modal-popup").on('mousemove', this.drag.bind(this));
                this.$el.find(".bw-modal-popup").on('mouseup', this.dragEnd.bind(this));
            },

            dragEnd: function() {
            	this.$el.find(".bw-modal-popup").off('mousemove');
            	this.$el.find(".bw-modal-popup").off('mouseup');
            },

            drag: function(e) {
            	this.$el.find(".bw-modal-popup").offset({left: e.clientX - this.correctX, top: e.clientY - this.correctY});
            },
            
            initialize: function (initConfig) {
                var that = this;

                that.mainMenu = new MainMenuView();
                that.header = new HeaderView();
                that.footer = new FooterView();
                that.workspace = workspaceView;

                that.$menuToggler = $('.cbb-menu-toggle-btn');
                that.$mainMenuItem = $('.main-menu-item');
                that.$mainMenuList = $('#main-menu-list');
                that.$main = $('#main');
                that.$mainNav = $('#side-nav');
                that.$tooltip = $('.tooltip');

                that.listenTo(that.header, 'select-root-menu', function (data) {
                    
                	var subMenuList = commonInfo.getSubMenuList(data.rootMenuId);
                	
                	// 서브 메뉴 리스트가 없으면 서버 에서 서브메뉴를 조회 한후 데이터가 있으면 MenuMap 에 넣는다.
                	if(subMenuList.length  == 0) {
                		var param = {};
                		param.menuId = data.rootMenuId;
                		var linkData = {"header" : fn_getHeader("CAPSV0108405") , "CaMenuMgmtSvcGetUserChildrenMenuIn" : param};
                		
                		bxProxy.post(sUrl, JSON.stringify(linkData), {
                			enableLoading: true,
                			success: function (response) {
                				subMenuList = [];
                				
                				if(typeof response.CaMenuMgmtSvcGetUserMenuListOut != "undefined") {
                					subMenuList = response.CaMenuMgmtSvcGetUserMenuListOut.menuItmList;
                				}
                				
                				commonInfo.setSubMenuList(data.rootMenuId, subMenuList);
                				
                				initMenuPageMap(subMenuList);

                				that.mainMenu.renderMenuItem(subMenuList);
                				
                				// 컨피규 자체 함수 미얀마는 적용 안함.
                                that.sideMenuOpen();
                				// 컨피규 자체 함수 미얀마는 적용 안함.
                                
                                function initMenuPageMap(menuList) {
                                	menuList.forEach(function (menu, i) {
                                		var menuKey = menu.scrnNbr,
                                		compositionKey = menuKey;
                                		
                                		if (menuKey) {
                                			if (menu.handlerArgCntnt) {
                                				compositionKey = menuKey + ':' + menu.handlerArgCntnt;
                                			}
                                			
                                			menu.src = that.pageSrcMap[menuKey];
                                			menu.name = menu.menuNm;
                                			
                                			config.pageMap[compositionKey] = menu;
                                		}
                                		
                                		if ($.isArray(menu.children)) {
                                			initMenuPageMap(menu.children);
                                		}
                                	});
                                }
                                
                          }
	                        , error : function(response) {
	                        	alert(response);
	                        }
                      });
                	}
                	else {
                		that.mainMenu.renderMenuItem(subMenuList);
                		that.sideMenuOpen();
                	}
                	
                });

                that.listenTo(that.header, 'select-inst', function () {
                    that.workspace.closeAllPage();
                });

                //1280이하 일 경우 메뉴를 접는다.
                var x = screen.width;
                if (x <= 1280)
                    that.toggleMainExpand();
                
                $( document ).tooltip({
                    position: {
                      my: "center bottom-20",
                      at: "center top",
                      using: function( position, feedback ) {
                        $( this ).css( position );
                        $( "<div>" )
                          .addClass( "arrow" )
                          .addClass( feedback.vertical )
                          .addClass( feedback.horizontal )
                          .appendTo( this );
                      }
                    }
                  });
            },

            render: function (renderInfo) {
                this.workspace.initPages(renderInfo.startPage);
                this.mainMenu.render(renderInfo.menuList);
                
                $(".login_title").text(topTitle); //config.js에 정의되어 있음..
            },

            renderRootMenu: function (rootMenuList, pageSrcMap) {
            	
            	this.pageSrcMap = pageSrcMap;
                this.header.renderRootMenu(rootMenuList);
            }
            
            , sideMenuOpen : function() {
            	$('#side-nav').animate(
            			{width:'200px'},
            			{ 
            				duration: 300,
            				queue: false, 
            				complete : function() {
            					$('#menu_open').hide();
            					$('#menu_close').show();
            				}
            			}
            	);
            	$('#main').animate({left:'250px'}, { duration: 300, queue: false });
            }

            , sideMenuClose : function() {
            	$('#side-nav').animate(
            			{width:'0px'}
            			, { duration: 300,
            				queue: false, 
            				complete : function() {
            					// 메인메뉴의 버튼을 활성화 한다.
            					$('#menu_open').show();
            					$('#menu_close').hide();
            				}
            			}
            	);
            	$('#main').animate({left:'52px'}, { duration: 300, queue: false });
            }
            
            , toggleMainExpand: function () {
                var self = this;

                if (self.$main.hasClass('is-extension')) {
                    self.reduceMainArea();
                    self.expandMainMenu();
                } else {
                    self.expandMainArea();
                    self.reduceMainMenu();
                }

                $('.manual-resize-component:visible').trigger('resize-component');
            },

            expandMainArea: function () {
                this.$main.addClass('is-extension');
            },

            reduceMainArea: function () {
                this.$menuToggler.removeClass('')
                this.$main.removeClass('is-extension');
            },

            expandMainMenu: function () {
                this.$mainNav.addClass('is-extension');
                this.$mainMenuList.addClass('is-extension');
            },

            reduceMainMenu: function () {
                this.$mainNav.removeClass('is-extension');
                this.$mainMenuList.removeClass('is-extension');
            },

            showTooltip: function (e) {
                var tooltipMsg = $(e.currentTarget).attr('data-tooltip');

                if (this.$tooltip.is(':visible')) {
                    return;
                }

                tooltip.show(tooltipMsg, e.clientX + 10, e.clientY + 10);
            },

            printErrorLog: function (errorMsg) {
                this.footer.printError(errorMsg);
            },

            hideTooltip: function (e) {
                tooltip.hide();
            },

            closeLayer: function (e) {
                activeState.removeLayer();
            }
        });

        return MainView;
    }
);