define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/online/link-flow-management/link-start-trading-code-search-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        commonConfig,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-popup-search input': 'loadList',

                'click .save-btn': 'selectCode',
                'click .cancel-btn': 'close'
            },

            /*
            * isStartingFilter
            * */
            initialize: function(initParam) {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('LinkFlowMainService', initParam && initParam.isStartingFilter ? 'getStartTrxCdList' : 'getDetailTrxCdList', 'LinkStartTrxCdInOMM'),
                        key: 'LinkStartTrxCdInOMM'
                    },
                    responseParam: {
                        objKey: 'LinkStartTrxCdListOMM',
                        key: 'trxCdList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['linkStartTrxCd', 'linkStartTrxNm', 'linkTrxTypeCd', 'linkCtrlFqn', 'linkMainCd'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="radio" name="radioItem" class="bw-input ipt-radio" data-form-param="linkStartTrxCd" data-link-start-cd="{0}" data-trx-nm="{1}" data-fqn="{2}" data-link-main="{3}"/>',
                                    record.get('linkStartTrxCd'),
                                    record.get('linkStartTrxNm'),
                                    record.get('linkCtrlFqn'),
                                    record.get('linkMainCd')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            width: 40
                        },
                        {text: bxMsg('online.transaction-code'), flex: 1, dataIndex: 'linkStartTrxCd', align: 'center'},
                        {text: bxMsg('online.transaction-name'), flex: 1, dataIndex: 'linkStartTrxNm', align: 'center'},
                        {
                            text: bxMsg('online.link-trading-division'), flex: 1, dataIndex: 'linkTrxTypeCd', align: 'center',
                            renderer: function(value){
                                return commonConfig.comCdList['BXMAD0034'][value];
                            }
                        },
                        {text: bxMsg('online.link-control-fqn'), flex: 2, dataIndex: 'linkCtrlFqn', align: 'center'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20],

                    listeners: {
                        select: function(_this, record, idx) {
                            $( that.$el.find('input[name="radioItem"]')[idx] ).attr("checked", true);
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.bxm-popup-grid').html(that.grid.render());
                that.$searchWrap = that.$el.find('.bxm-popup-search');

                if(initParam && initParam.isStartingFilter){
                    that.$el.find('.bw-tt').html(bxMsg('online.link-start-trading-code-select'));
                }
            },

            /*
            * existingTrxCdList
            * */
            render: function(renderParam) {
                if(renderParam) {
                    this.renderParam = renderParam;
                }
                this.loadList();
                this.setDraggable();
                this.show();
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function () {
                var param = commonUtil.makeParamFromForm(this.$searchWrap);

                this.renderParam && (param.existingTrxCdList = this.renderParam.existingTrxCdList);

                this.grid.loadData(param, null, true);
            },

            selectCode: function() {
                var $checkedItem = this.$el.find('input[name="radioItem"]:checked');

                this.trigger('select-code', {
                    linkStartTrxCd: $checkedItem.attr('data-link-start-cd'),
                    linkStartTrxNm: $checkedItem.attr('data-trx-nm'),
                    linkCtrlFqn: $checkedItem.attr('data-fqn'),
                    linkMainCd: $checkedItem.attr('data-link-main')
                });
                this.close();
            }
        });
    }
);