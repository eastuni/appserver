define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'common/popup/system-search/system-search',
        'common/popup/schedule-group-search/schedule-group-search',
        'common/popup/batch-job-search/batch-job-search',
        'views/scheduler/schedule-job-management/execution-parameter-add-popup',
        'views/scheduler/schedule-job-management/schedule-detail-setting-popup/schedule-detail-setting-popup',
        'views/scheduler/schedule-job-management/pre-schedule-add-popup',
        'views/scheduler/schedule-job-management/manager-add-popup',
        'text!views/scheduler/schedule-job-management/schedule-job-management-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        Popup,
        SystemSearchPopup,
        ScheduleGroupSearchPopup,
        BatchJobSearchPopup,
        ExecutionParameterAddPopup,
        ScheduleDetailSettingPopup,
        PreScheduleAddPopup,
        ManagerAddPopup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-large low-z-index-popup',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .batch-job-search-btn': 'showBatchJobSearchPopup',
                'click .schedule-group-search-btn': 'showScheduleGroupSearchPopup',
                'click .system-search-btn': 'showSystemSearchPopup',
                'change select[data-form-param="jobExecTypeCd"]': 'onChangeJobExecTypeCd',

                'click .detail-search-wrap .expand-detail-btn': 'expandAllDetail',
                'click .detail-search-wrap .collapse-detail-btn': 'collapseAllDetail',

                'change select[data-form-param="errProcCd"]': 'onChangeErrProcCd',
                'change select[data-form-param="startDelayProcYn"]': 'onChangeStartDelayProcYn',
                'change select[data-form-param="cmplDelayProcYn"]': 'onChangeCmplDelayProcYn',
                'change .alarm-info select[data-form-param="alarmUseYn"]': 'onChangeAlarmUseYn',
                'change .alarm-info input[type="checkbox"]': 'onChangeAlarmInfoCheckbox',

                'click .up-btn': 'upParameterItem',
                'click .down-btn': 'downParameterItem',

                'change select[data-form-param="scheduleTypeCd"]': 'onChangeScheduleTypeCd',
                'change select[data-form-param="scheduleSubCd"]': 'onChangeScheduleSubCd',
                'click .schedule-registration-detail-edit-btn': 'showScheduleDetailSettingPopup',

                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '',
            renderData: {},
            infoTypeSubCodeList: {},
            allAccordionExpanding: false,
            defaultExecParameter: {},

            initialize: function() {},

            render: function(data) {
                var that = this;
                that.mode = data ? 'edit' : 'add';

                that.$el.html(this.tpl(data));
                that.initializeView(data);
                if (that.mode === 'edit') {
                    that.loadCode(data);
                    data.jobId && that.$el.find('[data-form-param="jobExecTypeCd"]').prop('disabled', false);
                    data['basicProperty'].scheduleUseStartDt && that.$el.find('[data-form-param="scheduleUseStartDt"]').val(commonUtil.changeStringToDateString(data['basicProperty'].scheduleUseStartDt));
                    data['basicProperty'].scheduleUseEndDt && that.$el.find('[data-form-param="scheduleUseEndDt"]').val(commonUtil.changeStringToDateString(data['basicProperty'].scheduleUseEndDt));
                } else {
                    that.detailAccordionGrids['execParameter'].loadData({}, function (data) {
                        that.defaultExecParameter = data;
                        that.detailAccordionGrids['execParameter'].setGridHeight(data['execParamListSize']);
                    }, true);
                    
                    //2016-12-20, 황희예
                    that.$el.find('[data-form-param="startDelayProcYn"]').val('N');
                    that.$el.find('[data-form-param="cmplDelayProcYn"]').val('N');
                }

                that.renderDatePicker();
                
                that.setDraggable();
                that.show();
            },

            initializeView: function () {
                var that = this;


                // Set SubViews
                that.subViews['batchJobSearchPopup'] = new BatchJobSearchPopup();
                that.subViews['batchJobSearchPopup'].on('select-code', function (jobId) {
                    that.$detailWrap.find('input[data-form-param="jobId"]').val(jobId);

                    if($.isEmptyObject(jobId)) {
                    	that.$detailWrap.find('select[data-form-param="jobExecTypeCd"]').val('');
                    	that.$detailWrap.find('select[data-form-param="jobExecTypeCd"]').prop('disabled', true);
                    } else {
                    	that.$detailWrap.find('select[data-form-param="jobExecTypeCd"]').prop('disabled', false);
                    }
                });

                that.subViews['scheduleGroupSearchPopup'] = new ScheduleGroupSearchPopup();
                that.subViews['scheduleGroupSearchPopup'].on('select-code', function (scheduleGrpId) {
                    that.$detailWrap.find('input[data-form-param="scheduleGrpId"]').val(scheduleGrpId);
                });

                that.subViews['systemSearchPopup'] = new SystemSearchPopup();
                that.subViews['systemSearchPopup'].on('select-code', function (sysId) {
                    that.$detailWrap.find('input[data-form-param="sysId"]').val(sysId);
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

                    that.detailAccordionGrids['execParameter'].store.add(records);
                    that.detailAccordionGrids['execParameter'].setGridHeight(that.detailAccordionGrids['execParameter'].getAllData().length);
                });

                that.subViews['scheduleDetailSettingPopup'] = new ScheduleDetailSettingPopup();
                that.subViews['scheduleDetailSettingPopup'].on('save-item', function (data) {
                    that.renderData['typeInfo'] = data;
                    that.$scheduleRegistrationDetail.val(commonUtil.getScheduleRegistrationDetail(that.renderData['typeInfo']));
                });

                that.subViews['preScheduleAddPopup'] = new PreScheduleAddPopup();
                that.subViews['preScheduleAddPopup'].on('select-code', function (data) {
                    var records = [];
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            records.push({
                                preScheduleId: key,
                                preWorkCheckCd: 'UNKNOWN'
                            })
                        }
                    }

                    that.detailAccordionGrids['preJobInfo'].store.add(records);
                    that.detailAccordionGrids['preJobInfo'].setGridHeight(that.detailAccordionGrids['preJobInfo'].getAllData().length);
                });

                that.subViews['managerAddPopup'] = new ManagerAddPopup();
                that.subViews['managerAddPopup'].on('select-code', function (data) {
                    var records = [];
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            records.push({
                                userId: key,
                                userNm: data[key]['userNm'],
                                scheduleUserCd: 'M',
                                alarmProcYn: data[key]['alarmProcYn'] || 'Y',
                                phoneNo: data[key]['phoneNo'],
                                email: data[key]['email']
                            })
                        }
                    }

                    that.detailAccordionGrids['managerInfo'].store.add(records);
                    that.detailAccordionGrids['managerInfo'].setGridHeight(that.detailAccordionGrids['managerInfo'].getAllData().length);
                    that.$detailAccordionGrids['managerInfo'].trigger('doneSlideDown');
                });

                // grids
                that.detailAccordionGrids = {};
                that.detailAccordionGrids['execParameter'] = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleInfoService', 'getDefaultExecParamList', 'EmptyOMM'),
                        key: 'EmptyOMM'
                    },

                    responseParam: {
                        objKey: 'ScheduleInfoExecParamListOMM',
                        key: 'execParamList'
                    },

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
                                    that.subViews['executionParameterAddPopup'].render(that.detailAccordionGrids['execParameter'].getAllData());
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
                            renderer: function (){
                                return '<button type="button" class="bw-btn grid-del-btn"><i class="bw-icon i-20 i-func-trash"></i></button>'
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
                                that.detailAccordionGrids['execParameter'].store.removeAt(rowIndex);
                                that.detailAccordionGrids['execParameter'].setGridHeight(that.detailAccordionGrids['execParameter'].getAllData().length);
                            }
                        }
                    },
                    gridConfig: {
                        hidden: true,
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });

                that.detailAccordionGrids['preJobInfo'] = new ExtGrid({
                    header: {
                        button: [
                            {
                                html:
                                // '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-mng-dashboard" title="'
                                // + bxMsg('common.add') + '"></i></button>' +
                                '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                                + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    var sysId = that.$detailWrap.find('input[data-form-param="sysId"]').val(),
                                    	typeInfo = commonUtil.makeParamFromForm(that.$detailAccordions['typeInfo']);
                                    
                                    if (!sysId) {
                                        swal({type: 'warning', title: '', text: bxMsg('common.sys-id-first-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }

                                    if(typeInfo.scheduleTypeCd === 'CLN' && (typeInfo.scheduleSubCd === 'WEEK' || typeInfo.scheduleSubCd === 'YEAR')) {
                                    
                                    	if($.isEmptyObject(that.renderData)) {
                                    		swal({type: 'warning', title: '', text: bxMsg('scheduler.schedule-type-register-detail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    		return;
                                    	} else {
                                    		typeInfo.schedule1Val = that.renderData['typeInfo'].schedule1Val;
                                    	}
                                    }
                                    
                                    that.subViews['preScheduleAddPopup'].render(that.detailAccordionGrids['preJobInfo'].getAllData(), sysId, typeInfo);
                                }
                            }
                        ]
                    },
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['preScheduleId', 'preWorkCheckCd'],
                    columns: [
                        {text: bxMsg('scheduler.pre-schedule-id'), flex: 3, dataIndex: 'preScheduleId', align:'center'},
                        {
                            text: bxMsg('scheduler.pre-job-check'), flex: 2, dataIndex: 'preWorkCheckCd', align:'center',
                            editor: {
                                xtype: 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray(commonConfig.comCdList['BXMAD0025'])
                                }),
                                displayField: 'value',
                                valueField: 'key'
                            },
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0025'][value];
                            }
                        },
                        {
                            text:bxMsg('common.del'),
                            renderer: function (){
                                return '<button type="button" class="bw-btn grid-del-btn"><i class="bw-icon i-20 i-func-trash"></i></button>'
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        cellclick: function(_this, td, cellIndex, record, tr, rowIndex) {
                            if (cellIndex === 2) {
                                that.detailAccordionGrids['preJobInfo'].store.removeAt(rowIndex);
                                that.detailAccordionGrids['preJobInfo'].setGridHeight(that.detailAccordionGrids['preJobInfo'].getAllData().length);
                            }
                        }
                    },
                    gridConfig: {
                        hidden: true,
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
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
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                                + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['managerAddPopup'].render(that.detailAccordionGrids['managerInfo'].getAllData());
                                }
                            }
                        ]
                    },
                    pageCountDefaultVal: 5,
                    gridToggle: false,

                    fields: ['userId', 'userNm', 'scheduleUserCd', 'alarmProcYn', 'phoneNo', 'email'],
                    columns: [
                        {text: bxMsg('scheduler.manager-nm'), flex: 3, dataIndex: 'userNm', align:'center'},
                        {
                            text: bxMsg('scheduler.type'), flex: 2, dataIndex: 'scheduleUserCd', align:'center',
                            editor: {
                                xtype: 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray(commonConfig.comCdList['BXMAD0019'])
                                }),
                                displayField: 'value',
                                valueField: 'key'
                            },
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0019'][value];
                            }
                        },
                        {
                            text: bxMsg('scheduler.alarm-process'), flex: 1, dataIndex: 'alarmProcYn', align:'center',
                            editor: {
                                xtype: 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['value'],
                                    data: [
                                        {value: 'Y'},
                                        {value: 'N'}
                                    ]
                                }),
                                displayField: 'value',
                                valueField: 'value'
                            }
                        },
                        {text: bxMsg('scheduler.phone-no'), flex: 3, dataIndex: 'phoneNo', align:'center'},
                        {text: bxMsg('scheduler.email'), flex: 3, dataIndex: 'email', align:'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (){
                                return '<button type="button" class="bw-btn grid-del-btn"><i class="bw-icon i-20 i-func-trash"></i></button>'
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        cellclick: function(_this, td, cellIndex, record, tr, rowIndex) {
                            if (cellIndex === 5) {
                                that.detailAccordionGrids['managerInfo'].store.removeAt(rowIndex);
                                that.detailAccordionGrids['managerInfo'].setGridHeight(that.detailAccordionGrids['managerInfo'].getAllData().length);
                            }
                        }
                    },
                    gridConfig: {
                        hidden: true,
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });


                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
                that.$detailAccordionWrap = that.$el.find('.bxm-accordion-wrap');

                that.$detailAccordions = {};
                that.$detailAccordions['basicProperty'] = that.$detailWrap.find('.basic-property');

                that.$errProcCdSelect = that.$detailAccordions['basicProperty'].find('select[data-form-param="errProcCd"]');
                that.$startDelayProcYnSelect = that.$detailAccordions['basicProperty'].find('select[data-form-param="startDelayProcYn"]');
                that.$cmplDelayProcYnSelect = that.$detailAccordions['basicProperty'].find('select[data-form-param="cmplDelayProcYn"]');

                that.$reExecCntInput = that.$detailAccordions['basicProperty'].find('input[data-form-param="reExecCnt"]');
                that.$startDelayWaitSecInput = that.$detailAccordions['basicProperty'].find('input[data-form-param="startDelayWaitSec"]');
                that.$cmplDelayWaitSecInput = that.$detailAccordions['basicProperty'].find('input[data-form-param="cmplDelayWaitSec"]');

                that.$detailAccordions['typeInfo'] = that.$detailWrap.find('.type-info');

                that.$scheduleTypeCdSelect = that.$detailAccordions['typeInfo'].find('select[data-form-param="scheduleTypeCd"]');
                that.$scheduleSubCdSelect = that.$detailAccordions['typeInfo'].find('select[data-form-param="scheduleSubCd"]');
                that.$scheduleRegistrationDetailBtn = that.$detailAccordions['typeInfo'].find('button.schedule-registration-detail-edit-btn');
                that.$scheduleRegistrationDetail = that.$detailAccordions['typeInfo'].find('[data-form-param="scheduleRegistrationDetail"]');

                that.$detailAccordionGrids = {};
                that.$detailAccordionGrids['execParameter'] = that.$detailWrap.find('.execution-parameter-grid');
                that.$detailAccordionGrids['preJobInfo'] = that.$detailWrap.find('.pre-process-info-grid');
                that.$preProcessInfoHeader = that.$detailWrap.find('.pre-process-info-header');
                that.$postProcessInfoHeader = that.$detailWrap.find('.post-process-info-header');
                that.$detailAccordionGrids['postJobInfo'] = that.$detailWrap.find('.post-process-info-grid');
                that.$detailAccordionGrids['managerInfo'] = that.$detailWrap.find('.manager-info-grid');
                that.$detailAccordionsAlarmInfo = that.$detailWrap.find('.alarm-info');

                commonUtil.setExpandAccordion(this.$el.find('.bxm-accordion-wrap'));


                // avoiding Ext.grid bug that it's not rendered correctly when it's hidden
                for (var key in that.$detailAccordionGrids) {
                    if (that.$detailAccordionGrids.hasOwnProperty(key)) {
                        that.$detailAccordionGrids[key]
                            .on('doneSlideDown', getShowGridFunc(key))
                            .on('doneSlideUp', getHideGridFunc(key));
                    }
                }

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


                // scroll to the clicked accordion content when it expanded for better UX
                that.$detailWrap.children('div').on('doneSlideDown', function (e, header) {
                    // When accordions are expanding, only the first accordion animates scrolling down.
                    // Encountered the last accordion means accordion expanding finished(allAccordionExpanding = false).
                    if (that.allAccordionExpanding) {
                        if (!$(header).prev().length) {
                            that.$detailWrap.animate({ scrollTop: that.$detailWrap.scrollTop() + (header ? $(header).position().top : 1000) - 60 });
                        } else if (!$(header).next().next().length) {
                            that.allAccordionExpanding = false;
                        }
                        return;
                    }
                    that.$detailWrap.animate({ scrollTop: that.$detailWrap.scrollTop() + (header ? $(header).position().top : 1000) - 60 });
                });


                // render grids
                for (key in that.$detailAccordionGrids) {
                    if (that.$detailAccordionGrids.hasOwnProperty(key)) {
                        that.$detailAccordionGrids[key].html(that.detailAccordionGrids[key].render());
                    }
                }

                // render select tags
                that.$detailWrap.find('select[data-form-param="jobExecTypeCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0028'], true, bxMsg('scheduler.select-job-exec-type-cd')));
                that.$detailWrap.find('select[data-form-param="errProcCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0020']));
                that.$detailWrap.find('select[data-form-param="importanceCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0018']));
                that.$scheduleTypeCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0021']));


                // parse and save the sub codes with the relevant type codes
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ScheduleInfoService', 'getTypeCdList', 'EmptyOMM'), {
                    success: function (response) {
                        that.infoTypeSubCodeList = getInfoTypeSubCodeList(response['ScheduleInfoTypeCdListOMM']['typeCdList']);

                        that.$scheduleSubCdSelect.html(commonUtil.getCommonCodeOptionTag(that.infoTypeSubCodeList[that.$scheduleTypeCdSelect.val()]));
                    }
                });

                function getInfoTypeSubCodeList(data) {
                    var typeCodeList = {},
                        subCodeList;

                    data.forEach(function (typeCode) {
                        subCodeList = {};
                        typeCode['subCdList'].forEach(function (subCode) {
                            subCodeList[subCode] = commonConfig.comCdList['BXMAD0022'][subCode];
                        });

                        typeCodeList[typeCode['scheduleTypeCd']] = subCodeList;
                    });

                    return typeCodeList;
                }
            },

            loadCode: function(data) {
                var that = this,
                    key;
                that.renderData = data;

                commonUtil.makeFormFromParam(that.$detailWrap, data);

                for (key in that.$detailAccordions) {
                    if (that.$detailAccordions.hasOwnProperty(key)) {
                        commonUtil.makeFormFromParam(that.$detailAccordions[key], data[key]);
                    }
                }

                for (key in that.detailAccordionGrids) {
                    if (that.detailAccordionGrids.hasOwnProperty(key)) {
                        that.detailAccordionGrids[key].loadData({}, getSetGridHeightFunc(key), true, data, key)
                    }
                }

                that.$scheduleSubCdSelect.html(commonUtil.getCommonCodeOptionTag(that.infoTypeSubCodeList[that.$scheduleTypeCdSelect.val()]));
                setTimeout(function () {
                    that.$scheduleSubCdSelect.val(data['typeInfo']['scheduleSubCd']);

                    var selectedScheduleType = that.$scheduleTypeCdSelect.val();
                    if (selectedScheduleType === 'RMT' || selectedScheduleType === 'PRE') {
                        that.$scheduleRegistrationDetailBtn.hide();
                    } else {
                        that.$scheduleRegistrationDetailBtn.show();
                    }

                    that.$scheduleRegistrationDetail.val(commonUtil.getScheduleRegistrationDetail(data['typeInfo']));
                    that.togglePreJobInfoGrid();

                    that.onChangeErrProcCd();
                    that.onChangeStartDelayProcYn();
                    that.onChangeCmplDelayProcYn();
                }, 500);

                that.$detailAccordionsAlarmInfo.find('[data-form-param="alarmUseYn"]').val(data['alarmUseYn']);
                data['alarmInfo'].forEach(function (item) {
                    var $target = that.$detailAccordionsAlarmInfo.find('[data-type="' + item['alarmCd'] + '"]');
                    $target.find('input[type="checkbox"]').prop('checked', true);
                    $target.find('input[type="text"]').val(item['alarmCtt']);
                    that.onChangeAlarmUseYn();
                    that.onChangeAlarmInfoCheckbox();
                });


                // closure
                function getSetGridHeightFunc(key) {
                    return function () {
                        that.detailAccordionGrids[key].setGridHeight(data[key].length);
                    }
                }
            },

            onChangeJobExecTypeCd: function (e) {
                if (this.mode !== 'add') return;

                var that = this;

                if ($(e.currentTarget).val() === 'G') {
                    that.detailAccordionGrids['execParameter'].loadData({}, function () {
                        that.detailAccordionGrids['execParameter'].setGridHeight(that.defaultExecParameter['execParamListSize']);
                    }, true, that.defaultExecParameter, 'execParamList');
                } else {
                    that.detailAccordionGrids['execParameter'].resetData();
                    that.detailAccordionGrids['execParameter'].setGridHeight();
                }
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

            onChangeErrProcCd: function () {
                if (this.$errProcCdSelect.val() === 'R') {
                    this.$reExecCntInput.prop('disabled', false).siblings('label').addClass('asterisk');
                } else {
                    this.$reExecCntInput.prop('disabled', true).val('').siblings('label').removeClass('asterisk');
                }
            },

            onChangeStartDelayProcYn: function () {
                if (this.$startDelayProcYnSelect.val() === 'Y') {
                    this.$startDelayWaitSecInput.prop('disabled', false).siblings('label').addClass('asterisk');
                } else {
                    this.$startDelayWaitSecInput.prop('disabled', true).val('').siblings('label').removeClass('asterisk');
                }
            },

            onChangeCmplDelayProcYn: function () {
                if (this.$cmplDelayProcYnSelect.val() === 'Y') {
                    this.$cmplDelayWaitSecInput.prop('disabled', false).siblings('label').addClass('asterisk');
                } else {
                    this.$cmplDelayWaitSecInput.prop('disabled', true).val('').siblings('label').removeClass('asterisk');
                }
            },

            onChangeAlarmUseYn: function () {
                if (this.$detailAccordionsAlarmInfo.find('select[data-form-param="alarmUseYn"]').val() === 'Y') {
                    this.$detailAccordionsAlarmInfo.find('input[type="checkbox"]').prop('disabled', false);
                } else {
                    this.$detailAccordionsAlarmInfo.find('input[type="checkbox"]').prop('checked', false).prop('disabled', true);
                    this.$detailAccordionsAlarmInfo.find('input[type="text"]').val('').prop('readonly', true);
                }
            },

            onChangeAlarmInfoCheckbox: function (e) {
                if (e) {
                    var $target = $(e.currentTarget),
                    	$dataType = $target.parent().parent().attr('data-type');
                    
                    if ($target.prop('checked')) {
                        $target.parent().siblings('input').prop('readonly', false);
                        
                        switch($dataType) {
                        case 'OK' :
                        	$target.parent().siblings('input').val(bxMsg('scheduler.alarm-ok-msg'));
                        	break;
                        case 'ERROR' :
                        	$target.parent().siblings('input').val(bxMsg('scheduler.alarm-error-msg'));
                        	break;
                        case 'S_DELAY':
                        	$target.parent().siblings('input').val(bxMsg('scheduler.alarm-start-delay-msg'));
                        	break;
                        case 'E_DELAY':
                        	$target.parent().siblings('input').val(bxMsg('scheduler.alarm-end-delay-msg'));
                        	break;
                        case 'F_OK':
                        	$target.parent().siblings('input').val(bxMsg('scheduler.alarm-forced-ok-msg'));
                        	break;
                        case 'F_ERROR':
                        	$target.parent().siblings('input').val(bxMsg('scheduler.alarm-forced-error-msg'));
                        	break;
                        default : break;;
                        }
                        
                    } else {
                        $target.parent().siblings('input').val('').prop('readonly', true);
                    }
                } else {
                    var $targets = this.$detailAccordionsAlarmInfo.find('input[type="checkbox"]');

                    $targets.each(function (i, target) {
                        var $target = $(target);
                        if ($target.prop('checked')) {
                            $target.parent().siblings('input').prop('readonly', false);
                        } else {
                            $target.parent().siblings('input').val('').prop('readonly', true);
                        }
                    })

                }
            },

            upParameterItem: function () {
                var targetGrid = this.detailAccordionGrids['execParameter'],
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
                var targetGrid = this.detailAccordionGrids['execParameter'],
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

            onChangeScheduleTypeCd: function () {
                var selectedScheduleType = this.$scheduleTypeCdSelect.val();
                // When type code is changed, the following sub code select list also would be changed.
                this.$scheduleSubCdSelect.html(commonUtil.getCommonCodeOptionTag(this.infoTypeSubCodeList[selectedScheduleType]));

                if (selectedScheduleType === 'RMT' || selectedScheduleType === 'PRE' ) {
                    this.$scheduleRegistrationDetailBtn.hide();
                } else {
                    this.$scheduleRegistrationDetailBtn.show();
                }

                this.$scheduleRegistrationDetail.val('');
                
                this.togglePreJobInfoGrid();
                this.togglePostJobInfoGrid();
            },

            // Toggle pre-job-info depend on scheduleType
            togglePreJobInfoGrid: function () {
                var selectedScheduleType = this.$scheduleTypeCdSelect.val();

                if (selectedScheduleType !== 'RPT' && selectedScheduleType !== 'RMT') {
                    this.$preProcessInfoHeader.show();
                } else {
                    this.$preProcessInfoHeader.hide();
                    this.$detailAccordionGrids['preJobInfo'].hide();
                }
            },
            
            // Toggle post-job-info depend on scheduleType
            togglePostJobInfoGrid: function () {
                var selectedScheduleType = this.$scheduleTypeCdSelect.val();

                if (selectedScheduleType !== 'RPT' && selectedScheduleType !== 'RMT') {
                    this.$postProcessInfoHeader.show();
                } else {
                    this.$postProcessInfoHeader.hide();
                    this.$detailAccordionGrids['postJobInfo'].hide();
                }
            },

            onChangeScheduleSubCd: function () {
                this.$scheduleRegistrationDetail.val('');
                this.renderData = {};
            },

            saveItem: function() {
                var that = this,
                    $askFormItems,
                    selectedScheduleType = this.$scheduleTypeCdSelect.val(),
                    formParam = commonUtil.makeParamFromForm(that.$detailWrap),
                    typeInfo = that.renderData['typeInfo'],
                    params,
                    tempArray,
                    seq,
                    $item,
                    hasMainManager,
                    operation;

                // required values validation
                $askFormItems = that.$detailWrap.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length ; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param') || $askFormItem.parent().find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text() || $askFormItem.parent().find('.bw-label').text();

                    if(!formParam[key]){
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                if (selectedScheduleType !== 'RMT' && selectedScheduleType !== 'PRE') {
                    if (!typeInfo) {
                        swal({type: 'warning', title: '', text: bxMsg('common.no-type-info-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }

                    if (!formParam.scheduleRegistrationDetail) {
                        swal({type: 'warning', title: '', text: bxMsg('common.no-type-info-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                if(!that.$detailWrap.find('select[data-form-param="jobExecTypeCd"]').prop('disabled') 
                		&& (formParam.jobExecTypeCd === '' || formParam.jobExecTypeCd === null )) {
                	swal({type: 'warning', title: '', text: bxMsg('scheduler.alert-job-exec-type-cd'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                if(formParam.scheduleUseStartDt) {
                	formParam.scheduleUseStartDt = commonUtil.changeDateStringToString(formParam.scheduleUseStartDt);
                }
                
                if(formParam.scheduleUseEndDt) {
                	formParam.scheduleUseEndDt = commonUtil.changeDateStringToString(formParam.scheduleUseEndDt);
                }
                
                // parameters setup
                params = {
                    sysId: formParam.sysId,
                    scheduleId: formParam.scheduleId,
                    scheduleNm: formParam.scheduleNm,
                    jobId: formParam.jobId,
                    useYn: formParam.useYn,
                    scheduleGrpId: formParam.scheduleGrpId,
                    jobExecTypeCd: formParam.jobExecTypeCd,
                    basicProperty: {
                        expectedElapsedTimeSec: formParam.expectedElapsedTimeSec,
                        memVal: formParam.memVal,
                        errProcCd: formParam.errProcCd,
                        importanceCd: formParam.importanceCd,
                        reExecCnt: formParam.reExecCnt,
                        reExecIntervalSec: formParam.reExecIntervalSec,
                        startDelayProcYn: formParam.startDelayProcYn,
                        startDelayWaitSec: formParam.startDelayWaitSec,
                        cmplDelayProcYn: formParam.cmplDelayProcYn,
                        cmplDelayWaitSec: formParam.cmplDelayWaitSec,
                        concurrExecUseYn: formParam.concurrExecUseYn,
                        scheduleUseStartDt: formParam.scheduleUseStartDt,
                        scheduleUseEndDt: formParam.scheduleUseEndDt
                    },
                    typeInfo: {
                        scheduleTypeCd: formParam.scheduleTypeCd,
                        scheduleSubCd: formParam.scheduleSubCd,
                        schedule1Val: typeInfo && typeInfo.schedule1Val,
                        schedule2Val: typeInfo && typeInfo.schedule2Val,
                        schedule3Val: typeInfo && typeInfo.schedule3Val
                    },
                    alarmUseYn: formParam.alarmUseYn
                };

                tempArray = [];
                that.$detailAccordionsAlarmInfo.find('[data-type]').each(function (i, item) {
                    $item = $(item);

                    if ($item.find('input[type="checkbox"]').attr('checked')) {
                        tempArray.push({
                            alarmCd: $item.attr('data-type'),
                            alarmCtt: $item.find('input[type="text"]').val()
                        })
                    }
                });
                params['alarmInfo'] = tempArray;

                tempArray = [];
                seq = 1;
                that.detailAccordionGrids['execParameter'].getAllData().forEach(function (item) {
                    tempArray.push({
                        paramSeq: seq,
                        paramCd: item.paramCd,
                        paramVal: item.paramVal
                    });
                    seq += 1;
                });
                params['execParameter'] = tempArray;

                // preJobInfo only added when specific scheduleType satisfied
                if (selectedScheduleType !== 'RMT' && selectedScheduleType !== 'PRE') {
                    params['preJobInfo'] = that.detailAccordionGrids['preJobInfo'].getAllData();
                }

                tempArray = [];
                hasMainManager = false;
                that.detailAccordionGrids['managerInfo'].getAllData().forEach(function (item) {
                    if (item.scheduleUserCd === 'M') {
                        hasMainManager = true;
                    }
                    tempArray.push({
                        userId: item.userId,
                        scheduleUserCd: item.scheduleUserCd,
                        alarmProcYn: item.alarmProcYn
                    });
                });
                params['managerInfo'] = tempArray;

                if(!hasMainManager){
                    swal({type: 'warning', title: '', text: bxMsg('scheduler.no-manager-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }


                // Ajax request
                operation = (that.mode === 'edit') ? 'editScheduleInfo' : 'addScheduleInfo';

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ScheduleInfoService', operation, 'ScheduleInfoOMM', params), {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
                            that.close();
                        } else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        } else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            },

            showScheduleDetailSettingPopup: function (e) {
                e.stopPropagation();
                var selectedScheduleType = this.$scheduleTypeCdSelect.val();
                if (selectedScheduleType === 'RMT' || selectedScheduleType === 'PRE' ) return;

                this.subViews['scheduleDetailSettingPopup'].render(commonUtil.makeParamFromForm(this.$detailAccordions['typeInfo']));
            },

            showBatchJobSearchPopup: function () {
                this.subViews['batchJobSearchPopup'].render();
            },

            showScheduleGroupSearchPopup: function () {
            	var sysId = this.$detailWrap.find('input[data-form-param="sysId"]').val();
            	
            	if (!sysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.sys-id-first-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
            	
                this.subViews['scheduleGroupSearchPopup'].render(sysId);
            },

            showSystemSearchPopup: function () {
                this.subViews['systemSearchPopup'].render();
            },
            
            renderDatePicker: function() {
            	 commonUtil.setDatePicker(this.$el.find('input[data-form-param="scheduleUseStartDt"]'), 'yy-mm-dd');
                 commonUtil.setDatePicker(this.$el.find('input[data-form-param="scheduleUseEndDt"]'), 'yy-mm-dd');
            }
        });
    }
);
