define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/app-deploy/deploy-history/_deploy-history-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        tpl
    ) {

        var DeployHistoryView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadDeployHistoryList',
                'enter-component .deploy-history-search input': 'loadDeployHistoryList',
                'change .deploy-history-search select': 'loadDeployHistoryList'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set Grid
                that.deployHistoryGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DeployHistoryService', 'getDeployHistoryList', 'DeployHistSearchConditionOMM'),
                        key: 'DeployHistSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'DeployHistSumListOMM',
                        key: 'deployList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deployId', 'instanceCount', 'appCount', 'deployProcMethodNm', 'deploySuccessYn', 'regOccurDttm', 'regUserId'],
                    columns: [
                        {text: bxMsg('app-deploy.deploy-id'), flex: 2, dataIndex: 'deployId', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('app-deploy.instance-count'), flex: 1, dataIndex: 'instanceCount', align: 'center'},
                        {text: bxMsg('app-deploy.app-count'), flex: 1, dataIndex: 'appCount', align: 'center'},
                        {
                            text: bxMsg('app-deploy.process-level'), width: 100, dataIndex: 'deployProcMethodNm', align: 'center',
                            renderer: function(value){
                                return commonConfig.comCdList['BXMAD0013'][value];
                            }
                        },
                        {text: bxMsg('app-deploy.success-yn'), width: 100, dataIndex: 'deploySuccessYn', align: 'center'},
                        {text: bxMsg('app-deploy.execution-time'), width: 160, dataIndex: 'regOccurDttm', align: 'center'},
                        {text: bxMsg('app-deploy.user-id'), width: 120, dataIndex: 'regUserId', align: 'center'}
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.instanceDeployHistoryGrid.loadData(
                                {
                                    deployId: record.get('deployId')
                                },
                                function (data) {
                                	data= data['instanceList'];
                                	
                                	if(data && data.length) {
                                		that.$instanceDeployHistoryGrid.find('tbody tr:first-child').click();
                                	} else {
                                		that.instanceDeployHistoryGrid.setGridHeight(that.instanceDeployHistoryGrid.getLength());
                                	}
                                	
                                }
                            );

                            that.appDeployHistoryGrid.resetData();
                            that.appDeployHistoryGrid.setGridHeight(1);
                        }
                    }
                });

                that.instanceDeployHistoryGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DeployHistoryService', 'getDeployInstanceHistoryList', 'DeployHistoryOMM'),
                        key: 'DeployHistoryOMM'
                    },
                    responseParam: {
                        objKey: 'DeployHistInstanceListOMM',
                        key: 'instanceList'
                    },

                    fields: ['deployId', 'nodeName', 'containerNm', 'bxmInstanceId', 'appCount', 'deploySuccessYn'],
                    columns: [
                        {text: bxMsg('app-deploy.node'), flex: 1, dataIndex: 'nodeName', align: 'center'},
                        {text: bxMsg('app-deploy.container'), flex: 1, dataIndex: 'containerNm', align: 'center'},
                        {text: bxMsg('app-deploy.instance-id'), flex: 2, dataIndex: 'bxmInstanceId', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('app-deploy.app-count'), flex: 1, dataIndex: 'appCount', align: 'center'},
                        {text: bxMsg('app-deploy.success-yn'), flex: 1, dataIndex: 'deploySuccessYn', align: 'center'}
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.appDeployHistoryGrid.loadData(
                                {
                                    deployId: record.get('deployId'),
                                    bxmInstanceId: record.get('bxmInstanceId')
                                },
                                function () {
                                    that.appDeployHistoryGrid.setGridHeight(that.appDeployHistoryGrid.getLength() * 2);
                                }
                            );
                        }
                    }
                });

                that.appDeployHistoryGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DeployHistoryService', 'getDeployAppHistoryList', 'DeployHistoryOMM'),
                        key: 'DeployHistoryOMM'
                    },
                    responseParam: {
                        objKey: 'DeployHistAppDetailListOMM',
                        key: 'appList'
                    },

                    fields: ['bxmAppId', 'bxmAppDesc', 'deploySuccessYn', 'regOccurDttm', 'deployErrStacktrace'],
                    columns: [
                        {text: bxMsg('app-deploy.app-nm'), flex: 1, dataIndex: 'bxmAppId', align: 'center'},
                        {text: bxMsg('app-deploy.description'), flex: 2, dataIndex: 'bxmAppDesc', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('app-deploy.success-yn'), flex: 1, dataIndex: 'deploySuccessYn', align: 'center'},
                        {text: bxMsg('app-deploy.register-date'), flex: 1, dataIndex: 'regOccurDttm', align: 'center'}
                    ],
                    gridConfig: {
                        plugins: [{
                            ptype: 'rowexpander',
                            rowBodyTpl : '<p>{deployErrStacktrace}</p>'
                        }]
                    }
                });

                // Dom Element Cache
                that.$deployHistorySearch = that.$el.find('.deploy-history-search');
                that.$deployHistoryGrid = that.$el.find('.deploy-history-grid');
                that.$instanceDeployHistoryGrid = that.$el.find('.instance-deploy-history-grid');
                that.$appDeployHistoryGrid = that.$el.find('.app-deploy-history-grid');
                that.$deployHistoryDetailTitle = that.$el.find('h3 > .deploy-history-detail-title');
            },

            render: function() {
                var that = this;

                // 작업일시 데이터피커 셋팅
                commonUtil.setDatePicker(that.$deployHistorySearch.find('input[data-form-param="regOccurDttmStart[0]"]'), 'yy-mm-dd');
                commonUtil.setDatePicker(that.$deployHistorySearch.find('input[data-form-param="regOccurDttmEnd[0]"]'), 'yy-mm-dd');
                commonUtil.setTimePicker(that.$deployHistorySearch.find('input[data-form-param="regOccurDttmStart[1]"]'));
                commonUtil.setTimePicker(that.$deployHistorySearch.find('input[data-form-param="regOccurDttmEnd[1]"]'), {
                    noneOption: [
                        {
                            'label': '23:59',
                            'value': '23:59'
                        }
                    ]
                });

                // 처리방법 렌더
                that.$deployHistorySearch.find('select[data-form-param="deployProcMethodNm"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0013'], true));

                // 배포이력 그리드 렌더, 로드
                that.$deployHistoryGrid.html(that.deployHistoryGrid.render(function(){
                    that.resetSearch();
                    that.loadDeployHistoryList();
                }));

                // 인스턴스 배포이력 그리드 렌더
                that.$instanceDeployHistoryGrid.html(that.instanceDeployHistoryGrid.render(function() {
                    that.instanceDeployHistoryGrid.setGridHeight(1);
                }));

                // 어플리케이션 배포이력 그리드 렌더
                that.$appDeployHistoryGrid.html(that.appDeployHistoryGrid.render(function() {
                    that.appDeployHistoryGrid.setGridHeight(1);
                }));

                return that.$el;
            },

            afterRender: function (data) {
                if (data && data['refresh']) {
                    this.resetSearch();
                    this.loadDeployHistoryList();
                }
            },

            resetSearch: function() {
                this.$deployHistorySearch.find('[data-form-param]').val('');
                this.$deployHistorySearch.find('[data-form-param="regOccurDttmStart[0]"]').datepicker('setDate', new XDate().toString('yyyy')+'-01-01');
                this.$deployHistorySearch.find('[data-form-param="regOccurDttmStart[1]"]').val('00:00');
                this.$deployHistorySearch.find('[data-form-param="regOccurDttmEnd[0]"]').datepicker('setDate', new XDate().toString('yyyy-MM-dd'));
                this.$deployHistorySearch.find('[data-form-param="regOccurDttmEnd[1]"]').val('23:59');
            },

            loadDeployHistoryList: function() {
                var that = this,
                	loadData = commonUtil.makeParamFromForm(this.$deployHistorySearch);

                if(!commonUtil.isTimeFormat(loadData['regOccurDttmStart[1]'])) {
                    swal({type: 'warning', title: '', text: bxMsg('app-deploy.process-time-format-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                if(!commonUtil.isTimeFormat(loadData['regOccurDttmEnd[1]'])) {
                    swal({type: 'warning', title: '', text: bxMsg('app-deploy.process-time-format-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                loadData.regOccurDttmStart = loadData['regOccurDttmStart[0]'] + ' ' + loadData['regOccurDttmStart[1]'];
                loadData.regOccurDttmEnd = loadData['regOccurDttmEnd[0]'] + ' ' + loadData['regOccurDttmEnd[1]'];

                delete loadData['regOccurDttmStart[0]'];
                delete loadData['regOccurDttmStart[1]'];
                delete loadData['regOccurDttmEnd[0]'];
                delete loadData['regOccurDttmEnd[1]'];

                this.deployHistoryGrid.loadData(loadData, function(data) {
                	data = data['deployList'];
                	if(data && data.length) {
                		that.$deployHistoryGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            }

        });

        return DeployHistoryView;
    }
);