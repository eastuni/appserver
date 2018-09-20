define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!common/popup/error-message-code-search/error-message-code-search-tpl.html'
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
                'click .search-btn': 'loadList',
                'enter-component .bxm-popup-search input': 'loadList',
                'change .bxm-popup-search select': 'loadList',
                'click .add-error-code-btn': 'onClickAddErrorCode',
                'click .remove-error-code-btn': 'onClickRemoveErrorCode',
                'click .remove-all-error-code-btn': 'onClickRemoveAllErrorCode',

                'click .save-btn': 'selectCode',
                'click .cancel-btn': 'close'
            },

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BxmComMsgService', 'getComMsgUsingPaging', 'BxmComMsgOMM'),
                        key: 'BxmComMsgOMM'
                    },
                    responseParam: {
                        objKey: 'BxmComMsgListOMM',
                        key: 'bxmComMsg'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn-txt on">' + bxMsg('common.add-all') + '</button>',
                                event: function() {
                                    that.$errorCodeSection.html('<div class="items-in-box">\
                                    ALL<i class="fa fa-close remove-error-code-btn" data-code="ALL"></i>\
                                        </div>');
                                }
                            }
                        ]
                    },

                    fields: ['msgId', 'langCd', 'basicMsgCtt', 'regUserId'],
                    columns: [
                        {text: bxMsg('deferred.messageId'), flex: 3, dataIndex: 'msgId', align: 'center'},
                        {text: bxMsg('deferred.languageCode'), flex: 2, dataIndex: 'langCd', align: 'center',
                        	renderer: function(value) {
                                return commonConfig.comCdList['BXMAD0003'][value];
                            }
                        },
                        {text: bxMsg('deferred.basicMessageCtt'), flex: 8, dataIndex: 'basicMsgCtt', align: 'center'},
                        {text: bxMsg('deferred.regUserId'), flex: 2, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('common.add'), flex: 1, dataIndex: 'msgId', align: 'center', sortable: false,
                        	renderer: function(value) {
                                return '<button type="button" class="bw-btn">' +
                                    '<i class="fa fa-plus add-error-code-btn" data-code="' + value + '"></i>' +
                                    '</button>';
                        	}
                        }
                    ],
                    paging: true,
                    pageCountDefaultVal: 5,
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
                that.$errorCodeSection = that.$el.find('.error-code-section');
            },
            
            render: function(data) {
                this.setDraggable();
                this.show();
                this.renderCode(data);
                this.loadList();
            },

            renderCode: function(data) {
            	this.$searchWrap.find('select[data-form-param="langCd"]')
                .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0003'], true));
            	this.$searchWrap.find('select[data-form-param="langCd"]').val(commonConfig.locale);
            	
            	if (data && data['errorCodes']) {
                    var buttons = data['errorCodes'].split(',').map(function (errorCode) {
                        return '<div class="items-in-box">' +
                            errorCode + '<i class="fa fa-close remove-error-code-btn" data-code="' + errorCode + '"></i>' +
                            '</div>'
                    });

                    this.$errorCodeSection.html(buttons);
                }
            },
            
            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },
            
            loadList: function () {
                this.grid.loadData(commonUtil.makeParamFromForm(this.$searchWrap), null, true);
            },

            onClickAddErrorCode: function (event) {
                var dataCode = $(event.currentTarget).attr('data-code'),
                    button = '<div class="items-in-box">' +
                        dataCode + '<i class="fa fa-close remove-error-code-btn" data-code="' + dataCode + '"></i>' +
                        '</div>';
                if (!this.$errorCodeSection.find('div').length || this.$errorCodeSection.find('div')[0].innerText === 'ALL') {
                    this.$errorCodeSection.html(button);
                } else if (!this.$errorCodeSection.find('div i[data-code=' + dataCode + ']').length) {
                    this.$errorCodeSection.append(button);
                }
            },

            onClickRemoveErrorCode: function (event) {
                $(event.currentTarget).parent().remove();
            },

            onClickRemoveAllErrorCode: function () {
                this.$errorCodeSection.html('');
            },

            selectCode: function() {
                var errorCodes = [];

                this.$errorCodeSection.find('div i').map(function (i, item) {
                    errorCodes.push($(item).attr('data-code'));
                });

                this.trigger('select-code', errorCodes.join(','));
                this.close();
            }
        });
    }
);