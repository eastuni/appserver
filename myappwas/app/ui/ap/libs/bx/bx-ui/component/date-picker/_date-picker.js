define(
    [
        'text!bx-component/date-picker/_date-picker-tpl.html'
    ],
    function (tpl) {
        var DatePicker = Backbone.View.extend({
            tagName: 'section',
            className: 'bx-form-item-group date-picker',

            events: {
                'click .calendar-btn': 'focusDateInput',
                'click .calendar-reset-btn': 'resetValue',
                'keydown .date-picker-input': 'blockKeydown',
                'blur .date-picker-input': 'blurInputHandler'
            },

            defaultOption: null,

            editable: false,

            initialize: function (config) {
                var that = this;

                /*
                 * inputClass: string
                 * inputAttrs: Obj { attrName : attrValue}
                 * setTime: boolean
                 * editable
                 */
                $.extend(that, config);

                if (config.format == 'd-m-Y') {
                    that.format = 'd-m-Y';
                } else {
                    if (config.setTime === false) {
                        that.setTime = false;
                        that.format = 'Y-m-d';
                    } else {
                        that.setTime = true;
                        that.format = 'Y-m-d.H:00';
                    }
                }


//                if(that.pickDate === false){
//                	that.pickDate = false
//                	that.format = 'H:mm'
//                }else{
//                	that.pickDate = true
//                }

                //var lngCd = config.lngCd;
                var lngCd = $.sessionStorage('lngCd');
                var i18n;

                if (config.lngCd !== undefined) {
                    lngCd = config.lngCd;
                }

                if (lngCd === 'ko') {
                    i18n = {
                        ko: {
                            months: ['1월(JAN)', '2월(FEB)', '3월(MAR)', '4월(APR)', '5월(MAY)', '6월(JUN)',
                                '7월(JUL)', '8월(AUG)', '9월(SEP)', '10월(OCT)', '11월(NOV)', '12월(DEC)'],
                            dayOfWeek: ['일', '월', '화', '수', '목', '금', '토']
                        }
                    }
                } else if (lngCd === 'zh') {
                    i18n = {
                        zh: {
                            months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                            dayOfWeek: ["日", "一", "二", "三", "四", "五", "六"]
                        }
                    }
                } else {
                    i18n = {
                        en: {
                            months: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.',
                                'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
                            dayOfWeek: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']
                        }
                    }
                }

                that.defaultOption = {
                    format: that.format,
                    timepicker: that.setTime,
//                    pickDate:that.pickDate
                    validateOnBlur: false,
                    lang: lngCd,
                    i18n: i18n,
                    onSelectDate: function () {
                        that.$input.trigger('change');
                    },
                    onSelectTime: function () {
                        that.$input.trigger('change');
                    }
                };

                that.$el.html(tpl);
                that.$input = that.$el.find('.date-picker-input');
                that.$input.addClass(that.inputClass);
                that.inputAttrs && that.$input.attr(that.inputAttrs);

                if (config.defaultValue) {
                    that.$input.val(config.defaultValue);
                }

                that.initCalendar();
            },

            render: function () {
                return this.$el;
            },

            getValue: function () {

                var reVal;

                if (this.format === "d-m-Y") {    // Error Fix, Kisu Kim
                    reVal = this.$input.val().substring(6, 10) + this.$input.val().substring(3, 5) + this.$input.val().substring(0, 2);
                } else {
                    reVal = this.$input.val().substring(0, 4) + this.$input.val().substring(5, 7) + this.$input.val().substring(8, 10);
                }

                return reVal;
            },

            blurInputHandler: function (e) {
                typeof this.blurHandler === 'function' && this.blurHandler(e);
            },

            setValue: function (value) {
                if (value.length == 10) {
                    this.$input.val(value);
                }
                else if (value.length == 8) {
                    this.$input.val(value.substring(0, 4) + "-" + value.substring(4, 6) + "-" + value.substring(6, 8));
                }
            },

            focusDateInput: function () {
                this.$input.focus();
            },

            resetValue: function () {
                var resetVal = this.$input.attr('data-reset');
                (resetVal) ? this.$input.val(resetVal) : this.$input.val('');
                this.$input.trigger('change');
                this.trigger('reset', this.$input);
            },

            blockKeydown: function (e) {
                if (!this.editable) {
                    e.preventDefault();
                }
            },

            setLinkDatePicker: function (role, linkDatePicker) {
                var that = this, relateStandard,
                    datePickerOption = {};

                that.role = role;
                that.$input.attr('data-role', role);
                that.linkDatePicker = linkDatePicker;
                relateStandard = (that.role === 'start') ? 'max' : 'min';

                datePickerOption.onShow = function () {
                    relateDateValidate.call(this);
                };

                datePickerOption.onSelectDate = function () {
                    relateDateValidate.call(this);
                    that.$input.trigger('change');
                };

                datePickerOption.onSelectTime = function () {
                    relateDateValidate.call(this);
                    that.$input.trigger('change');
                };

                that.$input.datetimepicker(datePickerOption);

                function relateDateValidate() {
                    var option = {},
                        linkDateValue,
                        timeSeparatorIdx,
                        currentDate,
                        relateDate,
                        relateTime;

                    linkDateValue = that.linkDatePicker.getValue();
                    timeSeparatorIdx = linkDateValue.indexOf('.');

                    currentDate = that.getValue().substring(0, timeSeparatorIdx);
                    relateDate = linkDateValue.substring(0, timeSeparatorIdx);
                    relateTime = linkDateValue.substring(timeSeparatorIdx + 1);

                    option[relateStandard + 'Date'] = linkDateValue ? linkDateValue : false;
                    option.formatDate = that.format;

                    if (!(currentDate === '' && relateDate === '') && (currentDate === relateDate)) {
                        if (relateStandard === 'min') {

                            // 시간을 숫자로 변환해서 1을 빼고 다시 문자열로 변환
                            relateTime = ((relateTime.substring(0, 2) - 0) + 1) + '';
                            relateTime = (relateTime.length === 1) ? '0' + relateTime : relateTime;
                            relateTime += ':00';
                        }

                        option[relateStandard + 'Time'] = relateTime;
                    } else {
                        option[relateStandard + 'Time'] = false
                    }

                    this.setOptions(option);
                }
            },

            initCalendar: function () {
                this.$input.datetimepicker(this.defaultOption);
            },

            triggerChange: function () {
                this.$input.trigger('change');
            },

            removeWith: function () {
                var $input = this.$input;

                $('.xdsoft_datetimepicker').each(function (i, datePicker) {
                    var $datePicker = $(datePicker);

                    if ($datePicker.data('input')[0] === $input[0]) {
                        $datePicker.remove();
                    }
                });
            }
        });


        return DatePicker;
    }
);