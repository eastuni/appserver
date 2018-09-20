define(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar',
        'text!views/app-deploy/application-deploy/components/unselectable-app-item.html',
        'text!views/app-deploy/application-deploy/components/unselectable-instance-item.html',
        'text!views/app-deploy/application-deploy/sub-pages/manage-pre-deployed/_manage-pre-deployed-tpl.html'
    ],
    function(
        commonUtil,
        LoadingBar,
        appItem,
        instanceItem,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl,
                'appItem': appItem,
                'instanceItem': instanceItem
            },

            events: {
                'click .apply-btn': 'applyApps',
                'click .remove-btn': 'removeApps',

                'change select[data-form-param="listType"]': 'changeListType',
                'click .refresh-btn': 'loadList'
            },

            bxmInstanceId: [],

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                that.$listType = that.$el.find('select[data-form-param="listType"]');
                that.$appList = that.$el.find('.app-list');
                that.$instanceList = that.$el.find('.instance-list');

                that.subViews['loadingBar'] = new LoadingBar();
                that.$el.find('.grid-list-section').append(that.subViews['loadingBar'].render());
            },

            render: function() {
                this.loadList();
                return this.$el;
            },

            loadList: function () {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DeployService', 'getPredeployInfo', 'EmptyOMM'), {
                    beforeSend: function () {
                        that.subViews['loadingBar'].show();
                    },
                    success: function (response) {
                        var renderList = [],
                            predeployInfoOMM = response.PredeployInfoOMM;

                        predeployInfoOMM.appList.forEach(function (item) {
                            renderList.push(that.appItem(item));
                        });

                        if (!renderList.length) {
                            renderList = '<div class="empty-message">' + bxMsg('common.no-data-msg') + '</div>';

                        }
                        that.$appList.html(renderList);

                        renderList = [];
                        that.bxmInstanceId = [];
                        predeployInfoOMM.instanceList.forEach(function (item) {
                            that.bxmInstanceId.push(item.bxmInstanceId);
                            renderList.push(that.instanceItem(item));
                        });
                        if (!renderList.length) {
                            renderList = '<div class="empty-message">' + bxMsg('common.no-data-msg') + '</div>';

                        }
                        that.$instanceList.html(renderList);
                    },
                    complete: function () {
                        that.subViews['loadingBar'].hide();
                    }
                });
            },

            changeListType: function (e) {
                var $list = this['$' + $(e.currentTarget).val() + 'List'];

                $list.siblings().hide();
                $list.show();
            },

            applyApps: function () {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DeployService', 'deployPredeployedApplicationList', 'FrmInstanceListOMM', {
                        frmInstanceList: that.setFrmInstanceList()
                    }), {
                    beforeSend: function () {
                        that.subViews['loadingBar'].show();
                    },
                    success: function (response) {
                        switch (response.ResponseCode.code) {
                            case 302:
                                swal({
                                    type: 'success',
                                    title: '',
                                    text: bxMsg('app-deploy.pre-deployed-app-apply-success-msg'),
                                    showCancelButton: true,
                                    customClass: 'sweet-alert-button-resize',
                                    confirmButtonText: bxMsg('app-deploy.move-to-deploy-home'),
                                    cancelButtonText: bxMsg('app-deploy.move-to-deploy-history')
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        window.location.hash = '#MENU00601/SUB01';
                                    } else {
                                        window.location.hash = '#MENU00602';
                                    }
                                });
                                that.loadList();
                                break;
                            case 303:
                                swal({type: 'error', title: '', text: bxMsg('app-deploy.pre-deployed-app-apply-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            default:
                        }
                    },
                    complete: function () {
                        that.subViews['loadingBar'].hide();
                    }
                });
            },

            removeApps: function () {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DeployService', 'throwawayPredeployedApplicationList', 'FrmInstanceListOMM', {
                        frmInstanceList: that.setFrmInstanceList()
                    }), {
                    beforeSend: function () {
                        that.subViews['loadingBar'].show();
                    },
                    success: function (response) {
                        switch (response.ResponseCode.code) {
                            case 304:
                                swal({
                                    type: 'success',
                                    title: '',
                                    text: bxMsg('app-deploy.pre-deployed-app-remove-success-msg'),
                                    showCancelButton: true,
                                    customClass: 'sweet-alert-button-resize',
                                    confirmButtonText: bxMsg('app-deploy.move-to-deploy-home'),
                                    cancelButtonText: bxMsg('app-deploy.move-to-deploy-history')
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        window.location.hash = '#MENU00601/SUB01';
                                    } else {
                                        window.location.hash = '#MENU00602';
                                    }
                                });
                                that.loadList();
                                break;
                            case 305:
                                swal({type: 'error', title: '', text: bxMsg('app-deploy.pre-deployed-app-remove-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            default:
                        }
                    },
                    complete: function () {
                        that.subViews['loadingBar'].hide();
                    }
                });
            },

            setFrmInstanceList: function () {
                var instanceList = [];
                this.bxmInstanceId.forEach(function (id) {
                    instanceList.push({
                        bxmInstanceId: id
                    });
                });

                return instanceList;
            }
        });
    }
);
