define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-job-progress/_deferred-job-progress-tpl.html'
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
                'change .bxm-search-wrap input[data-form-param="bizDt"]': 'loadList',
                'click .deferred-search-btn': 'showDeferredSearchPopup'
            },

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
                        obj: commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'getDfrdWorkProgressSituationListUsingPaging', 'DfrdWorkProgrssSituation01In'),
                        key: 'DfrdWorkProgrssSituation01In'
                    },
                    responseParam: {
                        objKey: 'DfrdWorkProgrssSituation01Out',
                        key: 'dfrdWorkProgress'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'bizDt', 'startSeq', 'endSeq', 'lastSeq', 'errInCompleteCount', 'dfrdWorkStatus', 'endYn', 'nodeNo', 'inCompleteNumberingCount', 'errCompleteCount'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
//                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
//                        {text: bxMsg('deferred.deferredName'), flex: 3, dataIndex: 'deferredNm',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.startSeqNo'), flex: 1.5, dataIndex: 'startSeq',  align: 'center'},
                        {text: bxMsg('deferred.endSeqNo'), flex: 1.5, dataIndex: 'endSeq',  align: 'center'},
                        {text: bxMsg('deferred.lastSeqNo'), flex: 1.5, dataIndex: 'lastSeq',  align: 'center'},
                        {text: bxMsg('deferred.inCompleteNumberingCount'), flex: 1.5, dataIndex: 'inCompleteNumberingCount',  align: 'center'},
                        {
                            text: bxMsg('deferred.unprocessedErrorCount'), flex: 1.5, dataIndex: 'errInCompleteCount',  align: 'center',
                            renderer: function (value) {
                                if (value !== 0) {
                                    return '<button type="button" class="bw-btn bw-btn-txt chr-c-magenta">' + value + '</button>';
                                } else {
                                    return value;
                                }
                            },
                            listeners: {
                                click: function(e, t, index) {
                                    var record = that.grid.getDataAt(index);

                                    if (record['errInCompleteCount'] !== 0) {
                                        commonUtil.redirectRoutePage('MENU00304');
                                    }
                                }
                            }
                        },
                        {text: bxMsg('deferred.errCompleteCount'), flex: 1.5, dataIndex: 'errCompleteCount',  align: 'center'},
//                        {
//                            text: bxMsg('deferred.deferredJobStatus'), flex: 1.5, dataIndex: 'dfrdWorkStatus',  align: 'center',
//                            renderer: function (value) {
//                                var content = commonConfig.comCdList['BXMDF0009'][value];
//                                if (value === 'E') {
//                                    return '<button type="button" class="bw-btn bw-btn-txt chr-c-magenta">' + content + '</button>';
//                                } else {
//                                    return content;
//                                }
//                            },
//                            listeners: {
//                                click: function(e, t, index) {
//                                    var record = that.grid.getDataAt(index);
//
//                                    if (record['dfrdWorkStatus'] === 'E') {
//                                        commonUtil.redirectRoutePage('MENU00307');
//                                    }
//                                }
//                            }
//                        },
//                        {
//                            text: bxMsg('deferred.modifiedDatetime'), flex: 4, dataIndex: 'modifyDttm', align: 'center',
//                            renderer: function (value) {
//                                return commonUtil.changeStringToFullTimeString(value);
//                            }
//                        },
                        {
                            text:bxMsg('deferred.completedYn'),
                            dataIndex: 'endYn',
                            sortable: false,
                            align: 'center',
                            width: 60,
                            editor: {
                                xtype: 'combobox',
                                updateEl: true,
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray({
                                        Y: 'Y',
                                        N: 'N'
                                    }, null)
                                }),
                                displayField: 'value',
                                valueField: 'key',
                                listeners: {
                                    change: function(field) {
                                        var selected = that.grid.grid.getSelectionModel().selected.items[0].data;
                                        commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'updateEndYn', 'DfrdWork01IO', {
                                            deferredId: selected['deferredId'],
                                            bizDt: selected['bizDt'],
                                            nodeNo: selected['nodeNo'],
                                            endYn: field.value
                                        }), {
                                            success: function(response) {
                                                var code = response.ResponseCode.code;

                                                if(code === 200){
                                                    swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                                    (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
                                                    that.loadList();
                                                } else if(code === 201){
                                                    swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                                } else if(code === 202){
                                                    swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                                }
                                            }
                                        });
                                    }
                                }
                            },
                            renderer: function (value) {
                                return '<span style="cursor: pointer;">' + value + '<i class="bw-icon i-20 i-func-edit"></i></span>';
                            }
                        }
                    ],
                    gridConfig: {
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="bizDt"]'), 'yy-mm-dd');
                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', commonConfig.bizDate);
            },

            loadList: function() {
                var params = commonUtil.makeParamFromForm(this.$searchWrap);
                this.currentListParams = params;

                this.grid.loadData({
                    dfrdWorkIO: {
                        deferredId: params.deferredId,
                        bizDt: params.bizDt.replace(/-/g, '')
                    },
                    pageNum: params.pageNum,
                    pageCount: params.pageCount
                }, null, true);
            },

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            }
        });
    }
);