define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/schedule-search/schedule-search',
        'common/popup/schedule-group-search/schedule-group-search',
        'common/popup/system-search/system-search',
        'views/scheduler/schedule-job-management/execution-parameter-add-popup',
        'text!views/scheduler/schedule-prompt-execution/_schedule-prompt-execution-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        ScheduleSearchPopup,
        ScheduleGroupSearchPopup,
        SystemSearchPopup,
        ExecutionParameterAddPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',

                'click .schedule-search-btn': 'showScheduleSearchPopup',
                'click .schedule-group-search-btn': 'showScheduleGroupSearchPopup',
                'click .system-search-btn': 'showSystemSearchPopup',

                'click .up-btn': 'upParameterItem',
                'click .down-btn': 'downParameterItem',
                'click .run-schedule-btn': 'runSchedule',
                
                'click .grid-del-btn': 'deleteItem',
                'click .edit-btn': 'showEditItemPopup'
            },

            sysId: null,
            scheduleId: null,
            detailData: null,

            initialize: function() {

                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['scheduleSearchPopup'] = new ScheduleSearchPopup();
                that.subViews['scheduleSearchPopup'].on('select-code', function (scheduleId) {
                    that.$searchWrap.find('input[data-form-param="scheduleId"]').val(scheduleId);
                });

                that.subViews['scheduleGroupSearchPopup'] = new ScheduleGroupSearchPopup();
                that.subViews['scheduleGroupSearchPopup'].on('select-code', function (scheduleGrpId) {
                    that.$searchWrap.find('input[data-form-param="scheduleGrpId"]').val(scheduleGrpId);
                });

                that.subViews['systemSearchPopup'] = new SystemSearchPopup();
                that.subViews['systemSearchPopup'].on('select-code', function (sysId) {
                    that.$searchWrap.find('input[data-form-param="sysId"]').val(sysId);
                });

                that.subViews['executionParameterAddPopup'] = new ExecutionParameterAddPopup();
                that.subViews['executionParameterAddPopup'].on('select-code', function (data) {
                    var records = [];
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            records.push({
                                paramCd: key,
                                paramVal: data[key]['fixedInputVal'],
                                modifUseYn: data[key]['modifUseYn']
                            })
                        }
                    }

                    that.detailExecParameterGrid.store.add(records);
                    that.detailExecParameterGrid.setGridHeight(that.detailExecParameterGrid.getAllData().length);
                });
                
                that.subViews['detailLoadingBar'] = new LoadingBar();


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('PromptExecutionService', 'getRemoteScheduleList', 'ScheduleInfoInOMM'),
                        key: 'ScheduleInfoInOMM'
                    },

                    responseParam: {
                        objKey: 'ScheduleInfoListOMM',
                        key: 'scheduleList'
                    },

                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['sysId', 'sysNm', 'scheduleId', 'scheduleNm', 'scheduleGrpNm', 'jobId', 'useYn', 'mainManager', 'userNm', 'scheduleTypeCd'],
                    columns: [
                        {text: bxMsg('scheduler.system'), flex: 2, dataIndex: 'sysNm', align:'center'},
                        {text: bxMsg('scheduler.schedule-id'), flex: 2, dataIndex: 'scheduleId', align:'center'},
                        {text: bxMsg('scheduler.schedule-nm'), flex: 3, dataIndex: 'scheduleNm', align:'center'},
                        {text: bxMsg('scheduler.schedule-group'), flex: 3, dataIndex: 'scheduleGrpNm', align:'center'},
                        {text: bxMsg('scheduler.schedule-type'), flex: 2, dataIndex: 'scheduleTypeCd', align:'center',
                        	renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0021'][value];
                            }
                        },
                        {text: bxMsg('scheduler.batch-job-id'), flex: 3, dataIndex: 'jobId', align:'center'},
                        {text: bxMsg('scheduler.use-yn'), flex: 1, dataIndex: 'useYn', align:'center'},
                        {text: bxMsg('scheduler.primary-manager'), flex: 3, dataIndex: 'mainManager', align:'center'}
                    ],

                    listeners: {
                        select: function(_this, record){
                            that.loadDetail({sysId: record.get('sysId'), scheduleId: record.get('scheduleId')});
                        }
                    }
                });


                that.detailExecParameterGrid = new ExtGrid({
                	
                	header: {
                         content: [
                             '<div class="btn-wrap fix-l">' +
                             '<button type="button" class="bw-btn up-btn"><i class="bw-icon i-20 i-arrow-up"></i></button>' +
                             '<button type="button" class="bw-btn down-btn"><i class="bw-icon i-20 i-arrow-down"></i></button>' +
                             '</div>'
                         ],
                         button: [
                             {
                                 html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                                 + bxMsg('common.add') + '"></i></button>',
                                 event: function() {
                                     that.subViews['executionParameterAddPopup'].render(that.detailExecParameterGrid.getAllData());
                                 }
                             }
                         ]
                     },
                     
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['paramCd', 'paramVal', 'modifUseYn'],
                    columns: [
                        {text: bxMsg('scheduler.parameter-type'), flex: 2, sortable: false, dataIndex: 'paramCd', align:'center'},
                        {
                        	text: bxMsg('scheduler.input-value'), flex: 3, sortable: false, dataIndex: 'paramVal', align:'center', 
                        	editor: {}
                        },
                        {text: bxMsg('scheduler.editable-yn'), flex: 2, sortable: false, dataIndex: 'modifUseYn', align:'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn grid-del-btn" data-sys-id="{0}" data-schedule-id="{1}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('sysId'),
                                    record.get('scheduleId')
                                );
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        cellclick: function(_this, td, cellIndex, record, tr, rowIndex) {
                            if (cellIndex === 1 && record.get('modifUseYn') !== 'Y') {
                                return false;
                            }

                            if (cellIndex === 3) {
                                that.detailExecParameterGrid.store.removeAt(rowIndex);
                                that.detailExecParameterGrid.setGridHeight(that.detailExecParameterGrid.getAllData().length);
                            }
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

                // DOM Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
                that.$detailExecParameterGrid = that.$detailWrap.find('div > .execution-parameter-grid');
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function(){that.loadList();}));
                that.$detailExecParameterGrid.html(that.detailExecParameterGrid.render());
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('input[data-form-param]').val('');
            },

            loadList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$searchWrap);
            	
                this.grid.loadData(params, function(data) {
                	data = data['scheduleList'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	} else {
                		that.$detailWrap.find('[data-form-param]').val('');
                    	that.$detailTitle.text('');
                	}
                }, true);
            },

            loadDetail: function(param){
                var that = this,
                    requestParam;

                that.sysId = param.sysId;
                that.scheduleId = param.scheduleId;

                //요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'PromptExecutionService', 'getPromptExecutionInfo', 'ScheduleInfoInOMM',
                    {
                        sysId: param.sysId,
                        scheduleId: param.scheduleId
                    }
                );

                //Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function(){
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.PromptExecutionOMM;
                        that.detailData = $.extend(true, {}, data);

                        that.$detailTitle.text(data.sysId + '/' + data.scheduleId);

                        data.sysId = data.sysNm + '(' + data.sysId + ')';
                        data.scheduleGrpId = data.scheduleGrpNm + '(' + data.scheduleGrpId + ')';
                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                        
                        that.detailExecParameterGrid.setData(data.execParameter);
                        that.detailExecParameterGrid.setGridHeight(data.execParameter.length);
                    },
                    complete: function(){
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            upParameterItem: function () {
                var targetGrid = this.detailExecParameterGrid,
                    selectedRow = targetGrid.getSelectedRecords(),
                    selectedRowIdx = targetGrid.getSelectedRowIdx(),
                    prevRow = targetGrid.getDataAt(selectedRowIdx - 1);

                if(selectedRow.length === 0){
                    swal({type: 'warning', title: '', text: bxMsg('common.item-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                if(prevRow) {
                    prevRow = $.extend({}, prevRow);

                    targetGrid.setDataAt(selectedRowIdx - 1, selectedRow[0].data);
                    targetGrid.setDataAt(selectedRowIdx, prevRow);
                    targetGrid.setSelectedRowIdx(selectedRowIdx - 1);
                }
            },

            downParameterItem: function () {
                var targetGrid = this.detailExecParameterGrid,
                    selectedRow = targetGrid.getSelectedRecords(),
                    selectedRowIdx = targetGrid.getSelectedRowIdx(),
                    nextRow = targetGrid.getDataAt(selectedRowIdx + 1);

                if(selectedRow.length === 0){
                    swal({type: 'warning', title: '', text: bxMsg('common.item-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                if(nextRow) {
                    nextRow = $.extend({}, nextRow);

                    targetGrid.setDataAt(selectedRowIdx + 1, selectedRow[0].data);
                    targetGrid.setDataAt(selectedRowIdx, nextRow);
                    targetGrid.setSelectedRowIdx(selectedRowIdx + 1);
                }
            },
            
            runSchedule: function() {
            	var that = this,
            		requestParam,
            		params,
                    tempArray,
                    seq;

            	params = {
            		sysId: that.detailData.sysId,
            		scheduleId: that.detailData.scheduleId,
                    id: commonConfig.webSocketId
            	};

            	tempArray = [];
            	seq = 1;
            	that.detailExecParameterGrid.getAllData().forEach(function (item) {
            		tempArray.push({
            			paramCd: item.paramCd,
            			paramVal: item.paramVal
            		});
            		seq += 1;
            	});
            	params['parameterList'] = tempArray;

            	swal({
                    title: '', text: bxMsg('common.confirm-execution-msg'), showCancelButton: true, closeOnConfirm: false
                },
                function(){
                	//요청 객체 생성
                	requestParam = commonUtil.getBxmReqData(
                			'PromptExecutionService', 'scheduleRemoteControl', 'PromptExecutionInOMM',
                			params
                	);

                    // Ajax 요청
                    commonUtil.requestBxmAjax(requestParam, {
                        success: function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 1400){
                                commonUtil.closeTooltip();
                                swal({type: 'success', title: '', text: bxMsg('scheduler.remote-execute-success')});
                            } else {
                                swal({type: 'error', title: '', text: bxMsg('scheduler.remote-execute-fail')});
                            }
                        }
                    });
                }
            );
            	
            },
            
            showScheduleSearchPopup: function () {
                this.subViews['scheduleSearchPopup'].render();
            },

            showScheduleGroupSearchPopup: function () {
            	var sysId = this.$searchWrap.find('input[data-form-param="sysId"]').val();
            	
            	if (!sysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.sys-id-first-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
            	
            	this.subViews['scheduleGroupSearchPopup'].render(sysId);
            },

            showSystemSearchPopup: function () {
                this.subViews['systemSearchPopup'].render();
            }
        });
    }
);
