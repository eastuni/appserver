define(
    [
     	'bx-component/message/message-tooltip',
        'text!bx/views/tab-menu-tpl.html'
    ],
    function(
    		tooltip,
    		tabMenuTpl
    		) {

        var TabMenuView = Backbone.View.extend({
            el: '#main-tab > ul'

            , tabTemplate: Handlebars.compile(tabMenuTpl)

            , events: {
                'click .tab-item': 'changePageByTab'
                , 'click .tab-item .close-btn': 'removePageByTab'
                , 'click .tab-item .icon-refresh-btn': 'refreshPageByTab'
            }

        	, initialize: function() { }

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

        	, createItem: function(data) {
                var $tabMenuList = this.$el,
                    lastTab = $tabMenuList.find('.tab-item').eq(-1)[0];

                $tabMenuList.find('.tab-item.on').removeClass('on');

                // inline block 간격 벌어지는 현상 픽스
                if(lastTab && lastTab.nextSibling && lastTab.nextSibling.nodeType === 3) {
                    $tabMenuList.find('.tab-item:last-child')[0].nextSibling.nodeValue = "";
                }

                $tabMenuList.append(this.tabTemplate(data));
            }

        	, removeItem: function(pageHandler, pageArg) {
                this.findItem(pageHandler, pageArg).remove();
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