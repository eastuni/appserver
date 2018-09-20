define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/online/online-log-search/popup/trx-code-select-popup',
        'common/popup/msg-search/msg-search',
        'views/error-setting/error-event-setting/error-event-setting-popup',
        'text!views/error-setting/error-event-setting/_error-event-setting-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        TrxCodeSelectPopup,
        MsgSelectPopup,
        ErrorEventPopup,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadErrorEventList',
                'enter-component .error-event-search input': 'loadErrorEventList',
                'change .error-event-search select': 'loadErrorEventList',

                'click .del-error-event-btn': 'deleteErrorEvent',
                'click .edit-error-event-btn': 'showEditErrorEventPopup',

                'change .error-event-search [data-form-param="trxTargetCd"]': 'changeTrxCdInput',
                'change .error-event-search [data-form-param="errTargetCd"]': 'changeErrorCdInput',

                'click .trx-code-search-btn': 'showTrxCodeSearchPopup',
                'click .err-code-search-btn': 'showErrCodeSearchPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();
                that.subViews['errorEventPopup'] = new ErrorEventPopup();
                that.subViews['errorEventPopup'].on('edit-error-event', function() {
                    // 수정시, 리스트, 상세 리프래시
                    that.errorEventGrid.reloadData(function() {
                        that.loadErrorEventDetail({cndtUid: that.cndtUid});
                    });
                });
                that.subViews['errorEventPopup'].on('add-error-event', function() {
                    // 생성시, 리스트 리프래시
                    that.errorEventGrid.reloadData();
                });
                that.subViews['trxCodeSelectPopup'] = new TrxCodeSelectPopup();
                that.subViews['trxCodeSelectPopup'].on('select-trx-code', function(trxCode) {
                    that.$errorEventSearch.find('[data-form-param="trxCd"]').val(trxCode);
                });
                that.subViews['errMsgSelectPopup'] = new MsgSelectPopup();
                that.subViews['errMsgSelectPopup'].on('select-msg-id', function(msgId) {
                    that.$errorEventSearch.find('[data-form-param="errCd"]').val(msgId);
                });

                // Set Grid
                that.errorEventGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ErrEventCndtCntrlService', 'getListErrEventCndt', 'ErrEventCndtOMM'),
                        key: 'ErrEventCndtOMM'
                    },
                    responseParam: {
                        objKey: 'ErrEventCndtListOMM',
                        key: 'errEventCndtOmmList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['errorEventPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['cndtUid', 'cndtNm', 'trxTargetCd', 'errTargetCd', 'stdPerdCd', 'stdCnt', 'ctrlCd', 'useYn', 'trxCd', 'errCd', 'sqlErrCd'],
                    columns: [
                        {text: bxMsg('error-setting.condition-name'), flex: 1, dataIndex: 'cndtNm', align: 'center'},
                        {
                            text: bxMsg('error-setting.trading-target'), flex: 1, dataIndex: 'trxTargetCd', align: 'center',
                            renderer: function(value, p, record){
                                var returnStr = commonConfig['comCdList']['BXMDF0011'][value];

                                if(value === 'T'){
                                    returnStr = record.get('trxCd');
                                }

                                return returnStr;
                            }
                        },
                        {
                            text: bxMsg('error-setting.error-target'), flex: 1, dataIndex: 'errTargetCd', align: 'center',
                            renderer: function(value, p, record){
                                var returnStr = commonConfig['comCdList']['BXMDF0012'][value];

                                if(value === 'E'){
                                    returnStr = record.get('errCd');
                                }else if(value === 'S'){
                                    returnStr = record.get('sqlErrCd');
                                }

                                return returnStr;
                            }
                        },
                        {
                            text: bxMsg('error-setting.standard-period'), width: 160, dataIndex: 'stdPerdCd', align: 'center',
                            renderer: function(value){
                                return commonConfig['comCdList']['BXMDF0013'][value];
                            }
                        },
                        {text: bxMsg('error-setting.standard-count'), width: 160, dataIndex: 'stdCnt', align: 'center'},
                        {
                            text: bxMsg('error-setting.control-system'), width: 160, dataIndex: 'ctrlCd', align: 'center',
                            renderer: function(value){
                                return commonConfig['comCdList']['BXMDF0014'][value];
                            }
                        },
                        {text: bxMsg('error-setting.use-yn'), width: 120, dataIndex: 'useYn', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-error-event-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('cndtUid')
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
                            var cndtUid = record.get('cndtUid');

                            that.cndtUid = cndtUid;
                            that.loadErrorEventDetail({cndtUid: cndtUid});
                        }
                    }
                });

                // DOM Element Cache
                that.$errorEventSearch = that.$el.find('.error-event-search');
                that.$errorEventGrid = that.$el.find('.error-event-grid');
                that.$errorEventDetail = that.$el.find('.error-event-detail');
                that.$errorEvetnDetailTitle = that.$el.find('h3 > .error-event-detail-title');
            },

            render: function() {
                var that = this;

                that.$errorEventGrid.html(that.errorEventGrid.render(function(){that.loadErrorEventList();}));
                that.$errorEventDetail.append(that.subViews['detailLoadingBar'].render());

                that.$errorEventSearch.find('[data-form-param="trxTargetCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0011'], true)).trigger('change');
                that.$errorEventSearch.find('[data-form-param="errTargetCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0012'], true)).trigger('change');
                that.$errorEventSearch.find('[data-form-param="stdPerdCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0013'], true)).trigger('change');
                that.$errorEventSearch.find('[data-form-param="ctrlCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0014'], true)).trigger('change');

                return that.$el;
            },

            resetSearch: function() {
                this.$errorEventSearch.find('[data-form-param]').val('');
            },

            loadErrorEventList: function() {
                this.errorEventGrid.loadData(commonUtil.makeParamFromForm(this.$errorEventSearch), null, true);
            },

            deleteErrorEvent: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function() {
                        //요청객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ErrEventCndtCntrlService', 'deleteErrEventCndt', 'SearchBaseOMM',
                            {
                                cndtUid: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    //그리드 reload
                                    that.errorEventGrid.reloadData();

                                    //상세 초기화
                                    that.$errorEvetnDetailTitle.text('');
                                    that.$errorEventDetail.find('[data-form-param]').val('');
                                } else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    });
            },

            showEditErrorEventPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$errorEventDetail);

                if(!renderData.cndtUid) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['errorEventPopup'].render(renderData);
            },

            loadErrorEventDetail: function(param) {
                var that = this,
                    requestParam;

                //요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ErrEventCndtCntrlService', 'getErrEventCndt', 'SearchBaseOMM',
                    param
                );

                //Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function(){
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var errEventCndtOMM = response.ErrEventCndtOMM;

                        that.$errorEvetnDetailTitle.text(errEventCndtOMM.cndtNm);
                        commonUtil.makeFormFromParam(that.$errorEventDetail, errEventCndtOMM);

                        if(errEventCndtOMM.trxTargetCd === 'T'){
                            that.$errorEventDetail.find('.trx-cd-wrap').show();
                        }else{
                            that.$errorEventDetail.find('.trx-cd-wrap').hide();
                            that.$errorEventDetail.find('.trx-cd-wrap input').val('');
                        }

                        if(errEventCndtOMM.errTargetCd === 'E'){
                            that.$errorEventDetail.find('.err-cd-wrap').show();
                            that.$errorEventDetail.find('.sql-err-cd-wrap').hide();
                            that.$errorEventDetail.find('.sql-err-cd-wrap input').val('');
                        }else if(errEventCndtOMM.errTargetCd === 'S'){
                            that.$errorEventDetail.find('.err-cd-wrap').hide();
                            that.$errorEventDetail.find('.sql-err-cd-wrap').show();
                            that.$errorEventDetail.find('.err-cd-wrap input').val('');
                        }else{
                            that.$errorEventDetail.find('.err-cd-wrap').hide();
                            that.$errorEventDetail.find('.sql-err-cd-wrap').hide();
                            that.$errorEventDetail.find('.err-cd-wrap input').val('');
                            that.$errorEventDetail.find('.sql-err-cd-wrap input').val('');
                        }
                    },
                    complete: function(){
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            changeTrxCdInput: function(e){
                var $target = $(e.currentTarget);

                if($target.val() === 'T'){
                    this.$errorEventSearch.find('.trx-cd-wrap').show();
                }else{
                    this.$errorEventSearch.find('.trx-cd-wrap').hide();
                    this.$errorEventSearch.find('.trx-cd-wrap input').val('');
                }
            },

            changeErrorCdInput: function(e) {
                var $target = $(e.currentTarget);

                if($target.val() === 'E'){
                    this.$errorEventSearch.find('.err-cd-wrap').show();
                    this.$errorEventSearch.find('.sql-err-cd-wrap').hide();
                    this.$errorEventSearch.find('.sql-err-cd-wrap input').val('');
                }else if($target.val() === 'S'){
                    this.$errorEventSearch.find('.err-cd-wrap').hide();
                    this.$errorEventSearch.find('.sql-err-cd-wrap').show();
                    this.$errorEventSearch.find('.err-cd-wrap input').val('');
                }else{
                    this.$errorEventSearch.find('.err-cd-wrap').hide();
                    this.$errorEventSearch.find('.sql-err-cd-wrap').hide();
                    this.$errorEventSearch.find('.err-cd-wrap input').val('');
                    this.$errorEventSearch.find('.sql-err-cd-wrap input').val('');
                }
            },

            showTrxCodeSearchPopup: function() {
                this.subViews['trxCodeSelectPopup'].render();
            },

            showErrCodeSearchPopup: function() {
                this.subViews['errMsgSelectPopup'].render();
            }

        });
    }
);
