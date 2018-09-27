define(
    [
        'text!bx-component/time-picker/_time-picker-tpl.html'
    ],
    function (tpl) {
        var DatePicker = Backbone.View.extend({
            tagName: 'section',
            className: 'bx-form-item-group time-picker',

            events: {
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
                that.step=60;
                that.format="H:i";
                $.extend(that, config);
                
                that.defaultOption = {
                    format: that.format,
                    step:that.step,
                    timepicker: true,
                    datepicker: false,
                    validateOnBlur: false,
                    onSelectTime: function () {
                        that.$input.trigger('change');
                    }
                };

                that.$el.html(tpl);
                that.$input = that.$el.find('.date-picker-input');
                that.$input.addClass(that.inputClass);
                that.$input.attr("style='width:auto;'");
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
                var reVal = this.$input.val().substring(0, 2) + this.$input.val().substring(3, 5);
                return reVal;
            },

            blurInputHandler: function (e) {
                typeof this.blurHandler === 'function' && this.blurHandler(e);
            },

            setValue: function (value) {
                if (value.length == 5) {
                    this.$input.val(value);
                }
                else if (value.length == 4) {
                    this.$input.val(value.substring(0, 2) + ":" + value.substring(3, 4));
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

                datePickerOption.onSelectTime = function () {
                    relateDateValidate.call(this);
                    that.$input.trigger('change');
                };

                that.$input.datetimepicker(datePickerOption);

                function relateDateValidate() {
                    var option = {},
                        currentTime,
                        relateTime;

                    currentTime =  that.getValue();
                    relateTime = that.linkDatePicker.getValue();

                    if (relateTime && relateStandard === 'min') {
                    	
                    	// 시간을 숫자로 변환해서 1을 더하고 다시 문자열로 변환
                    	relateTime = ((relateTime - 0) + 1) + '';
                    	relateTime = (relateTime.length === 3) ? '0' + relateTime : relateTime;
                    	
                    } 

                    option[relateStandard + 'Time'] = relateTime ? relateTime.substring(0,2)+":"+relateTime.substring(2,4) : false;
                    option.formatDate = that.format;
                    
                    
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