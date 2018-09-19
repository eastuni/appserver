define(
    [
        'common/util',
        'text!common/main/main-tab-tpl.html'
    ],
    function(
        commonUtil,
        tabMenuTpl
    ) {
        return Backbone.View.extend({

            el: '#main-tab',

            templates: {
                tabMenuTpl: tabMenuTpl
            },

            events: {
                'click .tab-item': 'changePageByTab',
                'click .tab-item .page-close-btn': 'removePageByTab',
                'click .close-all-btn': 'removeAll',
                'click .move-left-btn': 'moveLeftTab',
                'click .move-right-btn': 'moveRightTab'
            },

            initialize: function() {
                this.$tabList = this.$el.find('.bx-tab-list');
                this.$closeAllBtn = this.$el.find('.close-all-btn');
                this.$moveLeftBtn = this.$el.find('.move-left-btn');
                this.$moveRightBtn = this.$el.find('.move-right-btn');
            },

            changePageByTab: function(e) {
                var pageId;

                if(e instanceof jQuery) {
                    pageId = e.attr('data-page');
                }else {
                    pageId = $(e.currentTarget).attr('data-page');
                }

                commonUtil.redirectRoutePage(pageId);
            },

            removePageByTab: function(e) {
                var pageId = $(e.currentTarget).parent().attr('data-page');

                this.$el.trigger({type: 'remove-page', pageId: pageId });

                if(this.$tabList.find('.tab-item').length > 0) {
                    this.changePageByTab(this.$tabList.find('.tab-item').eq(-1));
                }else{
                    commonUtil.redirectRoutePage('');
                }

                e.stopPropagation();
            },

            removeAll: function () {
                var that = this;

                this.$tabList.find('.tab-item').each(function (i, item) {
                    that.$el.trigger({type: 'remove-page', pageId: $(item).attr('data-page') });
                });

                this.$closeAllBtn.attr('disabled', true).removeClass('on');
                commonUtil.redirectRoutePage('');
            },

            refreshPageByTab: function(e){
                var pageId = $(e.currentTarget).parents('.tab-item').attr('data-page');

                this.$el.trigger({type: 'refresh-page', pageId: pageId });

                e.stopPropagation();
            },

            activeItem: function(pageId) {
                var $targetTab = this.findItem(pageId);

                if(!$targetTab.hasClass('on')) {
                    $targetTab.siblings('.on').removeClass('on');
                    $targetTab.addClass('on');
                }

                this.showActiveTab();
            },

            createItem: function(data) {
                this.$tabList.find('.tab-item.on').removeClass('on');
                this.$tabList.append(this.tabMenuTpl(data));

                if(this.$tabList.find('.tab-item').length > 5) {
                    this.$moveLeftBtn.attr('disabled', false).addClass('on');
                    this.$moveRightBtn.attr('disabled', false).addClass('on');
                    this.showActiveTab();
                }

                if(this.$tabList.find('.tab-item').length > 0) {
                    this.$closeAllBtn.attr('disabled', false).addClass('on');
                }
            },

            removeItem: function(pageId) {
                this.findItem(pageId).remove();

                if(this.$tabList.find('.tab-item').length <= 5) {
                    this.$moveLeftBtn.attr('disabled', true).removeClass('on');
                    this.$moveRightBtn.attr('disabled', true).removeClass('on');
                }

                if(this.$tabList.find('.tab-item').length <= 0) {
                    this.$closeAllBtn.attr('disabled', true).removeClass('on');
                }
            },

            findItem: function(pageId) {
                return this.$tabList.find('.tab-item[data-page='+pageId+']');
            },

            isExistItem: function(pageId) {
                return this.findItem(pageId).length > 0;
            },

            moveLeftTab: function() {
                this.$tabList.prepend(this.$tabList.find('.tab-item').last());
            },

            moveRightTab: function() {
                this.$tabList.append(this.$tabList.find('.tab-item').first());
            },

            showActiveTab: function () {
                while (!this.$tabList.find('.tab-item:lt(5).on').length) {
                    this.moveRightTab();
                }
            }
        });
    }
);