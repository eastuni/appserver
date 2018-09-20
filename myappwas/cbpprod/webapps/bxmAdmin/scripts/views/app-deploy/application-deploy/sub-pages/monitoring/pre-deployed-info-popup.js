define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/component/popup/popup',
        'text!views/app-deploy/application-deploy/sub-pages/monitoring/pre-deployed-info-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .ok-btn': 'close'
            },

            initialize: function() {
                var that = this;

                that.subViews['detailLoadingBar'] = new LoadingBar();

                that.preDeployedInfoGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DeployService', 'getPredeployedApplicationList', 'FrmInstanceOMM'),
                        key: 'FrmInstanceOMM'
                    },
                    responseParam: {
                        objKey: 'DeployHistListOMM',
                        key: 'appList'
                    },
                    gridToggle: false,

                    fields: ['bxmAppId', 'deployFileNm', 'refBxmAppIdList', 'regOccurDttm', 'serviceCount', 'bxmAppSharedYn'],
                    columns: [
                        {text: bxMsg('app-deploy.app-nm'), flex: 4, dataIndex: 'bxmAppId', align: 'center'},
                        {text: bxMsg('app-deploy.app-file-nm'), flex: 4, dataIndex: 'deployFileNm', align: 'center'},
                        {text: bxMsg('app-deploy.reference-app'), flex: 6, dataIndex: 'refBxmAppIdList', align: 'center'},
                        {text: bxMsg('app-deploy.occur-date'), flex: 3, dataIndex: 'regOccurDttm', align: 'center'},
                        {text: bxMsg('app-deploy.service-count'), flex: 2, dataIndex: 'serviceCount', align: 'center'},
                        {text: bxMsg('app-deploy.shared-yn'), flex: 2, dataIndex: 'bxmAppSharedYn', align: 'center'}
                    ]
                });

                that.$el.html(that.tpl());
                that.$preDeployedInfoGrid = that.$el.find('.pre-deployed-info-grid');
                that.$preDeployedInfoDetail = that.$el.find('.pre-deployed-info-detail');

                that.$preDeployedInfoGrid.html(that.preDeployedInfoGrid.render());
                that.$preDeployedInfoDetail.append(that.subViews['detailLoadingBar'].render());

            },

            render: function(bxmInstanceId) {
                var that = this;

                that.loadData(bxmInstanceId);

                that.setDraggable();

                that.show();
            },

            loadData: function(bxmInstanceId) {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DeployService', 'getPredeployedApplicationList', 'FrmInstanceOMM',
                    {
                        bxmInstanceId: bxmInstanceId
                    }
                ), {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var formData = response.DeployHistListOMM;
                        formData.preDeployTimeoutMin = (formData.preDeployTimeoutMills / 60000) + bxMsg('common.minutes');

                        commonUtil.makeFormFromParam(that.$preDeployedInfoDetail, formData);
                        that.preDeployedInfoGrid.loadData(null, null, true, formData, 'appList');
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);
