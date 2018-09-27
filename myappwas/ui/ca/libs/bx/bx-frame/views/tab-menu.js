define(
    [
     	'bx/common/config',
     	'bx-component/message/message-tooltip',
        'text!bx/views/tab-menu-tpl.html'
    ],
    function(
    		config,
    		tooltip,
    		tabMenuTpl
    		) {
    	var width = "";
    	
        var TabMenuView = Backbone.View.extend({
            el: '#main-tab > ul'

            , tabTemplate: Handlebars.compile(tabMenuTpl)

            , events: {
                'click .tab-item': 'changePageByTab'
                , 'click .tab-item .close-btn': 'removePageByTab'
                , 'click .tab-item .icon-refresh-btn': 'refreshPageByTab'
            	, 'click #tab-menu-after-move': 'afterMoveByTab'
        		, 'click #tab-menu-before-move': 'beforeMoveByTab'
            }
        
        	, initialize: function() {
        		var that = this;
        		
        		//TODO 
        	    $(".tab-list").sortable({
        	    	revert: true
        	    	, axis:'x'
        	    });
        	    $( ".tab-list, .tab-item" ).disableSelection();
        	}
        	
        	, changePageByTab: function(e /* eventObj or $TabItem */) {
                var pageHandler, pageArg;

                if(e instanceof jQuery) {
                    pageHandler = e.attr('data-page');
                    pageArg = e.attr('data-arg');
                }else {
                    pageHandler = $(e.currentTarget).attr('data-page');
                    pageArg = $(e.currentTarget).attr('data-arg');
                }

                this.$el.trigger({type: 'change-page', pageHandler: pageHandler, pageArg: pageArg });
                
//                console.log("changePageByTab");
                
                this.preNextButtonControl();
            }

        	, removePageByTab: function(e) {
                var targetTabItem = $(e.currentTarget).parents('.tab-item'),
                    pageHandler = targetTabItem.attr('data-page'),
                    pageArg = targetTabItem.attr('data-arg');

                this.$el.trigger({type: 'remove-page', pageHandler: pageHandler, pageArg: pageArg });

                if(this.$el.find('.tab-item').length > 0) {
                    this.changePageByTab(this.$el.find('.tab-item').eq(-1));
                }

                tooltip.hide();
                typeof e.stopPropagation === 'function' && e.stopPropagation();
            }
            
            , refreshPageByTab: function(e){
            	var pageHandler = $(e.currentTarget).parents('.tab-item').attr('data-page'),
                    pageArg = $(e.currentTarget).parents('.tab-item').attr('data-arg');

                this.$el.trigger({type: 'refresh-page', pageHandler: pageHandler, pageArg: pageArg });
                e.stopPropagation();
            }

        	, activeItem: function(pageHandler, pageArg) {
                var $targetTab = this.findItem(pageHandler, pageArg);

                if(!$targetTab.hasClass('on')) {
                    $targetTab.siblings('.on').removeClass('on');
                    $targetTab.addClass('on');
                }
            }

        	/**
        	 * 탭생성
        	 */
        	, createItem: function(data) {
                var $tabMenuList = this.$el,
                    lastTab = $tabMenuList.find('.tab-item').eq(-1)[0];

                $tabMenuList.find('.tab-item.on').removeClass('on');

                // inline block 간격 벌어지는 현상 픽스
                if(lastTab && lastTab.nextSibling && lastTab.nextSibling.nodeType === 3) {
                    $tabMenuList.find('.tab-item:last-child')[0].nextSibling.nodeValue = "";
                }
                
                data.active = true;
                
                $tabMenuList.append(this.tabTemplate(data));
                
//                width = $tabMenuList.find('li').eq(0).outerWidth();
                
//                console.log(width);
                
                // 최대 보여지는 갯수 5 config.js 에 정의
                if($tabMenuList.find("li").length > config.sysConfig.maxViewTabCount) {
//                	console.log("createItem");
                	// 보여지고 있는것중에서 첫번째를 숨긴다.
                	// data-active 가 true 인것만 찾는다.
                	var activeList = $tabMenuList.find("li").filter(
                			function() {
                				return $(this).attr('data-active') == 'true'
                			}
                	);
                	
                	activeList.eq(0).hide();
                	activeList.eq(0).attr("data-active", false);
                	
                	// 활성화 되어 있는 페이지 겟수 확인 및 정리
                	// 앞에것부터 비활성 시킨다.
                	activeList = $tabMenuList.find("li").filter(
                			function() {
                				return $(this).attr('data-active') == 'true'
                			}
                	);
                	
                	if(activeList.length > config.sysConfig.maxViewTabCount) {
                		var falseCnt = activeList.length - config.sysConfig.maxViewTabCount;
                		
                		for(var i = 0; i < falseCnt; i++) {
                			activeList.eq(i).hide();
                        	activeList.eq(i).attr("data-active", false);
                		}
                	}
                	
                }
                
                this.preNextButtonControl();
            }

        	/**
        	 * 탭삭제
        	 */
        	, removeItem: function(pageHandler, pageArg) {
//        		console.log("removeItem");
        		
                this.findItem(pageHandler, pageArg).remove();
                
                var $tabMenuList = this.$el;
                
                
                /*
                 * 현재 li 갯수가 최대탭뷰건수보다 크면
                 * data-active 가 false 인 목록중 마지막을 show 한다.
                 */
                if($tabMenuList.find("li").length >= config.sysConfig.maxViewTabCount) {
                	 /**
                     * 현재 보여지고 있는 탭의 뒤에 탭이 있으면 뒤에 탭을 보여 주고
                     * 없으면 앞의 탭을 확인 하여 보여 준다.
                     */
                    
                    // data-active 가 true 인것만 찾는다.
                	var activeList = $tabMenuList.find("li").filter(
                			function() {
                				return $(this).attr('data-active') == 'true'
                			}
                	);
                	
                	if(activeList.eq(activeList.length - 1).next().length !== 0) {
                		activeList.eq(activeList.length - 1).next().show();
                		activeList.eq(activeList.length - 1).next().attr("data-active", true);
                	}
                	else if(activeList.eq(0).prev().length !== 0){
                		activeList.eq(0).prev().show();
                		activeList.eq(0).prev().attr("data-active", true);
                	}
                }
                
                this.preNextButtonControl();
            }

        	/**
        	 * 앞으로 탭 이동
        	 */
        	, preMoveByTab : function() {
        		var $tabMenuList = this.$el;
//        		console.log("preMoveByTab");
        		
        		if($tabMenuList.find("li").length > config.sysConfig.maxViewTabCount) {
        			/*
        			 * data-active 가 true 인것 중 첫번째 의 pre 를 true 로 바꾸고
        			 * data-active 가 true 인것 중 마지막을 false 로 바꾼다.
        			 */
        			
        			// data-active 가 true 인것만 찾는다.
                	var activeList = $tabMenuList.find("li").filter(
                			function() {
                				return $(this).attr('data-active') == 'true'
                			}
                	);
                	var firstTab = $tabMenuList.find('.tab-item').eq(0);
                	
//                	console.log(firstTab);
                	
                	if($(firstTab).attr("data-active") == "false") {
//                		console.log(activeList.eq(0));
                		
                		activeList.eq(0).prev().show(500);
                		activeList.eq(0).prev().attr("data-active", true);
                		
                		activeList.eq(activeList.length - 1).hide(500);
//                		activeList.eq(activeList.length - 1).hide("slide", { direction: "left", queue : false }, 1000);
                		activeList.eq(activeList.length - 1).attr("data-active", false);
                		
                	}
        		}
        		
        		this.preNextButtonControl();
        	}

        	/**
        	 * 뒤로 텝 이동
        	 */
        	, nextMoveByTab : function() {
        		var $tabMenuList = this.$el;
//        		console.log("nextMoveByTab");
        		
        		if($tabMenuList.find("li").length > config.sysConfig.maxViewTabCount) {
        			/*
        			 * data-active 가 true 인것 중 첫번째 를 false 로 바꾸고
        			 * data-active 가 true 인것 중 마지막 next 를 true 로 바꾼다.
        			 */
        			
        			// data-active 가 true 인것만 찾는다.
                	var activeList = $tabMenuList.find("li").filter(
                			function() {
                				return $(this).attr('data-active') == 'true'
                			}
                	);
                	
                	var lastTab = $tabMenuList.find('.tab-item').eq(-1)[0];
                	
                	if($(lastTab).attr("data-active") == "false") {
                		activeList.eq(0).hide(500);
                		activeList.eq(0).attr("data-active", false);

                		activeList.eq(activeList.length - 1).next().show(500);
                		activeList.eq(activeList.length - 1).next().attr("data-active", true);
                	}
        		}
        		
        		this.preNextButtonControl();
        	}
        	
        	/**
        	 * 탭 앞, 뒤 이동 버튼 컨트롤
        	 */
        	, preNextButtonControl : function() {
        		var $tabMenuList = this.$el;
        		
        		if($tabMenuList.find("li").length <= config.sysConfig.maxViewTabCount) {
        			$("#preMenu").prop("disabled", true);
        			$("#nextMenu").prop("disabled", true);
        		}
        		else {
        			// li 의 첫번째가 false 면 앞으로 이동 버튼을 활성화 한다.
        			
        			// data-active 가 true 인것만 찾는다.
                	var activeList = $tabMenuList.find("li").filter(
                			function() {
                				return $(this).attr('data-active') == 'true'
                			}
                	);
                	
                	// true인것중 첫번쨰 자식의 앞 엘리멑트가 없으면 앞으로이동 비활성화 처리
                	if(activeList.eq(0).prev().length === 0) {
                		$("#preMenu").prop("disabled", true);
                		$("#preMenu").removeClass("on");
//                		$("#preMenu").css("background", "#ededed !important");
                	}
                	else {
                		$("#preMenu").prop("disabled", false);
                		$("#preMenu").addClass("on");
//                		$("#preMenu").css("background", "white");
                	}
        			
                	// true인것중에 마지막 자식의 뒤 엘리먼트가 없으면 뒤로이동 비활성화 처리
                	if(activeList.eq(-1).next().length === 0) {
                		$("#nextMenu").prop("disabled", true);
                		$("#nextMenu").removeClass("on");
                		$("#preMenu").css("background", "#ededed !important");
                	}
                	else {
                		$("#nextMenu").prop("disabled", false);
                		$("#nextMenu").addClass("on");
                		$("#preMenu").css("background", "white");
                	}
        		}
        	}
        	
        	, findItem: function(pageHandler, pageArg) {
                var queryStr = '.tab-item[data-page="'+pageHandler+'"]';

                if(pageArg) {
                    queryStr += '[data-arg="'+pageArg+'"]';
                }

                return this.$el.find(queryStr);
            }

        	, isExistItem: function(pageHandler, pageArg) {
                return this.findItem(pageHandler, pageArg).length > 0? true:false;
            }

        	, closeAllTab: function() {
                var that = this;

                that.$el.find('.tab-item .close-btn').each(function(i, closeBtn) {
                    that.removePageByTab({currentTarget: closeBtn});
                });
            }
        });

        return TabMenuView;
    }
);