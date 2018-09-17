define(
    [
     	'common/config',
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/online/online-group/online-group-popup',
        'views/online/online-group/online-trx-popup',
        'text!views/online/online-group/_online-group-tpl.html'
    ],
    function(
    	commonConfig,
        commonUtil,
        ExtGrid,
        LoadingBar,
        TrxGroupPopup,
        TrxAddPopup,
        tpl
    ) {

        var JobGroupView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'resize-component .trx-group-list-wrap': 'resizeGrid',

                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadTrxGroupList',
                'enter-component .trx-group-search input': 'loadTrxGroupList',

                'click .del-trx-group-btn': 'deleteTrxGroup',
                'click .edit-trx-group-btn': 'showEditTrxGroupPopup',

                'click .del-trx-btn': 'deleteTrx',
                'click .execute-ctrl-trxs': 'controlTrxGroup',
                'click .control-frcd-timeout': 'controlFrcdTimeout'
                
            },

            trxGrpId: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Dom Element Cache
                that.$trxGroupSearch = that.$el.find('.trx-group-search');
                that.$trxGroupGrid = that.$el.find('.trx-group-grid');
                that.$trxGroupDetail = that.$el.find('.trx-group-detail');
                that.$trxGroupTitle = that.$el.find('h4 > .trx-group-title');
                that.$trxTitle = that.$el.find('h4 > .trx-title');
                that.$trxGrid = that.$el.find('.trx-grid');

                // Set SubViews
                that.subViews['trxGroupPopup'] = new TrxGroupPopup();
                that.subViews['trxGroupPopup'].on('edit-trx-group', function() {
                    // 작업 그룹 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.trxGroupGrid.getSelectedRowIdx();

                    that.trxGroupGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadTrxGroup({trxGrpId: that.trxGrpId});
                        }else{
                            that.trxGroupGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['trxGroupPopup'].on('add-trx-group', function() {
                    // 작업 그룹 생성시, 리스트 리프래시
                    that.trxGroupGrid.reloadData();
                });

                that.subViews['trxPopup'] = new TrxAddPopup();
                that.subViews['trxPopup'].on('add-trx', function() {
                    // 작업 추가시, 리스트, 상세 리프래시
                    that.trxGrid.loadData({trxGrpId: that.trxGrpId});
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.trxGroupGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineGroupService', 'getTrxGroupList', 'TrxGroupInOMM'),
                        key: 'TrxGroupInOMM'
                    },
                    responseParam: {
                        objKey: 'TrxGroupListOMM',
                        key: 'trxGroupList'
                    },
                    header: {
                        pageCount: true,
                        pageCountList: [5, 10, 15],
                        pageCountDefaultVal: 5,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['trxGroupPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['trxGrpId', 'trxGrpNm'],
                    columns: [
                        {text: bxMsg('online.trx-group-id'), flex: 1, dataIndex: 'trxGrpId', align: 'center'},
                        {text: bxMsg('online.trx-group-name'), flex: 1, dataIndex: 'trxGrpNm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-trx-group-btn" data-trx-group-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('trxGrpId')
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
                            var loadParam = {trxGrpId: record.get('trxGrpId')};

                            that.loadTrxGroup(loadParam);
                            that.trxGrid.loadData(loadParam);

                            that.trxGrid.setEnabled();
                            that.trxGrpId = record.get('trxGrpId');
                        }
                    }
                });

                that.trxGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineGroupService', 'getIncludedTrxList', 'TrxGroupInOMM'),
                        key: 'TrxGroupInOMM'
                    },
                    responseParam: {
                        objKey: 'TrxGroupRelListOMM',
                        key: 'trxList'
                    },
                    header: {
                        pageCount: true,
                        pageCountDefaultVal: 20,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    if(!that.trxGrpId) {
                                        swal({type: 'warning', title: '', text: bxMsg('common.add-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }

                                    that.subViews['trxPopup'].render({trxGrpId: that.trxGrpId});
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['trxCd', 'trxNm', 'bxmAppId', 'svcNm', 'opNm', 'trxGrpId', 'trxCtrlCd', 'frcdTimeoutMills'],
                    columns: [
                        {text: bxMsg('online.transaction-code'), flex: 1, dataIndex: 'trxCd', align: 'center'},
                        {text: bxMsg('online.transaction-name'), flex: 1, dataIndex: 'trxNm', align: 'center'},
                        {text: bxMsg('online.trx-control-stat'), flex: 0.7, dataIndex: 'trxCtrlCd', align: 'center',
                        	renderer: function(value) {
                        		return commonConfig.comCdList['BXMRT0005'][value];
                        	}
                        },
                        {text: bxMsg('online.forced-timeout-mills'), flex: 1, dataIndex: 'frcdTimeoutMills', align: 'center',
                        	renderer: function(value) {
                        		if(value && value !== 0) {
                        			return commonUtil.convertNumberFormat(value) + ' ms';
                        		} else {
                        			return '-';
                        		}
                        	}
                        },
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-trx-btn" data-trx-grp-id="{0}" data-app-id="{1}" data-svc-nm="{2}" data-op-nm="{3}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('trxGrpId'),
                                    record.get('bxmAppId'),
                                    record.get('svcNm'),
                                    record.get('opNm')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ]
                });
                that.trxGrid.setDisabled();
            },

            render: function() {
                var that = this,
                	$trxCtrlCd = that.$trxGroupDetail.find('[data-form-param="trxCtrlCd"]');

                that.$trxGroupGrid.html(that.trxGroupGrid.render(function(){that.loadTrxGroupList();}));
                that.$trxGrid.html(that.trxGrid.render());
                that.$trxGroupDetail.append(that.subViews['detailLoadingBar'].render());

                $trxCtrlCd.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0005']));
                $trxCtrlCd.find('option[value="8"]').remove(); //지정기간거래불가 옵션 제거
                
                return that.$el;
            },

            resizeGrid: function() {
                this.trxGroupGrid.resizeGrid();
            },

            resetSearch: function() {
                this.$trxGroupSearch.find('[data-form-param]').val('');
            },

            loadTrxGroupList: function() {
                this.trxGroupGrid.loadData(commonUtil.makeParamFromForm(this.$trxGroupSearch), null, true);
            },

            controlTrxGroup: function() {
            	var that= this,
            		trxCtrlCd,
            		trxGrpId,
            		requestParam;

            	trxCtrlCd = that.$trxGroupDetail.find('select[data-form-param="trxCtrlCd"]').val();
            	trxGrpId = that.$trxGroupDetail.find('input[data-form-param="trxGrpId"]').val();
            	
            	if(trxGrpId === '') {
            		swal({type: 'warning', title: '', text: bxMsg('online.trx-control-warn'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}
            	
                swal({
                    title: '', text: Ext.String.format(bxMsg('online.trx-control-msg'), commonConfig.comCdList['BXMRT0005'][trxCtrlCd]), showCancelButton: true, closeOnConfirm: false
                },
                function(){
                	
                    // 요청 객체 생성
                    requestParam = commonUtil.getBxmReqData(
                        'OnlineGroupService', 'controlTrxControlType', 'TrxControlOMM',
                        {
                            trxGrpId: trxGrpId,
                            trxCtrlCd: trxCtrlCd
                        }
                    );

                    // Ajax 요청
                    commonUtil.requestBxmAjax(requestParam, {
                        success: function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 200){
                                swal({type: 'success', title: '', text: bxMsg('online.trx-control-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                // 그리드 리로드
                                that.trxGrid.reloadData();

                            }else if(code === 201) {
                                swal({type: 'error', title: '', text: bxMsg('online.trx-control-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }
                        }
                    });
                }
            );
            	
            },
            
            controlFrcdTimeout: function() {
            	var that= this,
        		trxCtrlCd,
        		frcdTimeoutMills,
        		requestParam;

            	frcdTimeoutMills = that.$trxGroupDetail.find('input[data-form-param="frcdTimeoutMills"]').val();
            	trxGrpId = that.$trxGroupDetail.find('input[data-form-param="trxGrpId"]').val();
        	
	        	if(trxGrpId === '') {
	        		swal({type: 'warning', title: '', text: bxMsg('online.trx-control-warn'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
	        		return;
	        	}
        	
            swal({
                title: '', text: Ext.String.format(bxMsg('online.timeout-control-msg'), commonUtil.convertNumberFormat(frcdTimeoutMills)), showCancelButton: true, closeOnConfirm: false
            },
            function(){
            	
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'OnlineGroupService', 'controlFrcdTimeoutMills', 'TrxControlOMM',
                    {
                        trxGrpId: trxGrpId,
                        frcdTimeoutMills: frcdTimeoutMills
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('online.change-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            // 그리드 리로드
                            that.trxGrid.reloadData();

                        }else if(code === 201) {
                            swal({type: 'error', title: '', text: bxMsg('online.change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        );
        	
        },
            
            deleteTrxGroup: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'OnlineGroupService', 'removeTrxGroup', 'TrxGroupOMM',
                            {
                                trxGrpId: $target.attr('data-trx-group-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.trxGroupGrid.reloadData();

                                    // 상세 초기화
                                    that.$trxGroupTitle.text('');
                                    that.$trxTitle.text(bxMsg('online.online-group-trx-list'));
                                    that.$trxGroupDetail.find('[data-form-param]').val('');

                                    // 배치 작업 그리드 초기화
                                    that.trxGrid.resetData();
                                    that.trxGrid.setDisabled();

                                    that.trxGrpId = null;
                                }else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditTrxGroupPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$trxGroupDetail);

                if(!renderData.trxGrpId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['trxGroupPopup'].render(renderData);
            },

            /**
             * trxGrpId
             * */
            loadTrxGroup: function(param) {
                var that = this,
                    requestParam;

                that.trxGrpId = param.trxGrpId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'OnlineGroupService', 'getTrxGroupSingleInfo', 'TrxGroupOMM',
                    {
                        trxGrpId: param.trxGrpId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var trxGroupOMM = response.TrxGroupOMM,
                            trxGrpId = trxGroupOMM.trxGrpId;

                        that.$trxGroupTitle.text(' : ' + trxGrpId);
                        that.$trxTitle.text(bxMsg('online.online-trx-list-for').replace('{{trxGrpId}}', trxGrpId));

                        commonUtil.makeFormFromParam(that.$trxGroupDetail, trxGroupOMM);
//                        that.$trxGroupDetail.find('[data-form-param="frcdTimeoutMills"]').val(0);
                        $trxCtrlCd = that.$el.find('select[data-form-param="trxCtrlCd"]');
                        $trxCtrlCd.val(trxGroupOMM.trxCtrlCd);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            deleteTrx: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'OnlineGroupService', 'removeTrxFromGroup', 'TrxGroupRelOMM',
                            {
                                trxGrpId: that.trxGrpId,
                                bxmAppId: $target.attr('data-app-id'),
                                svcNm: $target.attr('data-svc-nm'),
                                opNm: $target.attr('data-op-nm')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    that.trxGrid.loadData({trxGrpId: that.trxGrpId});
                                }else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            }
            
        });

        return JobGroupView;
    }
);