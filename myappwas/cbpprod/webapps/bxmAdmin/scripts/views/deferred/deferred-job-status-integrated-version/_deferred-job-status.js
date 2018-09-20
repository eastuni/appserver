define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-job-status-integrated-version/_deferred-job-status-tpl.html'
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
                'change .bxm-search-wrap input[data-form-param="bizDt"]': 'loadList',
                'click .deferred-search-btn': 'showDeferredSearchPopup',
                'click .play-btn': 'restartDeferred',
                
                'click .control-run-all': 'controlRunAllDeferred',
                'click .control-stop-all': 'controlStopAllDeferred',
                'click .control-run': 'controlRunDeferred',
                'click .control-stop': 'controlStopDeferred'
            },

//            currentDeferredId: null,
            controlParam : {
            	deferredId : null,
            	nodeNo : null,
            	bizDt : null
            },
            
            currentJobListParams: null,
            
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


                // Set Grid - 후행 작업 진행 상황
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'getDfrdWorkProgressSituationListUsingPaging', 'DfrdWorkProgrssSituation01In'),
                        key: 'DfrdWorkProgrssSituation01In'
                    },
                    responseParam: {
                        objKey: 'DfrdWorkProgrssSituation01Out',
                        key: 'dfrdWorkProgress'
                    },
                    header: {
                        pageCount: true,
                        button: [
							{
                                html: '<button type="button" class="bw-btn control-run-all" title="' + bxMsg('deferred.run-all') + '">\
                                    <i class="svg-icon i-25 i-start-all-2"></i>\
                                    </button>'
							},
							{
                                html: '<button type="button" class="bw-btn control-stop-all" title="' + bxMsg('deferred.stop-all') + '">\
                                    <i class="svg-icon i-25 i-stop-all-4"></i>\
                                    </button>'
							}
                        ]
                    },
                    paging: true,
                    pageCountDefaultVal: 5,

                    fields: ['deferredId', 'bizDt', 'startSeq', 'endSeq', 'lastSeq', 'errInCompleteCount', 'dfrdWorkStatus', 'endYn', 'nodeNo', 'inCompleteNumberingCount', 'errCompleteCount'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
//                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
//                        {text: bxMsg('deferred.deferredName'), flex: 3, dataIndex: 'deferredNm',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.startSeqNo'), flex: 1.5, dataIndex: 'startSeq',  align: 'center'},
                        {text: bxMsg('deferred.endSeqNo'), flex: 1.5, dataIndex: 'endSeq',  align: 'center'},
                        {text: bxMsg('deferred.lastSeqNo'), flex: 1.5, dataIndex: 'lastSeq',  align: 'center'},
                        {text: bxMsg('deferred.inCompleteNumberingCount'), flex: 1.5, dataIndex: 'inCompleteNumberingCount',  align: 'center',
                        	renderer: function(value) {
                        		return value ? commonUtil.convertNumberFormat(value) : value;
                        	}
                        },
                        {
                            text: bxMsg('deferred.unprocessedErrorCount'), flex: 1.5, dataIndex: 'errInCompleteCount',  align: 'center',
                            renderer: function (value) {
                                if (value !== 0) {
                                    return '<button type="button" class="bw-btn bw-btn-txt chr-c-magenta">' + commonUtil.convertNumberFormat(value) + '</button>';
                                } else {
                                    return value;
                                }
                            },
                            listeners: {
                                click: function(e, t, index) {
                                    var record = that.grid.getDataAt(index);

                                    if (record['errInCompleteCount'] !== 0) {
                                        commonUtil.redirectRoutePage('MENU00304', {errCount : '1-2-4', bizDt: commonUtil.changeStringToDateString(record.bizDt)});
                                    }
                                }
                            }
                        },
                        {text: bxMsg('deferred.errCompleteCount'), flex: 1.5, dataIndex: 'errCompleteCount',  align: 'center',
                        	renderer: function(value) {
                        		return value ? commonUtil.convertNumberFormat(value) : value;
                        	}	
                        },
                        {text: bxMsg('deferred.completedYn'), width: 60, dataIndex: 'endYn',  align: 'center'}
                        /*{
                            text:bxMsg('deferred.completedYn'),
                            dataIndex: 'endYn',
                            sortable: false,
                            align: 'center',
                            width: 60,
                            editor: {
                                xtype: 'combobox',
                                updateEl: true,
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray({
                                        Y: 'Y',
                                        N: 'N'
                                    }, null)
                                }),
                                displayField: 'value',
                                valueField: 'key',
                                listeners: {
                                    change: function(field) {
                                        var selected = that.grid.grid.getSelectionModel().selected.items[0].data;
                                        commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'updateEndYn', 'DfrdWork01IO', {
                                            deferredId: selected['deferredId'],
                                            bizDt: selected['bizDt'],
                                            nodeNo: selected['nodeNo'],
                                            endYn: field.value
                                        }), {
                                            success: function(response) {
                                                var code = response.ResponseCode.code;

                                                if(code === 200){
                                                    swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                                    (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
                                                    that.loadList();
                                                } else if(code === 201){
                                                    swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                                } else if(code === 202){
                                                    swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                                }
                                            }
                                        });
                                    }
                                }
                            },
                            renderer: function (value) {
                                return '<span style="cursor: pointer;">' + value + '<i class="bw-icon i-20 i-func-edit"></i></span>';
                            }
                        }*/
                    ],
                    
                    listeners: {
                    	select: function(_this, record) {
                    		that.loadJobList({
                    			deferredId: record.get('deferredId'),
                    			bizDt: record.get('bizDt')
                    		});
                    	}
                    },
                    
                    gridConfig: {
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });
                
             // Set Grid - 후행 작업 상세
                that.jobGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdStatusMngtService', 'getDfrdStatusListUsingPaging', 'DfrdStatus01IO'),
                        key: 'DfrdStatus01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdStatusList01IO',
                        key: 'dfrdStatus'
                    },
                    header: {
                        pageCount: true,
                        button: [
                                 {
                                     html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                     event: function () {
                                         that.loadJobList(that.currentJobListParams);
                                     }
                                 }
                             ]
                    },
                    paging: true,
                    pageCountDefaultVal: 5,

                    fields: ['deferredId', 'deferredNm', 'bizDt', 'nodeNo', 'deferredMainStatusCd', 'modifyDttm', 'errCnt', 'completeCnt', 'inCompleteCnt'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 1.7, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 1.3, dataIndex: 'deferredNm',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 1.3, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {
                            text: bxMsg('deferred.deferredMainStatus'), flex: 1.3, dataIndex: 'deferredMainStatusCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMDF0004'][value];
                            }
                        },
                        {text : bxMsg('deferred.cumulativeProcessCount'), flex: 1, dataIndex: 'completeCnt', align: 'center',
                        	renderer: function(value) {
                        		return value ? commonUtil.convertNumberFormat(value) : value;
                        	}
                        },
                        {text : bxMsg('deferred.cumulativeUnprocessCount'), flex: 1.3, dataIndex: 'inCompleteCnt', align: 'center',
                        	renderer: function(value) {
                        		return value ? commonUtil.convertNumberFormat(value) : value;
                        	}
                        },
                        {text : bxMsg('deferred.currentUnprocessCount'), flex: 1.5, dataIndex: 'errCnt', align: 'center',
                        	renderer: function(value) {
                        		return value ? commonUtil.convertNumberFormat(value) : value;
                        	}
                        },
                        {
                            text: bxMsg('deferred.modifiedDatetime'), flex: 1.5, dataIndex: 'modifyDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text:bxMsg('deferred.control'),
                            renderer: function (value, p, record){
                            	
                            	if(record.get('deferredMainStatusCd') === '7' ) { //후행 컨테이너 다운
                            		return '';
                            	} else {
                            		return Ext.String.format(
                            				'<button type="button" class="bw-btn add-mg-r-half control-run"><i class="fa fa-play chr-c-green"></i></button>' 
                            				+'<button type="button" class="bw-btn control-stop"><i class="fa fa-stop chr-c-orange"></i></button>'
//                            				record.get('deferredId'),
//                            				record.get('nodeNo'),
//                            				record.get('bizDt'),
//                            				record.get('deferredMainStatusCd')
                            		);
                            	}
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    
                    listeners: {
                    	select: function(_this, record) {
                    		that.loadExecList({
                    			deferredId: record.get('deferredId'),
                    			nodeNo: record.get('nodeNo'),
                    			bizDt: record.get('bizDt')
                    		});
                    		that.controlParam.deferredId = record.get('deferredId');
                    		that.controlParam.nodeNo = record.get('nodeNo');
                    		that.controlParam.bizDt = record.get('bizDt');
                    	}
                    }
                });

                // Set Grid-후행 실행 현황
                that.execGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdExecSituationService', 'getDfrdExecListUsingPaging', 'DfrdExec01IO'),
                        key: 'DfrdExec01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdExecList01IO',
                        key: 'dfrdExec'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,
                    pageCountDefaultVal: 5,

                    fields: ['deferredId', 'deferredNm', 'bizDt', 'nodeNo', 'startSeq', 'endSeq', 'parllProcSeq', 'deferredStatusCd', 'currSeq', 'errSeq', 'startDttm', 'errCd'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 1.5, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 1.5, dataIndex: 'deferredNm',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 1.5, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {
                            text: bxMsg('deferred.deferredExecutionStatus'), flex: 1.5, dataIndex: 'deferredStatusCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMDF0008'][value];
                            }
                        },
                        {text: bxMsg('deferred.startSeqNo'), flex: 1.1, dataIndex: 'startSeq',  align: 'center'},
                        {text: bxMsg('deferred.endSeqNo'), flex: 1.1, dataIndex: 'endSeq',  align: 'center'},
                        {text: bxMsg('deferred.currentSeqNo'), flex: 1.1, dataIndex: 'currSeq',  align: 'center'},
                        {text: bxMsg('deferred.errorSeqNo'), flex: 1.1, dataIndex: 'errSeq',  align: 'center'},
                        {
                            text: bxMsg('deferred.startDatetime'), flex: 2, dataIndex: 'startDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.errorCode'), flex: 1, dataIndex: 'errCd',  align: 'center',
                            renderer: function (value) {
                                if (value === 'ERROR') {
                                    return '<button class="bw-btn bw-btn-txt chr-c-magenta">' + value + '</button>';
                                } else {
                                    return value;
                                }
                            },
                            listeners: {
                                click: function(e, t, index) {
                                    var record = that.execGrid.getDataAt(index);

                                    if (record['errCd'] === 'ERROR') {
                                        commonUtil.redirectRoutePage('MENU00304', {
                                            deferredId: record['deferredId'],
                                            nodeNo: record['nodeNo'],
                                            bizDt: record['bizDt'],
                                            errSeq: record['errSeq']
                                        });
                                    }
                                }
                            }
                        }
                    ]
                });
                
                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap-progress');
                that.$jobGridWrap = that.$el.find('.bxm-grid-wrap-job');
                that.$jobGridTitle = that.$el.find('.bxm-detail-title-job');
                that.$execGridWrap = that.$el.find('.bxm-grid-wrap-execution');
                that.$execGridTitle = that.$el.find('.bxm-detail-title-execution');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="bizDt"]'), 'yy-mm-dd');
                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));
                
                that.$jobGridWrap.html(that.jobGrid.render());
                that.$execGridWrap.html(that.execGrid.render());
                
                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', commonConfig.bizDate);
            },

            loadList: function() {
                var that = this,
                	params = commonUtil.makeParamFromForm(this.$searchWrap);
                that.currentListParams = params;

                that.grid.loadData({
                    dfrdWorkIO: {
                        deferredId: params.deferredId,
                        bizDt: params.bizDt.replace(/-/g, '')
                    },
                    pageNum: params.pageNum,
                    pageCount: params.pageCount
                }, function(data) {
                	data = data['dfrdWorkProgress'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            loadJobList: function(params) {
            	var that = this;
            	
            	this.currentJobListParams = params;
            	
            	that.$jobGridTitle.text(params.deferredId);
            	that.jobGrid.loadData(params, function(data) {
                	data = data['dfrdStatus'];
                	if(data && data.length) {
                		that.$jobGridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },
            
            loadExecList: function(params) {
            	params.nodeNo && this.$execGridTitle.text(params.deferredId + ' / node number : ' + params.nodeNo);
            	this.execGrid.loadData(params, null, true);
            },
            
            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            },
            
            restartDeferred: function (event) {
                var that = this,
                    $target = $(event.currentTarget),
                    requestParam;

                requestParam = commonUtil.getBxmReqData(
                    'DfrdStatusMngtService', 'restartDfrdWork', 'DfrdStatus01IO',
                    {
                        deferredId: $target.attr('data-id'),
                        nodeNo: $target.attr('data-node'),
                        bizDt: $target.attr('data-biz-dt'),
                        deferredMainStatusCd: $target.attr('data-status-cd')
                    }
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            //그리드 reload
                            that.jobGrid.reloadData();
                            that.execGrid.reloadData();

                        } else if(code === 201) {
                            swal({type: 'error', title: '', text: bxMsg('deferred.deferredRestartFail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            },
            
            controlRunAllDeferred: function () {
            	var that = this,
            		requestParam;
            	
            	if($.isEmptyObject(that.grid.getDataAt(0))) {
            		swal({type: 'error', title: '', text: bxMsg('deferred.exec-error-no-data'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}

            	requestParam = commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'executeAllDfrdWork', 'DfrdStatus01IO');

                swal({
                    title: '', text: bxMsg('deferred.run-all') + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                }, function() {
                	commonUtil.requestBxmAjax(requestParam, {
                        success: function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 200){
                                swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                //그리드 reload
                                that.grid.reloadData();
                                that.jobGrid.reloadData();
                                that.execGrid.reloadData();

                            } else if(code === 201) {
                                swal({type: 'error', title: '', text: bxMsg('deferred.run-all-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }
                        }
                    });
                });
            },
            
            controlStopAllDeferred: function () {
            	var that = this,
        		requestParam;
            	
            	if($.isEmptyObject(that.grid.getDataAt(0))) {
            		swal({type: 'error', title: '', text: bxMsg('deferred.exec-error-no-data'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}
            	
        	 requestParam = commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'stopAllDfrdWork', 'DfrdStatus01IO');

        	 swal({
                 title: '', text: bxMsg('deferred.stop-all') + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
             }, function() {
            	 commonUtil.requestBxmAjax(requestParam, {
                     success: function(response) {
                         var code = response.ResponseCode.code;

                         if(code === 200){
                             swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                             //그리드 reload
                             that.grid.reloadData();
                             that.jobGrid.reloadData();
                             that.execGrid.reloadData();

                         } else if(code === 201) {
                             swal({type: 'error', title: '', text: bxMsg('deferred.stop-all-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                         }
                     }
                 });
             });
            },
            
            controlRunDeferred: function () {
            	var that = this,
            		requestParam;
            	
            	if($.isEmptyObject(that.jobGrid.getDataAt(0))) {
            		swal({type: 'error', title: '', text: bxMsg('deferred.exec-error-no-data'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}
            	
            	requestParam = commonUtil.getBxmReqData(
            			'DfrdWorkProgressSituationService', 'startOneDfrdWork', 'DfrdStatus01IO',
            			that.controlParam
            		);

            	swal({
                    title: '', text: bxMsg('deferred.run') + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                }, function() {
                	commonUtil.requestBxmAjax(requestParam, {
                        success: function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 200){
                                swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                //그리드 reload
                                that.grid.reloadData();
                                that.jobGrid.reloadData();
                                that.execGrid.reloadData();

                            } else if(code === 201) {
                                swal({type: 'error', title: '', text: bxMsg('deferred.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }
                        }
                    });
                });
            },
            
            controlStopDeferred: function() {
            	var that = this,
        		requestParam;
        	
            	if($.isEmptyObject(that.jobGrid.getDataAt(0))) {
            		swal({type: 'error', title: '', text: bxMsg('deferred.exec-error-no-data'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}
            	
        	requestParam = commonUtil.getBxmReqData(
        			'DfrdWorkProgressSituationService', 'pauseOneDfrdWork', 'DfrdStatus01IO',
        			that.controlParam
        		);

        	swal({
                title: '', text: bxMsg('deferred.stop') + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
            }, function() {
            	commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            //그리드 reload
                            that.grid.reloadData();
                            that.jobGrid.reloadData();
                            that.execGrid.reloadData();

                        } else if(code === 201) {
                            swal({type: 'error', title: '', text: bxMsg('deferred.stop-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            });
        }
        });
    }
);