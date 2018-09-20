/**
 * @fileOverview It inquires information that is essential for the composition of the Product Factory screen.
 * 				 function(1) Inquire of Common Code Information of the Product Factory. 
 * 				 function(2) Inquire of Menu Information for Login user role.
 * 				 function(3) Re-adjust Menu Cascading Style Sheets by login user role.
 * @author BankwareGlobal ProductFactory Team
 */
(function(global) {

    getCode();
    getMenu();
    mainMenuResize();

    /**
     * Inquire to Common Code information and make Global variable for Common Code.
     * @global {Object} codeNameMap - Common Code Master Information Object.
     * @global {Object} codeMapObj - Common Code Detail Information Object.
     * @global {Object} codeArrayObj - Common Code Detail Information Array Object.
     * @return {void}
     */
    function getCode() {
        PFRequest.get('/common/getListAllIndex.json', {}, {
            success: function (responseData) {

                var codeMapObj = {},
                    codeArrayObj = {},
                    codeNameMap = {};

                codeNameMap = PFUtil.convertArrayToMap(responseData, 'code', 'domainContent');
                codeMapObj = PFUtil.convertArrayToMap(responseData, 'codeName', 'codeList');

                jQuery.each(codeMapObj, function (codeType, codeUnits) {
                    var codeUnit = {};

                    codeUnits.forEach(function (code, i) {
                        codeUnit[code.code] = code.name;
                    });

                    codeMapObj[codeType] = codeUnit;
                    codeArrayObj[codeType] = codeUnits;
                });

                global.codeNameMap = codeNameMap;
                global.codeMapObj = codeMapObj;
                global.codeArrayObj = codeArrayObj;

            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'IndexService',
                operation: 'getAllEnumCode',
                locale: getCookie('lang')
            }
        });
    }

    /**
     * Inquire to the ProductFactory Menu information and make Global variable for Menu.
     * @global {Object} g_menu_data - Menu Data for the ProductFactory menu assembly.
     * @global {Object} g_hidden_data - Hidden Menu Data for the ProductFactory menu assembly.
     * @global {Object} g_menuList - ProductFactory Menu Information Object.
     * @global {Object} g_cndAtrb - Authority Data for Condition Attribute.
     * @global {Object} g_pdBaseRelAuthority - Authority Data for Product Relation.  
	 * @global {Object} g_projectTypeAuthority - Authority Data for Project Type.
	 * @return {void}
     */
    function getMenu() {

        var requestParam = {
            staffId : getCookie('loginId')
        }
        PFRequest.get('/common/role/getUserRoleMenuDetailList.json', requestParam, {
            success: function (responseData) {

                if(responseData.length == 0){
                    return;
                }
                
                // 메뉴관리 외부화에따른 조회값 저장 ( 트리구조 형태 )
                global.g_menu_data = responseData.menuMasterWrapVO;
                global.g_hidden_data = responseData.hiddenMenuList;
                
                var menuList = {};
                var cndAtrb = {};
                var pdBaseRelAuthority = {};
                var projectTypeAuthority = {};
                
                $.each(responseData.voList, function (index, menu) {

                    if(menu.athrtyTpDscd == '01') {
                    	
                    	
                    	// OHS 2017.08.31 수정
                    	// 기존 menuId + scrnId 에서 화면주소로 변경
                    	// ex. /setting/menu_setting/index.htm
                    	if(menu.scrnUrlAddr) {
                        	menuList[menu.scrnUrlAddr] = {
                        		useYn: menu.useYn,
                                writeYn: menu.writeYn
                        	};                    		
                    	}
                    }else if(menu.athrtyTpDscd == '05'){    // 조건속성일때
                        cndAtrb['cndAtrb-'+menu.atrbDscd] = menu.useYn;
                    }else if(menu.athrtyTpDscd == '06'){    // 상품기본/관계일때
                        if(menu.atrbDscd=='01'){
                            pdBaseRelAuthority['base'] = menu.writeYn;       // 01.기본, 02.관계
                        }else if(menu.atrbDscd == '02') {
                            pdBaseRelAuthority['rel'] = menu.writeYn;       // 01.기본, 02.관계
                        }
                    }else if(menu.athrtyTpDscd == '07'){    // 개발과제일때
                        projectTypeAuthority[menu.atrbDscd] = menu.useYn;
                    }
                })
                global.g_menuList = menuList;
                global.g_cndAtrb = cndAtrb;
                global.g_pdBaseRelAuthority = pdBaseRelAuthority;
                global.g_projectTypeAuthority = projectTypeAuthority;

                if (g_menuList['/planner/project/index.htm'].writeYn != 'Y') {
                    $('.task-create-popup-btn').hide();
                }
            },
            async:false,
            bxmHeader: {
                application: 'PF_Factory',
                service: 'RoleMenuDetailService',
                operation: 'queryListUserRoleMenuDetail',
                locale: getCookie('lang')
            }
        });
    }

    /**
     * Re-adjust Menu Cascading Style Sheets by login user role.
     * 역할별메뉴에따라서 보이고안보이고에따른 css 세부조절
     * @return {void}
     */
    function mainMenuResize() {
        $('ul.product-submenu-area').each(function(idx, element) {
        	// product-submenu-area영역에서 보이는메뉴가 하나도없으면처리
        	var displayElementCnt = 0;
        	$(element).find('li').each(function(idx_, element_) {
        		if($(element_).css('display') != 'none') {
        			displayElementCnt++;
        		}
        	})
        	
        	if(displayElementCnt == 0) {
        		$(element).css('margin-top', '0px');
        	}
        	else {
        		$(element).css('margin-top', '-10px');
        	}
        });
    }
    
    /**
     * Getting the Cookie
     * @param {String} cName - Cookie name
     * @return {String} Cookie value
     */
    function getCookie(cName) {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if(start != -1){
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if(end == -1)end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }
})(window);