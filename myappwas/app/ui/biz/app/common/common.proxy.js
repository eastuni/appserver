/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonProxy', __service);

function __service($http, $q, $timeout, $interval, $rootScope, $state, $commonConfig, $commonModal){
    var commonLoadingDim;
    var mainLodingDimList = {};
    var subLodingDimList = {};
    
    return {
        /**
         * 서비스를 sync 로 호출한다. (동기)
         */
        fn_callSyncSvc : function (url, linkData, option) {
        	
        	let that = this;
        	let srvcCd = "";
            if (linkData == null) return null;
            	
            if(linkData.header === null || !angular.isDefined(linkData.header.srvcCd)) {
        		alert("서비스코드가 정의되지 않았습니다.");
        		return false;
        	}
        	else {
        		srvcCd = linkData.header.srvcCd;
        	}
            
            $rootScope.$broadcast('__removeFooterLogMessage');
            
            if(option.enableLoading) {
        		let loadingDim = $('body').bxDim({
            		color: 'black',
            		enableBlur: true,
            		enableIcon: true,
            		iconType: 'spin',
            		text: 'Now Loading .....'
            	}).show();
        		subLodingDimList[srvcCd] = loadingDim;
        	}
            
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.open("post", url, false); // false for synchronous request
            xmlHttp.send(JSON.stringify(linkData));

            if(option.enableLoading) {
            	if(subLodingDimList[srvcCd]) {
    				subLodingDimList[srvcCd].hide();
    				delete subLodingDimList[srvcCd];
            	}
    		}
            
            let resultData = JSON.parse(xmlHttp.responseText);
            
            if(that.fn_commonChekResult(resultData)) {
            	return resultData;
            }
        },
        
        
        /**
         * 서비스를 async 로 호출한다. (비동기)
         */
        fn_callAsyncSvc : function(url, linkData, option) {
        	let that = this;
        	//console.log(url, linkData, option);
        	//console.log(option.callerController);
        	let srvcCd = "";
        	
        	if(linkData.header === null || !angular.isDefined(linkData.header.srvcCd)) {
        		alert("서비스코드가 정의되지 않았습니다.");
        		return false;
        	}
        	else {
        		srvcCd = linkData.header.srvcCd;
        	}
        	
        	$rootScope.$broadcast('__removeFooterLogMessage');
        	
        	// 로딩여부가 true 이고 로딩바가 실행되어 있지 않으면 한다.
        	if(option.enableLoading && !that.isDimExecution()) {
        		let loadingDim = $('body').bxDim({
            		color: 'clear',
            		enableBlur: false,
            		enableIcon: true,
            		iconType: 'spin',
            		text: 'Now Loading .....'
            	}).show();
        		option.cid = loadingDim.cid+new Date().getTime() / 1000;
        		subLodingDimList[srvcCd+option.cid] = loadingDim;
        	}

        	$http({
        		method: 'POST', 
        		url: url, 
        		data: JSON.stringify(linkData)
        	}).success(function (responseData) {
        		if(option.enableLoading && that.isDimExecution()) {   
        			if(subLodingDimList[srvcCd+option.cid]) {
        				subLodingDimList[srvcCd+option.cid].hide();
        				delete subLodingDimList[srvcCd+option.cid];
        				
                	}
        		}
        		responseData.callerController = option.callerController;
        		if(that.fn_commonChekResult(responseData)) {
        			typeof option.success === 'function' && option.success(responseData);
        		}
        		
        	}).error(function (data, status, headers, config) {
        		if(option.enableLoading && that.isDimExecution()) {
        			if(subLodingDimList[srvcCd+option.cid]) {
        				subLodingDimList[srvcCd+option.cid].hide();
        				delete subLodingDimList[srvcCd+option.cid];
                	}
        		}
        		$rootScope.$broadcast('__setFooterLogMessage', "cbb_items.SCRNITM#error");
        		typeof option.error === 'function' && option.error(data, status, headers, config);
        	}).finally(function() {
        		
            });
        },
        
        fn_commonChekResult : function (responseData) {
        	//returnCode 0 : 정상, 1: 에러, 2 : 시스템에러, 3 : 책임자승인
        	let returnCode = responseData.header.returnCode;
        	
        	/**
        	 * 모든 서비스 종료 시, 승인 세션 제거.
        	 * 승인 프로세스가 종료되지 않아, 화면에 승인식별자가 있는 경우,
        	 * 다시 세션스토리지에 설정되므로 해당 위치에서 clear
        	 */
        	$.sessionStorage('aprvlId', null);
        	
        	if(returnCode == "1" || returnCode == "2") { // 에러
        		
        		$commonModal.showMessageModal(responseData.header);
        		$rootScope.$broadcast('__setFooterLogMessage', "cbb_items.SCRNITM#error");
        		return false;
        	}
        	else if(returnCode == "3"){ //책임자승인
        		
        		var param = {};
            	var list = [];
            	/*WORKAREA_acctNbr_REPLACE_START*/
            	
            	//if(responseData.header.data.aprvlSts=="02"){ //승인거절이 난 후, 동일거래에 대해 재요청 시
            	//	$.sessionStorage('globalAprvlId', null); //재요청하는 승인식별자가 셋팅되기 전 기록을 지움
            	//}
            	
            	console.log("##b check header",responseData.header);
                // 2018.04.17  keewoong.hong  Header 정비
    			list.push({"aprvlId" : responseData.header.aprvlId});
    			//list.push({"scrnId" : responseData.header.data.scrnId});
    			//list.push({"srvcCd" : responseData.header.data.srvcCd});
    			//list.push({"seqNbr" : 0});
    			param.list = list;
    			var popInstance = $commonModal.showModal({
    				id : "SCM500",
    				name : "SCM500",
    				templateUrl : 'app/views/page/popup/SCM500/SCM500.tpl.html',
    				controller : 'views.page.popup.SCM500.SCM500.controller',
    				controllerAs : 'SCM500Ctrl', 
    				param : param
    			});
    			
    		/*WORKAREA_acctNbr_REPLACE_END*/
    			popInstance.result.then (
        			function (selectedItem) { 
        				console.log("seulakk1");
        				//SCM500에서 넘어온 값
        				console.log(selectedItem);
        				
//        				$.sessionStorage('globalAprvlId', selectedItem.aprvlId);
//        				var aprvlInfo = '{"aprvlId" : selectedItem.aprvlId, "srvcCd": selectedItem.srvcCd, "scrnId": selectedItem.scrnId}'
//        				$.sessionStorage('aprvlInfo', JSON.stringify(aprvlInfo));
        				console.log("#@#proxy responseData",responseData);
                		responseData.callerController.setGlobalAprvlId(selectedItem.aprvlId);
        			},
        			function () { // 닫기시 callback 함수
//        		        	console.log('Modal dismissed at: ' + new Date());
        				console.log("seulakk2");
        			}
            	);
            	
        		return false;
        	}
        	else {
        		$rootScope.$broadcast('__setFooterLogMessage', "cbb_items.SCRNITM#success");
        		return true;
        	}
        },
        
        // @이영주 사용 안함 삭제 해야됨
        showLoadingDim : function(options) {
        },

        // @이영주 사용 안함 삭제 해야됨
        hideLoadingDim : function(loadingDim) {
        },
        
        showMainLoadingDim : function(options) {
        	let loadingDim;
        	let __options = options ? options : {};
        	
        	__options.enableIcon = __options.enableIcon ? __options.enableIcon : false;
        	__options.iconType = __options.iconType ? __options.iconType : '';
        	__options.text = __options.text ? __options.text : '';
        	
        	loadingDim = $('body').bxDim({
        		color: 'black',
        		enableBlur: false,
        		enableIcon: __options.enableIcon,
        		iconType: __options.iconType,
        		text: __options.text
        	}).show();
        	
        	mainLodingDimList[loadingDim.cid] = loadingDim;
        	
    		return loadingDim;
        },
        
        hideMainLoadingDim : function(loadingDim) {
        	if(mainLodingDimList[loadingDim.cid]) {
        		loadingDim.hide();
        	}
        },
        
        /**
         * dim 이 실행 되었는지 판단 한다.
         */
        isDimExecution : function() {
        	if(angular.element("body .bx-dim").length > 0) {
        		return true;
        	}
        	else {
        		return false;
        	}
        }
        
    } // end return
} // end function