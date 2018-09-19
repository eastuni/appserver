define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-input-tables/_deferred-input-tables-tpl.html'
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

                'click .refresh-btn': 'loadDetails'
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
                        obj: commonUtil.getBxmReqData('DfrdInputTableMngtService', 'getInputListUsingPaging', 'DfrdInput01IO'),
                        key: 'DfrdInput01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdInputList01IO',
                        key: 'dfrdInput'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'deferredNm', 'logSeq', 'bizDt', 'trxDt', 'inputProcCd', 'regDttm', 'guid', 'linkSeq'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 2, dataIndex: 'deferredNm',  align: 'center'},
                        {text: bxMsg('deferred.logSeqNo'), flex: 1, dataIndex: 'logSeq',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.transactionDate'), flex: 2, dataIndex: 'trxDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.inputProcessingStatus'), flex: 1.5, dataIndex: 'inputProcCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMDF0007'][value];
                            }
                        },
                        {
                            text: bxMsg('deferred.registerDatetime'), flex: 2, dataIndex: 'regDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.loadDetails({
                                deferredId: record.get('deferredId'),
                                guid: record.get('guid'),
                                linkSeq: record.get('linkSeq')
                            });
                        }
                    }
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="bizDt"]'), 'yy-mm-dd');
                that.$searchWrap.find('select[data-form-param="inputProcCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0007'], true));

                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));

                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', new Date());
            },

            loadList: function() {
                var params = commonUtil.makeParamFromForm(this.$searchWrap);

                params.bizDt = params.bizDt.replace(/-/g, '');

                this.grid.loadData(params, null, true);
            },

            loadDetails: function(params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'DfrdInputTableMngtService', 'getInputDetail', 'DfrdInput01IO', params);

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['DfrdInput01IO'];

                        that.$detailTitle.text(data.deferredId);

                        data['bizDt'] = commonUtil.changeStringToDateString(data['bizDt']);
                        data['trxDt'] = commonUtil.changeStringToDateString(data['trxDt']);
                        data['sysDt'] = commonUtil.changeStringToDateString(data['sysDt']);
                        data['sysTime'] = commonUtil.changeStringToTimeString(data['sysTime']);
                        data['regDttm'] = commonUtil.changeStringToFullTimeString(data['regDttm']);
                        data['modifDttm'] = commonUtil.changeStringToFullTimeString(data['modifDttm']);

                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            }
        });
    }
);