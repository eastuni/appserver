/**
 * @fileOverview Provides several features for validation of product information.
 * @author BankwareGlobal ProductFactory Team
 */

(function(global) {

    var PFValidation = { };

    /**
     * Special character check By jQuery Element
     * @param {Object} selector - jQuery Element.
     * @return {boolean} check result
     */
    PFValidation.specialCharacter = function(selector) {
        var validateItem = $('body').find(selector);
        var checkResult = true;

        $.each(validateItem, function (index, formItem) {
            var text = $(formItem).val();
            var special_str = /[,.`~!@#$%^&*+=|\\\'\";:\/?]/;

            if (special_str.test(text)) {
                var message = bxMsg('specialCharacterMsg');
                PFComponent.showMessage(message, 'warning');
                checkResult = false;
            }
        });

        return checkResult;
    };

    /**
     * Special character check By Value
     * @param {String} value - check target value
     * @return {boolean} check result
     */
    PFValidation.specialCharacterValue = function(value) {
        var special_str = /[,.`~!@#$%^&*+=|\\\'\";:\/?]/;

        if (special_str.test(value)) {
            var message = bxMsg('specialCharacterMsg');
            PFComponent.showMessage(message, 'warning');

            return true;
        }

        return false;
    };

    /**
     * When the focus event is activated, drag all
     * @param {Object} $root - jQuery Element
     * @return {void}
     */
    PFValidation.dragAll = function($root) {
        return function (selector) {
            $($root).on('focus', selector, function () {
                var inputText = this;

                setTimeout(function() {
                    inputText.select();
                }, 100)
            })
        };
    };

    /**
     * mandatory check
     * @param {Object} selector - jQuery Element
     * @return {boolean} - If it is an mandatory but empty value return false else false 
     */
    PFValidation.mandatoryCheck = function (selector) {

        var validateItem = $('body').find(selector);
        var checkResult = true;

        $.each(validateItem, function (index, formItem) {

            var formText = $(formItem).val().split(' ').join('');

            if (formText === '') {
                var message = bxMsg('Z_EmptyInputValue');
                PFComponent.showMessage(message, 'warning');

                checkResult = false;
                return;
            }
        });

        return checkResult;
    };

    /**
     * popup mandatory check
     * @param {Object} selector - jQuery Element
     * @return {boolean} - If it is an mandatory but empty value return false else false 
     */
    PFValidation.popupMandatoryCheck = function (selector) {

        var validateItem = $('body').find(selector);
        var checkResult = true;

        $.each(validateItem, function (index, formItem) {

        	if($(formItem).val()) {
                var formText = $(formItem).val().split(' ').join('');

                if (formText === '') {
                    var message = bxMsg('Z_EmptyInputValue_popup');
                    PFComponent.showMessage(message, 'warning');

                    checkResult = false;
                    return;
                }        		
        	}
        	else {
                var message = bxMsg('Z_EmptyInputValue_popup');
                PFComponent.showMessage(message, 'warning');

                checkResult = false;
                return;        		
        	}

        });

        return checkResult;
    };

    /**
     * min, max, default, increase value check
     * @param {Object} $el - jQuery Element
     * @param {String} minSelector - min selector class name
     * @param {String} maxSelector - max selector class name
     * @param {String} defaultSelector - default selector class name
     * @param {String} increaseSelector - increase selector class name
     * @return {boolean} - if check error then false 
     */
    PFValidation.minMaxCheck = function($el, minSelector, maxSelector, defaultSelector, increaseSelector){
        var minVal = $el.find(minSelector).val().split(',').join(''),
            maxVal = $el.find(maxSelector).val().split(',').join(''),
            defaultVal = ($el.find(defaultSelector).length == 0) ? null : $el.find(defaultSelector).val().split(',').join(''),
            increaseVal = ($el.find(increaseSelector).length == 0) ? null : $el.find(increaseSelector).val().split(',').join(''),
            checkResult = true;

        minVal = parseFloat(minVal);
        maxVal = parseFloat(maxVal);
        defaultVal = (!defaultVal) ? null: parseFloat(defaultVal);
        increaseVal = (!increaseVal) ? null: parseFloat(increaseVal);

        if (minVal > maxVal) {
            checkResult = false;
        }

        if (defaultVal !=0 && defaultVal != null  && (minVal > defaultVal)) {
            checkResult = false;
        }

        if (defaultVal !=0 && defaultVal != null  && (defaultVal > maxVal)) {
            checkResult = false;
        }

        // 2017.01.23 OHS 수정, 증가값체크로직 수정
        /*
        if (increaseVal != null  && (increaseVal > maxVal)) {
            checkResult = false;
        }
        */

        // 증가값 0보다 클때 최소값과 최대값의 구간에 정상적인 값인지 체크
        // OHS 2017.07.10 수정 - 증가값이 실수일경우 처리불가
        //if (increaseVal != null  && increaseVal > 0 && (maxVal - minVal) % increaseVal != 0) {

        if (increaseVal != null  && increaseVal > 0 && ((maxVal - minVal) / increaseVal) % 1 != 0) {
            checkResult = false;
        }

        // 증가값이 0일때 최소값과 최대값이 0이 아닌지 체크
        if (increaseVal != null && increaseVal == 0 && (minVal != 0 || maxVal != 0)) {
        	// 최소<최대 일때만 false (최소=최대 일때는 증가값=0 가능)
        	if(minVal < maxVal){
        		checkResult = false;
        	}
        }

        // 증가값이 0보다 작을때 최소값과 최대값이 모두 음수인지 체크
        if (increaseVal != null && increaseVal < 0 && (minVal > 0 || maxVal > 0)) {
        	checkResult = false;
        }
        return checkResult;
    };

    /**
     * min, max, default, increase value check in product level
     * 상품레벨 범위조건의 값체크
     * @param {Object} $el - jQuery Element
     * @param {String} minSelector - min selector class name
     * @param {String} maxSelector - max selector class name
     * @param {String} defaultSelector - default selector class name
     * @param {String} increaseSelector - increase selector class name
     * @return {String} - if check error then error message 
     */
    PFValidation.minMaxCheckForPfLvl = function($el, minSelector, maxSelector, defaultSelector, increaseSelector) {
        var minVal = $el.find(minSelector).val().split(',').join(''),
        maxVal = $el.find(maxSelector).val().split(',').join(''),
        defaultVal = ($el.find(defaultSelector).length == 0) ? null : $el.find(defaultSelector).val().split(',').join(''),
        increaseVal = ($el.find(increaseSelector).length == 0) ? null : $el.find(increaseSelector).val().split(',').join(''),
        //checkResult = true;
        checkResultMsg; // OHS 2017.02.13 Return값 Msg로 처리

	    minVal = parseFloat(minVal);
	    maxVal = parseFloat(maxVal);
	    defaultVal = (!defaultVal) ? null: parseFloat(defaultVal);
	    increaseVal = (!increaseVal) ? null: parseFloat(increaseVal);


	    // 1. 최소값 == 최대값 == 기본값인데 증가값이 0이 아닐경우
	    if((minVal == maxVal) && (maxVal == defaultVal)) {
	    	if(increaseVal != 0) {
	    		//checkResult = false;
	    		//checkResultMsg = '[상품레벨] 최소 == 최대 == 기본 일경우 증가값은 0 이어야 합니다.';
	    		checkResultMsg = bxMsg('pfLvlCheck01');
	    	}
	    }
	    else if((minVal == maxVal) && (maxVal != defaultVal)) {
	    	//checkResult = false;
	    	//checkResultMsg = '[상품레벨] 최소 == 최대 일경우 기본은 최소,최대와 같아야 합니다.';
	    	checkResultMsg = bxMsg('pfLvlCheck02');
	    }
	    else {
		    // 2. 최소값 > 최대값이면 에러
		    if (minVal > maxVal) {
		        //checkResult = false;
		        //checkResultMsg = '[상품레벨] 최소 < 최대 이어야 합니다.';
		    	checkResultMsg = bxMsg('pfLvlCheck03');
		    }
		    else {
		    	// 3. 최대값 > 최소값이나 기본값, 증가값이 0이 아니면 에러
		    	if(defaultVal != 0 || increaseVal != 0) {
		    		//checkResult = false;
		    		//checkResultMsg = '[상품레벨] 최대 < 최소 일경우 기본, 증가는 0이어야 합니다.';
		    		checkResultMsg = bxMsg('pfLvlCheck04');
		    	}
		    }
	    }

	    return checkResultMsg;
    }

    /**
     * Check the key down events in the grid
     * @param {Object} e - jQuery Element
     * @param {Number} integer - Integer
     * @param {Decimal} decimal - Decimal
     * @return {void} 
     */
    PFValidation.gridFloatCheckKeydown = function(e, integer, decimal) {
        var inputVal = e.target.value,
            inputValSplit = inputVal.split('.'),
            regEx;

        if(!decimal || decimal == 0){
            regEx = new RegExp("^\\.|(\\d{1,3}(\\,\\d{3})*|(\\d{1,"+integer+"}))$");
        }else{
            regEx = new RegExp("^\\.|(\\d{1,3}(\\,\\d{3})*|(\\d{1,"+integer+"})([.]\\d{0,"+decimal+"})?)$");
        }

        //typing dot && (first typing or one more dot typing)
        if (((e.keyCode == 190 || e.keyCode == 110) && (/*inputVal == "" ||*/ inputValSplit.length == 2))) {
            e.preventDefault();
        } else if (inputVal == "") {
            //when first typing, do nothing
        } else if (!regEx.test(inputVal)) {
            e.preventDefault();
        }

        // Allow: backspace, delete, tab, escape, and enter
        if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 ||
                // allow decimals
            e.keyCode == 190 || e.keyCode == 110 ||
                // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
        } else {
            // Ensure that it is a number and stop the keypress
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }
    };

    /**
     * Check the key down events of the range type grid
     * @param {Object} e - jQuery Element
     * @param {Number} integer - Integer
     * @param {Decimal} decimal - Decimal
     * @return {void} 
     */
    PFValidation.gridFloatCheckKeydownForRangeType = function(e, integer, decimal) {
        var inputVal = e.target.value,
            inputValSplit = inputVal.split('.'),
            regEx = new RegExp("^\\-|^\\.|(\\d{1,3}(\\,\\d{3})*|(^[-]?\\d{1,"+integer+"})([.]\\d{0,"+decimal+"})?)$");

        //typing dot && (first typing or one more dot typing)
        if (((e.keyCode == 190 || e.keyCode == 110) && (/*inputVal == "" ||*/ inputValSplit.length == 2))) {
            e.preventDefault();
        } else if (inputVal == "") {
            //when first typing, do nothing
        } else if (!regEx.test(inputVal)) {
            e.preventDefault();
        }

        // Allow: backspace, delete, tab, escape, and enter
        if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 189 ||
                // allow decimals
            e.keyCode == 190 || e.keyCode == 110 ||
                // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
        } else {
            // Ensure that it is a number and stop the keypress
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }
    };

    /**
     * Check the key up events of the range type grid
     * @param {Object} e - jQuery Element
     * @param {Number} integer - Integer
     * @param {Decimal} decimal - Decimal
     * @return {void} 
     */
    PFValidation.gridFloatCheckKeyupForRangeType = function(e, integer, decimal) {
        var inputVal = e.target.value,
            inputValSplit = inputVal.split('.'),
            cutInt, cutDec;
        var $target = $(e.currentTarget);

        if (inputValSplit[0].length == 0) {
            cutInt = '';
        } else if (inputValSplit[0].length > integer) {
            cutInt = inputValSplit[0].substr(0, integer);
        } else {
            cutInt = inputValSplit[0];
        }

        if (inputValSplit[1]) {
            if (inputValSplit[1].length > decimal) {
                cutDec = '.' + inputValSplit[1].substr(0, decimal);
            } else {
                if(e.keyCode!=189){
                    cutDec = '.' + inputValSplit[1];
                }else{
                    cutDec = '.' + inputValSplit[1].substr(0,inputValSplit[1].length);
                    if(cutDec == '.'){
                        cutDec = '';
                    }
                }
            }
        } else {
            cutDec = '';
        }

        if (inputValSplit[0].length == 0 ||inputValSplit[0].length > integer || (inputValSplit[1] && inputValSplit[1].length > decimal)) {
            $target.find('input').val(cutInt + cutDec);
        }

        var resultValue = cutInt + cutDec;
        if(resultValue.length > 1 && !$.isNumeric(resultValue)){
            var finalValue = resultValue.substr(0, resultValue.length-1);
            if(finalValue=='-'){
                $target.find('input').val('');
                $target.find('div').text('');
            }else{
                $target.find('input').val(finalValue);
                $target.find('div').text(finalValue);
            }
        }else{
            if(inputValSplit[1]!=''){
                $target.find('input').val(resultValue);
                $target.find('div').text(resultValue);
            }
        }

    };

    /**
     * Check the key up events in the grid
     * @param {Object} e - jQuery Element
     * @param {Number} integer - Integer
     * @param {Decimal} decimal - Decimal
     * @return {void} 
     */
    PFValidation.gridFloatCheckKeyup = function(e, integer, decimal) {
        var inputVal = e.target.value,
            inputValSplit = inputVal.split('.'),
            cutInt, cutDec;


        if (inputValSplit[0].length == 0) {
            cutInt = '';
        } else if (inputValSplit[0].length > integer) {
            cutInt = inputValSplit[0].substr(0, integer);
        } else {
            cutInt = inputValSplit[0];
        }

        if (inputValSplit[1]) {
            if (inputValSplit[1].length > decimal) {
                cutDec = '.' + inputValSplit[1].substr(0, decimal);
            } else {
                cutDec = '.' + inputValSplit[1];
            }
        } else {
            cutDec = '';
        }

        if (inputValSplit[0].length == 0 ||inputValSplit[0].length > integer || (inputValSplit[1] && inputValSplit[1].length > decimal)) {
            $(e.currentTarget).find('input').val(cutInt + cutDec);
        }

    };

    /**
     * Convert the values to match the grid of range type and return.
     * @param {String} value - value
     * @param {Number} integer - Integer
     * @param {Decimal} decimal - Decimal
     * @param {boolean} convert - convert yes or no
     * @return {void} 
     */
    PFValidation.gridFloatCheckRendererForRangeType = function(value, integer, decimal, convert) {
        var isNegativeNumber = value.substr(0,1) == '-';
        if(!value) {
            return '0.000000';
        }
        var regEx  = /(\d+)(\d{3})/,
            inputVal = value.split('.'),
            cutInt = (inputVal[0]) ? inputVal[0] : 0,
            cutDec = (inputVal[1]) ? inputVal[1] : '',
            val,
            i = 0;

        if (parseFloat(value) == '0') {
            var decimalString = '';
            for (i = 0; i < decimal ; i++) {
                decimalString = decimalString + '0';
            }
            val = '0' + '.' + decimalString;
        } else {

            if (cutInt.length < 17) {
                cutInt = parseInt(cutInt) + '';
            } else if (cutInt.length == 17 && cutInt.substr(0,1) == '0') {
                cutInt = parseInt(cutInt) + '';
            }

            if (!convert) {
                while(regEx.test(cutInt)) {
                    cutInt = cutInt.replace(regEx, "$1,$2");
                }
            }

            if (cutDec != '') {
            	var decimalLength = cutDec.length;
                // OHS20180417 - 아래로직 수정
                // 자릿수 값으로 세팅한 decimal length보다 실제 값으로 입력된 decimal 값이 클경우 처리
                if(decimal > decimalLength) {
                	for (i = 0; i < decimal - decimalLength ; i++) {
                		cutDec = cutDec + '0';
                	}
                }
                // 입력된 decimal 값이 자릿수 값으로 세팅한 decimal length 보다 클경우 잘라주는 작업 처리
                else if(decimal < decimalLength) {
                	cutDec = cutDec.substring(0, decimal);
                }
            } else {
                for (i = 0; i < decimal ; i++) {
                    cutDec = cutDec + '0';
                }
            }

            val = cutInt+'.'+cutDec;
        }

        if(isNegativeNumber && cutInt == '0'){
            val = '-' + val;
        }

        return val;
    };

    /**
     * Convert the values to match the grid and return.
     * @param {String} value - value
     * @param {Number} integer - Integer
     * @param {Decimal} decimal - Decimal
     * @param {boolean} convert - convert yes or no
     * @return {void} 
     */
    PFValidation.gridFloatCheckRenderer = function(value, integer, decimal, convert) {
        if(!value) {
            if(!decimal || decimal==0){
                return 0;
            }
            return '0.000000';
        }
        var regEx  = /(\d+)(\d{3})/,
            inputVal = value.toString().split('.'),
            cutInt = (inputVal[0]) ? inputVal[0] : 0,
            cutDec = (inputVal[1]) ? inputVal[1] : '',
            val,
            i = 0;

        if (parseFloat(value) == '0') {
            var decimalString = '';
            for (i = 0; i < decimal ; i++) {
                decimalString = decimalString + '0';
            }
            val = '0' + '.' + decimalString;
        } else {

            if (cutInt.length < 17) {
                cutInt = parseInt(cutInt) + '';
            } else if (cutInt.length == 17 && cutInt.substr(0,1) == '0') {
                cutInt = parseInt(cutInt) + '';
            }

            if (!convert) {
                while(regEx.test(cutInt)) {
                    cutInt = cutInt.replace(regEx, "$1,$2");
                }
            }

            if (cutDec != '') {
                var decimalLength = cutDec.length;
                // OHS20180417 - 아래로직 수정
                // 자릿수 값으로 세팅한 decimal length보다 실제 값으로 입력된 decimal 값이 클경우 처리
                if(decimal > decimalLength) {
                	for (i = 0; i < decimal - decimalLength ; i++) {
                		cutDec = cutDec + '0';
                	}
                }
                // 입력된 decimal 값이 자릿수 값으로 세팅한 decimal length 보다 클경우 잘라주는 작업 처리
                else if(decimal < decimalLength) {
                	cutDec = cutDec.substring(0, decimal);
                }
            } else {
                for (i = 0; i < decimal ; i++) {
                    cutDec = cutDec + '0';
                }
            }

            val = cutInt+'.'+cutDec;
        }

        if(!decimal || decimal==0){
            val = val.split('.')[0];
        }

        return val;
    };

    /**
     * Number check
     * @param {Object} e - event object.
     * @return {void} 
     */
    PFValidation.numberCheck = function(e) {
        // Allow: backspace, delete, tab, escape, and enter
        if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 ||
                // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
        } else {
            // Ensure that it is a number and stop the keypress
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }
    };

    /**
     * Float Check for range type
     * @param {Object} $el - jQuery Element
     * @return {Function} - keydown, keyup, blur, focus events check function. 
     */
    PFValidation.floatCheckForRangeType = function($el) {
        return function(selector, integer, decimal) {
            $($el).on('keydown', selector, function(e){
                var inputVal = $(e.currentTarget).val(),
                    inputValSplit = inputVal.split('.'),
                    regEx = new RegExp("^\\-|^\\.|(\\d{1,3}(\\,\\d{3})*|(\\d{1,"+integer+"})([.]\\d{0,"+decimal+"})?)$");

                //typing dot && (first typing or one more dot typing)
                if (((e.keyCode == 190 || e.keyCode == 110) && (/*inputVal == "" ||*/ inputValSplit.length == 2))) {
                    e.preventDefault();
                } else if (inputVal == "") {
                    //when first typing, do nothing
                } else if (!regEx.test(inputVal)) {
                    e.preventDefault();
                }

                // Allow: backspace, delete, tab, escape, and enter
                if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 189 ||
                        // allow decimals
                    e.keyCode == 190 || e.keyCode == 110 ||
                        // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                        // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    // let it happen, don't do anything
                } else {
                    // Ensure that it is a number and stop the keypress
                    if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                }
            }).on('keyup', selector, function (e) {
                var inputVal = $(e.currentTarget).val(),
                    inputValSplit = inputVal.split('.'),
                    cutInt, cutDec;

                var isNegativeNumber = $(e.currentTarget).val().substr(0,1) == '-';

                integer = isNegativeNumber ? integer+1 : integer;

                if (inputValSplit[0].length == 0) {
                    cutInt = '';
                } else if (inputValSplit[0].length > integer) {
                    cutInt = inputValSplit[0].substr(0, integer);
                } else {
                    cutInt = inputValSplit[0];
                }

                if (inputValSplit[1]) {
                    if (inputValSplit[1].length > decimal) {
                        cutDec = '.' + inputValSplit[1].substr(0, decimal);
                    } else {
                        cutDec = '.' + inputValSplit[1];
                    }
                } else {
                    cutDec = '';
                }

                // OHS20150323 add, decimal == 0 이면 정수부만 세팅처리
                if(decimal == 0) {
                    $(e.currentTarget).val(cutInt.split('.').join(''));
                } else if (inputValSplit[0].length == 0 ||inputValSplit[0].length > integer || (inputValSplit[1] && inputValSplit[1].length > decimal)) {
                    $(e.currentTarget).val(cutInt + cutDec);
                }

                var resultValue = cutInt + cutDec;
                if(resultValue.length > 1 && !$.isNumeric(resultValue)){
                    var finalValue = resultValue.substr(0, resultValue.length-1);
                    if(finalValue=='-'){
                        $(e.currentTarget).find('input').val('');
                        $(e.currentTarget).find('div').text('');
                    }else{
                        $(e.currentTarget).find('input').val(finalValue);
                        $(e.currentTarget).find('div').text(finalValue);
                    }
                }else{
                    if(inputValSplit[1]!=''){
                        $(e.currentTarget).find('input').val(resultValue);
                        $(e.currentTarget).find('div').text(resultValue);
                    }
                }

            }).on('blur', selector, function(e){
                var regEx  = /(\d+)(\d{3})/,
                    inputVal = e.target.value.split('.'),
                    // KYL20180720 - cutInt가 comma를 포함하고 있으면 parseInt시 인식을 제대로 못해서 comma 없애는 .replace(/,/g,'') 추가 
                    cutInt = (inputVal[0]) ? inputVal[0].replace(/,/g,'') : 0,                    		
                    cutDec = (inputVal[1]) ? inputVal[1] : '',
                    value,
                    i = 0;

                var isNegativeNumber = $(e.currentTarget).val().substr(0,1) == '-';

                // OHS20150420 add. decimal == 0 이면 정수부만 세팅처리 '.' 제거
                if (parseFloat(e.target.value) == '0' || isNaN(parseFloat(e.target.value))) {
                    if(decimal == 0) {
                        value = '0';
                    } else {
                        var decimalString = '';
                        for (i = 0; i < decimal ; i++) {
                            decimalString = decimalString + '0';
                        }
                        value = '0' + '.' + decimalString;
                    }
                } else {

                    if (cutInt.length < 17) {
                        cutInt = parseInt(cutInt) + '';
                    } else if (cutInt.length == 17 && cutInt.substr(0,1) == '0') {
                        cutInt = parseInt(cutInt) + '';
                    }

                    while(regEx.test(cutInt)) {
                        cutInt = cutInt.replace(regEx, "$1,$2");
                    }

                    if (cutDec != '') {
                    	var decimalLength = cutDec.length;
                        // OHS20180417 - 아래로직 수정
                        // 자릿수 값으로 세팅한 decimal length보다 실제 값으로 입력된 decimal 값이 클경우 처리
                        if(decimal > decimalLength) {
                        	for (i = 0; i < decimal - decimalLength ; i++) {
                        		cutDec = cutDec + '0';
                        	}
                        }
                        // 입력된 decimal 값이 자릿수 값으로 세팅한 decimal length 보다 클경우 잘라주는 작업 처리
                        else if(decimal < decimalLength) {
                        	cutDec = cutDec.substring(0, decimal);
                        }
                    } else {
                        for (i = 0; i < decimal ; i++) {
                            cutDec = cutDec + '0';
                        }
                    }

                    if(decimal == 0) {
                        // decimal == 0 일경우 정수부만 처리
                        value = cutInt.split('.').join('');
                    } else {
                        value = cutInt+'.'+cutDec;
                    }
                }

                if(isNegativeNumber && cutInt == 0){
                    value = parseFloat('-' + value) + '';
                    if(value == '-0'){
                        var decimalString = '';
                        for (i = 0; i < decimal ; i++) {
                            decimalString = decimalString + '0';
                        }
                        value = '0' + '.' + decimalString;
                    }
                }

                if(!$.isNumeric(value.split(',').join(''))){
                    var decimalString = '';
                    for (i = 0; i < decimal ; i++) {
                        decimalString = decimalString + '0';
                    }
                    value = '0' + '.' + decimalString;
                }

                $(e.currentTarget).val(value);
            }).on('focus', selector, function(e){
                var regEx  = /(\d+)(\,)(\d{3})/,
                    inputVal = e.target.value;

                while(regEx.test(inputVal)) {
                    inputVal = inputVal.replace(regEx, "$1$3");
                }
                $(e.currentTarget).val(inputVal);
            })
        };
    };

    /**
     * Float Check
     * @param {Object} $el - jQuery Element
     * @return {Function} - keydown, keyup, blur, focus events check function. 
     */
    PFValidation.floatCheck = function($el) {
        return function(selector, integer, decimal) {
            $($el).on('keydown', selector, function(e){
                var inputVal = $(e.currentTarget).val(),
                    inputValSplit = inputVal.split('.'),
                    regEx = new RegExp("^\\.|(\\d{1,3}(\\,\\d{3})*|(\\d{1,"+integer+"})([.]\\d{0,"+decimal+"})?)$");

                //typing dot && (first typing or one more dot typing)
                if (((e.keyCode == 190 || e.keyCode == 110) && (/*inputVal == "" ||*/ inputValSplit.length == 2))) {
                    e.preventDefault();
                } else if (inputVal == "") {
                    //when first typing, do nothing
                } else if (!regEx.test(inputVal)) {
                    e.preventDefault();
                }

                // Allow: backspace, delete, tab, escape, and enter
                if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 ||
                        // allow decimals
                    e.keyCode == 190 || e.keyCode == 110 ||
                        // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                        // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    // let it happen, don't do anything
                } else {
                    // Ensure that it is a number and stop the keypress
                    if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                }
            }).on('keyup', selector, function (e) {
                var inputVal = $(e.currentTarget).val(),
                    inputValSplit = inputVal.split('.'),
                    cutInt, cutDec;

                if (inputValSplit[0].length == 0) {
                    cutInt = '';
                } else if (inputValSplit[0].length > integer) {
                    cutInt = inputValSplit[0].substr(0, integer);
                } else {
                    cutInt = inputValSplit[0];
                }

                if (inputValSplit[1]) {
                    if (inputValSplit[1].length > decimal) {
                        cutDec = '.' + inputValSplit[1].substr(0, decimal);
                    } else {
                        cutDec = '.' + inputValSplit[1];
                    }
                } else {
                    cutDec = '';
                }

                // OHS20150323 add, decimal == 0 이면 정수부만 세팅처리
               if(decimal == 0) {
                    $(e.currentTarget).val(cutInt.split('.').join(''));
                } else if (inputValSplit[0].length == 0 ||inputValSplit[0].length > integer || (inputValSplit[1] && inputValSplit[1].length > decimal)) {
                    $(e.currentTarget).val(cutInt + cutDec);
                }
            }).on('blur', selector, function(e){
                var regEx  = /(\d+)(\d{3})/,
                    inputVal = e.target.value.split('.'),
                    cutInt = (inputVal[0]) ? inputVal[0] : 0,
                    cutDec = (inputVal[1]) ? inputVal[1] : '',
                    value,
                    i = 0;

                // OHS20150420 add. decimal == 0 이면 정수부만 세팅처리 '.' 제거
                if (parseFloat(e.target.value) == '0' || isNaN(parseFloat(e.target.value))) {
                    if(decimal == 0) {
                        value = '0';
                    } else {
                        var decimalString = '';
                        for (i = 0; i < decimal ; i++) {
                            decimalString = decimalString + '0';
                        }
                        value = '0' + '.' + decimalString;
                    }
                } else {

                    if (cutInt.length < 17) {
                        cutInt = parseInt(cutInt) + '';
                    } else if (cutInt.length == 17 && cutInt.substr(0,1) == '0') {
                        cutInt = parseInt(cutInt) + '';
                    }

                    while(regEx.test(cutInt)) {
                        cutInt = cutInt.replace(regEx, "$1,$2");
                    }

                    if (cutDec != '') {
                        var decimalLength = cutDec.length;
                        for (i = 0; i < decimal - decimalLength ; i++) {
                            cutDec = cutDec + '0';
                        }
                    } else {
                        for (i = 0; i < decimal ; i++) {
                            cutDec = cutDec + '0';
                        }
                    }

                    if(decimal == 0) {
                        // decimal == 0 일경우 정수부만 처리
                        value = cutInt.split('.').join('');
                    } else {
                        value = cutInt+'.'+cutDec;
                    }
                }

                $(e.currentTarget).val(value);
            }).on('focus', selector, function(e){
                var regEx  = /(\d+)(\,)(\d{3})/,
                    inputVal = e.target.value;

                while(regEx.test(inputVal)) {
                    inputVal = inputVal.replace(regEx, "$1$3");
                }
                $(e.currentTarget).val(inputVal);
            })
        };
    };

    /**
     * real time length check
     * @param {Object} $root - jQuery Element
     * @return {Function} - blur event check function. 
     */
    PFValidation.realTimeLengthCheck = function($root){
        // 20150205 OHS Modifed, MsgDiv Add ( Message Change )
        return function (selector, maxByteSize, msgDiv) {
            $($root).on('blur',selector, function () {
                if($(this).val().split(' ').join('') ==''){
                    return;
                }else{
                    PFValidation.finalLengthCheck('',maxByteSize,$(this).val(), msgDiv);
                }
            })
        };
    }

    /**
     * Check the length of the input value
     * @param {Object} selector - jQuery Element
     * @param {Number} maxByteSize - max byte
     * @param {String} inputVal - input value
     * @param {String} msgDiv - message type
     * @param {String} inputNm - input element name
     * @return {boolean} - true or false
     */
    PFValidation.finalLengthCheck = function(selector, maxByteSize, inputVal, msgDiv, inputNm){
        //
        var targetValue = inputVal || $(selector).val();

        targetValue = targetValue == null ? '' : targetValue;

        if(targetValue.length>maxByteSize){
            var message;
            if(msgDiv == "01") {
                message = inputNm  + bxMsg('DPS0121_4String6') + maxByteSize + bxMsg('digit') + ', ' + bxMsg('OverDigit');
            } else {
                message = bxMsg('DPS0121_4String6') + maxByteSize + bxMsg('OverDigit');
            }
            PFComponent.showMessage(message, 'warning');
            return false;
        }else{
            return true;
        }
    }
    
    /**
     * original : 비교대상 원래의 데이터
     * data : 비교대상 변경된 혹은 변경 가능성이 있는 데이터
     * compareVar : 비교대상 변수를 지정할 수 있음. 미지정시 전체 대상
     * removeVar : 비교대상 변수들 중에서 제외할 수 있음. 미지정시 전체 대상
     * 
     */
    PFValidation.compare = function(original, data, compareVar, removeVar) {
    	// 비교대상이 없을때는 true;
    	if(!original || !data) return true;
    	
    	var getClass = function(val) {
    		return Object.prototype.toString.call(val)
    			.match(/^\[object\s(.*)\]$/)[1];
    	};
    	
    	var whatis = function(val) {
    		if (val === undefined)
    			return 'undefined';
    		if (val === null)
    			return 'null';
    		var type = typeof val;
    		if (type === 'object')
    			type = getClass(val).toLowerCase();

    		if (type === 'number') {
    			if (val.toString().indexOf('.') > 0)
    				return 'float';
    			else
    				return 'integer';
    		}
    		return type;
    	};

    	var compareObjects = function(a, b) {
    		if (a === b)
    			return true;
    		for (var i in a) {
    			if (b.hasOwnProperty(i)) {
    				if (!equal(a[i],b[i])) return false;
    			} else {
    				return false;
    			}
    		}
    		for (var i in b) {
    			if (!a.hasOwnProperty(i)) {
    				return false;
    			}
    		}
    		return true;
    	};

    	var compareArrays = function(a, b) {
    		if (a === b)
    			return true;
    		if (a.length !== b.length)
    			return false;
    		for (var i = 0; i < a.length; i++){
    			if(!equal(a[i], b[i])) return false;
    		};
    		return true;
    	};

    	var _equal = {};
    	_equal.array = compareArrays;
    	_equal.object = compareObjects;
    	_equal.date = function(a, b) {
    		return a.getTime() === b.getTime();
    	};
    	_equal.regexp = function(a, b) {
    		return a.toString() === b.toString();
    	};

    	/*
    	 * Are two values equal, deep compare for objects and arrays.
    	 * @param a {any}
    	 * @param b {any}
    	 * @return {boolean} Are equal?
    	 */
    	var equal = function(a, b) {
    		if (a !== b) {
    			var atype = whatis(a), btype = whatis(b);

    			if (atype === btype)
    				return _equal.hasOwnProperty(atype) ? _equal[atype](a, b) : a==b;

    			return false;
    		}
    		return true;
    	};
    	return equal(original, data);
    }

    var TokenType = {
	  ARITHMETIC: 1,
	  DISCOUNT: 2,
	  CONDITION: 3,
	  FUNCTION: 4,
	  OPEN_BRACKET: 5,
	  CLOSE_BRACKET: 6,
	  NUMBER: 7,
	  COMMA: 8,
	  CALCULATION_RULE: 9
	};

	var State = {
	  EXPECT_VALUE: 0,
	  EXPECT_OPERATOR: 1,
	  EXPECT_OPEN_BRACKET: 2
	};

    /**
     * PFFormulaEditor
     * @namespace PFFormulaEditor
     */
	var PFFormulaEditor = {
	    patterns: [
	      {regex: /^[\+\-\*/]/, type: TokenType.ARITHMETIC},
	      {regex: /^#[0-9]+/, type: TokenType.DISCOUNT},
	      {regex: /^[\$#][YLADFNRIKCP]([0-9]{4})/, type: TokenType.CONDITION},
	      {regex: /^(not_equal|less_equal|more_equal)/i, type: TokenType.FUNCTION},
	      {regex: /^(min|max|avg|sum|priority|multiply|and|or|not|match[0-9]?|case|less|more|equal)/i, type: TokenType.FUNCTION},
	      {regex: /^\(/, type: TokenType.OPEN_BRACKET},
	      {regex: /^\)/, type: TokenType.CLOSE_BRACKET},
	      {regex: /^([0-9]\.)?[0-9]+/, type: TokenType.NUMBER},
	      {regex: /^,/, type: TokenType.COMMA},
	      {regex: /^#RULE([0-9]{11})/, type: TokenType.CALCULATION_RULE}
	    ],

	    /**
		  * Get Token Type
	      * @param {String} s - input string
	      * @return {String} - Token Type
	      */
	    getTokenType : function(s){
	    	if (s === "case" || s === "min" || s === "max") { // function
	            type = TokenType.FUNCTION;

	        } else if (s === "(") {
	            type = TokenType.OPEN_BRACKET;

	        } else if (s === ")") {
	            type = TokenType.CLOSE_BRACKET;

	        } else if (s === ",") {
	            type = TokenType.COMMA; // OHS 20171214 script 오류 수정 - PFFormulaEditor.TokenType.COMMA > TokenType.COMMA

	        } else if (s === "+" || s === "-" || s === "*" || s === "/") {
	            type = TokenType.ARITHMETIC;
	        } else {
	            type = TokenType.NUMBER;
	        }
	    	return type;
	    },

	    /**
		  * validate
	      * @param {String} rule - rule
	      * @param {String} scope - scope
	      * @return {boolean} - true or false
	      */
	    validate: function(rule, scope) {
	      var tokens = this.tokenize(rule);

	      if (!tokens)
	        return false;

	      return this.validateParenthesis(tokens) && this.validateSyntax(tokens)
	          && this.validateScope(tokens, scope);
	    },

	    /**
		  * validate Parenthesis
	      * @param {String} tokens - tokens
	      * @return {boolean} - true or false
	      */
	    validateParenthesis: function(tokens) {
	      var stack = 0;
	      for (var i in tokens) {
	        token = tokens[i];
	        switch (token.type) {
	          case TokenType.OPEN_BRACKET:
	            stack++;
	            break;

	          case TokenType.CLOSE_BRACKET:
	            stack--;
	            break;

	          default:
	            continue;
	        }

	        if (stack < 0)
	          return false;
	      }

	      return stack === 0;
	    },

	    /**
		  * validate Syntax
	      * @param {String} tokens - tokens
	      * @return {boolean} - true or false
	      */
	    validateSyntax: function(tokens) {
	        var state = State.EXPECT_VALUE;

	        for (var i in tokens) {
	          token = tokens[i];

	          switch (token.type) {
	          case TokenType.ARITHMETIC:
	            if (state !== State.EXPECT_OPERATOR) return false;
	            state = State.EXPECT_VALUE;
	            break;

	          case TokenType.DISCOUNT:
	          case TokenType.CONDITION:
	          case TokenType.NUMBER:
	          case TokenType.CALCULATION_RULE:
	            if (state !== State.EXPECT_VALUE) return false;
	            state = State.EXPECT_OPERATOR;
	            break;

	          case TokenType.OPEN_BRACKET:
	            if (state === State.EXPECT_OPEN_BRACKET)
	              state = State.EXPECT_VALUE;
	            if (state !== State.EXPECT_VALUE) return false;
	            break;

	          case TokenType.CLOSE_BRACKET:
	            if (state !== State.EXPECT_OPERATOR) return false;
	            break;

	          case TokenType.FUNCTION:
	            if (state !== State.EXPECT_VALUE) return false;
	            state = State.EXPECT_OPEN_BRACKET;
	            break;

	          case TokenType.COMMA:
	            if (state !== State.EXPECT_OPERATOR) return false;
	            state = State.EXPECT_VALUE;
	            break;

	          default:
	            return false;
	          }
	        }

	        return state === State.EXPECT_OPERATOR
	    },

	    /**
		  * validate Scope
	      * @param {String} tokens - tokens
	      * @param {String} scope - scope
	      * @return {boolean} - true or false
	      * @example - scope: {
		  *                     func: [ a, b, c ],
	      *   					item: [ d, e, f ]
	      * 				  }
	      */
	    validateScope: function(tokens, scope) {
	      if (scope) {
	        // build map
	        var validFunction = {};
	        var validItem = {};

	        if (scope.func) {
	          scope.func.forEach(function(v) {
	            validFunction[v.toLowerCase()] = true;
	          });
	        }

	        if (scope.item) {
	          scope.item.forEach(function(v) {
	            validItem[v] = true;
	          });
	        }

	        for (var i in tokens) {
	          token = tokens[i];

	          switch (token.type) {
	          case TokenType.FUNCTION:
	            if (scope.func && !validFunction[token.value.toLowerCase()]) return false;
	            break;

	          case TokenType.DISCOUNT:
	          case TokenType.CONDITION:
	          case TokenType.CALCULATION_RULE:
	            if (scope.item && !validItem[token.value]) return false;
	            break;
	          }
	        }
	      }

	      return true;
	    },

	    /**
		  * Integrated Validation
	      * @param {String} tokens - tokens
	      * @param {String} scope - scope
	      * @return {boolean} - true or false
	      */
	    validateAll: function(tokens, scope) {
	      var state = State.EXPECT_VALUE;
	      var stack = 0;
	      var validFunction = {};
	      var validCondition = {};

	      if (scope) {
	        if (scope.func) {
	          for (var i in scope.func) {
	            validFunction[scope.func[i]] = true;
	          }
	        }

	        if (scope.condition) {
	          for (var i in scope.condition) {
	            validCondition[scope.condition[i]] = true;
	          }
	        }
	      }

	      for (var i in tokens) {
	        token = tokens[i];

	        switch (token.type) {
	        case TokenType.ARITHMETIC:
	          if (state !== State.EXPECT_OPERATOR) return false;
	          state = State.EXPECT_VALUE;
	          break;

	        case TokenType.CONDITION:
	          if (scope && scope.condition && !validCondition[token.value]) return false;
	        case TokenType.NUMBER:
	          if (state !== State.EXPECT_VALUE) return false;
	          state = State.EXPECT_OPERATOR;
	          break;

	        case TokenType.OPEN_BRACKET:
	          if (state !== State.EXPECT_VALUE) return false;
	          stack++;
	          break;

	        case TokenType.CLOSE_BRACKET:
	          if (state !== State.EXPECT_OPERATOR) return false;
	          stack--;
	          break;

	        case TokenType.FUNCTION:
	          if (scope && scope.func && !validFunction[token.value]) return false;
	          break;

	        default:
	          return false;
	        }

	        if (stack < 0)
	          return false;
	      }

	      return state === State.EXPECT_OPERATOR && stack === 0;
	    },

	    /**
		  * tokenize 
	      * @param {String} str - string
	      * @return {String} - tokens
	      */
	    tokenize: function(str) {
	      var tokens = [];
	      str = str ? str.replace(/\s/g, "") : "";
	      while (str) {
	        token = this.parseToken(str);

	        if (token) {
	          tokens.push(token);
	          str = str.replace(token.value, "");
	        }
	        else
	          return null;
	      }

	      return tokens;
	    },
	    
	    /**
		  * parse Token 
	      * @param {String} s - string
	      * @return {String} - token
	      */
	    parseToken: function(s) {
	        token = null;

	        for (var i in this.patterns) {
	          pattern = this.patterns[i];
	          var match = s.match(pattern.regex)
	          if (match) {
	            token = {
	              type: pattern.type,
	              value: match[0]
	            };
	            break;
	          }
	        }
	        
	        return token;
	    },

	    /**
		  * to Content
	      * @param {String} tokens - tokens
	      * @param {String} delimiter - delimiter
	      * @return {String} - result
	      */
	    toContent: function(tokens, delimiter) {
	      var result = "";
	      var value;
	      if (!delimiter) delimiter = "";

	      $.each(tokens, function(index, token) {
	        if (token.type === TokenType.ARITHMETIC)
	          result += delimiter;

	        result += token.value;

	        if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
	          result += delimiter;
	      });

	      return result;
	    },

	    /**
		  * translate
	      * @param {String} rule - rule
	      * @param {String} map - map
	      * @param {String} delimiter - delimiter
	      * @return {String} - result
	      */
	    translate: function(rule, map, delimiter) {
	      var tokens = this.tokenize(rule) || [];
	      var result = "";
	      map = map || {};
	      delimiter = delimiter || "";

	      $.each(tokens, function(index, token) {
	        if (token.type === TokenType.ARITHMETIC)
	          result += delimiter;

	        switch (token.type) {
	        case TokenType.CONDITION:
	        case TokenType.DISCOUNT:
	          result += map[token.value.substr(1)] || token.value;
	          break;
	        default:
	          result += token.value;
	        }

	        if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
	          result += delimiter;
	      });

	      return result
	    },
	    
	    /**
		  * input Token
	      * @param {String} string - string
	      * @param {Object} $content - jQuery Element
	      * @return {String} - result
	      */
	    inputToken: function(string, $content) {
        if ($content) {
          var token = this.parseToken(string);
          var tokens = this.tokenize($content.val());
          if (token && tokens) {
            tokens.push(token);

            $content.val(this.toContent(tokens, " "));
            $content.trigger("change");
          }
        }
	      
	    }

	};

    global.PFValidation = PFValidation;
    global.TokenType = TokenType;
    global.PFFormulaEditor = PFFormulaEditor;

})(window);

