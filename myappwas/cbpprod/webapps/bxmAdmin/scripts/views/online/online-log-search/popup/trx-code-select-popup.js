define(
    [
        '../../../../common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!views/online/online-log-search/popup/trx-code-select-popup-tpl.html'
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
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadTrxCodeList',
                'enter-component .trx-code-search input': 'loadTrxCodeList',

                'click .select-trx-code-btn': 'selectTrxCode',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                that.trxCodeGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('TrxInfoService', 'getTrxInfoList', 'TrxInfoSearchConditionOMM'),
                        key: 'TrxInfoSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'TrxInfoListOMM',
                        key: 'trxInfoList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['trxCd', 'bxmAppId', 'svcNm', 'opNm'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<input type="radio" name="trxCd" class="bw-input ipt-radio" data-form-param="trxCd" data-value="{0}" />',
                                    record.get('trxCd')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 5
                        },
                        {text: bxMsg('online.trx-code'), flex: 15, dataIndex: 'trxCd', align: 'center'},
                        {text: bxMsg('online.application'), flex: 25, dataIndex: 'bxmAppId', align: 'center'},
                        {text: bxMsg('online.service'), flex: 25, dataIndex: 'svcNm', align: 'center'},
                        {text: bxMsg('online.operation'), flex: 30, dataIndex: 'opNm', align: 'center'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20],

                    listeners: {
                        select: function(_this, record, idx) {
                            $( $('input[name="trxCd"]')[idx] ).attr("checked", true);
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.trx-code-grid').html(that.trxCodeGrid.render());

                that.$trxCodeSearch = that.$el.find('.trx-code-search');
            },

            render: function() {
                var that = this;

                that.loadTrxCodeList();

                that.setDraggable();

                that.show();
            },

            resetSearch: function() {
                this.$trxCodeSearch.find('[data-form-param]').val('');
            },

            loadTrxCodeList: function () {
                var renderData = commonUtil.makeParamFromForm(this.$trxCodeSearch);

                this.trxCodeGrid.loadData(renderData, null, true);
            },

            selectTrxCode: function() {
                var trxCode = $( $('input[name="trxCd"]:checked')[0] ).attr('data-value');

                if(!trxCode){
                    swal({type: 'warning', title: '', text: bxMsg('common.select-item-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.trigger('select-trx-code', trxCode);
                this.close();
            }
        });
    }
);
