define(
    [
        '../../../../../common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/app-deploy/application-deploy/sub-pages/monitoring/pre-deployed-info-popup',
        'views/app-deploy/application-deploy/sub-pages/monitoring/application-info-popup',
        'text!views/app-deploy/application-deploy/sub-pages/monitoring/_monitoring-tpl.html'
    ],
    function (commonUtil,
              commonConfig,
              ExtGrid,
              LoadingBar,
              PreDeployedInfoPopup,
              ApplicationInfoPopup,
              tpl) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            initialize: function () {
                var that = this;

                // Set Page
                that.$el.html(this.tpl());

                // Set SubViews
                that.subViews['preDeployedInfoPopup'] = new PreDeployedInfoPopup();
                that.subViews['applicationInfoPopup'] = new ApplicationInfoPopup();
                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.monitoringGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DeployService', 'getFrmInstanceList', 'EmptyOMM'),
                        key: 'EmptyOMM'
                    },
                    responseParam: {
                        objKey: 'InstanceMonListOMM',
                        key: 'instanceMonList'
                    },
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function () {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function () {
                                            commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DeployService', 'instanceExcelExport', 'EmptyOMM'), {
                                                success: function (response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn" title="'+ bxMsg('app-deploy.cache-clear')+'"><i class="svg-icon i-25 i-clear"></i></button>',
                                event: function() {
                                	that.clearCache();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function() {
                                    that.loadInstanceList();
                                }
                            }
                        ]
                    },
                    gridToggle: false,
                    pageCountDefaultVal: 15,

                    fields: ['node', 'container', 'context', 'bxmInstanceNm', 'autoDeployYn', 'loadingModeCd', 'predeployCount', 'deployedAppCount', 'bxmInstanceId'],
                    columns: [
                        {text: bxMsg('app-deploy.node'), flex: 2, dataIndex: 'node', align: 'center'},
                        {text: bxMsg('app-deploy.container'), flex: 3, dataIndex: 'container', align: 'center'},
                        {text: bxMsg('app-deploy.context'), flex: 3, dataIndex: 'context', align: 'center'},
                        {text: bxMsg('app-deploy.instance-nm'), flex: 3, dataIndex: 'bxmInstanceNm', align: 'center'},
                        {
                            text: bxMsg('app-deploy.auto-deploy'),
                            flex: 2,
                            dataIndex: 'autoDeployYn',
                            renderer: function (value) {
                                switch (value) {
                                    case 'Y':
                                        return '<i class="bw-icon i-20 i-deploy-check-on"></i>';
                                        break;
                                    case 'N':
                                        return '<i class="bw-icon i-20 i-deploy-check-off"></i>';
                                        break;
                                    default:
                                        return '';
                                }
                            },
                            align: 'center'
                        },
                        {
                            text: bxMsg('app-deploy.loading-mode'),
                            flex: 3,
                            dataIndex: 'loadingModeCd',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMRT0001'][value];
                            },
                            align: 'center'
                        },
                        {
                            text: bxMsg('app-deploy.pre-deployed-ea'),
                            flex: 2,
                            dataIndex: 'predeployCount',
                            renderer: function (value) {
                                return value ? '<button type="button" class="bw-btn bw-btn-txt">' + value + '</button>' : value;
                            },
                            align: 'center',
                            listeners: {
                                click: function(e, t, index) {
                                    var instanceData = that.monitoringGrid.getDataAt(index);
                                    if (instanceData.predeployCount) {
                                        that.subViews['preDeployedInfoPopup'].render(instanceData.bxmInstanceId);
                                    }
                                }
                            }
                        },
                        {
                            text: bxMsg('app-deploy.application-ea'),
                            flex: 3,
                            dataIndex: 'deployedAppCount',
                            renderer: function (value) {
                                return value ? '<button type="button" class="bw-btn bw-btn-txt">' + value + '</button>': value;
                            },
                            align: 'center',
                            listeners: {
                                click: function(e, t, index) {
                                    var instanceData = that.monitoringGrid.getDataAt(index);
                                    if (instanceData.deployedAppCount) {
                                        that.subViews['applicationInfoPopup'].render(instanceData.bxmInstanceId);
                                    }
                                }
                            }
                        }
                    ]
                });

                // Dom Element Cache
                that.$monitoringGrid = that.$el.find('.monitoring-grid');
            },

            render: function () {
                var that = this;

                that.$monitoringGrid.html(that.monitoringGrid.render(function(){that.loadInstanceList();}));
                that.$monitoringGrid.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            afterRender: function (data) {
                if (data && data['refresh']) {
                    this.loadInstanceList();
                }
            },

            loadInstanceList: function() {
                var that = this;

                that.monitoringGrid.loadData(null, function () {
                    that.monitoringGrid.setGridHeight(that.monitoringGrid.currentPageRowCount);
                    if (that.monitoringGrid.getAllData().length) {
                        that.$monitoringGrid.removeClass('grid-body-no-border');
                    } else {
                        that.$monitoringGrid.addClass('grid-body-no-border');
                    }
                }, true);
            },
            
            clearCache: function() {
            	var that = this;
            	
            	swal({
            		title: '', text: bxMsg('app-deploy.clear-cache-msg'), showCancelButton: true, closeOnConfirm: false
            	}, function() {
            		commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
            				'ClearInstanceService', 'clearFrmInstance', 'EmptyOMM', {}
            		), {
            			success: function (response) {
            				var code = response.ResponseCode.code;
            				
            				if(code === 200) {
            					swal({type: 'success', title: '', text: bxMsg('app-deploy.clear-instance-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            				} else if(code === 201) {
            					swal({type: 'error', title: '', text: bxMsg('app-deploy.clear-instance-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            				}
            			}
            		})
            	});
            }
        });
    }
);
