define(
    [
        'common/config',
        'common/main/workspace',
        'text!common/main/main-menu-aside-tpl.html',
        'text!common/main/main-menu-nav-tpl.html'
    ],
    function(
        commonConfig,
        workspaceView,
        asideTpl,
        navTpl
    ) {
        return Backbone.View.extend({

            el: '#main-menu',

            templates: {
                asideTpl: asideTpl,
                navTpl: navTpl
            },

            events: {
                'click .open-menu-btn': 'openMenu',
                'click .close-menu-btn': 'closeMenu',

                'mouseenter .aside-item': 'showSubMenu',
                'mouseleave .aside-item': 'hideSubMenu'
            },

            iconList: {
                MENU00100: 'i-mng-online', // 온라인 관리
                MENU00200: 'i-mng-layout', // 배치
                MENU00300: 'i-mng-lagging', // 후행 관리
                MENU00400: 'i-mng-centercut', //센터컷 관리
                MENU00500: 'i-mng-common', // 거래공통 설정관리
                MENU00600: 'i-mng-app', // 앱 배포 관리
                MENU00700: 'i-setting', // 환경설정,
                MENU00800: 'i-mng-analysis', // DNI,
                MENU00900: 'i-mng-detail',
                MENU01000: 'i-mng-sim'
            },

            initialize: function() {
                this.$nav = this.$el.find('.bx-side-nav');
                this.$main = $('#main');
                this.$menu = this.$el.find('.bx-main-menu');
            },

            renderMainMenu: function(menuList) {
                var that = this,
                    asideTagList = [],
                    menuTagList = [];

                menuList.forEach(function(menu) {
                    var asideTag,
                        menuTag,
                        childMenuList = [];

                    menu.childMenuList.forEach(function (menuItem) {
                        menuItem.menuNm = bxMsg('main-menu.' + menuItem.menuId);
                        childMenuList.push(menuItem);

                        // 로그인한 계정에 따라 접근가능한 menuList를 저장하여 routing 처리 시 사용
                        commonConfig.authorizedMenuList[menuItem.menuId] = true;
                    });

                    // aside 렌더
                    asideTag = that.asideTpl({
                        menuNm: bxMsg('main-menu.' + menu.menuId),
                        menuId: menu.menuId,
                        menuIcon: that.iconList[menu.menuId],
                        childMenuList: childMenuList
                    });

                    // menu 렌더
                    menuTag = that.navTpl({
                        menuNm: bxMsg('main-menu.' + menu.menuId),
                        menuId: menu.menuId,
                        menuIcon: that.iconList[menu.menuId],
                        childMenuList: childMenuList
                    });

                    asideTagList.push(asideTag);
                    menuTagList.push(menuTag);
                });

                that.$el.find('.aside > .fav').html(asideTagList);
                that.$menu.html(menuTagList).accordion({
                    collapsible: true,
                    active: false,
                    heightStyle: "content"
                });


                $('a[href^="#MENU010"]').on('click', function (event) {
                    var enpharosTRACE = document.getElementById("TRACE");
                    if (enpharosTRACE)
                    {
                        enpharosTRACE.changeMenu(commonConfig.pageInfo[$(event.currentTarget).attr('href').substring(1)]['desc']);
                    }
                });
            },

            openMenu: function() {
                this.$nav.css({left:'0'});
                this.$main.css({left:'200px'});

                $('.manual-resize-component:visible').trigger('resize-component');
            },

            closeMenu: function() {
                this.$nav.css({left:'-200px'});
                this.$main.css({left:'35px'});

                $('.manual-resize-component:visible').trigger('resize-component');
            },

            showSubMenu: function(e) {
                //var $subMenu = $(e.currentTarget).find('.bw-sub');

                //$subMenu.addClass('on').css({top: $target.position().top, left: $target.position().left});
            },

            hideSubMenu: function(e) {
                //var $subMenu = $(e.currentTarget).find('.bw-sub');

                //$subMenu.removeClass('on');
            }
        });
    }
);