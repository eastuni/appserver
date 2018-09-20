/**
 * @fileOverview It provides common utility for JavaScript coding in the ProductFactory Screen.
 * 				 function(1) Inquire of Common Code Information of the Product Factory.
 * 				 function(2) Inquire of Menu Information for Login user role.
 * 				 function(3) Re-adjust Menu Cascading Style Sheets by login user role.
 * @author BankwareGlobal ProductFactory Team
 */
(function(global) {

    extendsJQuery(jQuery);

    /**
     * PFUtil
     * @namespace PFUtil
     */
    global.PFUtil = {

    		/**
    		  * Attach an event handler function for events to the selected elements.
		      * @param {Object} $root - Page Root jQuery Element.
		      * @return {function} Wrapping function of event handler in jQuery.
		      */
    		makeEventBinder: function makeEventMethod($root) {
    			return function (event, selector, handler) {
    				$root.on(event, selector, handler);
    			}
    		},

    		/**
    		 * Get Hash Information In Location Object.
    		 * @return {String} Hash Information of Replace '#' to ''
    		 */
	        getHash: function() {
	            return location.hash.replace('#', '');
	        },

	        /**
	         * Make JSON Object from jQuery Object.
	         * @param {Object} $form - jQuery Object.
	         * @param {MakeParamFromFormOption} option - configuration object for make JSON object.
	         * @return {(Object|String)} JSON Object or JSON String
	         */
	        makeParamFromForm: function($form, option) {

	            var $formItems = $form.find('[data-form-param]'),
	                param = {},
	                option = option || {};

	            $formItems.each(function(i, formItem) {
	                var $formItem = $(formItem),
	                    value;

	                if($formItem.hasClass('removeComma')) {
	                    value = $formItem.val().split(',').join('');
	                } else {
	                    value = $formItem.val() || $formItem.attr('data-value');
	                }

	                if(!value){
	                    if(option.ignoreEmpty) {
	                        return;
	                    }else{
	                        value = '';
	                    }
	                }

	                if($formItem.is('[type=checkbox]') && !$(formItem).is(':checked')) {
	                    return;
	                }

	                $(formItem).is(':checked')

	                if($formItem.hasClass('calendar')) {
	                    if(!value) {
	                        value = null;
	                    }else {
	                        value = XDate(value).toString(option.dateFormat || 'yyyy-MM-dd HH:mm:ss');
	                    }
	                }
	                if(!param[$formItem.attr('data-form-param')] || param[$formItem.attr('data-form-param')].length == 0 ){
	                    param[$formItem.attr('data-form-param')] = value;
	                }
	            });
	            return (option.isStringfy)? JSON.stringify(param) : param;
	        },

	        /**
	         * Convert Array Object to Map Object
	         * @param {Array} array - Array Object.
	         * @param {String} key - Key of Map Object.
	         * @param {String} value - Value of Map Object.
	         * @param {String} type - Type of Array Object.
	         * @return {Object} Map Object
	         */
	        convertArrayToMap: function(array, key, value, type) {

	            if(type == null){
	                type = 'code'; // common code
	            }

	            var map = {};

	            array.forEach(function(item, i) {
	                if(type == 'code' && item['code'].substring(0,1) != 'P'){
	                    map[item['code']] = (value) ? item[value] : item;
	                }else {
	                    map[item[key]] = (value) ? item[value] : item;
	                }
	            });

	            return map;
	        },

	        /**
	         * Compare Dates
	         * @param {(String|XDateObject)} date1 - jQuery Object.
	         * @param {(String|XDateObject)} date2 - jQuery Object.
	         * @return {Number} Compare value
	         */
	        compareDateTime: function(date1, date2) {
	            var returnValue;

	            date1 = (typeof date1 === 'string')?  XDate(date1):date1;
	            date2 = (typeof date2 === 'string')?  XDate(date2):date2;

	            date1 = parseInt(date1.toString('yyyyMMddhhmmss'));
	            date2 = parseInt(date2.toString('yyyyMMddhhmmss'));

	            if(date1 === date2) {
	                returnValue = 0;
	            }else if(date1 > date2) {
	                returnValue = -1;
	            }else {
	                returnValue = 1;
	            }
	            return returnValue;
	        },

	        /**
	         * Add Date to day.
	         * @param {(String|XDateObject)} date - The original date user want to add.
	         * @param {Number} days - Number of days to add
	         * @return {String} Added date.
	         */
	        addDays: function(date, days){
	        	return (new XDate(date)).addDays(days).toString('yyyy-MM-dd');
	        },

	        /**
	         * Add Date to Month.
	         * @param {(String|XDateObject)} date - The original date user want to add.
	         * @param {Number} months - Number of months to add
	         * @return {String} Added date.
	         */
	        addMonths: function(date, months){
	        	return (new XDate(date)).addMonths(months).toString('yyyy-MM-dd');
	        },

	        /**
	         * Get Default Start Date for ProductFactory.
	         * @return {String} Default Start Date.
	         */
	        getStartDate: function(){
	        	return '2000-01-01';
	        },

	        /**
	         * Get Default End Date for ProductFactory.
	         * @return {String} Default End Date.
	         */
	        getEndDate: function(){
	        	return '9999-12-31';
	        },

	        /**
	         * Get new XDate with the current date and time
	         * @return {String} Current Date
	         */
	        getToday: function(){
	            return commonConfig.currentXDate.toString('yyyy-MM-dd');
	        },

	        /**
	         * Get add the next day to the current date.
	         * @return {String} Added Date
	         */
	        getNextDate: function(){
	            var today = new XDate();
	            return today.addDays(global.g_nextDate).toString('yyyy-MM-dd');
	        },

	        /**
	         * Create a datetimepicker library object However, the minimum date is 1970-01-01.
	         * @param {boolean} isTimepicker - Whether to show the time.
	         * @param {Object} $target - jQuery Element for rendering.
	         * @return {void}
	         */
	        getDatePicker: function(isTimepicker, $target, config = {}) {
	            var format;
	            //var config = {};
	            if(!$target) $target = $el;

	            if(!isTimepicker) {
	                $target.find('.calendar.start-date').val(this.getToday());
	                $target.find('.calendar.end-date').val('9999-12-31');
	                format = 'Y-m-d';
	            }else{
	                format = 'Y-m-d H:i:s';
	                config.minDate = '+1970/01/0' + (1+global.g_nextDate);
	                config.onSelectDate = function(currentUnixTime, $this){
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d');
	                    
	                    // KYL20180718 수정 - 시작일자 변경시엔 시간을 00:00:00, 종료일자 변경시엔 시간을 23:59:59로 변경
	                    if($this.hasClass('calendar end-date')) {
	                    	$this.val(currentTime + ' 23:59:59')	                    	
	                    } else {
	                    	$this.val(currentTime + ' 00:00:00')
	                    }
	                };
	                config.onSelectTime = function(currentUnixTime, $this){
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d H:i:s');
	                    // OHS20180411 수정 - 적용시작일자일때는 기존처럼, 종료일자일때는 시간을 제외한 분,초는 59:59로 변경
	                    if($this.hasClass('calendar end-date')) {
	                    	currentTime = currentTime.substr(0, 14);
	                    	currentTime += '59:59';
	                    	$this.val(currentTime);
	                    }
	                    else {
	                    	$this.val(currentTime.substr(0, 17)+'00');
	                    }
	                };
	            }

	            config.format = format;
	            config.timepicker = !!isTimepicker;
	            config.yearEnd = 9999;
	            config.todayButton = true;

	            $target.find('.calendar').on('mousedown', function() {
	            	// 2017.01.04 OHS - datetimepicker 생성전 전부제거
	            	// mousedown 이벤트 추가
	            	if($('.xdsoft_datetimepicker.xdsoft_noselect.xdsoft_')) {
	            		$('.xdsoft_datetimepicker.xdsoft_noselect.xdsoft_').remove();
	            	}
	            	// OHS20180413 - 기존생성되어있던 datetimepicker 객체는 제거하고 다시 생성한다.
	            	$target.find('.calendar').datetimepicker('destroy');
	                $target.find('.calendar').datetimepicker(config);
	            });
	        },

	        /**
	         * Create a datetimepicker library object the minimum date is not limited.
	         * @param {boolean} isTimepicker - Whether to show the time.
	         * @param {Object} $target - jQuery Element for rendering.
	         * @return {void}
	         */
	        getAllDatePicker: function(isTimepicker, $target) {
	            var format;
	            var config = {};
	            if(!$target) $target = $el;

	            if(!isTimepicker) {
	                $target.find('.calendar.start-date').val(this.getToday());
	                $target.find('.calendar.end-date').val('9999-12-31');
	                format = 'Y-m-d';
	            }else{
	                format = 'Y-m-d H:i:s';
	                config.onSelectDate = function(currentUnixTime, $this){
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d');
	                    
	                    // KYL20180718 수정 - 시작일자 변경시엔 시간을 00:00:00, 종료일자 변경시엔 시간을 23:59:59로 변경
	                    if($this.hasClass('calendar end-date')) {
	                    	$target.find('.calendar-all').val(currentTime + ' 23:59:59');
	                    } else {
	                    	$target.find('.calendar-all').val(currentTime + ' 00:00:00');
	                    }
	                };
	                config.onSelectTime = function(currentUnixTime, $this){
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d H:i:s');
	                    //$target.find('.calendar-all').val(currentTime.substr(0, 17)+'00');
	                    // OHS20180411 수정 - 적용시작일자일때는 기존처럼, 종료일자일때는 시간을 제외한 분,초는 59:59로 변경
	                    if($this.hasClass('calendar end-date')) {
	                    	currentTime = currentTime.substr(0, 14);
	                    	currentTime += '59:59';
	                    	$target.find('.calendar-all').val(currentTime);
	                    }
	                    else {
	                    	$target.find('.calendar-all').val(currentTime.substr(0, 17)+'00');
	                    }
	                };
	            }

	            config.format = format;
	            config.timepicker = !!isTimepicker;
	            config.yearEnd = 9999;
	            config.todayButton = true;
	            config.enterLikeTab = false;

	            $target.find('.calendar-all').on('mousedown', function() {
	            	// 2017.01.04 OHS - datetimepicker 생성전 전부제거
	            	// mousedown 이벤트 추가
	            	if($('.xdsoft_datetimepicker.xdsoft_noselect.xdsoft_')) {
	            		$('.xdsoft_datetimepicker.xdsoft_noselect.xdsoft_').remove();
	            	}
	            	$target.find('.calendar-all').datetimepicker('destroy');
	                $target.find('.calendar-all').datetimepicker(config);
	            });
	        },

	        /**
	         * Create a datetimepicker library object. However Time information does not appear.
	         * @param {Object} target - this object in extJs Grid column.
	         * @param {String} dateType - dataIndex in extJs Grid Column. (applyStart or applyEnd)
	         * @param {Object} grid - extJs Grid Object.
	         * @param {Number} selectedCellIndex - extJs Grid current selected row index.
	         * @param {boolean} isNextDay - Want to add to minimum date.
	         * @param {boolean} isTime - Whether to show the time.
	         * @return {void}
	         */
	        getGridDatePicker: function(target, dateType, grid, selectedCellIndex, isNextDay, isTime) {
	            /*
	             * target : grid에서 focus할 때의 this객체
	             * dateType : dataIndex (applyStart or applyEnd)
	             * grid : grid 객체
	             * selectendCellIndex : 해당 row의 index
	             * isNextDay : mindate가 nextDay일 경우 true (default : false)
	             * isTime : true인 경우 target에는 Y-m-d를 dateType에는 Y-m-d H:i:s를 바인딩함 (default : false)
	             *          false인 경우에는 target, dateType 모두 Y-m-d를 바인딩함
	             * */

	            // isNextDay는 관계 그리드때문에 만든 파라미터임
	            // 실제 운영시에는 mindate가 today가 아닌 nextDay일 것이므로
	            // isNext파라미터와 아래 분기문을 삭제하고 mindate와 value부분을 nextDay로 수정 요함.

	            $('#' + target.id + ' input[type=text]').datetimepicker({
	                format: 'Y-m-d',
	                yearEnd: 9999,
	                timepicker: false,
	                className: 'grid-calendar',
	                minDate: isNextDay ? '+1970/01/0' + (1+global.g_nextDate) : '0001/01/01', //this.getToday(),
	                todayButton: true,
	                onSelectDate: function(currentUnixTime, $this){
	                    var currentDate = currentUnixTime.dateFormat('Y-m-d');
	                    var currentTime = currentDate + ((dateType == 'applyStart' || dateType == 'applyStartDate') ? ' 00:00:00' : ' 23:59:59');
	                    $this.val(currentDate);
	                    grid.store.getAt(selectedCellIndex).set(dateType, isTime ? currentTime : currentDate);
	                }
	            });

	            $('#' + target.id + ' input[type=text]').focus();
	        },

	        /**
	         * Create a datetimepicker library object. Time information appears.
	         * @param {Object} target - this object in extJs Grid column.
	         * @param {String} dateType - dataIndex in extJs Grid Column. (applyStart or applyEnd)
	         * @param {Object} grid - extJs Grid Object.
	         * @param {Number} selectedCellIndex - extJs Grid current selected row index.
	         * @param {boolean} isNextDay - Want to add to minimum date.
	         * @return {void}
	         */
	        getGridDateTimePicker: function(target, dateType, grid, selectedCellIndex, isNextDay) {
	            /*
	             * target : grid에서 focus할 때의 this객체
	             * dateType : dataIndex (applyStart or applyEnd)
	             * grid : grid 객체
	             * selectendCellIndex : 해당 row의 index
	             * isNextDay : mindate가 nextDay일 경우 true (default : false)
	             * */

	            // isNextDay는 관계 그리드때문에 만든 파라미터임
	            // 실제 운영시에는 mindate가 today가 아닌 nextDay일 것이므로
	            // isNext파라미터와 아래 분기문을 삭제하고 mindate와 value부분을 nextDay로 수정 요함.

	            $('#' + target.id + ' input[type=text]').datetimepicker({
	                format: 'Y-m-d H:i:s',
	                yearEnd: 9999,
	                timepicker: true,
	                className: 'grid-calendar',
	                minDate: isNextDay ? '+1970/01/0' + (1+global.g_nextDate) : '0001/01/01', //this.getToday(),
	                todayButton: true,
	                onSelectDate: function(currentUnixTime, $this){
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d');
	                    currentTime += (dateType == 'applyStart' || dateType == 'applyStartDate') ? ' 00:00:00' : ' 23:59:59';
	                    $this.val(currentTime);
	                    grid.store.getAt(selectedCellIndex).set(dateType, currentTime);
	                },
	                onSelectTime : function (currentUnixTime, $this) {
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d H:i:s').substr(0, 14);
	                    currentTime += (dateType == 'applyStart' || dateType == 'applyStartDate') ? '00:00' : '59:59';
	                    $this.val(currentTime);
	                    grid.store.getAt(selectedCellIndex).set(dateType, currentTime);
	                }
	            });

	            $('#' + target.id + ' input[type=text]').focus();
	        },

	        /**
	         * Create a datetimepicker library object for Tree Grid.
	         * The functionality is identical to the existing getGridDatePicker
	         * @param {Object} target - this object in extJs Tree Grid column.
	         * @param {String} dateType - dataIndex in extJs Tree Grid Column. (applyStart or applyEnd)
	         * @param {Object} grid - extJs Tree Grid Object.
	         * @param {Number} selectedCellIndex - extJs Tree Grid current selected row index.
	         * @param {boolean} isNextDay - Want to add to minimum date.
	         * @param {boolean} isTime - Whether to show the time.
	         * @param {Object} record - extJs Tree Grid Record Information Object.
	         * @return {void}
	         */
	        getTreeGridDatePicker: function(target, dateType, grid, selectedCellIndex, isNextDay, isTime, record) {
	            $('#' + target.id + ' input[type=text]').datetimepicker({
	                format: 'Y-m-d',
	                yearEnd: 9999,
	                timepicker: false,
	                className: 'grid-calendar',
	                minDate: isNextDay ? '+1970/01/0' + (1+global.g_nextDate) : '0001/01/01', //this.getToday(),
	                todayButton: true,
	                onSelectDate: function(currentUnixTime, $this){
	                    var currentDate = currentUnixTime.dateFormat('Y-m-d');
	                    var currentTime = currentDate + ((dateType == 'applyStart' || dateType == 'applyStartDate' || dateType == 'aplyStartDt') ? ' 00:00:00' : ' 23:59:59');
	                    $this.val(currentDate);
	                    record.set(dateType, isTime ? currentTime : currentDate);
	                }
	            });

	            $('#' + target.id + ' input[type=text]').focus();
	        },

	        /**
	         * 2017.08.17 추가
	         * 기존 getGridDateTimePicker 기능은 동일, TreeGrid의 getAt 메소드 미존재로 인해 재구현
	         */
	        /**
	         * Create a datetimepicker library object for Tree Grid. Time information appears.
	         * The functionality is identical to the existing getGridDateTimePicker
	         * @param {Object} target - this object in extJs Tree Grid column.
	         * @param {String} dateType - dataIndex in extJs Tree Grid Column. (applyStart or applyEnd)
	         * @param {Object} grid - extJs Tree Grid Object.
	         * @param {Number} selectedCellIndex - extJs Tree Grid current selected row index.
	         * @param {boolean} isNextDay - Want to add to minimum date.
	         * @param {Object} record - extJs Tree Grid Record Information Object.
	         * @return {void}
	         */
	        getTreeGridDateTimePicker: function(target, dateType, grid, selectedCellIndex, isNextDay, record) {

	            $('#' + target.id + ' input[type=text]').datetimepicker({
	                format: 'Y-m-d H:i:s',
	                yearEnd: 9999,
	                timepicker: true,
	                className: 'grid-calendar',
	                minDate: isNextDay ? '+1970/01/0' + (1+global.g_nextDate) : '0001/01/01', //this.getToday(),
	                todayButton: true,
	                onSelectDate: function(currentUnixTime, $this){
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d');
	                    currentTime += (dateType == 'applyStart' || dateType == 'applyStartDate' || dateType == 'aplyStartDt') ? ' 00:00:00' : ' 23:59:59';
	                    $this.val(currentTime);
	                    record.set(dateType, currentTime);
	                },
	                onSelectTime : function (currentUnixTime, $this) {
	                    var currentTime = currentUnixTime.dateFormat('Y-m-d H:i:s').substr(0, 14);
	                    currentTime += (dateType == 'applyStart' || dateType == 'applyStartDate' || dateType == 'aplyStartDt') ? '00:00' : '59:59';
	                    $this.val(currentTime);
	                    record.set(dateType, currentTime);
	                }
	            });

	            $('#' + target.id + ' input[type=text]').focus();
	        },

	        /**
	         * Check for future dates
	         * @param {Object} $target - jQuery Element.
	         * @param {Object} date - Set it if it is not a future date.
	         * @return {void} Show alert message
	         */
	        checkDate: function($target, date){
	            if(g_nextDate == 0) return;

	            var inDate = new XDate($target.value);
	            var nextDate = new XDate(PFUtil.getNextDate());
	            if(inDate < nextDate){
	                PFComponent.showMessage(bxMsg('selectDateErr'), 'warning');
	                $target.value = date ? date : nextDate.toString('yyyy-MM-dd HH:mm:ss');
	            }
	        },

	        /**
	         * Check for future dates
	         * cosdownload.jsp을 공통으로 사용하여 파일을 다운로드 합니다.
	         * @param {String} ifrClass - class name of iframe tag.
	         * @param {String} fileNm - The name of the file containing the extension to download.
	         * @param {String} target - Attachment or temporary file path
	         * @param {String} localFileName - The local name of the file containing the extension to download.
	         * @return {void} open window of file download
	         */
	        downLaodFile : function(ifrClass, fileNm, target, localFileName){
	        	$(ifrClass).attr('src', global.g_cosdownloadContext+'/pf_common/jsp/cosdownload.jsp?fileName=' + fileNm + '&target=' + target + '&localFileName=' + localFileName);
	        },

	        /**
	         * Rendering a combo box
	         * 콤보박스를 불러온다.
	         * @param {String|Object} source - Source data for combobox. Can be common code or Object.
	         * @param {String} selector - Selector for target <select> tag.
	         * @param {String} [initialValue=''] - Initial value.
	         * @param {boolean} [addDefault=false] - Add default option.
	         * @return {void}
	         */
	        renderComboBox: function (source, selector, initialValue = '', addDefault = false) {
	            const options = [];
				const sourceObj = typeof source === 'string' ?
					codeArrayObj[source] : source;
				const sourceArray = typeof source === 'string' ? codeArrayObj[source] :
				Object.keys(source).sort().map((key) => {
   				    return {
						code: key,
						name: source[key]
					};
				});

	            if (addDefault) {
	                var $defaultOption = $('<option>');
	                $defaultOption.val('');
	                $defaultOption.text(bxMsg('select'));
	                options.push($defaultOption);
	            }

				sourceArray.forEach((v) => {
	                const $option = $("<option>");
	                $option.val(v.code);
	                $option.text(v.name);
	                options.push($option);
				})

	            const $target = $(selector);
	            $target.html(options);
	            $target.val(initialValue);
	        },

	        /**
	         * Get Object of Handlebars compile
	         * @param {String} target - screen directory for get Template file.
	         * @param {String} template - Template file name for get Template file.
	         * @return {Object} Handlebars library object
	         */
	        getTemplate: function (target, template = 'tpl') {
	            let request = new XMLHttpRequest();
	            request.open('get', `/${target}/tpl/${template}.html`, false);
	            request.send();
	            return Handlebars.compile(request.responseText);
	        }
    };

    /**
	 * If the element has not been found by the time the DOM is fully loaded the callback function will not be called
	 * The function works by polling the DOM at intervals
     * @param {Object} jQuery Object
     * @return {void}
     */
    function extendsJQuery($) {

        /**
    	 * If the element has not been found by the time the DOM is fully loaded the callback function will not be called
    	 * The function works by polling the DOM at intervals
    	 * jQuery Prototype extends
         * @callback {$~elementReadyCallback} afterRenderFn
         * @return {void}
         */
        $.fn.elementReady = function(afterRenderFn) {
            checkRendering(this, afterRenderFn);
        };

        /**
    	 * If the element has not been found by the time the DOM is fully loaded the callback function will not be called
    	 * The function works by polling the DOM at intervals
    	 * jQuery Prototype extends
    	 * @param {Object} jQuery Object
         * @callback {$~elementReadyCallback} afterRenderFn
         * @return {void}
         */
        $.elementReady = function(selector, afterRenderFn) {
            checkRendering(selector, afterRenderFn);
        };

        /**
         * OHS 2018.01.23 주석처리 - 정확한 사용용도를 알기전까지 주석, 현재 사용되는곳도 없어보임.
        $.fn.offsetRelative = function(top){
            var $this = $(this);
            var $parent = $this.offsetParent();
            var offset = $this.position();
            if(!top) return offset; // Didn't pass a 'top' element
            else if($parent.get(0).tagName == "BODY") return offset; // Reached top of document
            else if($(top,$parent).length) return offset; // Parent element contains the 'top' element we want the offset to be relative to
            else if($parent[0] == $(top)[0]) return offset; // Reached the 'top' element we want the offset to be relative to
            else { // Get parent's relative offset
                var parent_offset = $parent.offsetRelative(top);
                offset.top += parent_offset.top;
                offset.left += parent_offset.left;
                return offset;
            }
        };
        $.fn.positionRelative = function(top){
            return $(this).offsetRelative(top);
        };
        */

        /**
    	 * Execute the callback function after the element completes rendering.
    	 * @param {Object} HTML Element Object
         * @callback {$~elementReadyCallback} afterRenderFn
         * @return {void}
         */
        function checkRendering(element, afterRenderFn) {
            var findTime = 0,
                checkInterval = setInterval(function() {

                    var $el = $(element);

                    if($el.length > 0) {
                        clearInterval(checkInterval);
                        afterRenderFn.call($el);
                        return;
                    }

                    findTime += 100;

                    if(findTime >= 5000) {
                        clearInterval(checkInterval);
                        console.log($el);
                        throw 'DOM Ready Time Out By YG';
                    }

                }, 100);
        }
    }

})(window);

// PFRequest
(function(global) {

    var requestMap = {},
        preOption = {
            commonBeforeRequest: null,
            commonSuccessHandler: null,
            commonErrorHandler: null,
            commonCompleteHandler: null,
            showMessageType : null // 2017.12.05 추가 - Show Message Type 메세지창유형
        };


    if(!$) {
        throw 'jQuery 가 먼저 로드되어 있어야함';
    }

    /**
     * PFRequest
     * @namespace PFRequest
     */
    global.PFRequest = {

            /**
        	 * Execute transactions by HTTP get method
        	 * @param {String} url - Uniform Resource Locator for Transactions
        	 * @param {String} param - Input data for transactions
             * @param {PFRequestOption} option - configuration data for PFRequest
             * @return {void}
             */
    		'get': function(url, param, option) {
	            return request('GET', url, param, option);
	        },

            /**
        	 * Execute transactions by HTTP post method
        	 * @param {String} url - Uniform Resource Locator for Transactions
        	 * @param {String} param - Input data for transactions
             * @param {PFRequestOption} option - configuration data for PFRequest
             * @return {void}
             */
	        'post': function(url, param, option) {

	            // 권한체크
	            if(writeYn != 'Y'){
	                PFComponent.showMessage(bxMsg('AccessError'), 'warning');
	                return;
	            }

	            return request('POST', url, param, option);
	        },

            /**
        	 * Execute transactions by HTTP delete method
        	 * @param {String} url - Uniform Resource Locator for Transactions
        	 * @param {String} param - Input data for transactions
             * @param {PFRequestOption} option - configuration data for PFRequest
             * @return {void}
             */
	        'delete': function(url, param, option) {
	            return request('DELETE', url, param, option);
	        },

            /**
        	 * Execute transactions by HTTP put method
        	 * @param {String} url - Uniform Resource Locator for Transactions
        	 * @param {String} param - Input data for transactions
             * @param {PFRequestOption} option - configuration data for PFRequest
             * @return {void}
             */
	        'put': function(url, param, option) {
	            return request('PUT', url, param, option);
	        },

            /**
        	 * Execute transactions by HTTP longpoll method
        	 * @param {String} url - Uniform Resource Locator for Transactions
        	 * @param {String} param - Input data for transactions
             * @param {PFRequestOption} option - configuration data for PFRequest
             * @return {void}
             */
	        'longpoll': function(url, param, option) {
	            if(!option) {
	                option = param;
	                param = null;
	            }

	            (function poll() {
	                $.ajax({
	                    url: url,
	                    dataType: 'json',
	                    timeout: 600000,
	                    success: function(data) {
	                        option.success(data);
	                        poll();
	                    },
	                    error: function(responseError) {
	                        console.log('longpoll error');
	                    }
	                });
	            })();
	        },

            /**
        	 * Execute transactions by HTTP preSet(permitSameRequest) method
        	 * [중복 요청 동기여부]
        	 * @link {PreOprions} preOption - permit same request method
             * @param {PFRequestOption} option - configuration data for PFRequest
             * @return {void}
             */
	        'preSet': function(option) {
	            $.extend(preOption, option);
	        }
    };

    /**
	 * Execute transactions
	 * @param {String} method - HTTP method
	 * @param {String} url - Uniform Resource Locator for Transactions
	 * @param {String} param - Input data for transactions
     * @param {PFRequestOption} option - configuration data for PFRequest
     * @return {void}
     */
    function request(method, url, param, option) {

        var requestOption, successFn,
            bxmHeader, bxmParam;

        var tntInstId;
        if(!param.tntInstId){
            tntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
        }else{
            tntInstId = param.tntInstId;
        }

        if(!tntInstId){
            //location.href = '/';
        }

        var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

        if(!option) {

            if(!param) {    //param = null;
                option = {};

                param = {};
                param.tntInstId = tntInstId;
                param.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '",' +
                    ' "motherTntInstId" : "' + getCookie('motherTntInstId') + '",' +
                    ' "lastModifier" : "' + getCookie('loginId') + '"}';
            }else {
                option = param;

                param = {};
                param.tntInstId = tntInstId;
                param.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '",' +
                    ' "motherTntInstId" : "' + getCookie('motherTntInstId') + '",' +
                    ' "lastModifier"   : "' + getCookie('loginId') + '"}';
            }
        }else{
            param.tntInstId = tntInstId;
            param.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '",' +
                ' "motherTntInstId" : "' + getCookie('motherTntInstId') + '",' +
                ' "lastModifier"   : "' + getCookie('loginId') + '"}';
        }

        if(param.projectId && !param.projectTypeCode){
            param.projectTypeCode = parent.taskList[param.projectId] ?  parent.taskList[param.projectId].projectTypeCode : '';
        }

        option = option || param;

        // BXM 인 경우
        if(g_serviceType == g_bxmService && (method=='GET' || method=='POST')){
            method = 'POST';                            // 고정
            url = '/serviceEndpoint/json/request.json';  // 고정
            bxmHeader = option.bxmHeader;
            bxmHeader.locale = getCookie('lang');
            bxmParam = param;
            bxmParam.commonHeader = {
                loginTntInstId: loginTntInstId,
                motherTntInstId: getCookie('motherTntInstId'),
                lastModifier : getCookie('loginId')
            };
            delete bxmParam.commonHeaderMessage;
            param = {
                header: bxmHeader,
                input : bxmParam
            };
        }

        requestOption = {
            type: method,
            url: url,
            data: param
        };

        if(typeof option === 'function') {
            successFn = option
        }else {
            successFn = option.success;
        }

        if(option.contentType) {
            requestOption.contentType = option.contentType
        }else {
            if(method === 'POST') {
                requestOption.contentType = 'application/json; charset=UTF-8';
                requestOption.data = (typeof param === 'string')? param : JSON.stringify(param);
            }
        }
        // OHS 2017.12.05 - 메세지창유형
        preOption.showMessageType = option.showMessageType;

        option.cache && (requestOption.cache = option.cache);
        // OHS 2017.02.22 수정 - async 기본값은 true임 '!' 추가
        !option.async && (requestOption.async = option.async);

        requestOption.beforeSend = function() {
            if(typeof preOption.commonBeforeRequest === 'function' && preOption.commonBeforeRequest() === false) {
                return;
            }
            typeof option.beforeSend === 'function' && option.beforeSend();
        };

        requestOption.success = function(response) {
            var data = response,
                responseData = response,
                errorMessage = '';

            if(typeof data === 'string') {
                try {
                    responseData = JSON.parse(responseData);
                    data = responseData;
                }catch(e){
                    if(e.name == "SyntaxError"){
                        PFComponent.showMessage(bxMsg('SyntaxErrorMsg'), 'warning');
                        location.href = '/';
                    }
                }
            }


        	// OHS 20171221 추가 - underscore.js 오버라이드
        	var escapeMap_override = {
        			'&': '&amp;',
        			'<': '&lt;',
        			'>': '&gt;',
        			'\\"': '&quot;',
        			"'": '&#39;',
        			'`': '&#x60;'
        	};
        	var unescapeMap = _.invert(escapeMap_override);

        	var createEscaper_override = function(map) {
        		var escaper_override = function(match) {
        			return map[match];
        		};
        	    var source = '(?:' + _.keys(map).join('|') + ')';
        	    var testRegexp = RegExp(source);
        	    var replaceRegexp = RegExp(source, 'g');
        	    return function(string) {
        	    	string = string == null ? '' : '' + string;
        	    	return testRegexp.test(string) ? string.replace(replaceRegexp, escaper_override) : string;
        	    };
        	};
        	var unescape_ovveride = createEscaper_override(unescapeMap);


        	  // 2018.02.09 에러 처리를 먼저 할 수 있도록 조건 변경
            if (responseData === null || typeof responseData !== 'object') {
                document.location.href = '/';
                // 2018.02.27 responseData가 Object가 아닌 경우 루트 페이지 이동 처리.
            } else if('responseError' in responseData) {
                responseData.responseError.forEach(function(error) {
                    // Error Message 정비. 메세지만 출력
                    //errorMessage += '<p>['+error.errorCode + '] '+error.errorMsg+'</p>';
                    errorMessage += '<p>'+error.errorMsg+'</p>';
                });

                PFUI.use('pfui/overlay',function(overlay){
                	if(preOption.showMessageType == 'W') {
                		PFComponent.showMessage(errorMessage, 'warning');
                		preOption.showMessageType = null;
                	}
                	else {
                		PFComponent.showMessage(errorMessage, 'error');
                	}
                });
                return false;
            }else if('header' in responseData && 'messageCode' in responseData.header && responseData.header.messageCode != '') {
                responseData.header.messages.forEach(function(errorMsg) {
                    // Error Message 정비. 메세지만 출력
                    //errorMessage += '<p>['+error.errorCode + '] '+error.errorMsg+'</p>';
                    errorMessage += '<p>'+errorMsg+'</p>';
                });

                PFUI.use('pfui/overlay',function(overlay){
                 	if(preOption.showMessageType == 'W') {
                		PFComponent.showMessage(errorMessage, 'warning');
                		preOption.showMessageType = null;
                	}
                	else {
                        PFComponent.showMessage(errorMessage, 'error');
                	}
                });
                return false;
            }else if ('errorMsg' in responseData) {
                document.location.href = '';
            // error 처리  -->

            } else if('responseMessage' in responseData) {
            	// OHS20171221 추가
            	  responseData.responseMessage = unescape_ovveride(JSON.stringify(responseData.responseMessage));
            	if(responseData.responseMessage) responseData.responseMessage = JSON.parse(responseData.responseMessage);

                data = responseData.responseMessage;

            }else if('ModelMap' in responseData && 'responseMessage' in responseData.ModelMap) {
            	// OHS20171221 추가
            	responseData.ModelMap.responseMessage = unescape_ovveride(JSON.stringify(responseData.ModelMap.responseMessage));
          	  	if(responseData.ModelMap.responseMessage) responseData.ModelMap.responseMessage = JSON.parse(responseData.ModelMap.responseMessage);

                data = responseData.ModelMap.responseMessage;
            }

            if(typeof preOption.commonSuccessHandler === 'function' && preOption.commonSuccessHandler(data) === false) {
                return;
            }
            typeof successFn === 'function' && successFn(data, responseData);
        };

        requestOption.error = function(jqXHR, textStatus) {
            if(typeof preOption.commonErrorHandler === 'function' && preOption.commonErrorHandler(jqXHR, textStatus) === false) {
                return;
            }
            typeof option.error === 'function' && option.error(jqXHR, textStatus);
        };

        requestOption.complete = function(jqXHR, textStatus) {
            if(typeof preOption.commonCompleteHandler === 'function' && preOption.commonCompleteHandler(jqXHR, textStatus) === false) {
                return;
            }

            typeof option.complete === 'function' && option.complete(jqXHR, textStatus);
            delete requestMap[url];
        };

        $.ajax(url, requestOption);
    }

})(window);

// PFPopup
(function(global) {

  /**
   * PFPopup
   * @namespace PFPopup
   */
  global.PFPopup = {};

  /**
   * Get template of popup with path and template name.
   * @param {string} target Type of popup.
   * @param {string} [template='tpl'] Name of template file. Default is 'tpl'.
   */
  global.PFPopup.getPopupTemplate = function (target, template = 'tpl') {
    let request = new XMLHttpRequest();
    request.open('get', `/pf_common/popup/${target}/tpl/${template}.html`, false);
    request.send();
    return Handlebars.compile(request.responseText);
  };

  /**
   * Get checkbox model with option.
   * @param {boolean} [multi=false] Allow multi select.
   * @param {boolean} [readOnly=false] Create popup as read-only mode.
   */
  global.PFPopup.getCheckboxModel = function (multi, readOnly) {
      return Ext.create('Ext.selection.CheckboxModel', {
          mode: multi && !readOnly ? 'MULTI' : 'SINGLE',
          checkOnly: readOnly || multi,
          renderer: (value, p) => {
              if (readOnly) { p.tdCls += 'checkbox-disabled '; }
              p.tdCls += 'x-grid-cell-special ';
              return '<div class="x-grid-row-checker">&nbsp;</div>';
          },
      });
  };
})(window);

/**
 * makeParamFromForm option
 * @typedef {Object} MakeParamFromFormOption
 * @property {boolean} ignoreEmpty - Whether to assemble into a JSON Object when there is no value.
 * @property {String} dateFormat - Date format, default format is 'yyyy-MM-dd HH:mm:ss'
 * @property {boolean} isStringfy Whether or not to use JSON.stringify().
 */

/**
 * PFRequest option
 * @typedef {Object} PFRequestOption
 * @property {Object} bxmHeader - JSON data in headers for bxm framework transactions.
 * @property {Function} success - Functions to execute when a transaction succeeds.
 * @property {String} contentType - content type.
 * @property {String} showMessageType - show message type. default is Error mode. (W : warning)
 * @property {boolean} [cache=true] - Whether the cache is applied. default is true.
 * @property {boolean} [async=false] - Whether the async is applied. default is false.
 * @property {Function} beforeSend - Functions to execute before Transactions.
 * @property {Function} error - Functions to execute when a transaction error.
 * @property {Function} complete - Functions to execute when a transaction complete.
 */

/**
 * permitSameRequest option
 * @typedef {Object} PreOprions
 * @property {Function} commonBeforeRequest - function to execute common before request.
 * @property {Function} commonSuccessHandler - function to execute common success handler.
 * @property {Function} commonErrorHandler - function to execute common error handler.
 * @property {Function} commonCompleteHandler - function to execute common complete handler.
 * @property {String} [showMessageType=ErrorMode] - show message type. default is Error mode. (W : warning)
 */