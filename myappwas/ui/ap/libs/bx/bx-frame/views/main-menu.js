define(
    [
        'bx-component/bx-accordion/bx-accordion'
        , 'bx-component/message/message-alert'
        , 'bx/views/workspace'
    ],
    function(
        bxAccordion
        , alertMessage
        , workspaceView
    ) {

        var MainMenuView = Backbone.View.extend({
            el: '#main-menu-accordion'

            , events: { }

            , initialize: function() {
                var that = this;

                that.$mainMenu = $('#main-menu');
                that.$mainMenuAccordion = $('#main-menu-accordion');
                that.$sideIconListArea = $('.sideIconListArea');
                that.workspace = workspaceView;
                
                that.subViews['subMenuAccordion'] = new bxAccordion({
                    fields: {
                        id: 'scrnNbr', value: 'menuNm', symbol: { text: 'M', color: '#56799F'}
                , disabled : 'scrnUseYn'
                    },
                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                        	//사용여부확인 후 페이지전환
                        	this.workspace.checkUseYn(itemData);
                        }
                    }
                });
            }

            , render: function(menuList) {
            
            }

            // LNB 생성
            , renderMenuItem: function(menuList) {

                if(!this.isMenuRendered) {
                    this.$mainMenuAccordion.html(this.subViews['subMenuAccordion'].render());
                    this.isMenuRendered = true;
                }
                this.subViews['subMenuAccordion'].renderItem(menuList);
                
                // 메뉴 접었을때 아이콘 생성 주석으로 막음
//                this.renderSideIcons(menuList);
            }

            // 페이지 전환
            , changePage: function(menuData) {
                var pageHandler = menuData.scrnNbr,
                    pageArg = menuData.handlerArgCntnt;
                this.workspace.changePage(pageHandler, pageArg);
            }

            // LNB 접었을때 icon 생성
            , renderSideIcons : function(menuList) {
            	var that = this;
            	that.$sideIconListArea.html("");
            	
            	$(menuList).each(function(idx, data) {
            		var sideIcon = "<li onclick=\"javascript:alert('개발중입니다.');\" class=\"bw-btn\" title=\""+data.menuNm+"\">";
            		sideIcon += "<i class=\"bw-icon i-30 i-mng-online\"></i>";
            		sideIcon += "</li>";
            		that.$sideIconListArea.append(sideIcon);
            	});
            	
            }
        });

        return MainMenuView;
    }
);

