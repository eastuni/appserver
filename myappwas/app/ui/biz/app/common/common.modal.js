/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */
const angular = require('angular');

const md = require('./common.module');

md.service('$commonModal', __service);

function __service($uibModal, $timeout){
	var modalInfo = {};
	
    return {
        
    	showModal : function(param) {
    		
    		// 팝업창이 존재 하면 이중 팝업을 띄우지 못하게 한다.
    		if($("body").children().hasClass("bw-modal-wrap")) {
    			return;
    		}
    		
    		param.param.id = param.id;
    		param.param.name = param.name;
    		
    		let loadingDim = $('body').bxDim({
        		color: 'black',
        		enableBlur: false,
        		enableIcon: false
        	}).show();
    		
    		param.loadingDim = loadingDim;
    		modalInfo[param.id] = param;
    		  
    		let popupInstance = $uibModal.open({
    			id : param.name,
    			name : param.id,
    			templateUrl: param.templateUrl,
    			controller: param.controller,
    			controllerAs: param.controllerAs,
    			windowClass : "bw-modal-wrap",
//    			animation: $ctrl.animationsEnabled,
    			resolve: {
    				items: function () {
    					return param.param;
    				}
    			},
    			backdrop: "static"
    		});
    		
    		if (angular.isDefined(popupInstance)) {
    			popupInstance.closed.then(function(){
        			if(modalInfo[param.id]) {
        				if(modalInfo[param.id].loadingDim) {
        					modalInfo[param.id].loadingDim.hide();
        				}
        				delete modalInfo[param.id];
        			}
        		});
    		}
    		  		
    		return popupInstance;
    	},

    	showMessageModal : function(param) {
    		
    		let loadingDim = $('body').bxDim({
        		color: 'black',
        		enableBlur: false,
        		enableIcon: false
        	}).show();
    		
    		let popupInstance = $uibModal.open({
    			id : "modal_message",
    			name : "modal_message",
    			templateUrl: 'app/views/page/popup/message/message.tpl.html',
    			controller: 'views.page.popup.message.controller',
    			controllerAs: "messageCtrl",
    			windowClass : "modal-wrap fix-h modal-message-wrap",
    			animation: true,
    			resolve: {
    				items: function () {
    					return param;
    				}
    			},
    			backdrop: "static"
    		});
    		
    		if (angular.isDefined(popupInstance)) {
    			popupInstance.closed.then(function(){
    				loadingDim.hide();
        		});
    		}
    		return popupInstance;	
    	},
    	
    	modalInit : function(__option) {
    		this.modalModifyCss(__option);
    		this.modalMove(); 
    	},
    	
    	/**
    	 * 팝업창의 사이즈 조절 및 위치 설정
    	 */
    	modalModifyCss : function(__option) {
    		let modalDialog = $(".modal.bw-modal-wrap"); // 팝업의 최상단 element
    		let parentWidth = angular.element($("body")).prop('offsetWidth');
    		let parentHeight = angular.element($("body")).prop('offsetHeight');

    		let modalWidth = __option.width ? __option.width : "0";
    		let modalHeight = __option.height ? __option.height : angular.element(modalDialog).prop('offsetHeight')+"";
    		
    		// 높이 값을 직접 주고 싶을때는  modalHeight 에 값을 넣는다.
//    		var modalHeight = angular.element(modalDialog).prop('offsetHeight') + Number(__option.height); // 동적으로 추가되는 그리드 높이값 +
    		
    		let modalTop = (parentHeight / 2) - (Number(modalHeight) / 2); // 팝업의 상단 위치
    		let modalLeft = (parentWidth / 2) - (Number(modalWidth) / 2); // 팝업의 왼쪽 위치
    		
    		let css = {"width" : modalWidth + "px", "height" : modalHeight+"px", "left" : modalLeft + "px", "top" : modalTop + "px"};
    		modalDialog.css(css);
    		
    	}, // end modalModifyCss
    	
    	/**
    	 * 팝업창의 이동 이벤트 처리 호출
    	 */
    	modalMove : function() {
    		
    		$(".modal.bw-modal-wrap").draggable({
    			handle : '.modal-title', // 되는것
//    			cancel : '.modal-body, .modal-footer', // 안되는것
    			containment : 'parent',
    			scroll : false
    		});
    	} // end modalMove
    	
    } // end return
}

