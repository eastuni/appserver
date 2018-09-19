define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/schedule-search/schedule-search',
        'common/popup/schedule-group-search/schedule-group-search',
        'common/popup/system-search/system-search',
        'views/scheduler/schedule-job-management/schedule-job-management-popup',
        'views/scheduler/schedule-job-management/excel-upload-popup',
        'text!views/scheduler/schedule-job-management/_schedule-job-management-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        ScheduleSearchPopup,
        ScheduleGroupSearchPopup,
        SystemSearchPopup,
        ScheduleJobManagementPopup,
        ExcelUploadPopup,
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

                'click .detail-search-wrap .expand-detail-btn': 'expandAllDetail',
                'click .detail-search-wrap .collapse-detail-btn': 'collapseAllDetail',

                'click .schedule-search-btn': 'showScheduleSearchPopup',
                'click .schedule-group-search-btn': 'showScheduleGroupSearchPopup',
                'click .system-search-btn': 'showSystemSearchPopup',

                'click .grid-del-btn': 'deleteItem',
                'click .edit-btn': 'showEditItemPopup'
            },

            sysId: null,
            scheduleId: null,
            detailData: null,
            latestSearchParams: null,
            allAccordionExpanding: false,

            initialize: function() {

                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['scheduleJobManagementPopup'] = new ScheduleJobManagementPopup();

                that.subViews['scheduleJobManagementPopup'].on('edit-item', function(){
                    var selectedIdx = that.grid.getSelectedRowIdx();

                    that.grid.reloadData(function(){
                        if(selectedIdx === -1){
                            that.loadDetail({
                                sysId: that.sysId,
                                scheduleId: that.scheduleId
                            });
                        } else {
                            that.grid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });

                that.subViews['scheduleJobManagementPopup'].on('add-item', function(){
                    that.grid.reloadData();
                });

                that.subViews['excelUploadPopup'] = new ExcelUploadPopup();
                that.subViews['excelUploadPopup'].on('file-uploaded', function(){
                    that.grid.reloadData();
                });

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

                that.subViews['detailLoadingBar'] = new LoadingBar();


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleInfoService', 'getScheduleList', 'ScheduleInfoInOMM'),
                        key: 'ScheduleInfoInOMM'
                    },

                    responseParam: {
                        objKey: 'ScheduleInfoListOMM',
                        key: 'scheduleList'
                    },

                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                                + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['scheduleJobManagementPopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls-up" title="'
                                + bxMsg('common.excel-upload') + '"></i></button>',
                                event: function() {
                                    that.subViews['excelUploadPopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="'
                                + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData('ScheduleInfoService', 'scheduleExportExcel', 'ScheduleInfoInOMM',
                                                that.latestSearchParams);

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('/bxmAdmin/fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        });
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls-empty" title="'
                                + bxMsg('common.excel-bean-type-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData('ScheduleInfoService', 'scheduleExportEmptyExcel', 'EmptyOMM');

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('/bxmAdmin/fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        });
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['sysId', 'sysNm', 'scheduleId', 'scheduleNm', 'scheduleGrpNm', 'jobId', 'useYn', 'mainManager', 'userNm', 'scheduleTypeCd'],
                    columns: [
                        {text: bxMsg('scheduler.system'), flex: 2, dataIndex: 'sysNm', align:'center'},
                        {text: bxMsg('scheduler.schedule-id'), flex: 2, dataIndex: 'scheduleId', align:'center'},
                        {text: bxMsg('scheduler.schedule-nm'), flex: 3, dataIndex: 'scheduleNm', align:'center'},
                        {text: bxMsg('scheduler.schedule-group'), flex: 2.5, dataIndex: 'scheduleGrpNm', align:'center'},
                        {text: bxMsg('scheduler.schedule-type'), flex: 2, dataIndex: 'scheduleTypeCd', align:'center',
                        	renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0021'][value];
                            }
                        },
                        {text: bxMsg('scheduler.batch-job-id'), flex: 3, dataIndex: 'jobId', align:'center'},
                        {text: bxMsg('scheduler.use-yn'), flex: 1, dataIndex: 'useYn', align:'center'},
                        {text: bxMsg('scheduler.primary-manager'), flex: 3, dataIndex: 'mainManager', align:'center'},
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
                        select: function(_this, record){
                            that.loadDetail({sysId: record.get('sysId'), scheduleId: record.get('scheduleId')});
                        }
                    }
                });


                that.detailAccordionGrids = {};
                that.detailAccordionGrids['execParameter'] = new ExtGrid({
                    header: {
                    },
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['paramCd', 'paramVal', 'modifUseYn'],
                    columns: [
                        {text: bxMsg('scheduler.parameter-type'), flex: 2, sortable: false, dataIndex: 'paramCd', align:'center'},
                        {text: bxMsg('scheduler.input-value'), flex: 3, sortable: false, dataIndex: 'paramVal', align:'center'},
                        {text: bxMsg('scheduler.editable-yn'), flex: 2, sortable: false, dataIndex: 'modifUseYn', align:'center'}
                    ],
                    gridConfig: {
                        hidden: true
                    }
                });

                that.detailAccordionGrids['preJobInfo'] = new ExtGrid({
                    header: {
                    },
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['preScheduleId', 'preWorkCheckCd'],
                    columns: [
                        {text: bxMsg('scheduler.pre-schedule-id'), flex: 3, dataIndex: 'preScheduleId', align:'center'},
                        {
                            text: bxMsg('scheduler.pre-job-check'), flex: 2, dataIndex: 'preWorkCheckCd', align:'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0025'][value];
                            }
                        }
                    ],
                    gridConfig: {
                        hidden: true
                    }
                });

                that.detailAccordionGrids['postJobInfo'] = new ExtGrid({
                    header: {
                    },
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['scheduleId', 'preWorkCheckCd'],
                    columns: [
                        {text: bxMsg('scheduler.post-schedule-id'), flex: 3, dataIndex: 'scheduleId', align:'center'},
                        {
                            text: bxMsg('scheduler.pre-job-check'), flex: 2, dataIndex: 'preWorkCheckCd', align:'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0025'][value];
                            }
                        }
                    ],
                    gridConfig: {
                        hidden: true
                    }
                });

                that.detailAccordionGrids['managerInfo'] = new ExtGrid({
                    header: {
                    },
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['userNm', 'scheduleUserCd', 'alarmProcYn', 'phoneNo', 'email'],
                    columns: [
                        {text: bxMsg('scheduler.manager-nm'), flex: 3, dataIndex: 'userNm', align:'center'},
                        {
                            text: bxMsg('scheduler.type'), flex: 2, dataIndex: 'scheduleUserCd', align:'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0019'][value];
                            }
                        },
                        {text: bxMsg('scheduler.alarm-process'), flex: 1, dataIndex: 'alarmProcYn', align:'center'},
                        {text: bxMsg('scheduler.phone-no'), flex: 3, dataIndex: 'phoneNo', align:'center'},
                        {text: bxMsg('scheduler.email'), flex: 3, dataIndex: 'email', align:'center'}
                    ],
                    gridConfig: {
                        hidden: true
                    }
                });


                // DOM Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
                that.$detailAccordionWrap = that.$el.find('.bxm-accordion-wrap');
                that.$detailAccordions = {};
                that.$detailAccordions['basicProperty'] = that.$detailWrap.find('.basic-property');
                that.$detailAccordions['typeInfo'] = that.$detailWrap.find('.type-info');
                that.$detailAccordionGrids = {};
                that.$detailAccordionGrids['execParameter'] = that.$detailWrap.find('.execution-parameter-grid');
                that.$detailAccordionGrids['preJobInfo'] = that.$detailWrap.find('.pre-process-info-grid');
                that.$preProcessInfoHeader = that.$detailWrap.find('.pre-process-info-header');
                that.$detailAccordionGrids['postJobInfo'] = that.$detailWrap.find('.post-process-info-grid');
                that.$detailAccordionGrids['managerInfo'] = that.$detailWrap.find('.manager-info-grid');
                that.$detailAccordionsAlarmInfo = that.$detailWrap.find('.alarm-info');

                // apply accordion format
                commonUtil.setExpandAccordion(that.$detailAccordionWrap);

                // avoiding Ext.grid bug that it's not rendered correctly when it's hidden
                for (var key in that.$detailAccordionGrids) {
                    if (that.$detailAccordionGrids.hasOwnProperty(key)) {
                        that.$detailAccordionGrids[key]
                            .on('doneSlideDown', getShowGridFunc(key))
                            .on('doneSlideUp', getHideGridFunc(key));
                    }
                }

                // scroll to the clicked accordion content when it expanded for better UX
                that.$detailAccordionWrap.children('div').on('doneSlideDown', function () {
                    // When accordions are expanding, only the first accordion animates scrolling down.
                    // Encountered the last accordion means accordion expanding finished(allAccordionExpanding = false).
                    if (that.allAccordionExpanding) {
                        if (!$(this).prev().prev().length) {
                            that.$el.parent().animate({ scrollTop: $(this).position().top + 574 });
                        } else if (!$(this).next().length) {
                            that.allAccordionExpanding = false;
                        }
                        return;
                    }
                    that.$el.parent().animate({ scrollTop: $(this).position().top + 574 });
                });

                // closure
                function getShowGridFunc(key) {
                    return function () {
                        that.detailAccordionGrids[key].grid.show();
                    }
                }
                function getHideGridFunc(key) {
                    return function () {
                        that.detailAccordionGrids[key].grid.hide();
                    }
                }
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function(){that.loadList();}));
                for (var key in that.$detailAccordionGrids) {
                    if (that.$detailAccordionGrids.hasOwnProperty(key)) {
                        that.$detailAccordionGrids[key].html(that.detailAccordionGrids[key].render());
                    }
                }
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return this.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this,
                    params;

                if(pageRenderInfo && pageRenderInfo.scheduleId) {
                    that.sysId = pageRenderInfo.sysId;
                    that.scheduleId = pageRenderInfo.scheduleId;

                    params = {
                        sysId: that.sysId,
                        scheduleId: that.scheduleId
                    };

                    that.loadDetail(params, function () {
                        commonUtil.makeFormFromParam(that.$searchWrap, params);
                        that.loadList();
                    });
                }
            },

            resetSearch: function() {
                this.$searchWrap.find('input[data-form-param]').val('');
            },

            loadList: function() {
            	var that= this;
            	
            	that.latestSearchParams = commonUtil.makeParamFromForm(that.$searchWrap);
                
            	that.grid.loadData(this.latestSearchParams, function(data) {
            		data = data['scheduleList'];
            		if(data && data.length) {
            			that.$gridWrap.find('tbody tr:first-child').click();
            		}else {
            			that.$detailWrap.find('[data-form-param]').val('');
                    	that.$detailTitle.text('');
            		}
            	}, true);
            },

            expandAllDetail: function () {
                var that = this;

                // When all accordion are expanding, animations for each accordion are disabled but the last one.
                that.allAccordionExpanding = true;
                that.$detailAccordionWrap.children('h3').each(function(i, item) {
                    var $item = $(item);

                    if (!$item.hasClass('accordion-header-active')) {
                        $item.trigger('click');
                    }
                });
            },

            collapseAllDetail: function () {
                this.$detailAccordionWrap.children('h3').each(function(i, item) {
                    var $item = $(item);

                    if ($item.hasClass('accordion-header-active')) {
                        $item.trigger('click');
                    }
                });
            },

            loadDetail: function(param, callback) {
                var that = this,
                    requestParam;

                that.sysId = param.sysId;
                that.scheduleId = param.scheduleId;

                //요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ScheduleInfoService', 'getScheduleInfo', 'ScheduleInfoInOMM',
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
                        var key,
                            data = response.ScheduleInfoOMM;
                        that.detailData = $.extend(true, {}, data);

                        that.$detailTitle.text(data.sysId + '/' + data.scheduleId);

                        data.sysId = data.sysNm + '(' + data.sysId + ')';
                        data.scheduleGrpId = data.scheduleGrpNm + '(' + data.scheduleGrpId + ')';
                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                        for (key in that.$detailAccordions) {
                            if (that.$detailAccordions.hasOwnProperty(key)) {
                                commonUtil.makeFormFromParam(that.$detailAccordions[key], data[key]);
                            }
                        }

                        for (key in that.detailAccordionGrids) {
                            if (that.detailAccordionGrids.hasOwnProperty(key)) {
                                that.detailAccordionGrids[key].loadData(requestParam, getSetGridHeightFunc(key), true, data, key)
                            }
                        }

                        data['basicProperty'].scheduleUseStartDt && that.$detailAccordions['basicProperty'].find('[data-form-param="scheduleUseStartDt"]').val(commonUtil.changeStringToDateString(data['basicProperty'].scheduleUseStartDt));
                        data['basicProperty'].scheduleUseEndDt && that.$detailAccordions['basicProperty'].find('[data-form-param="scheduleUseEndDt"]').val(commonUtil.changeStringToDateString(data['basicProperty'].scheduleUseEndDt));
                        that.$detailAccordions['typeInfo'].find('[data-form-param="scheduleRegistrationDetail"]').val(commonUtil.getScheduleRegistrationDetail(data['typeInfo']));

                        if (data['alarmInfo'].length) {
                            data['alarmInfo'].forEach(function (item) {
                                var $target = that.$detailAccordionsAlarmInfo.find('[data-type="' + item['alarmCd'] + '"]');
                                $target.find('input[type="checkbox"]').prop('checked', true);
                                $target.find('input[type="text"]').val(item['alarmCtt']);
                            });
                        } else {
                            that.$detailAccordionsAlarmInfo.find('input[type="checkbox"]').prop('checked', false);
                            that.$detailAccordionsAlarmInfo.find('input[type="text"]').val('');
                        }
                        that.$detailAccordionsAlarmInfo.find('[data-form-param="alarmUseYn"]').val(data['alarmUseYn']);


                        // Toggle pre-job-info depend on scheduleType
                        var selectedScheduleType = data['typeInfo']['scheduleTypeCd'];

                        if (selectedScheduleType !== 'RPT' && selectedScheduleType !== 'RMT') {
                            that.$preProcessInfoHeader.show();
                        } else {
                            that.$preProcessInfoHeader.hide();
                            that.$detailAccordionGrids['preJobInfo'].hide();
                        }


                        // closure
                        function getSetGridHeightFunc(key) {
                            return function () {
                                that.detailAccordionGrids[key].setGridHeight(data[key].length);
                            }
                        }
                    },
                    complete: function(){
                        that.subViews['detailLoadingBar'].hide();
                        callback && callback();
                    }
                });
            },

            deleteItem: function(e){
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam,
                    key;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function() {
                        //요청객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ScheduleInfoService', 'removeScheduleInfo', 'ScheduleInfoInOMM',
                            {
                                sysId: $target.attr('data-sys-id'),
                                scheduleId: $target.attr('data-schedule-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    //그리드 reload
                                    that.grid.reloadData();

                                    //상세 초기화
                                    that.$detailTitle.text('');
                                    that.$detailWrap.find('[data-form-param]').val('');

                                    for (key in that.$detailAccordions) {
                                        if (that.$detailAccordions.hasOwnProperty(key)) {
                                            that.$detailAccordions[key].find('[data-form-param]').val('');
                                        }
                                    }

                                    for (key in that.detailAccordionGrids) {
                                        if (that.detailAccordionGrids.hasOwnProperty(key)) {
                                            that.detailAccordionGrids[key].loadData({}, null, true, {data: {}}, 'data');
                                        }
                                    }

                                    that.$detailAccordionsAlarmInfo.find('input[type="checkbox"]').prop('checked', false);
                                    that.$detailAccordionsAlarmInfo.find('input[type="text"]').val('');
                                } else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    });
            },

            showEditItemPopup: function(){
                if(!this.detailData) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['scheduleJobManagementPopup'].render(this.detailData);
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