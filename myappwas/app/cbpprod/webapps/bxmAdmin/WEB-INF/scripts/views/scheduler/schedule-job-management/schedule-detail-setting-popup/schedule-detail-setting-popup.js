define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-job-management/schedule-detail-setting-popup/day.html',
        'text!views/scheduler/schedule-job-management/schedule-detail-setting-popup/week.html',
        'text!views/scheduler/schedule-job-management/schedule-detail-setting-popup/month.html',
        'text!views/scheduler/schedule-job-management/schedule-detail-setting-popup/year.html',
        'text!views/scheduler/schedule-job-management/schedule-detail-setting-popup/rhour.html',
        'text!views/scheduler/schedule-job-management/schedule-detail-setting-popup/min.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        day,
        week,
        month,
        year,
        rhour,
        min
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                'day': day,
                'week': week,
                'month': month,
                'year': year,
                'rhour': rhour,
                'min': min
            },

            events: {
                'click .time-wrap .i-count-up': 'increaseTime',
                'click .time-wrap .i-count-down': 'decreaseTime',

                'click .bx-week button': 'toggleWeekButton',
                'click .bw-cal table span': 'onClickDayOfMonthButton',
                'change .month-select select': 'onChangeMonth',

                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            DAYS_OF_MONTHS: [null, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            OPTIONS_FOR_HOURS: (function () {
                var options = [];

                for (var i = 0; i < 24; ++i) {
                    options.push(i);
                }

                return options;
            })(),
            OPTIONS_FOR_END_HOURS: (function () {
                var options = [];

                for (var i = 1; i <= 24; ++i) {
                    options.push(i);
                }

                return options;
            })(),
            renderData: null,

            initialize: function() {},

            render: function(data) {
                var that = this;
                that.renderTpl(data);
                this.renderData = data;

                this.setDraggable();
                this.show();
            },

            renderTpl: function(data) {
                switch (data['scheduleTypeCd']) {
                    case 'CLN':     // Calender
                        var title = {
                            title: Ext.String.format(
                                bxMsg('scheduler.schedule-detail-setting'),
                                bxMsg('common.' + data['scheduleSubCd']))
                        };

                        switch (data['scheduleSubCd']) {
                            case 'WEEK':    // Every week
                                this.$el.html(this['week'](title));
                                break;
                            case 'MONTH':   // Every month
                                this.$el.html(this['month'](title));
                                this.$calenderWrap = this.$el.find('.bw-cal');
                                break;
                            case 'YEAR':    // Every year
                                this.$el.html(this['year'](title));
                                this.$monthSelect = this.$el.find('.month-select select');
                                this.$selectListWrap = this.$el.find('.bw-schedule ul');
                                this.$calenderWrap = this.$el.find('.bw-cal');
                                this.$day30 = this.$calenderWrap.find('.day-30');
                                this.$day31 = this.$calenderWrap.find('.day-31');
                                this.$monthSelect.html(commonUtil.getCommonCodeOptionTag(bxMsg('common.MONTHS')));
                                break;
                            case 'DAY':     // Everyday
                            case 'BDAY':    // Business day
                            case 'HDAY':    // Holiday
                            case 'WDAYS':   // Weekdays
                            case 'WEND':    // Weekend
                            case 'MEND':    // The end of the month
                                this.$el.html(this['day'](title));
                                break;
                            default:
                        }

                        // time input fields validation
                        this.$el.find('.time-wrap input').on( "keydown", function( event ) {
                            commonUtil.validateInput(event, /^[0-9]{0,2}$/);
                        });

                        break;
                    case 'RPT':     // Repeat
                        switch (data['scheduleSubCd']) {
                            case 'RHOUR':
                                this.$el.html(this['rhour']({
                                    title: Ext.String.format(
                                        bxMsg('scheduler.schedule-detail-setting'),
                                        bxMsg('common.every-hour'))
                                }));
                                this.$startHourSelect = this.$el.find('.start-hour');
                                this.$endHourSelect = this.$el.find('.end-hour');
                                this.$minuteInput = this.$el.find('.minute-input');
                                this.$startHourSelect.html(commonUtil.getCommonCodeOptionTag(this.OPTIONS_FOR_HOURS));
                                this.$endHourSelect.html(commonUtil.getCommonCodeOptionTag(this.OPTIONS_FOR_END_HOURS));

                                // minute input validation
                                this.$minuteInput.on( "keydown", function( event ) {
                                    commonUtil.validateInput(event, /^([0-9]{0,2})(,([0-9]{0,2}))*$/);
                                });

                                break;
                            case 'MIN':
                                this.$el.html(this['min']({
                                    title: Ext.String.format(
                                        bxMsg('scheduler.schedule-detail-setting'),
                                        bxMsg('common.repeat'))
                                }));
                                this.$startHourSelect = this.$el.find('.start-hour');
                                this.$endHourSelect = this.$el.find('.end-hour');
                                this.$minuteInput = this.$el.find('.minute-input');
                                this.$startHourSelect.html(commonUtil.getCommonCodeOptionTag(this.OPTIONS_FOR_HOURS));
                                this.$endHourSelect.html(commonUtil.getCommonCodeOptionTag(this.OPTIONS_FOR_END_HOURS));

                                // minute input validation
                                this.$minuteInput.on( "keydown", function( event ) {
                                    commonUtil.validateInput(event, /^[0-9]{0,2}$/);
                                });

                                break;
                            default:
                        }
                        break;
                    case 'PRE':     // 선스케줄유형종속
                    case 'RMT':     // Remote
                    default:
                }
            },

            increaseTime: function (e) {
                var $target = $(e.currentTarget).parent().siblings('input'),
                    value = parseInt($target.val());

                switch ($target.attr('data-form-param')) {
                    case 'hour':
                        value = value + 1;
                        if (value > 23) value = 23;
                        break;
                    case 'minute':
                    case 'second':
                        value = value + 15;
                        if (value > 59) value = 59;
                        break;
                }

                $target.val(value);
            },

            decreaseTime: function (e) {
                var $target = $(e.currentTarget).parent().siblings('input'),
                    value = parseInt($target.val());

                switch ($target.attr('data-form-param')) {
                    case 'hour':
                        value = value - 1;
                        if (value < 0) value = 0;
                        break;
                    case 'minute':
                    case 'second':
                        value = value - 15;
                        if (value < 0) value = 0;
                        break;
                }

                $target.val(value);
            },

            toggleWeekButton: function (e) {
                var $target = $(e.currentTarget);

                if ($target.hasClass('on')) {
                    $target.removeClass('on');
                } else {
                    $target.addClass('on');
                }
            },

            toggleDayOfMonthButton: function (e) {
                var $target = $(e.currentTarget).parent();

                if ($target.hasClass('cal-today')) {
                    $target.removeClass('cal-today');
                } else {
                    $target.addClass('cal-today');
                }
            },

            onChangeMonth: function () {
                var that = this,
                    selectedMonth = this.$monthSelect.val();

                // clear calender
                that.$calenderWrap.find('td').removeClass('cal-today');

                // set the selected date of the current month
                that.$selectListWrap.find('li[data-month="' + selectedMonth + '"]').each(function (i, item) {
                    that.$calenderWrap.find('td[data-value="' + $(item).attr('data-day') + '"]').addClass('cal-today');
                });

                switch (that.DAYS_OF_MONTHS[selectedMonth]) {
                    case 29:
                        that.$day30.hide();
                        that.$day31.hide();
                        break;
                    case 30:
                        that.$day30.show();
                        that.$day31.hide();
                        break;
                    case 31:
                        that.$day30.show();
                        that.$day31.show();
                        break;
                    default:
                }
            },

            onClickDayOfMonthButton: function (e) {
                this.toggleDayOfMonthButton(e);

                if (this.renderData['scheduleTypeCd'] === 'CLN' && this.renderData['scheduleSubCd'] === 'YEAR') {
                    var $target = $(e.currentTarget).parent(),
                        month = this.$monthSelect.val(),
                        day = $target.children().text();

                    if ($target.hasClass('cal-today')) {
                        this.$selectListWrap.append('<li data-month="' + month + '" data-day="' + day + '">' +
                            Ext.String.format(bxMsg('common.month-and-day'), month, day) + '</li>');
                    } else {
                        this.$selectListWrap.find('li[data-month="' + month + '"][data-day="' + day + '"]').remove();
                    }
                }
            },

            saveItem: function () {
                var $searchWrap = this.$el.find('.search-wrap'),
                    data = {
                        scheduleTypeCd: this.renderData['scheduleTypeCd'],
                        scheduleSubCd: this.renderData['scheduleSubCd'],
                        schedule1Val: null,
                        schedule2Val: null,
                        schedule3Val: null
                    },
                    params = commonUtil.makeParamFromForm($searchWrap),
                    schedule1Val,
                    $item;

                switch (data['scheduleTypeCd']) {
                    case 'CLN':     // Calender
                        switch (data['scheduleSubCd']) {
                            case 'WEEK':    // Every week
                                schedule1Val = [];

                                $searchWrap.find('.bx-week .on').each(function (i, item) {
                                    schedule1Val.push($(item).val());
                                });

                                if (!schedule1Val.length) {
                                    swal({type: 'error', title: '', text: bxMsg('common.day-of-week-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    return;
                                }

                                data.schedule1Val = schedule1Val.join(',');
                                data.schedule2Val = this.convertTimeString(params);
                                break;
                            case 'MONTH':   // Every month
                                schedule1Val = [];

                                this.$calenderWrap.find('.cal-today span').each(function (i, item) {
                                    schedule1Val.push($(item).text());
                                });

                                if (!schedule1Val.length) {
                                    swal({type: 'error', title: '', text: bxMsg('common.day-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    return;
                                }

                                data.schedule1Val = schedule1Val.join(',');
                                data.schedule2Val = this.convertTimeString(params);
                                break;
                            case 'YEAR':    // Every year
                                schedule1Val = [];

                                this.$selectListWrap.find('li').each(function (i, item) {
                                    $item = $(item);
                                    schedule1Val.push($item.attr('data-month') + '-' + $item.attr('data-day'));
                                });

                                if (!schedule1Val.length) {
                                    swal({type: 'error', title: '', text: bxMsg('common.day-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    return;
                                }

                                data.schedule1Val = schedule1Val.join(',');
                                data.schedule2Val = this.convertTimeString(params);
                                break;
                            case 'DAY':     // Everyday
                            case 'BDAY':    // Business day
                            case 'HDAY':    // Holiday
                            case 'WDAYS':   // Weekdays
                            case 'WEND':    // Weekend
                            case 'MEND':    // The end of the month
                                data.schedule2Val = this.convertTimeString(params);
                                break;
                            default:
                        }
                        break;
                    case 'RPT':     // Repeat
                        switch (data['scheduleSubCd']) {
                            case 'RHOUR':
                                schedule1Val = this.$minuteInput.val();

                                if (!schedule1Val.length) {
                                    swal({type: 'error', title: '', text: bxMsg('common.minute-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    return;
                                }

                                data.schedule1Val = schedule1Val;
                                data.schedule2Val = this.convertTimeString({
                                    hour: this.$startHourSelect.val(),
                                    minute: '0',
                                    second: '0'
                                });
                                data.schedule3Val = this.convertTimeString({
                                    hour: this.$endHourSelect.val(),
                                    minute: '0',
                                    second: '0'
                                });
                                break;
                            case 'MIN':
                                schedule1Val = this.$minuteInput.val();

                                if (!schedule1Val.length) {
                                    swal({type: 'error', title: '', text: bxMsg('common.minute-no-input-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    return;
                                }

                                data.schedule1Val = schedule1Val;
                                data.schedule2Val = this.convertTimeString({
                                    hour: this.$startHourSelect.val(),
                                    minute: '0',
                                    second: '0'
                                });
                                data.schedule3Val = this.convertTimeString({
                                    hour: this.$endHourSelect.val(),
                                    minute: '0',
                                    second: '0'
                                });
                                break;
                            default:
                        }
                        break;
                    case 'PRE':     // 선스케줄유형종속
                    case 'RMT':     // Remote
                    default:
                }

                this.trigger('save-item', data);
                this.close();
            },

            convertTimeString: function (params) {
                return (params['hour'].length === 1 ? '0' + params['hour'] : params['hour']) +
                    (params['minute'].length === 1 ? '0' + params['minute'] : params['minute']) +
                    (params['second'].length === 1 ? '0' + params['second'] : params['second']);
            }
        });
    }
);
