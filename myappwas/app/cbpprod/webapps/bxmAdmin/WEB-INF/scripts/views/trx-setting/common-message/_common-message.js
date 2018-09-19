define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/trx-setting/common-message/common-message-popup',
        'text!views/trx-setting/common-message/_common-message-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        CommonMessagePopup,
        tpl
    ) {

        var CommonMessageView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            msgId: null,
            langCd: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadCommonMessageList',
                'enter-component .common-message-search input': 'loadCommonMessageList',
                'change .common-message-search select': 'loadCommonMessageList',

                'click .del-common-message-btn': 'deleteCommonMessage',
                'click .edit-common-message-btn': 'showEditCommonMessagePopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['commonMessagePopup'] = new CommonMessagePopup();
                that.subViews['commonMessagePopup'].on('edit-common-message', function() {
                    // 공통 메시지 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.commonMessageGrid.getSelectedRowIdx();

                    that.commonMessageGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadCommonMessage({msgId: that.msgId, langCd: that.langCd});
                        }else{
                            that.commonMessageGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['commonMessagePopup'].on('add-common-message', function() {
                    // 공통 메시지 생성시, 리스트 리프래시
                    that.commonMessageGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.commonMessageGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('CommonMessageService', 'getCommonMsgList', 'CommonMessageSearchConditionOMM'),
                        key: 'CommonMessageSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'CommonMessageListOMM',
                        key: 'commonMsgList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['commonMessagePopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData('CommonMessageService', 'exportCommonMsgExcel', 'EmptyOMM');

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                            
                        ]
                    },
                    paging: true,

                    fields: ['msgId', 'langCd', 'basicMsgCtt', 'msgBizGrpId', 'msgTypeCd', 'regUserId', 'regOccurDttm'],
                    columns: [
                        {text: bxMsg('trx-setting.message-id'), flex: 1, dataIndex: 'msgId', align: 'center'},
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
                        },
                        {text: bxMsg('trx-setting.default-message'), flex: 2, dataIndex: 'basicMsgCtt', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('trx-setting.register-id'), width: 120, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('trx-setting.register-date'), width: 160, dataIndex: 'regOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-common-message-btn" data-msg-id="{0}" data-lang-cd="{1}"> ' +
                                    '<i class="bw-icon i-20 i-func-trash"></i>' +
                                    '</button>',
                                    record.get('msgId'),
                                    record.get('langCd')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadCommonMessage({msgId: record.get('msgId'), langCd: record.get('langCd')});
                        }
                    }
                });

                // Dom Element Cache
                that.$commonMessageSearch = that.$el.find('.common-message-search');
                that.$commonMessageGrid = that.$el.find('.common-message-grid');
                that.$commonMessageDetail = that.$el.find('.common-message-detail');
                that.$commonMessageDetailTitle = that.$el.find('h3 > .common-message-detail-title');
            },

            render: function() {
                var that = this;

                that.$commonMessageGrid.html(that.commonMessageGrid.render(function(){that.loadCommonMessageList();}));
                that.$commonMessageDetail.append(that.subViews['detailLoadingBar'].render());
                that.$commonMessageSearch.find('select[data-form-param="langCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0003'], true, bxMsg('common.all')));
                that.$commonMessageSearch.find('select[data-form-param="langCd"]').val(commonConfig.locale);
                
                return that.$el;
            },

            resetSearch: function() {
                this.$commonMessageSearch.find('[data-form-param]').val('');
            },

            loadCommonMessageList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$commonMessageSearch);
            	
                this.commonMessageGrid.loadData(params, function(data) {
                	data = data['commonMsgList'];
                	if(data && data.length) {
                		that.$commonMessageGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteCommonMessage: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'CommonMessageService', 'removeCommonMsg', 'CommonMessageOMM',
                            {
                                msgId: $target.attr('data-msg-id'),
                                langCd: $target.attr('data-lang-cd')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.commonMessageGrid.reloadData();

                                    // 상세 초기화
                                    that.$commonMessageDetailTitle.text('');
                                    that.$commonMessageDetail.find('[data-form-param]').val('');
                                }else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditCommonMessagePopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$commonMessageDetail);

                if(!renderData.msgId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['commonMessagePopup'].render(renderData);
            },

            /**
             * msgId
             * langCd
             * */
            loadCommonMessage: function(param) {
                var that = this,
                    requestParam;

                that.msgId = param.msgId;
                that.langCd = param.langCd;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'CommonMessageService', 'getCommonMsgInfo', 'CommonMessageOMM',
                    {
                        msgId: param.msgId,
                        langCd: param.langCd
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var commonMessageOMM = response.CommonMessageOMM;

                        that.$commonMessageDetailTitle.text(commonMessageOMM.msgId);
                        commonUtil.makeFormFromParam(that.$commonMessageDetail, commonMessageOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return CommonMessageView;
    }
);