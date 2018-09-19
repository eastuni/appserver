/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonService', __service);

function __service($http, $q, $commonConfig, $commonProxy, $commonModal, $rootScope, $state){
    var subMenuList = [];
    var _messageData = {};

    return {
    	getFileData : function(url_){

            var defer = $q.defer();
            $http({
                url: url_,
                method: "GET"
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.resolve(data);
            });

            return defer.promise;
        },

    	getGridJsonData : function(){
            var defer = $q.defer();
            $http({
                url: $commonConfig.restful.grid.url,
                method: $commonConfig.restful.grid.method
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.resolve(data);
            });

            return defer.promise;
        },

        getTreeJsonData : function(){

            var defer = $q.defer();
            $http({
                url: $commonConfig.restful.tree.url,
                method: $commonConfig.restful.tree.method
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.resolve(data);
            });

            return defer.promise;
        },

        fn_removeQoutes : function(item){
        	if (item != null && item != undefined){
        		return item.replace(/\"/g, "");
        	}
        	return "";
        },

        CommonInfo : function(){
            var _userInfo = {
                    name: $.sessionStorage("nm"),
                    loinIdNbr: $.sessionStorage("loinIdNbr"),
                    staffId: $.sessionStorage("staffId"),
                    deptNm: $.sessionStorage("deptNm"),
                    deptId: $.sessionStorage("deptId")
                };
            var _targetCustomerInfo = {};
            var _systemDate = new XDate().toString('yyyy-MM-dd');
            var _locale = $.sessionStorage("inst_lngCd");
            var _instInfo = {
                    instCd: $.sessionStorage("instCd")
                    , instNm: $.sessionStorage("instNm")
                };

            var _menuMap = {};
            var assignHandler = {};
            var _portletsMap = {};
            var _portletsPollingMap = {};
            var _cInstCd;

            var CommonInfo = {

                getUserInfo: function() {
                    return _userInfo;
                },
                setUserInfo: function(userInfo) {
                    $.extend(_userInfo, userInfo);
                    typeof assignHandler['userInfo'] === 'function' && assignHandler['userInfo'](_userInfo);
                },
                getTargetCustomerInfo: function() {
                    return _targetCustomerInfo;
                },
                setTargetCustomerInfo: function(targetCustomerInfo) {
                    $.extend(_targetCustomerInfo, targetCustomerInfo);
                    typeof assignHandler['targetCustomerInfo'] === 'function' && assignHandler['targetCustomerInfo'](_targetCustomerInfo);
                },
                getSystemDate: function() {
                    return _systemDate;
                },
                setSystemDate: function(systemDate) {
                    _systemDate = systemDate;
                    typeof assignHandler['systemDate'] === 'function' && assignHandler['systemDate'](_systemDate);
                },
                getLocale: function() {
                    return _locale;
                },
                setLocale: function(locale) {
                    _locale = locale;
                    typeof assignHandler['locale'] === 'function' && assignHandler['locale'](_locale);
                },

                getInstInfo: function() {

                	if(_instInfo.constantBaseInstCd) {
                		var cInstInfo = {};
                		cInstInfo.instCd = _instInfo.instNm;
                		cInstInfo.instNm = _instInfo.instNm;
                		cInstInfo.orgInstCd = _instInfo.instCd;
                		return cInstInfo;
                	}
                	else {
                		return _instInfo;
                	}
                },

                setMenuMap: function(rootMenuList) {
                    rootMenuList.forEach(function(menuItem, i) {
                        _menuMap[menuItem.menuId] = menuItem.children;
                    });
                },
                // 수정 20160611 서브메뉴 생성
                setSubMenuList: function(rootMenuId, rootMenuList) {
                	_menuMap[rootMenuId] = rootMenuList;
                },
                getSubMenuList: function(parentId) {
                    return _menuMap[parentId];
                },
                setInstInfo: function(instInfo) {
                	$.extend(_instInfo, instInfo);
                	typeof assignHandler['instInfo'] === 'function' && assignHandler['instInfo'](_instInfo);
                },
                registAssignHandler: function(name, fn) {
                    assignHandler[name] = fn;
                }
                , getAllSubMenuList : function() {
                	return _menuMap;
                }
                , setPortletsMap : function(portletsMenuList) {
                	portletsMenuList.forEach(function(menuItem, i) {
                		_portletsMap[menuItem.scrnId] = menuItem;
                    });
                }

                , getAllPortletsMap : function() {
                	return _portletsMap;
                }

                , getPortletsMap : function(scrnId) {
                	return _portletsMap[scrnId];
                }

                /**
                 * polling 관련 함수
                 */
                // 폴링 셋팅
                , setPortletsPollingMap : function(portletsInfo) {
                	_portletsPollingMap[portletsInfo.scrnId] = portletsInfo;
                }
                // 폴링 전체 조회
                , getAllPortletsPollingMap : function() {
                	return _portletsPollingMap;
                }
                // 폴링 조회
                , getPortletsPollingMap : function(scrnId) {
                	return _portletsPollingMap[scrnId];
                }
                // 폴링 삭제
                , removePortletsPollingMap : function(scrnId) {
                	delete _portletsPollingMap[scrnId];
                }
            };
            return CommonInfo;
        },

        /**
         * 콤보박스생성
         */
        fn_getCodeList : function(sParam) {
            var param = {};
            var that = this;
            param.cdNbr = sParam.cdNbr;

//            console.log(sParam);

            var linkData = {"header": this.fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};

            $commonProxy.fn_callAsyncSvc(sUrl, linkData, {
            	enableLoading : false, // 로딩바 여부
            	success : function(responseData) {

                    var selectArea = $("[data-form-param=\"" + sParam.targetId + "\"]");
                    if (sParam.ctrlId != undefined && sParam.ctrlId != ""){
                    	selectArea = $("#" + sParam.ctrlId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                    }
                    if (sParam.tabId != undefined && sParam.tabId != ""){
                    	selectArea = $("#" + sParam.tabId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                    }
                    selectArea.empty();
                    if (sParam.disabled) {
                        selectArea.attr("disabled", true);
                    };

                    if (sParam.hidden) {
                        selectArea.attr("hidden", true);
                    };
                    if (sParam.nullYn == "Y") {
                    	var option;
                    	if(sParam.blankTitle){
	                        option = $(document.createElement('option')).val("").text(sParam.blankTitle);
	                    } else {
	                    	option = $(document.createElement('option')).val("").text(" ");
	                    }
                        selectArea.append(option);
                    };

                    $(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
                        var optionText = item.cdNm;
                        var option = $(document.createElement('option')).val(item.cd).text(optionText);
                        
                        if (sParam.viewType) {
                            if (sParam.viewType == "ValNm") {
                                option = $(document.createElement('option')).val(item.cd).text(item.cd + " " + optionText);
                            }
                            else if (sParam.viewType == "val") {
                                option = $(document.createElement('option')).val(item.cd).text(item.cd);
                            } else if (sParam.viewType == "Nm") {
                                option = $(document.createElement('option')).val(item.cd).text(optionText);
                            }
                        }
                        selectArea.append(option);
                        
                        typeof sParam.fn === 'function' && sParam.fn();
                    });

                    if (sParam.selectVal) {
                        selectArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                        //sectionArea.change();
                    };
            	},
            	error : function(data, status, headers, config) {
            		console.log(status);
            	}
            });
        },
        
        /**
         * 콤보박스생성
         */
        fn_getCodeSyncList : function(sParam) {
            var param = {};
            var that = this;
            param.cdNbr = sParam.cdNbr;

//            console.log(sParam);

            var linkData = {"header": this.fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};

            $commonProxy.fn_callSyncSvc(sUrl, linkData, {
            	enableLoading : false, // 로딩바 여부
            	success : function(responseData) {

                    var selectArea = $("[data-form-param=\"" + sParam.targetId + "\"]");
                    if (sParam.ctrlId != undefined && sParam.ctrlId != ""){
                    	selectArea = $("#" + sParam.ctrlId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                    }
                    if (sParam.tabId != undefined && sParam.tabId != ""){
                    	selectArea = $("#" + sParam.tabId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                    }
                    selectArea.empty();
                    if (sParam.disabled) {
                        selectArea.attr("disabled", true);
                    };

                    if (sParam.hidden) {
                        selectArea.attr("hidden", true);
                    };
                    if (sParam.nullYn == "Y") {
                    	var option;
                    	if(sParam.blankTitle){
	                        option = $(document.createElement('option')).val("").text(sParam.blankTitle);
	                    } else {
	                    	option = $(document.createElement('option')).val("").text(" ");
	                    }
                        selectArea.append(option);
                    };

                    $(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
                        var optionText = item.cdNm;
                        var option = $(document.createElement('option')).val(item.cd).text(optionText);
                        
                        if (sParam.viewType) {
                            if (sParam.viewType == "ValNm") {
                                option = $(document.createElement('option')).val(item.cd).text(item.cd + " " + optionText);
                            }
                            else if (sParam.viewType == "val") {
                                option = $(document.createElement('option')).val(item.cd).text(item.cd);
                            } else if (sParam.viewType == "Nm") {
                                option = $(document.createElement('option')).val(item.cd).text(optionText);
                            }
                        }
                        selectArea.append(option);
                        
                        typeof sParam.fn === 'function' && sParam.fn();
                    });

                    if (sParam.selectVal) {
                        selectArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                        //sectionArea.change();
                    };
            	},
            	error : function(data, status, headers, config) {
            		console.log(status);
            	}
            });
        },
        /**
         * 상품코드조회
         */
        fn_getPdCodeList : function(sParam) {
            var param = {};
            var serviceCd;

            param.instCd = sParam.instCd;	//기관코드 추가
            param.bizDscd = sParam.bizDscd;
            param.pdTpCd = sParam.pdTpCd;
            param.pdTmpltCd = sParam.pdTmpltCd;

            if (sParam.pdInfoDscd){
                param.pdInfoDscd = sParam.pdInfoDscd;
            }
            
            if (sParam.getPdListByChannel == "Y") {
                serviceCd = "SPD0010404";
            } else {
                serviceCd = "SPD0010401";
            }
            
            var linkData = {"header": this.fn_getHeader(serviceCd), "PdTxSrvcMgmtSvcIn": param};
            
            $commonProxy.fn_callAsyncSvc(sUrl, linkData, {
            	enableLoading : false, // 로딩바 여부
                success : function (data) {
                    //var elSelect = $("#"+sParam.targetId);
                    var elSelect = $("[data-form-param=\"" + sParam.targetId + "\"]");
                    if (sParam.ctrlId != undefined && sParam.ctrlId != ""){
                    	selectArea = $("#" + sParam.ctrlId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                    }
                    if (sParam.tabId != undefined && sParam.tabId != ""){
                    	elSelect = $("#" + sParam.tabId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                    }
                    elSelect.empty();

                    if (sParam.disabled) {
                        elSelect.attr("disabled", true);
                    };

                    if (sParam.hidden) {
                        elSelect.attr("hidden", true);
                    };
                    
                    if (sParam.nullYn == "Y") {
                    	var elOption = $(document.createElement('option'));
                    	if(sParam.blankTitle){
                    		elOption.val("").text(sParam.blankTitle);
	                    } else {
	                    	elOption.val("").text(" ");
	                    }
                        elSelect.append(elOption);
                    };

                    $(data.PdTxSrvcMgmtSvcOut.tbl).each(function (idx, item) {
                        var optionText = item.pdNm;
                        var elOption = $(document.createElement('option'));

                        if (sParam.viewType) {
                            if (sParam.viewType == "ValNm") {
                            	elOption.val(item.pdCd).text(item.pdCd + " " + optionText);
                            } else if (sParam.viewType == "val") {
                            	elOption.val(item.pdCd).text(item.pdCd);
                            } else if (sParam.viewType == "Nm") {
                            	elOption.val(item.pdCd).text(optionText);
                            }
                        }

                        elSelect.append(elOption);
                        
                        typeof sParam.fn === 'function' && sParam.fn();
                    });

                    if (sParam.selectVal) {
                        elSelect.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                    };
                }
            });
        },
        fn_makeCombo : function(sParam) {
            var label;

            if (this.fn_isNull(sParam.label)) {
            	label = "cbb_items.AT#" + sParam.targetId;
            } else {
            	label = sParam.label;
            }

            var elDiv = $("#"+sParam.divId);
            elDiv.addClass("input-wrap fix-label clr");
            
            if (sParam.nullYn == "N") {
            	elDiv.addClass("asterisk");
            }
            
            var elLabel = $(document.createElement('label'));
            elLabel.addClass("bw-label");
            elLabel.attr("data-i18n", "{%=" + label + "%}");

            elDiv.html(elLabel);
            
            var elSelect = $(document.createElement('select'));
            elSelect.addClass("bw-input ipt-select");
            elSelect.attr("data-form-param", sParam.targetId);
            elSelect.attr("id", sParam.targetId);

            elDiv.append(elSelect);
        },
        comboStoreFn : function(cdNbr){
    		var param = {};
    		var comboStore;
    		  param.cdNbr = cdNbr;

    		  var linkData = {"header": this.fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};
    		  var response = $commonProxy.fn_callSyncSvc(sUrl, linkData, {
    		  	enableLoading : false
    		  });
    		  if (response != null){
    			  if (response.CaCmnCdSvcGetCdListByCdNbrOut != null) {
    				  comboStore = new Ext.data.Store({
    				      fields: ['cd', 'cdNm'],
    				      data: response.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
    				  });
    			  }
    		  };
    		  return comboStore;
    	},
    	comboFillFn : function(sParam){
                var selectArea = $("[data-form-param=\"" + sParam.targetId + "\"]");
                if (sParam.tabId != undefined && sParam.tabId != ""){
                	selectArea = $("#" + sParam.tabId).find("[data-form-param=\"" + sParam.targetId + "\"]");
                }
                
                selectArea.empty();
                if (sParam.disabled) {
                    selectArea.attr("disabled", true);
                };

                if (sParam.hidden) {
                    selectArea.attr("hidden", true);
                };
                if (sParam.nullYn == "Y") {
                	var option;
                	if(sParam.blankTitle){
                        option = $(document.createElement('option')).val("").text(sParam.blankTitle);
                    } else {
                    	option = $(document.createElement('option')).val("").text(" ");
                    }
                    selectArea.append(option);
                };
                

                $(sParam.data).each(function (idx, item) {

                    var optionCd = item[sParam.fields[0]];
                    var optionText = item[sParam.fields[1]];
                    var option = $(document.createElement('option')).val(optionCd).text(optionText);

                    if (sParam.viewType) {
                        if (sParam.viewType == "ValNm") {
                            option = $(document.createElement('option')).val(optionCd).text(optionCd + " " + optionText);
                        }
                        else if (sParam.viewType == "val") {
                            option = $(document.createElement('option')).val(optionCd).text(optionCd);
                        } else if (sParam.viewType == "Nm") {
                            option = $(document.createElement('option')).val(optionCd).text(optionText);
                        }
                    }
                    selectArea.append(option);
                });

                if (sParam.selectVal) {
                    selectArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                    //sectionArea.change();
                };
 
    	},
        /**
         * 삭제 해야됨.
         * common.proxy 의 체크리스트를 사용 해야 함.
         */
        fn_commonChekResult : function (responseData) {
        	return $commonProxy.fn_commonChekResult(responseData);
        },

        /* 라디오박스 생성 */
        fn_makeRadio : function(sParam, that, selectStyle, fn) {
            var param = {};
            var that = this;
            param.cdNbr = sParam.cdNbr;

            var linkData = {"header": this.fn_getHeader("PCM0038400"), "CmnCdSvc06In": param};

            $commonProxy.fn_callAsyncSvc(sUrl, linkData, {
            	enableLoading : false, // 로딩바 여부
            	success : function(responseData) {
            		var targetArea = $("." + sParam.className);
//                      that.$el.find("." + sParam.className).html("");
            		targetArea.html("");
            		var selectArea = "";

            		var fristVal = "";

            		$(data.CmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
            			var optionText = item.cdNm;
            			var optionValue = item.cd;
            			if (idx == 0) {
            				fristVal = optionValue;
            			}
            			var inputMarginRight = "2px";
            			var labelMarginRight = "5px";

            			if (sParam.inputMarginRight) {
            				inputMarginRight = sParam.inputMarginRight;
            			}

            			if (sParam.labelMarginRight) {
            				labelMarginRight = sParam.labelMarginRight;
            			}

            			var inRadio = "<input type=\"radio\" value=\"" + optionValue + "\" id=\"" + sParam.targetId + "_" + optionValue + "\" name=\"" + sParam.targetId + "\" style=\"vertical-align: middle; margin-right: " + inputMarginRight + ";\">";
            			inRadio += "<label for=\"" + sParam.targetId + "_" + optionValue + "\" style=\"vertical-align: middle; margin-right: " + labelMarginRight + ";\">" + optionText + "</label>";
            			selectArea += inRadio;
            		});

            		targetArea.html(selectArea);

            		if (sParam.selectVal) {
            			that.$el.find('input:radio[name=' + sParam.targetId + ']:input:radio[value=' + sParam.selectVal + ']').attr("checked", true);
            		}
            		else {
            			that.$el.find('input:radio[name=' + sParam.targetId + ']:input:radio[value=' + fristVal + ']').attr("checked", true);
            		}

            		if (sParam.disabled) {
            			targetArea.attr("disabled", true);
            		}

            		if (sParam.hidden) {
            			targetArea.attr("hidden", true);
            		}

            		typeof fn === 'function' && fn();
            	},
            	error : function(data, status, headers, config) {
            		console.log(status);
            	}
            });

        },

        fn_getEmptyCombo : function(sParam, that, selectStyle) {
//            var sectionArea = $(document.createElement('section'));
            var selectArea = $("[data-form-param=\"" + sParam.targetId + "\"]");
            selectArea.empty();
//            sectionArea.addClass("bx-combo-box-wrap");
//            sParam.className = "." + sParam.className;
//            that.$el.find(sParam.className).html("");
//
//            var selectArea = $(document.createElement('select'));

//            selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
//            selectStyle && selectArea.css(selectStyle);
//            selectArea.attr("data-form-param", sParam.targetId);

            if (sParam.disabled) {
                selectArea.attr("disabled", true);
            }

            var option = $(document.createElement('option')).val("").text("");

            selectArea.append(option);

//            $(sectionArea).html(selectArea);
//
//            that.$el.find(sParam.className).html(sectionArea);
        },

        /**
         * 기관코드 조회
         */
        fn_getInstCd : function (InstCd) {
            var result;
            var ss_instCd = $.sessionStorage("instCd");

            if (!this.fn_isNull(InstCd)) {
                result = InstCd;
            } else if (!this.fn_isNull(ss_instCd) && ss_instCd != 'STDA') {
                result = ss_instCd;
            }

            if (this.fn_isNull(result)) {
                return null;
            }

            return result;
        },

        fn_isNull : function (param) {
            if (param == null)
                return true;

            if (param == 'undefined')
                return true;

            if (typeof param == 'string' && param.trim() == '')
                return true;

            if (typeof param == 'object' && $.isEmptyObject(param))
            	return true;

            if(param == "null")
            	return true;

            return false;
        },

        fn_isEmpty : function(param) {
        	return this.fn_isNull(param);
        },

        /**
         * 구군코드조회
         */
        fn_getGuGunList : function (sParam, selectStyle, fn) {
            var param = {};
            var that = this;
            param.cityPrvncCd = sParam.cityPrvncCd;

            var linkData = {"header": this.fn_getHeader("SCM0038401"), "KrAddrSvcGetGuGunListIn": param};

            $commonProxy.fn_callAsyncSvc(sUrl, linkData, {
            	enableLoading : false, // 로딩바 여부
            	success : function(responseData) {
//                		var sectionArea = $(document.createElement('section'));
            		var selectArea = $("[data-form-param=\"" + sParam.targetId + "\"]");
            		selectArea.empty();
//                        sectionArea.addClass("bx-combo-box-wrap");
//                        sParam.className = "." + sParam.className;
//                        that.$el.find(sParam.className).html("");

//                        var selectArea = $(document.createElement('select'));

//                        selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
//                        selectStyle && selectArea.css(selectStyle);
//                        selectArea.attr("data-form-param", sParam.targetId);

                    if (sParam.disabled) {
                        selectArea.attr("disabled", true);
                    }

                    if (sParam.hidden) {
                        selectArea.attr("hidden", true);
                    }

                    if (sParam.nullYn == "Y") {
                        var option = $(document.createElement('option')).val("").text(" ");
                        selectArea.append(option);
                    }

                    $(responseData.KrAddrSvcGetGuGunListOut.tblNm).each(function (idx, item) {
                        var optionText = item.cityGunGuAddr;
                        var optionValue = item.cityGunGuCd;
                        var option = $(document.createElement('option')).val(optionValue).text(optionText);

                        if (sParam.viewType) {
                            if (sParam.viewType == "ValNm") {
                                option = $(document.createElement('option')).val(optionValue).text(item.cd + " " + optionText);
                            }
                            else if (sParam.viewType == "val") {
                                option = $(document.createElement('option')).val(optionValue).text(item.cd);
                            }
                        }

                        selectArea.append(option);
                    });

//                        sectionArea.html(selectArea);
//                        that.$el.find(sParam.className).html(sectionArea);

                    if (sParam.selectVal) {
                        selectArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                    }
                    typeof fn === 'function' && fn();
            	},
            	error : function(data, status, headers, config) {
            		console.log(status);
            	}
            });
        },

        /**
         * 기관파라미터조회
         */
        fn_getInstParm : function (instCd, parmAtrbtNm) {

            if (instCd == null || parmAtrbtNm == null) return null;

            var sessionValue = $.sessionStorage('inst_'+parmAtrbtNm);

            if(sessionValue) {
            	return sessionValue;
            }

            var param = {};
            param.instCd = instCd;

            var linkData = {"header": this.fn_getHeader("CAPCM0308403"), "CaInstMgmtSvcGetParmIn": param};
            var response = $commonProxy.fn_callSyncSvc(sUrl, linkData, {
            	enableLoading : false
            });

            if (response == null) return null;
            if (response.CaInstMgmtSvcGetParmOut == null) return null;

            var tblList = response.CaInstMgmtSvcGetParmOut.parmList;
            var result = "";

            for (var idx = 0; idx < tblList.length; idx++) {

            	$.sessionStorage('inst_'+tblList[idx].parmAtrbtNm, tblList[idx].parmVal);

                if (tblList[idx].parmAtrbtNm == parmAtrbtNm) {
                    result = tblList[idx].parmVal;
                }
            }

            return result;
        },

        fn_getHeader: function (srvcCd) {
        	var header = new Object();

            header.custId = $.sessionStorage("custId");
            header.staffId = $.sessionStorage("staffId");
            header.instCd = $.sessionStorage("instCd");
            header.userGrpCd = $.sessionStorage("userGrpCd");
            header.srvcCd = srvcCd;
            header.tmZone = "";
            header.deptId = $.sessionStorage("deptId");
            header.lngCd = $.sessionStorage("lngCd");
            header.txDt = $.sessionStorage("txDt");
            header.chnlDscd = $.sessionStorage("chnlDscd");
            header.scrnId = $.sessionStorage("scrnId");
            header.custRprsnId = $.sessionStorage("custRprsnId");// customer related person identification for commit

            return header;
        },

        setSubMenuList: function (menuList) {
            if(menuList) {
                subMenuList = menuList;
            }
        },

        getSubMenuList: function () {
            return subMenuList;
        },

        fn_makeDatePicker : function(target, value, styleOption, onSelectFn, onCloseFn) {

        	var dateFormatCd = this.fn_getInstParm($.sessionStorage("instCd"), "dtFormatCd");
        	var dateFormat = "yy-mm-dd";
        	var yearSuffix = "년";
        	var lngCd = $.sessionStorage('lngCd');
            var months;
            var dayOfWeek;
            var returnDateFormat = "yyyyMMdd";
            var _styleOption = styleOption == null ? [] : styleOption;

        	if(dateFormat == "01") { // yyyy-mm-dd
        		dateFormat = "yy-mm-dd";
        		yearSuffix = "년";
        		returnDateFormat = "yyyyMMdd";
        	}
        	else if(dateFormat == "02") { //dd-mm-yyyy
        		dateFormat = "dd-mm-yy";
        		yearSuffix = "year";
        		returnDateFormat = "ddMMyyyy";
        	}
        	else {
        		dateFormat = "yy-mm-dd";
//        		yearSuffix = "년";
        		yearSuffix = "year";
        		returnDateFormat = "yyyyMMdd";
        	}

        	if (lngCd === 'ko') {
            	months = ['1월(JAN)', '2월(FEB)', '3월(MAR)', '4월(APR)', '5월(MAY)', '6월(JUN)','7월(JUL)', '8월(AUG)', '9월(SEP)', '10월(OCT)', '11월(NOV)', '12월(DEC)'];
            	dayOfWeek =  ['일', '월', '화', '수', '목', '금', '토'];
            } else if (lngCd === 'zh') {
            	months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
                dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"];
            } else {
            	months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
                 dayOfWeek = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
            }

        	let datePicker = $(target).bxDatePicker({
                dateFormat: dateFormat,
                changeMonth: true,
                changeYear: true,
                yearSuffix: yearSuffix,
                yearRange: 100,
                attr: {
                    style: 'text-align:center'
                },
            	monthNames : months, // 월 설정
            	monthNamesShort : months, // 월의 언어 변환
            	dayNames : dayOfWeek, // 요일 설정
            	dayNamesMin : dayOfWeek, // 요일의 언어 변환

                onSelect : function(date, ui){
                	typeof onSelectFn === 'function' && onSelectFn(new XDate(date).toString(returnDateFormat));
                },
                onClose : function(date, ui){
                    if (!date){
//                        alert("날짜를 선택하세요");
                    }
                    else {
                    	typeof onCloseFn === 'function' && onCloseFn(new XDate(date).toString(returnDateFormat));
                    }
                }
            }).render();

            if(value) {
            	if(value == "0000-00-00") { //현재일
                	$(target).find("input").val(new XDate().toString('yyyy-MM-dd'));
                }
                else {
                	$(target).find("input").val(new XDate(value).toString('yyyy-MM-dd'));
                }
            }
            else {
            	$(target).find("input").val('');
            }

            if(_styleOption.length > 0) {
            	$(_styleOption).each(function(idx, data) {
            		$(target).find("input").css(data.key, data.value);
            	});
            }
            
            return datePicker;
        },
        
        /**
         * message alert
         */
    	alert : function(param) {
    		$().bxDialog({
    			type : 'default',
    			width : 0,
    			confirmText : param.closeText ? param.closeText : 'Ok',
    					dimStyle : {
    						color : 'black',
    						enableBlur : false
    					}
    		}).alert({
    			title: param.title ? param.title : '',
    					content: param.content ? param.content : ''
    						, onConfirm: function(e){
    							console.log("close");
    						}
    		});
    	},

    	/**
    	 * message say
    	 */
    	alertSay : function(param) {
    		//say
    		 $().bxDialog({
    		    type : 'default',
    		    width : 0,
    		    dimStyle : {
    		        color : 'black',
    		        enableBlur : false
    		    }
    		 }).say({
    			 title: param.title ? param.title : '',
				 content: param.content ? param.content : ''
    		});
    	},

    	/**
    	 * message confirm
    	 */
    	alertConfirm : function(param, fn) {
    		 //confirm
    		 $().bxDialog({
    		    type : 'default',
    		    width : 0,
    		    confirmText : param.confirmText ? param.confirmText : 'Ok',
    		    closeText : param.closeText ? param.closeText : 'Cancel',
    		    dimStyle : {
    		        color : 'black',
    		        enableBlur : false
    		    }
    		 }).confirm({
    			 title: param.title ? param.title : '',
				 content: param.content ? param.content : '',
				 onConfirm: function(e){
					 typeof fn === 'function' && fn(param);
					 this.hide();
				 },
				 onClose: function(e){
				 }
    		});
    	},

    	/**
    	 * 다국어 사용 메시지 데이터 생성
    	 */
    	makeMessageData : function() {
    		if(_messageData !== {}) {
    			/**
    			 * 다국어 생성
    			 */
    			let messagePath = 'app/common/messages/'+$.sessionStorage('lngCd')+"/";
    			let messageList = ['cbb-items.csv', 'cbb-err-msg.csv', 'login.json', 'main.json', 'issue-mng.json'];

    			let jsonMessageDatas = {};
    			var that = this;
    			$(messageList).each(function(idx, data) {
    				let requestURL = messagePath + data,
    				responseType = data.indexOf('.csv') === -1? 'json':'text';
    				
    				that.getFileData(requestURL).then(function(data){
    					let message = {};

    					if(responseType === 'text') { // CSV 파일
    						let items = data.split('\n');
    						let namespace = "";

    						$(items).each(function(i, item) {
    							let itemSepa = item.split(',');

    							if (itemSepa[0] === 'namespace') {
    								namespace = itemSepa[1].trim();
    							} else {
    								var nameSpace = itemSepa[0].trim();
    								itemSepa.splice(0, 1);

    								var subMessage = itemSepa.join(', ');
    								message[nameSpace] = subMessage;
    							}
    						});

    						jsonMessageDatas[namespace] = message;
    					}
    					else { // json 파일
    						jsonMessageDatas[data.namespace] = data.messages;
    					}

    					_messageData[$.sessionStorage('lngCd')] = jsonMessageDatas;
    		        });
    			});
    		}
    	},

    	/**
    	 * 화면 다국어 생성
    	 */
    	makeBxI18n : function(param) {
    		
    		var i18n = $().bxI18n({
    			langType: $.sessionStorage('lngCd'),
    			langDatas: _messageData,
    			enableStorage: false
    		}).init(function(){
    			this.translate();
    		});

    		return i18n;
    	},

    	/**
    	 * 왼쪽 채움
    	 */
    	fn_Lpad : function(str, len) {
    		str = str + "";
    	    while(str.length < len) {
    	      	str = "0"+str;
    	    }
    	    return str;
    	} ,

    	/**
    	 * 현재날짜 조회
    	 */
    	getCurrentDate : function(dateType) { // FIXME
    	    var now = new Date();   //현재시간
    	    var reDate;

    	    var year = now.getFullYear();   //현재시간 중 4자리 연도
    	    var month = now.getMonth() + 1;   //현재시간 중 달. 달은 0부터 시작하기 때문에 +1

    	    if ((month + "").length < 2) {
    	        month = "0" + month;   //달의 숫자가 1자리면 앞에 0을 붙임.
    	    }

    	    var date = now.getDate();      //현재 시간 중 날짜.

    	    if ((date + "").length < 2) {
    	        date = "0" + date;
    	    }
    	    if(dateType == undefined){
    	    	dateType =  "yyyy-mm-dd";
    	    }

    	    if (dateType == "yyyymmdd") {
    	        reDate = year + "" + month + "" + date;
    	    }

    	    if (dateType == "yyyy-mm-dd") {
    	        reDate = year + "-" + month + "-" + date;
    	    }
    	    if (dateType == "yyyy-mm") {
    	        reDate = year + "-" + month;
    	    }
    	    if (dateType == "dd-mm-yyyy") {
    	        reDate = date + "-" + month + "-" + year;
    	    }


    	    return reDate;
    	},

    	/**
    	 * 화면의 접기 버튼 클릭 이벤트
    	 */
    	fn_pageLayerCtrl : function(target, button) {
    		if($(target).is(":visible")) {
    			$(target).hide();
    			if($(target).prev().find("i.fa-forward").length > 0) {
    				$(target).prev().find("i.fa-forward").removeClass("fa-rotate-270");
    				$(target).prev().find("i.fa-forward").addClass("fa-rotate-90");
    			} 
    			else {
    				if($(target).prev(".sub-tool").length > 0) {
    					var subTarget = $(target).prev(".sub-tool").find(".btn-wrap.fix-r .i-func-close");
    					subTarget.removeClass("i-func-close");
    					subTarget.addClass("i-func-open");
    				}
    				else if($(target).parent().parent().find("i.fa-forward").length > 0) {
        				$(target).parent().parent().find("i.fa-forward").removeClass("fa-rotate-270");
        				$(target).parent().parent().find("i.fa-forward").addClass("fa-rotate-90");
        			}
    			}
    		}
    		else {
    			$(target).show();
    			if($(target).prev().find("i.fa-forward").length > 0) {
    				$(target).prev().find("i.fa-forward").removeClass("fa-rotate-90");
    				$(target).prev().find("i.fa-forward").addClass("fa-rotate-270");
    			} 
    			else {
    				if($(target).prev(".sub-tool").length > 0) {
    					var subTarget = $(target).prev(".sub-tool").find(".btn-wrap.fix-r .i-func-open");
    					subTarget.removeClass("i-func-open");
    					subTarget.addClass("i-func-close");
    				}
    				else if($(target).parent().parent().find("i.fa-forward").length > 0) {
        				$(target).parent().parent().find("i.fa-forward").removeClass("fa-rotate-90");
        				$(target).parent().parent().find("i.fa-forward").addClass("fa-rotate-270");
        			}
    			}
    		}

    	    if(button) $(button).toggleClass('toggled');
    	},
    	/**
    	 * treeview conversing
    	 */
    	fn_toTreeData : function(data,keyField,txtField,rootTitle) {
    		var rtnData;
    		if(data != null){
    			if(data.constructor.toString().indexOf("Array") > -1){
    				if(data.length > 1){
    				rtnData = {
  						  [keyField] : "root",
  						  [txtField] : rootTitle,
  						  children : data
  						};
    				} else {
    					rtnData = data[0];
    				}
    			} else {
    				rtnData = data;
    			}
    		}
    		return rtnData;
    	},
    	
    	/**
    	 * 숫자만 있는지 검사
    	 */
    	fn_onlyNumber : function(event) {
    		
    		event = event || window.event;
			var keyID = (event.which) ? event.which : event.keyCode;

    	    if ((keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39) {
    	        return true;
    	    } else {
    	        return false;
    	    }
    	},
    	
    	/**
    	 * 문자 제거
    	 */
    	fn_removeChar : function(event) {
    	    event = event || window.event;
    	    var keyID = (event.which) ? event.which : event.keyCode;
    	    var targetValue;

    	    if (keyID == 37 || keyID == 39 || keyID == 16 || keyID == 35 || keyID == 36) {
    	        return;
    	    } else {
    	        targetValue = event.target.value;

    	        if (!isNaN(fn_removeComma(targetValue))) { //문자가 아니면
    	            targetValue = Number(fn_removeComma(targetValue));
    	        }
    	        event.target.value = fn_setComma(targetValue + "".replace(/[^0-9]/g, ""));
    	    }
    	},
    	/**
    	 * 타임스템프 리포멧
    	 * param : dt[날짜],[yy-mm-dd HH:mm:ss...]
    	 */
    	fn_setDateTimeFormat : function(dt,fmt) {
    		var rtnVal = "";
    		if(fmt && fmt.length > 0){
    			if(dt == undefined ){
    				return rtnVal;
    			}
    			dt = dt.replace(/\-/g, "");
    			dt = dt.replace(/\//g, "");
    			dt = dt.replace(/\:/g, "");
    			dt = dt.replace(/\ /g, "");
    			if(dt.length > 0 && dt.length <= 14){
    				var year = "";
    				var month = "";
    				var day = "";
    				var hour = "";
    				var minute = "";
    				var secound = "";
    					
    				if(dt.length >= 4){
    					year = dt.substr(0,4);
    				}
    				if(dt.length >= 6){
    					month =  dt.substr(4,2);
    				}
    				if(dt.length >= 8){
    					day =  dt.substr(6,2);
    				}
    				if(dt.length >= 10){
    					hour =  dt.substr(8,2);
    				}
    				if(dt.length >= 12){
    					minute =  dt.substr(10,2);
    				}
    				if(dt.length >= 14){
    					secound =  dt.substr(12,2);
    				}
    				rtnVal = fmt.toLowerCase().replace("yyyy",year);
    				rtnVal = rtnVal.replace("mm",month);
    				rtnVal = rtnVal.replace("dd",day);
    				rtnVal = rtnVal.replace("hh",hour);
    				rtnVal = rtnVal.replace("mi",minute);
    				rtnVal = rtnVal.replace("ss",secound);
    			}
    		} else {
    			dt = dt.replace(/\-/g, "");
    			rtnVal = dt.replace(/\//g, "");
    		}
    		return rtnVal;
    	},
    	/**
    	 * 날짜 리포멧
    	 * param : dt[날짜],[true[yy-mm-dd], false[yymmdd]]
    	 */
    	fn_setDateFormat : function(dt,b) {
    	    var rtnVal = "";
    	    if(b){
    	    	if(dt == undefined ){
    	    		return rtnVal;
    	    	}
    	    	dt = dt.replace(/\-/g, "");
    	    	dt = dt.replace(/\//g, "");
    	    	if(dt.length > 0 && dt.length >= 8){
    	    		rtnVal = dt.substr(0,4) + "-" +  dt.substr(4,2) + "-" +  dt.substr(6,2);
    	    	}
    	    } else {
    	    	dt = dt.replace(/\-/g, "");
    	    	rtnVal = dt.replace(/\//g, "");
    	    }
    	    return rtnVal;
    	},
    	/**
    	 * 시간 리포멧
    	 * param : dt[날짜],[true[yy-mm-dd], false[yymmdd]]
    	 */
    	fn_setTimeFormat : function(dt,b) {
    	    var rtnVal = "";
    	    if(b){
    	    	if(dt == undefined ){
    	    		return rtnVal;
    	    	}
    	    	dt = dt.replace(/\:/g, "");
    	    	dt = dt.replace(/\//g, "");
    	    	if(dt.length > 0 && dt.length >= 6){
    	    		rtnVal = dt.substr(0,2) + ":" +  dt.substr(2,2) + ":" +  dt.substr(4,2);
    	    	}
    	    } else {
    	    	dt = dt.replace(/\:/g, "");
    	    	rtnVal = dt.replace(/\//g, "");
    	    }
    	    return rtnVal;
    	},
    	/**
    	 * 숫자에 콤마 삽입
    	 */
    	fn_setComma : function(num) {
    	    num = num + "";
    	    if (num != "") {
    	        var regx = new RegExp(/(-?\d+)(\d{3})/);
    	        var bExists = num.indexOf(".", 0);
    	        var strArr = num.split('.');

    	        //콤마 표시
    	        while (regx.test(strArr[0])) {
    	            strArr[0] = strArr[0].replace(regx, "$1,$2");
    	        }

    	        //소수점 표시
    	        if (bExists > -1)
    	            return strArr[0] + "." + strArr[1];
    	        else
    	            return strArr[0];
    	    }
    	    else {
    	        return "";
    	    }
    	},

    	/**
    	 * 숫자 콤마 제거
    	 */
    	fn_removeCommaToStr : function(n) {
    		if(n) {
    			return n.replace(/,/g, "");
    		}
    	},
    	/**
    	 * 숫자 콤마 제거
    	 */
    	fn_removeComma : function(n) {
    	    return parseInt(n.replace(/,/g, ""));
    	},
    	
    	// 날짜값 변환 YYYY-MM-DD >> YYYYMMDD
    	fn_getDateValue : function(value) {
    		return value.replace(/-/gi, '');
    	},

    	fn_setDateValue : function(value) {
    	    if(this.fn_isNull(value)) return '';
    	    return [value.slice(0, 4), '-', value.slice(4, 6), '-', value.slice(6)].join('');
    	},

    	// 시간값 변환 HH:MM:SS >> HHMMSS
    	fn_getTimeValue : function(value) {
    	    return value.replace(/:/gi, '');
    	},

    	// 시간값 변환 HHMMSS >> HH:MM:SS
    	fn_setTimeValue : function(value) {
    	    if(this.fn_isNull(value)) return '';
    	    return [value.slice(0, 2), ':', value.slice(2, 4), ':', value.slice(4)].join('');
    	},
    	
    	/**
    	 * 필수 입력 항목 검증
    	 * paramList : 입력항목을 검증할 항목명
    	 * 
    	 * 리턴
    	 * boolean   : true 로 리턴되는 경우 필수입력 누락된 항목이 존재
    	 *             false로 리턴되는 경우 필수입력 누락항목 미존재
    	 */
    	fn_validCheck : function(val,title) {
    		//파라미터 입력 여부 확인
    		if(val == undefined) {
    			return false;
    		}
    		if(typeof val == "object"){
    			val = val.val();
    		}
    		if(val == undefined) {
    			return false;
    		}
    		if(val == '') {
//    			obj.focus();
    			var alertParam = {};
//    			alertParam.content = "[" + title + "]은(는) 필수 입력 항목입니다.";
    			alertParam.content = "["+title+"]" + this.makeBxI18n().getValue('{%=cbb_err_msg.AUICME0064%}') + this.makeBxI18n().getValue('{%=cbb_err_msg.AUICME0004%}'); 
    			alertParam.closeText = this.makeBxI18n().getValue('{%=cbb_items.SCRNITM#cnfrm%}'); 
//    			alertParam.closeText = "확인";
    			 
        		console.log("param.title : " + alertParam.title);
        		console.log("param.content : " + alertParam.content);

    			this.alert(alertParam);
    			return false;
    		}
			return true;
    	},
    	fn_format : function(str,val){
    		var s = str,
            ii = val.length;

	        while (ii--) {
	            s = s.replace(new RegExp('\\{' + ii + '\\}', 'gm'), val[ii]);
	        }
	        return s;
    	},
    	/**
    	 * 엔터 처리
    	 * _targetElementList : 엔터 이벤트를 적용할 element 위치
    	 * _fn : 함수
    	 */
    	fn_keyPressEnter : function(_targetElementList, _fn) {
    		if(!angular.isArray(_targetElementList)) {
    			alert("대상 element는 array 로 변수를 넘겨야 합니다.");
    			return false;
    		}
    		
    		if(!angular.isDefined(_fn) || _fn === null || typeof _fn !== "function") {
    			alert("대상 함수가 없습니다.");
    			return false;
    		}
    		
    		$(_targetElementList).each(function(idx, data) {
    			angular.element(data).on({
    				"keypress" : function(e) {
    					if(e.which === 13) { // 엔터 키코드
    						_fn(); // 호출 함수
    					}
    				}
    			});
    		});
    	},
    	
    	/**
    	 * 화면에 적용 한다.
    	 * scope : $scope
    	 * fn : callback 함수
    	 */
    	fn_apply : function({scope, fn} = {}) {
    		if(scope) {
    			if (scope.$$phase == '$apply' || scope.$$phase == '$digest' ) {
    				typeof fn === "function" && fn();
    			} else {
    				scope.$apply(function() {
    					typeof fn === "function" && fn();
    				});
    			}
    		}
    		else {
    			alert("scope 변수가 없습니다. scope를 입력 하십시오.");
    		}
    	},
    	
    	/**
    	 * 날짜 일자 계산
    	 * 몇일후 몇일전을 계산 한다.
    	 * date : 기준일자
    	 * calDay :  변경일
    	 * return String 
    	 */
    	fn_calDate : function({date, calDay} = {}) {
    		if(this.fn_isNull(date)) {
    			alert("fn_calDate 기준 날짜가 없습니다.");
    			return "";
    		}
    		
    		if(isNaN(calDay)) {
    			alert("fn_calDate 계산 하려는 날짜가 숫자가 아닙니다.");
    			return "";
    		}
    		else {
    			calDay = Number(calDay);
    		}
    		
    		date = date.replace(/-/g, "").replace(/\//g, "");
    		
    		if(date.length !== 8) {
    			alert("fn_calDate 날짜 (/, -) 미포함 8자리가 아닙니다.");
    			return "";
    		}
    		
    		var year = date.substring(0, 4);
    		var month = date.substring(4, 6);
    		var day = date.substring(6);
    		
    		var returnDate = new Date(Date.parse(new Date(year+"-"+month+"-"+day)) + calDay * 1000 * 60 * 60 * 24);
    		var instCd = this.CommonInfo().getInstInfo().instCd;
    		
    		var dtFormatCd = this.fn_getInstParm(instCd, "dtFormatCd");
    		var dateFormat = "";

    		if(dtFormatCd == "01") { // yyyy-mm-dd
    			dateFormat = "yyyy-MM-dd";
        	}
        	else if(dtFormatCd == "02") { //dd-mm-yyyy
        		dateFormat = "dd-MM-yy";
        	}
        	else {
        		dateFormat = "yyyy-MM-dd";
        	}
    		
    		return new XDate(returnDate).toString(dateFormat);
    		
    	},
    	
    	/**
    	 * mainTarget 하위의 label 을 찾아서 title 을 설정 한다.
    	 * 다국어 생성후 호출 한다.
    	 */
    	fn_addLabelTitle : function(mainTarget) {
    		$(mainTarget.find("label")).each(function(idx, data) {
    			angular.element(data).attr("title", angular.element(data).text());
    		});
    	}
    } // end return
}
