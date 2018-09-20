define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!views/app-deploy/application-deploy/sub-pages/monitoring/application-info-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
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

                that.applicationInfoGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DeployService', 'getDeployedApplicationList', 'FrmInstanceOMM'),
                        key: 'FrmInstanceOMM'
                    },
                    responseParam: {
                        objKey: 'FrmApplicationListOMM',
                        key: 'frmApplicationList'
                    },
                    gridToggle: false,

                    fields: ['name', 'appType', 'referenceApps', 'serviceCount', 'isShared', 'isImageLogging'],
                    columns: [
                        {text: bxMsg('app-deploy.app-nm'), flex: 6, dataIndex: 'name', align: 'center'},
                        {text: bxMsg('app-deploy.app-type'), flex: 6, dataIndex: 'appType', align: 'center'},
                        {text: bxMsg('app-deploy.reference-app'), flex: 8, dataIndex: 'referenceApps', align: 'center'},
                        {text: bxMsg('app-deploy.service-count'), flex: 3, dataIndex: 'serviceCount', align: 'center'},
                        {text: bxMsg('app-deploy.shared-yn'), flex: 2, dataIndex: 'isShared', align: 'center'},
                        {text: bxMsg('app-deploy.image-logging-yn'), flex: 3, dataIndex: 'isImageLogging', align: 'center'}
                    ]
                });

                that.$el.html(that.tpl());
                that.$el.find('.application-info-grid').html(that.applicationInfoGrid.render());
            },

            render: function(bxmInstanceId) {
                var that = this;

                that.applicationInfoGrid.loadData({
                    bxmInstanceId: bxmInstanceId
                }, null, true);

                that.setDraggable();

                that.show();
            }
        });
    }
);
