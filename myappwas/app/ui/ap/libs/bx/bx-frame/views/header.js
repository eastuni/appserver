define(
    [
        'bx/common/config'
        , 'bx/common/common-info'
        , 'bx/views/workspace'
        , 'text!bx/views/header-tool-tpl.html'
    ],
    function (
    		  config
    		  , commonInfo
    		  , workspaceView
    		  , headerToolTpl
    		  ) {
        var HeaderView = Backbone.View.extend({
                el: '#header'

                , events: {
                	'click .logout-btn': 'logout'
            		, 'click .bx-primary-menu-item': 'selectPrimaryMenu'
        			, 'keydown .instNm': 'fn_instNmEnter'
    				, 'click .ccb-cust-name': 'movePersonalInfo'
					, 'change #cbb-system-date-wrap': 'changeSystemDateWrap'
                	, 'change #header-instSelectArea': 'changeInstCd'
            		, 'change #header-theme': 'changeHeaderTheme'
        			, 'click #icon-cal': 'clickIconCal'
                }

                , templates: {
                    headerToolTpl: headerToolTpl
                }
                
                , clickIconCal : function() {
                	fn_datePickerIconClick("#cbb-system-date-wrap");
                }
                
                , initialize: function () {
                    var that = this;
                    var loginMode = that.setHeaderFlag();
                    that.$el.find('.header-tool').html(that.headerToolTpl(loginMode));
                    
                    $("#themeArea").hide();
                    // 기관코드 설정
                    that.fn_getInstCdList();
                    
                    //과제목록 셋팅
                    fn_headerTaskList(false);  //common.js
                    
                    // 달력 설정
                    fn_makeDatePicker("#cbb-system-date-wrap");
                    

                	// 로그인기관 label 설정  : 2017.06.26 조남규sm의 요청에 의해 불필요한 정보는 보여주지 않도록 함
                	//$("#headerloinInstNmTitle").text(bxMsg('cbb_items.SCRNITM#loinInstNm')+" :");
                	//$("#headerloinInstNm").text($.sessionStorage('instNm'));
                	
                    // 개발 운경 설정
                    if(cbpMode == "D") { // 개발
                    	$("#cbpMode").text(bxMsg('cbb_items.SCRNITM#dvlpmnt'));
                    }
                    else { // 운영
                    	$("#cbpMode").text(bxMsg('cbb_items.SCRNITM#oprtn'));
                    }
                    
                    that.$primaryMenuArea = $("#main-body").find('.primary-menu'); 

                    $.sessionStorage('headerInstCd', $.sessionStorage('instCd'));
                    $.sessionStorage('headerInstNm', $.sessionStorage('instNm'));
                    
                    // 로그인한 정보를 instInfo 에 설정한다.
                    commonInfo.setInstInfo({
                        instCd: $.sessionStorage('instCd')
                        , instNm: $.sessionStorage('instNm')
                    });
                    
/////////////////////////////////////////////////// 사용자 정보 설정 start ///////////////////////////////////////////////////
                    that.$userName = that.$el.find('.ccb-user-name');
                    that.$userDeptNm = that.$el.find('.ccb-user-deptNm');
                    that.$userDeptId = that.$el.find('.ccb-user-deptId');
                    
                    // 공통 정보 액세스 핸들러 등록
                    commonInfo.registAssignHandler('userInfo', function (userInfo) {
                    	that.$userName.text(userInfo.name);
                    	that.$userDeptNm.text(userInfo.deptNm);
                    	that.$userDeptId.text(userInfo.deptId);
                    });
                    
                    // 사용자정보 설정
                    commonInfo.setUserInfo({
                        name: $.sessionStorage('nm'),
                        loinIdNbr: $.sessionStorage('loinIdNbr'),
                        staffId: $.sessionStorage('staffId'),
                        deptNm: $.sessionStorage('deptNm'),
                        deptId: $.sessionStorage('deptId')
                    });
                    
/////////////////////////////////////////////////// 사용자 정보 설정  end ///////////////////////////////////////////////////
                    
                    // 언어 설정
                    commonInfo.setLocale($.sessionStorage('lngCd'));

//                    // 고객정보설정
//                    commonInfo.setTargetCustomerInfo({
//                    	name: ' ',
//                    	account: ' '
//                    });
//                    
//
//                    that.$customerName = that.$el.find('.ccb-header-customer-name');
//                    that.$customerAccount = that.$el.find('.ccb-header-customer-account');
//
//                    that.$instCd = that.$el.find('.instCd');
//                    that.$instNm = that.$el.find('.instNm');
//
//                    that.$locale = that.$el.find('.cbb-language-wrap');
//
//            		that.$el.find('[data-form-param="instCd"]').val($.sessionStorage('instCd'));
//                    that.$el.find('[data-form-param="instNm"]').val($.sessionStorage('instNm'));
//
//
//                    commonInfo.registAssignHandler('targetCustomerInfo', function (customerInfo) {
//                        that.$customerName.text(customerInfo.name);
//                        that.$customerAccount.text(customerInfo.account);
//                    });
//
                    commonInfo.registAssignHandler('systemDate', function (systemDate) {
                        that.$el.find('#cbb-system-date-wrap').val(systemDate);
                    });
//
//                    commonInfo.registAssignHandler('locale', function (locale) {
//                        that.$locale.text(locale);
//                    });
//
                    commonInfo.registAssignHandler('instInfo', function (instInfo) {
                        $.sessionStorage('headerInstCd', instInfo.instCd);
                        $.sessionStorage('headerInstNm', instInfo.instNm);
                    });
                    
                    $(that.$primaryMenuArea).on('click', '.bx-primary-menu-item', function(e) {
                    	that.selectPrimaryMenu(e);
                    });
                }

                // 로그아웃버튼 클릭
                , logout: function (e) {
                	fn_confirmMessage(e, bxMsg('cbb_items.SCRNITM#logout'), bxMsg('main.sign-out-msg'), this.fn_oklogout);
                }
                
                , fn_oklogout : function() {
                	$.removeCookie('loinIdNbr');
                    sessionStorage.clear();

                    var href = location.href;
                    var restLoc = href.lastIndexOf('/');
                    location.href = href.substring(0, restLoc);
                }
                
                // 메인 메뉴 생성
                , renderRootMenu: function (rootMenuList) {
                	var that = this;
	    			
            		$(rootMenuList).each(function(idx, data) {
            			var classOn = "";
            			if(idx == 0) classOn = "on";

            			var mainMenu = "<li class=\"bw-btn bx-primary-menu-item "+classOn+"\" data-id=\""+data.menuId+"\">";
            			mainMenu += "<i class=\"bw-icon i-30 "+data.iconNm+"\" title=\""+data.menuNm+"\"></i></li>";
            			that.$primaryMenuArea.append(mainMenu);
            		});
            		
//            		that.$el.find('.primary-menu-item.on').trigger("click");
                }
                
                // 메인 메뉴 클릭
                , selectPrimaryMenu: function (e) {
                    var $current = $(e.currentTarget);

                    this.$primaryMenuArea.find('.bx-primary-menu-item.on').removeClass('on');
                    $current.addClass('on');

                    this.trigger('select-root-menu', {rootMenuId: $current.attr('data-id')});
                }
                
                /*기관코드 생성*/
                , fn_getInstCdList : function() {
                	var that = this;
                    sParam = {};

                    sParam.instCd = "";
                    sParam.instNm = "";

                    var linkData = {"header": fn_getHeader("CAPCM0308402"), "CaInstMgmtSvcGetInstIn": sParam};

                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	
                        success: function (responseData) {
                        	var returnCode = responseData.header.returnCode;
                        	if(returnCode == "0") { // 정상
                        		if (responseData.CaInstMgmtSvcGetInstOut) {
                                	// 기관코드 콤보 설정
                                	var $selectInst = $("#header-instSelectArea");
                                	
                                	$('#header-instSelectArea option').remove();
                                	
                                	var instList = responseData.CaInstMgmtSvcGetInstOut.instList;
                                	$selectInst.attr("data-form-param", "instCd");
//                                	$selectInst.append($(document.createElement('option')).val("").text(" ").attr('selected', true));
                                	
                                	$(instList).each(function(idx, item) {
                                		// 건수만큼 자식 생성
                                		var optionText = item.instNm;
                                		var optionValue = item.instCd;
                                		
                                		$selectInst.append($(document.createElement('option')).val(optionValue).text(optionText));
                                	});
                                	
                                	// 설정대상기관 label 설정
                                	$("#headerSettingTrgtInstNm").text(bxMsg('cbb_items.SCRNITM#settingTrgtInstNm')+" :");
                                	
                                	// 설정대상기관 label 설정
                                	$("#cc").text(bxMsg('cbb_items.SCRNITM#settingTrgtInstNm')+" :");
//                                	that.changeInstCd();
                                	
                                    console.log(constantAdminInstCd + '__' + $.sessionStorage('instCd'));
                                    
                                }
                                else {
                                	$('#header-instSelectArea option').remove();
                                }
                        	}
                        }
                    });
                }
                
                
                
                //기관코드 변경
                , changeInstCd: function () {
                    var that = this;
                    var param = {};
                    var instCd = $('#header-instSelectArea').val();
                    var instNm = $("#header-instSelectArea option:selected").text();
                    $.sessionStorage('headerInstCd', instCd);
                    $.sessionStorage('headerInstNm', instNm);

                    commonInfo.setInstInfo({
                        instCd: instCd,
                        instNm: instNm
                    });
                    
                    that.trigger('select-inst');
                }

                , movePersonalInfo: function () {
                    workspaceView.changePage('SCU122');
                }
                
                // 달력선택
                , changeSystemDateWrap: function () {
                    var that = this;
                    var setDt = fn_getDateValue(that.$el.find('#cbb-system-date-wrap').val());

                    $.sessionStorage('txDt', setDt);
                }
                
                , changeHeaderTheme : function() {
                	// header 테마 설정
                	var that = this;
                	var headerTheme = that.$el.find('#header-theme').val();
                	
                	var $header = $("#header");
                	var headers = $header.attr("class").split(" ");
                	
                	$(headers).each(function(idx, data) {
                		if(data !== "header") {
                			$("#header").removeClass(data);
                		}
                	});
                	
                	if(headerTheme == "hd3" || headerTheme == "hd1") {
                		$("#cbb-system-date-wrap").css("background", "linear-gradient(to right, rgba(66,82,174,1) 0%,rgba(101,97,204,1) 100%)");
                	}
                	else if(headerTheme == "hd2"){
                		$("#cbb-system-date-wrap").css("background", "");
                	}
                	else {
                		$("#cbb-system-date-wrap").css("background", "#eee");
                	}
                	
                	$("#header").addClass(headerTheme);
                }
                
                , setHeaderFlag: function () {
                    // For header rendering
                    var loginMode = {};
                    var loginState = false;
                    var loginId;

                    if (sessionStorage.loinIdNbr != undefined) {
                        loginState = true;
                    }

                    if (sessionStorage.custMode == "true") {
                        if (sessionStorage.loginId != undefined) {
                            loginId = sessionStorage.loginId.replace(/"/gi, '');
                        }

                        loginMode = {
                            custMode: true
                            , staffMode: false
                            , loginId: loginId
                            , loginState: loginState
                        };
                    } else {
                        loginMode = {
                            custMode: false
                            , staffMode: true
                            , loginId: loginId
                            , loginState: loginState
                        };
                    }

                    return loginMode;
                }
                
            });
        return HeaderView;
    }
)
;