define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/trx-setting/omm-validate-rule/omm-validate-rule-popup',
        'text!views/trx-setting/omm-validate-rule/_omm-validate-rule-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        OmmValidateRulePopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            ruleId: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'change .bx-search-wrap select': 'loadList',
                'enter-component .bx-search-wrap input': 'loadList',

                'click .del-btn': 'deleteItem',
                'click .edit-btn': 'showEditItemPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['ommValidateRulePopup'] = new OmmValidateRulePopup();
                that.subViews['ommValidateRulePopup'].on('edit-item', function() {
                    // 공통 메시지 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.grid.getSelectedRowIdx();

                    that.grid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadDetails({validRuleId: that.validRuleId});
                        }else{
                            that.grid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['ommValidateRulePopup'].on('add-item', function() {
                    // 공통 메시지 생성시, 리스트 리프래시
                    that.grid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ValidationRuleService', 'getValidRuleList', 'ValidationRuleSearchConditionOMM'),
                        key: 'ValidationRuleSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'ValidationRuleListOMM',
                        key: 'validationRuleList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['ommValidateRulePopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['validRuleId', 'validRuleNm', 'type', 'errMsgId', 'regUserId', 'regOccurDttm'],
                    columns: [
                        {text: bxMsg('trx-setting.rule-id'), flex: 2, dataIndex: 'validRuleId', align: 'center'},
                        {text: bxMsg('trx-setting.rule-nm'), flex: 2, dataIndex: 'validRuleNm', align: 'center'},
                        {text: bxMsg('trx-setting.rule-applied-type'), flex: 3, dataIndex: 'type', align: 'center'},
                        {text: bxMsg('trx-setting.error-msg-id'), flex: 2, dataIndex: 'errMsgId', align: 'center'},
                        {text: bxMsg('trx-setting.registerer-id'), width: 120, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('trx-setting.register-datetime'), width: 160, dataIndex: 'regOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-btn" data-id="{0}"> ' +
                                    '<i class="bw-icon i-20 i-func-trash"></i>' +
                                    '</button>',
                                    record.get('validRuleId')
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
                            that.loadDetails({validRuleId: record.get('validRuleId')});
                        }
                    }
                });

                // Dom Element Cache
                that.$bxSearchWrap = that.$el.find('.bx-search-wrap');
                that.$bxGridWrap = that.$el.find('.bx-grid-wrap');
                that.$bxDetailsWrap = that.$el.find('.bx-details-wrap');
                that.$bxDetailsTitle = that.$el.find('.bx-details-title');
            },

            render: function() {
                var that = this;

                that.$bxGridWrap.html(that.grid.render(function(){that.loadList();}));
                that.$bxDetailsWrap.append(that.subViews['detailLoadingBar'].render());

                that.$bxSearchWrap.find('select[data-form-param="type"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0030'], true));

                return that.$el;
            },

            resetSearch: function() {
                this.$bxSearchWrap.find('[data-form-param]').val('');
            },

            loadList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$bxSearchWrap);
            	
                this.grid.loadData(params, function(data) {
                	data = data['validationRuleList'];
                	if(data && data.length) {
                		that.$bxGridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteItem: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ValidationRuleService', 'removeValidRule', 'ValidationRuleOMM',
                            {
                                validRuleId: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.grid.reloadData();

                                    // 상세 초기화
                                    that.$bxDetailsTitle.text('');
                                    that.$bxDetailsWrap.find('[data-form-param]').val('');
                                }else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.delete-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditItemPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$bxDetailsWrap);

                if(!renderData.validRuleId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['ommValidateRulePopup'].render(renderData);
            },

            /**
             * validRuleId
             * */
            loadDetails: function(param) {
                var that = this,
                    requestParam;

                that.validRuleId = param.validRuleId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ValidationRuleService', 'getValidRuleInfo', 'ValidationRuleOMM',
                    {
                        validRuleId: param.validRuleId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.ValidationRuleOMM;

                        that.$bxDetailsTitle.text(data.validRuleId);
                        commonUtil.makeFormFromParam(that.$bxDetailsWrap, data);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });
    }
);