/**
 * @author wb-yanggwikim
 *
 * @version $$id: , v 0.1 15. 2. 12. 오전 10:51 wb-yealeekim Exp $$
 */
define(
    function() {

        var _userInfo = {};
        var _targetCustomerInfo = {};
        var _systemDate = new XDate().toString('yyyy-MM-dd');
        var _locale = 'ko';
        var _instInfo = {};
        var _menuMap = {};
        var assignHandler = {};
        var _portletsMap = {};
        var _portletsPollingMap = {};
        
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
            	return _instInfo;
            },
            setMenuMap: function(rootMenuList) {
                rootMenuList.forEach(function(menuItem, i) {
                    _menuMap[menuItem.menuId] = menuItem.children;
                });
            },
            // 서브메뉴 생성
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
    }
);