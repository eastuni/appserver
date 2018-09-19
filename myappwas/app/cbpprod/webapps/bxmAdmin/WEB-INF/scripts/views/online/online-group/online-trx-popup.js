define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/online/online-group/online-trx-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        commonConfig,
        Popup,
        tpl
    ) {

        var JobPopup = Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadTrxList',
                'enter-component .trx-search input': 'loadTrxList',

                'click .trx-cd-check': 'changeCheck',

                'click .save-trx-btn': 'saveTrx',
                'click .cancel-btn': 'close'
            },

            trxGrpId: null,
            trxAddList: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());
                that.setDraggable();

                // Set Grid
                that.trxGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineGroupService', 'getAddTrxList', 'TrxGroupInOMM'),
                        key: 'TrxGroupInOMM'
                    },
                    responseParam: {
                        objKey: 'TrxGroupRelListOMM',
                        key: 'trxList'
                    },
                    header: {
                        pageCount: true,
                        pageCountList: [5, 10, 15]
                    },
                    paging: true,

                    fields: ['trxCd', 'trxNm', 'bxmAppId', 'svcNm', 'opNm'],
                    columns: [
                        {
                            width: 40,
                            align: 'center',
                            renderer: function(value, p, record) {
                                var trxCd = record.get('trxCd'),
                                	bxmAppId = record.get('bxmAppId'),
                                	svcNm = record.get('svcNm'),
                                	opNm = record.get('opNm'),
                                    tpl;

                                if(that.trxAddList.indexOf(trxCd) !== -1) {
                                    tpl = '<input type="checkbox" class="bw-input ipt-radio trx-cd-check" data-trx-cd="{0}" data-app-id="{1}" data-svc-nm="{2}" data-op-nm="{3}" checked>';
                                }else{
                                    tpl = '<input type="checkbox" class="bw-input ipt-radio trx-cd-check" data-trx-cd="{0}" data-app-id="{1}" data-svc-nm="{2}" data-op-nm="{3}">';
                                }

                                return Ext.String.format(
                                    tpl,
                                    trxCd,
                                    bxmAppId,
                                    svcNm,
                                    opNm
                                );
                            }
                        },
                        {text: bxMsg('online.transaction-code'), flex: 1, dataIndex: 'trxCd', style: 'text-align:center'},
                        {text: bxMsg('online.transaction-name'), flex: 1, dataIndex: 'trxNm', style: 'text-align:center'}
                    ]
                });

                // Dom Element Cache
                that.$trxSearch = that.$el.find('.trx-search');
                that.$trxGrid = that.$el.find('.trx-grid');

                that.$trxGrid.html(that.trxGrid.render());
            },

            
            render: function(renderParam) {
                $.extend(this, renderParam);

                this.trxAddList = [];

                this.show();
                this.resetSearch();
                this.loadTrxList(renderParam);
                this.trxGrpId = renderParam.trxGrpId;
            },

            resetSearch: function() {
                this.$trxSearch.find('[data-form-param]').val('');
            },

            loadTrxList: function(renderParam) {
            	var that= this,
            		param;
            	
            	param = commonUtil.makeParamFromForm(that.$trxSearch);
            	
            	$.extend(param, {
            		trxGrpId : renderParam.trxGrpId
            	});
            	
                that.trxGrid.loadData(param, null, true);
            },

            changeCheck: function(e) {
                var $target = $(e.currentTarget);

                if($target.is(':checked')){
                    this.trxAddList.push({
                    	trxCd :$target.attr('data-trx-cd'),
                    	bxmAppId:$target.attr('data-app-id'),
                    	svcNm: $target.attr('data-svc-nm'),
                    	opNm: $target.attr('data-op-nm')
                    });
                }else{
                    this.trxAddList.splice(this.trxAddList.indexOf({
                    	trxCd :$target.attr('data-trx-cd'),
                    	bxmAppId:$target.attr('data-app-id'),
                    	svcNm: $target.attr('data-svc-nm'),
                    	opNm: $target.attr('data-op-nm')
                    	}),1);
                }
            },

            saveTrx: function() {
                var that = this,
                    requestParam,
                    requestParamList = [];

                if(that.trxAddList.length === 0){
                    swal({type: 'warning', title: '', text: bxMsg('online.online-trx-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                that.trxAddList.forEach(function(value) {
                    requestParamList.push({
                        trxCd: value.trxCd,
                        trxGrpId: that.trxGrpId,
                        bxmAppId: value.bxmAppId,
                        svcNm: value.svcNm,
                        opNm: value.opNm
                    });
                });

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'OnlineGroupService', 'addTrxToGroup', 'TrxGroupRelListOMM',
                    {
                    	trxList: requestParamList
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('add-trx');
                            that.close();
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }

        });

        return JobPopup;
    }
);