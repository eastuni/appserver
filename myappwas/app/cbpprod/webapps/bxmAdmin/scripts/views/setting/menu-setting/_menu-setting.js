define(
    [
        'common/util',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/menu-setting/menu-setting-popup',
        'text!views/setting/menu-setting/_menu-setting-tpl.html'
    ],
    function(
        commonUtil,
        ExtTreeGrid,
        LoadingBar,
        MenuSettingPopup,
        tpl
    ) {

        var MenuSettingView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .edit-menu-btn': 'showEditMenuPopup'
            },

            menuId: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['menuSettingPopup'] = new MenuSettingPopup();
                that.subViews['menuSettingPopup'].on('edit-menu', function() {
                    // 메뉴 수정시, 리스트, 상세 리프래시
                    that.menuSettingGrid.reloadData(function() {
                        that.loadMenu({menuId: that.menuId});
                    });
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.menuSettingGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserMenuService', 'getUserMenuList', 'PageCountOMM'),
                        key: 'PageCountOMM'
                    },
                    responseParam: {
                        objKey: 'UserMenuListOMM',
                        key: 'userMenuList'
                    },
                    header: {
                        treeExpand: true
                    },
                    customHeight: 500,
                    
                    fields: ['menuId', 'menuNm', 'menuDesc', 'useYn', 'children'],
                    columns: [
                        {xtype: 'treecolumn', text: bxMsg('setting.menu-id'), flex: 1, dataIndex: 'menuId', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('setting.menu-nm'), flex: 1, dataIndex: 'menuNm', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('setting.menu-desc'), flex: 1, dataIndex: 'menuDesc', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('setting.use-yn'), width: 100, dataIndex: 'useYn', align : 'center'}
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadMenu({menuId: record.get('menuId')});
                        }
                    }
                });

                // Dom Element Cache
                that.$menuSettingGrid = that.$el.find('.menu-setting-grid');
                that.$menuSettingDetail = that.$el.find('.menu-setting-detail');
                that.$menuSettingDetailTitle = that.$el.find('h3 > .menu-setting-detail-title');
            },

            render: function() {
                var that = this;

                that.$menuSettingGrid.html(this.menuSettingGrid.render(function(){that.loadMenuList();}));
                that.$menuSettingDetail.append(that.subViews['detailLoadingBar'].render());

                return this.$el;
            },

            loadMenuList: function() {
                this.menuSettingGrid.loadData();
            },

            showEditMenuPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$menuSettingDetail);

                if(!renderData.menuId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['menuSettingPopup'].render(renderData);
            },

            /**
             * menuId
             * */
            loadMenu: function(param) {
                var that = this,
                    requestParam;

                that.menuId = param.menuId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'UserMenuService', 'getUserMenuInfo', 'UserMenuOMM',
                    {
                        menuId: param.menuId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var userMenuOutOMM = response.UserMenuOutOMM;

                        that.$menuSettingDetailTitle.text(userMenuOutOMM.menuId);
                        commonUtil.makeFormFromParam(that.$menuSettingDetail, userMenuOutOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return MenuSettingView;
    }
);