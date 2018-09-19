define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'text!views/setting/schedule-calendar/biz-date-detail.html',
        'text!views/setting/schedule-calendar/_schedule-calendar-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        bizDateDetail,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'bizDateDetail': bizDateDetail,
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'change .bxm-search-wrap select': 'loadList',

                'click .save-btn': 'saveCalendar'
            },

            currentCalendar: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('CalendarService', 'getCalendarInfo', 'CalendarOMM'),
                        key: 'CalendarOMM'
                    },
                    responseParam: {
                        objKey: 'CalendarListOMM',
                        key: 'calendarList'
                    },
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn save-btn" title="' + bxMsg('common.save') + '"><i class="bw-icon i-25 i-func-save"></i></button>'
                            }
                        ],
                        content: [
                            '<h3 class="bw-desc d-block calendar-info-title">' + bxMsg('scheduler.calendar-info') + '</h3>'
                        ]
                    },
                    gridToggle: false,
                    pageCountDefaultVal: 22,

                    fields: ['stdDay', 'dayOfTheWeek', 'dtCd'],
                    columns: [
                        {text: bxMsg('scheduler.calendar-date'), flex: 1, dataIndex: 'stdDay', align: 'center'},
                        {text: bxMsg('scheduler.day-of-the-week'), flex: 1, dataIndex: 'dayOfTheWeek', align: 'center',
                        	renderer: function(value) {
                        		return commonConfig.comCdList['BXMRT0003'][value];
                        	}
                        },
                        {
                            text: bxMsg('scheduler.date-code'), flex: 1, dataIndex: 'dtCd', align: 'center',
                            editor: {
                                xtype: 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray(
                                        commonConfig.comCdList['BXMRT0009'],
                                        function (key) {
                                            return parseInt(key);
                                        })
                                }),
                                displayField: 'value',
                                valueField: 'key'
                            },
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMRT0009'][value];
                            }
                        }
                    ],
                    gridConfig: {
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });

                if (commonConfig.extraOption && commonConfig.extraOption['systemdateUseAsBizdate'] === 'true') {
                	this.$el.find('.calendar-biz-date').attr('style', 'display:none');
                };
                
                // Dom Element Cache
                that.$calenderWrap = that.$el.find('.calendar-wrap');
                that.$searchWrap = that.$calenderWrap.find('.bxm-search-wrap');
                that.$calenderYear = that.$calenderWrap.find('select[data-form-param="stdYear"]');
                that.$calenderMonth = that.$calenderWrap.find('select[data-form-param="stdMonth"]');
                that.$grid = that.$el.find('.bxm-grid-wrap');

                that.$registeredCalendarInfoDesc = that.$el.find('.registered-calendar-info-desc');
                that.$bizDateDetail = that.$el.find('.biz-date-detail');
            },

            render: function() {
                var that = this;

                that.$calenderMonth.html(commonUtil.getCommonCodeOptionTag((function () {
                    var optionList = [];
                    for (var i = 1; i <= 12; ++i) {
                        optionList.push(i);
                    }

                    return optionList;
                })()));
                
                that.$calenderYear.html(commonUtil.getCommonCodeOptionTag((function () {
                	var optionList = [],
                		date = new Date();
                	for (var i = 0 ; i <= 4; i++) {
                		optionList.push(date.getFullYear() + i);
                	}
                	
                	return optionList;
                })()));
                
                that.resetSearch();

                that.$grid.html(that.grid.render(function(){that.loadList();}));

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('BizDateService', 'getBizDate', 'EmptyOMM'), {
                    success: function(response) {
                        var formData = response.BizDateOMM;

                        if(!$.isEmptyObject(formData)) {
                            formData.day_of_week = bxMsg("common.days-of-week")[formData.daywTypeCd];
                        }

                        that.$bizDateDetail.html(that.bizDateDetail(formData));
                    }
                });

                return that.$el;
            },

            resetSearch: function() {
                var date = new Date();
                this.$calenderYear.val(date.getFullYear());
                this.$calenderMonth.val(date.getMonth()+1);
            },

            loadList: function() {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap);

                // refresh current registered date info
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('CalendarService', 'getCurrentCalendarStatus', 'EmptyOMM'), {
                    success: function(response) {
                        var formData = response.CalendarCurrentPeriodOMM,
                            firstDateString = Ext.String.format(bxMsg('common.year-and-month'),
                                formData['firstDate'].substring(0, 4), formData['firstDate'].substring(4)),
                            lastDateString = Ext.String.format(bxMsg('common.year-and-month'),
                                formData['lastDate'].substring(0, 4), formData['lastDate'].substring(4));

                        that.$registeredCalendarInfoDesc.text(Ext.String.format(bxMsg('scheduler.registered-calendar-desc'),
                            firstDateString, lastDateString));
                    }
                });

                params.stdMonth = ("0" + params.stdMonth).slice(-2);

                // load list
                that.grid.loadData(params, function (response) {
                    that.$calenderWrap.find('.calendar-info-title').text(Ext.String.format(bxMsg('common.year-and-month'),
                        params['stdYear'], params['stdMonth']) + ' '
                        + (response['existData'] ? bxMsg('scheduler.calendar-info') : bxMsg('scheduler.calendar-info-not-exist')));
                    
                    //수정해야함
                    if(params.stdMonth.length === 1) {
                    	params.stdMonth = 0 + params.stdMonth;
                    }
                    
                    if(!response['existData']) {
                    	swal({type: 'warning', title: '', text: Ext.String.format(bxMsg('common.year-and-month'),
                                params['stdYear'], params['stdMonth']) + bxMsg('setting.no-calendar-info-msg'), showConfirmButton:  true});
                    }
                    
                    that.currentCalendar = params;
                }, true);
            },

            saveCalendar: function(e) {
                var that = this,
                    baseDate = {
                        stdYear: that.currentCalendar['stdYear'],
                        stdMonth: that.currentCalendar['stdMonth']
                    },
                    calendarList = [];

                setTimeout(function () {
                    that.grid.getModifiedData().forEach(function (item) {
                        calendarList.push($.extend({}, baseDate, {
                            stdDay: item.stdDay,
                            dtCd: item.dtCd
                        }));
                    });

                    commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                        'CalendarService', 'updateCalendarInfo', 'CalendarListOMM',
                        {
                            calendarList: calendarList
                        }
                    ), {
                        beforeSend: function() {
                            that.grid.subViews['gridLoadingBar'].show();
                        },
                        success: function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 200){
                                swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                that.loadList();
                            }else if(code === 201){
                                swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }else if(code === 202){
                                swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }else if(code === 204){
                                swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }                    },
                        complete: function() {
                            that.grid.subViews['gridLoadingBar'].hide();
                        }
                    });
                }, 200);
            }
        });
    }
);
