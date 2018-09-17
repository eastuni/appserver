define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!common/popup/msg-search/msg-search-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
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
                'click .search-btn': 'loadMsgCodeList',
                'enter-component .msg-code-search input': 'loadMsgCodeList',

                'click .select-msg-code-btn': 'selectMsgCode',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                that.msgCodeGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('CommonMessageService', 'getCommonMsgList', 'CommonMessageSearchConditionOMM'),
                        key: 'CommonMessageSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'CommonMessageListOMM',
                        key: 'commonMsgList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['msgId', 'msgBizGrpId', 'msgTypeCd', 'langCd'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<input type="radio" name="msgId" class="bw-input ipt-radio" data-form-param="msgId" data-value="{0}" />',
                                    record.get('msgId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            width: 120
                        },
                        {
                            text: bxMsg('trx-setting.message-id'), flex: 1, dataIndex: 'msgId', align: 'center'
                        },
                        {
                            text: bxMsg('trx-setting.message-level'), flex: 1, dataIndex: 'msgBizGrpId', align: 'center',
                            renderer: function(value) {
                                return commonConfig.comCdList['BXMAD0005'][value];
                            }
                        },
                        {
                            text: bxMsg('trx-setting.message-type'), flex: 1, dataIndex: 'msgTypeCd', align: 'center',
                            renderer: function(value) {
                                return commonConfig.comCdList['BXMAD0006'][value];
                            }
                        },
                        {
                            text: bxMsg('trx-setting.language-cd'), width: 100, dataIndex: 'langCd', align: 'center',
                            renderer: function(value) {
                                return commonConfig.comCdList['BXMAD0003'][value];
                            }
                        }
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20],

                    listeners: {
                        select: function(_this, record, idx) {
                            $( $('input[name="msgId"]')[idx] ).attr("checked", true);
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.msg-code-grid').html(that.msgCodeGrid.render());

                that.$msgCodeSearch = that.$el.find('.msg-code-search');
                that.$searchWrap = that.$el.find('.search-wrap');
            },

            render: function() {
                var that = this;

                that.$searchWrap.find('select[data-form-param="langCd"]')
                .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0003'], true));
                that.$searchWrap.find('select[data-form-param="langCd"]').val(commonConfig.locale);
            	
                that.loadMsgCodeList();

                that.setDraggable();

                that.show();
            },

            resetSearch: function() {
                this.$msgCodeSearch.find('[data-form-param]').val('');
            },

            loadMsgCodeList: function () {
                var renderData = commonUtil.makeParamFromForm(this.$msgCodeSearch);

                this.msgCodeGrid.loadData(renderData, null, true);
            },

            selectMsgCode: function() {
                var msgId = $( $('input[name="msgId"]:checked')[0] ).attr('data-value');
                this.trigger('select-msg-id', msgId);
                this.close();
            }
        });
    }
);
