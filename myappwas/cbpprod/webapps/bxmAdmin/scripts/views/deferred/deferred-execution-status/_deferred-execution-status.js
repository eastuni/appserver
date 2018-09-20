define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-execution-status/_deferred-execution-status-tpl.html'
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
                'click .deferred-search-btn': 'showDeferredSearchPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());


                // Set SubViews
                that.subViews['deferredSearchPopup'] = new DeferredSearchPopup();
                that.subViews['deferredSearchPopup'].on('select-code', function (deferredId) {
                    that.$searchWrap.find('input[data-form-param="deferredId"]').val(deferredId);
                    that.loadList();
                });


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdExecSituationService', 'getDfrdExecListUsingPaging', 'DfrdExec01IO'),
                        key: 'DfrdExec01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdExecList01IO',
                        key: 'dfrdExec'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'deferredNm', 'bizDt', 'nodeNo', 'startSeq', 'endSeq', 'parllProcSeq', 'deferredStatusCd', 'currSeq', 'errSeq', 'startDttm', 'errCd'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 1.5, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 1.5, dataIndex: 'deferredNm',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 1.5, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {
                            text: bxMsg('deferred.deferredExecutionStatus'), flex: 1.5, dataIndex: 'deferredStatusCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMDF0008'][value];
                            }
                        },
                        {text: bxMsg('deferred.startSeqNo'), flex: 1.1, dataIndex: 'startSeq',  align: 'center'},
                        {text: bxMsg('deferred.endSeqNo'), flex: 1.1, dataIndex: 'endSeq',  align: 'center'},
                        {text: bxMsg('deferred.currentSeqNo'), flex: 1.1, dataIndex: 'currSeq',  align: 'center'},
                        {text: bxMsg('deferred.errorSeqNo'), flex: 1.1, dataIndex: 'errSeq',  align: 'center'},
                        {
                            text: bxMsg('deferred.startDatetime'), flex: 2, dataIndex: 'startDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.errorCode'), flex: 1, dataIndex: 'errCd',  align: 'center',
                            renderer: function (value) {
                                if (value === 'ERROR') {
                                    return '<button class="bw-btn bw-btn-txt chr-c-magenta">' + value + '</button>';
                                } else {
                                    return value;
                                }
                            },
                            listeners: {
                                click: function(e, t, index) {
                                    var record = that.grid.getDataAt(index);

                                    if (record['errCd'] === 'ERROR') {
                                        commonUtil.redirectRoutePage('MENU00304', {
                                            deferredId: record['deferredId'],
                                            nodeNo: record['nodeNo'],
                                            bizDt: record['bizDt'],
                                            errSeq: record['errSeq']
                                        });
                                    }
                                }
                            }
                        }
                    ]
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function(){
                    that.loadList();
                }));

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function() {
                this.grid.loadData(commonUtil.makeParamFromForm(this.$searchWrap), null, true);
            },

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            }
        });
    }
);