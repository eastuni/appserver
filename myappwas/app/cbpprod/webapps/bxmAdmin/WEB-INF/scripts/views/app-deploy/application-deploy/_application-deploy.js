define(
    [
        'common/config',
        'text!views/app-deploy/application-deploy/_application-deploy-tpl.html'
    ],
    function(
        commonConfig,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            pageId: null,
            subId: null,
            activePageMap: [],

            initialize: function(pageInitConfig) {
                // Set Page
                this.$el.addClass('app-deploy-workspace').html(this.tpl());
                this.$subNavs = this.$el.find('.app-deploy-nav');
                this.$subWorkspace = this.$el.find('.app-deploy-main');
                this.pageId = pageInitConfig.pageId;
            },

            render: function() {
                return this.$el;
            },

            changeSubPage: function (subId, renderInfo) {
                this.subId = commonConfig.pageInfo[this.pageId].currentSubId = subId;
                if(this.findPage(subId).length) {
                    this.activatePage(subId, renderInfo);
                }else {
                    this.createPage(subId, renderInfo);
                }
            },

            createPage: function(subId, renderInfo) {
                var that = this,
                    pagePath = commonConfig.pageInfo[that.pageId].subPages[subId].src;

                require([pagePath], function(pageConstructor) {
                    var $pageEl, pageObj;

                    if(pageConstructor) {
                        pageObj = that.activePageMap[subId] = new pageConstructor({subId: subId});
                        $pageEl = pageObj.render();
                        $pageEl.attr({'data-page': subId});
                        that.$subWorkspace.append($pageEl);

                        that.activatePage(subId, renderInfo);
                    }
                });
            },

            activatePage: function(subId, renderInfo) {
                this.findActivePage().removeClass('on');
                this.$subNavs.find('.on').removeClass('on');
                this.findPage(subId).addClass('on');
                this.$subNavs.find('.' + subId).addClass('on');

                $(window).resize();


                var pageObj = this.activePageMap[subId];

                if(renderInfo && pageObj) {
                    pageObj.afterRender && pageObj.afterRender(renderInfo);
                }
            },

            findActivePage: function() {
                return this.$subWorkspace.find('.on[data-page]');
            },

            findPage: function(subId) {
                return this.$subWorkspace.find('[data-page='+ subId +']');
            }
        });
    }
);