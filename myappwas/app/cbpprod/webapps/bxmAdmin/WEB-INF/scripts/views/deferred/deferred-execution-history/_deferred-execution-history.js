define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-execution-history/_deferred-execution-history-tpl.html'
    ],
    function (
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        DeferredSearchPopup,
        tpl) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',
                'change .bxm-search-wrap select': 'loadList',
                'change .bxm-search-wrap input[data-form-param="bizDt"]': 'loadList',
                'click .deferred-search-btn': 'showDeferredSearchPopup',
                'click .redirect-online-log-btn': 'redirectToOnlineLogPage'
            },

            currentDetailsListParams: null,
            
            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());


                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();

                that.subViews['deferredSearchPopup'] = new DeferredSearchPopup();
                that.subViews['deferredSearchPopup'].on('select-code', function (deferredId) {
                    that.$searchWrap.find('input[data-form-param="deferredId"]').val(deferredId);
                    that.loadList();
                });


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdExecHistoryService', 'getDfrdExecHistoryListUsingPaging', 'DfrdExecHistory01IO'),
                        key: 'DfrdExecHistory01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdExecHistoryList01IO',
                        key: 'dfrdExecHistory'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'bizDt', 'nodeNo', 'deferredStatusCd', 'startSeq', 'endSeq', 'errSeq', 'startDttm', 'endDttm', 'errCd', 'parllProcSeq'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
//                        {
//                            text: bxMsg('deferred.deferredExecutionStatus'), flex: 2, dataIndex: 'deferredStatusCd', align: 'center',
//                            renderer: function (value) {
//                                return commonConfig.comCdList['BXMDF0008'][value];
//                            }
//                        },
                        {text: bxMsg('deferred.startSeqNo'), flex: 1, dataIndex: 'startSeq',  align: 'center'},
                        {text: bxMsg('deferred.endSeqNo'), flex: 1, dataIndex: 'endSeq',  align: 'center'},
//                        {text: bxMsg('deferred.errorSeqNo'), flex: 1, dataIndex: 'errSeq',  align: 'center'},
                        {
                            text: bxMsg('deferred.startDatetime'), flex: 2, dataIndex: 'startDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.endDatetime'), flex: 2, dataIndex: 'endDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        }
//                        ,
//                        {
//                            text: bxMsg('deferred.errorCode'), flex: 1, dataIndex: 'errCd',  align: 'center',
//                            renderer: function (value) {
//                                if (value === 'ERROR') {
//                                    return '<button class="bw-btn bw-btn-txt chr-c-magenta">' + value + '</button>';
//                                } else {
//                                    return value;
//                                }
//                            }
//                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 9);
                        },
                        beforeselect: function(_this, record) {
                            if (!this.gridSelect && record.get('errCd') === 'ERROR') {
                                commonUtil.redirectRoutePage('MENU00304', {
                                    deferredId: record.get('deferredId'),
                                    nodeNo: record.get('nodeNo'),
                                    bizDt: record.get('bizDt'),
                                    errSeq: record.get('errSeq')
                                });

                                return false;
                            } else {
                                return this.gridSelect;
                            }

                        }
                        /*,
                        select: function(_this, record) {
                            that.loadDetailsList({
                                deferredId: record.get('deferredId'),
                                bizDt: record.get('bizDt'),
                                nodeNo: record.get('nodeNo'),
                                startSeq: record.get('startSeq'),
                                endSeq: record.get('endSeq')
                            });
                        }*/
                    }
                });

                //detailGrid
/*                that.detailsListGrid = new ExtGrid({
                	
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function () {
                                    that.loadDetailsList(that.currentDetailsListParams);
                                }
                            }
                        ]
                    },

                    fields: ['deferredId', 'nodeNo', 'bizDt', 'deferredStatusCd', 'logSeq', 'guid', 'linkSeq', 'startDttm', 'endDttm', 'renderOnlineLogYn'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {text: bxMsg('deferred.businessDate'), flex: 1.5, dataIndex: 'bizDt',  align: 'center',
                        	renderer: function(value) {
                        		return commonUtil.changeStringToDateString(value);
                        	}
                        },
//                        {
//                            text: bxMsg('deferred.deferredExecutionStatus'), flex: 1.5, dataIndex: 'deferredStatusCd', align: 'center',
//                            renderer: function (value) {
//                                return commonConfig.comCdList['BXMDF0008'][value];
//                            }
//                        },
                        {text: bxMsg('deferred.seqNo'), flex: 1, dataIndex: 'logSeq',  align: 'center',
                        	renderer: function(value, metaData, record) {
                        		if(record.get('renderOnlineLogYn')) {
                        			return Ext.String.format('<button type="button" class="bw-btn bw-btn-txt redirect-online-log-btn" data-guid="{0}" data-link-seq="{1}" data-start-dttm="{2}">{3}</button>',
                                            record.get('guid'),
                                            record.get('linkSeq'),
                                            record.get('startDttm'),
                                            value
                                        );
                        		} else {
                        			return value;
                        		}
                        	}
                        },
                        {text: bxMsg('deferred.guid'), flex: 5, dataIndex: 'guid',  align: 'center'},
                        {text: bxMsg('deferred.linkSeqNo'), flex: 1.5, dataIndex: 'linkSeq',  align: 'center'},
                        {text: bxMsg('deferred.startDatetime'), flex: 2.5, dataIndex: 'startDttm',  align: 'center',
                        	renderer: function(value) {
                        		return commonUtil.changeStringToFullTimeString(value);
                        	}
                        },
                        {text: bxMsg('deferred.endDatetime'), flex: 2.5, dataIndex: 'endDttm',  align: 'center',
                        	renderer: function(value) {
                        		return commonUtil.changeStringToFullTimeString(value);
                        	}
                        }
                    ]
                });*/
                

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
//                that.$detailsListGrid = that.$el.find('.details-list-grid-wrap');
//                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="bizDt"]'), 'yy-mm-dd');
                that.$searchWrap.find('select[data-form-param="deferredStatusCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0008'], true));

                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));

//                that.$detailsListGrid.html(that.detailsListGrid.render());
//                that.$detailsListGrid.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', commonConfig.bizDate);
            },

            loadList: function() {
                var that = this,
                	params = commonUtil.makeParamFromForm(this.$searchWrap);

                params.bizDt = params.bizDt.replace(/-/g, '');

                this.grid.loadData(params, function(data) {
                	data = data['dfrdExecHistory'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

           /* loadDetailsList: function(params) {
                var that = this,
                    requestParam;

                //??어케해야할지모르겠음
                this.currentDetailsListParams = params;

                if (!params) {
                    return;
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'DfrdExecHistoryService', 'getDfrdExecHistoryDetail', 'DfrdExecHistory01IO', params);

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.DfrdExecHistoryList02IO;
                        
                        if(data.listSize > 0) {
                        	that.$detailTitle.text(data.dfrdExecHistory[0].deferredId);
                        } else {
                        	that.$detailTitle.text('');
                        }
                      
                        that.detailsListGrid.setData(data.dfrdExecHistory);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },*/

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            },
            
            redirectToOnlineLogPage: function(e) {
                var target = $(e.currentTarget);
                commonUtil.redirectRoutePage('MENU00101', {
                    guid: target.attr('data-guid'),
                    linkSeq: target.attr('data-link-seq'),
                    startDttm: target.attr('data-start-dttm')
                });
            
            }
        });
    }
);