const angular = require('angular');

const md = require('./common.module');

md.factory('$commonIndexPaging', __factory);

function __factory($rootScope, $commonService) {
	
	/**
	 * 초기 설정
	 * scrnId : 화면ID
	 * pageSize : 조회건수
	 * naviSize : 페이징에 보여줄 건수 1 2 3 4 5 6 7 8 9 10
	 * scope : 해당 scope
	 * target : 페이징 위치 element 로 받음
	 */
	 var IndexPaging = function(__config) {
		 
		 angular.extend(this, __config);
		 
		 if($commonService.fn_isNull(this.scrnId) || $commonService.fn_isNull(this.pageSize) || $commonService.fn_isNull(this.naviSize)
				 || $commonService.fn_isNull(this.scope) || $commonService.fn_isNull(this.target)) {
			 alert("paging 처리할 필수값을 정의 하십시오.");
			 return false;
		 }
		 else {
			 if(this.target.find("#cbp-paging-area").length === 0) {
				 let childElement = angular.element("<div class=\"bw-paging add-mg-t\" id=\"cbp-paging-area\"></div>");
				 childElement.attr("scrnId", this.scrnId);
				 
				 // $scope.$apply 시 기존에 apply 가 실행중이면 에러가 발생하여 에러방지 if 문 삽입
				 if (this.scope.$$phase == '$apply' || this.scope.$$phase == '$digest' ) {
					 this.target.append(childElement);
				 } else {
					 this.scope.$apply(function() {
						 this.target.append(childElement);
					 });
				 }
			 }
		 }
		 
	 };
	
	/**
	 * 페이징 버튼 클릭
	 * pgNbr : 페이지번호
	 * totalCount : 전체건수
	 * indexClickFn : 버튼클릭시 callback 함수
	 */
	IndexPaging.prototype.setIndexPaging = function (pgNbr, totalCount, indexClickFn) {
        let that = this;
        
        that.pgNbr = pgNbr;
		that.totalCount = totalCount;
		
		let record_end_number = parseInt(parseInt(that.pgNbr) * parseInt(that.pageSize)); // 페이징 네이게이션의 마지막 번호	
		
		let record_start_number = parseInt(record_end_number - (parseInt(that.pageSize) - 1));
		if(record_end_number > parseInt(that.totalCount)){
			record_end_number = parseInt(that.totalCount);
		}
		
		// 전체 페이지 건수
		let total_page_count = parseInt(parseInt(that.totalCount) / parseInt(that.pageSize) + (parseInt(that.totalCount) % parseInt(that.pageSize) > 0 ? 1 : 0));
		if(that.pgNbr > total_page_count){
			that.pgNbr = total_page_count;
		}
		
		// 현재 그룹번호 
		let group_number = parseInt(parseInt(that.pgNbr) / parseInt(that.naviSize) + (parseInt(that.pgNbr) % parseInt(that.naviSize) > 0 ? 1:0)); // 그룹번호 
		// 보여지는 번호중 끝 번호
		let page_end_number = parseInt(group_number * parseInt(that.naviSize));		// 현재 페이징의 끝 번호
		// 보여지는 번호중 시작 번호
		let page_start_number = parseInt(page_end_number - (parseInt(that.naviSize) - 1)); // 현재 페이징의 시작 번호
		
//		현재 그룹 끝 번호가 전체페이지 수 보다 클 경우	현재 끝 번호를 마지막 번호로 넣는다.
		if(page_end_number > total_page_count){
			page_end_number = total_page_count;
		}
		// 이전 페이지 번호
		let prev_page_number = parseInt(page_start_number - parseInt(that.naviSize));
		// 다음 페이지 번호
		let next_page_number = parseInt(page_start_number + parseInt(that.naviSize));
		
//			이전 페이지 번호가 1보다 작을 경우 1을 설정 한다.		
		if(prev_page_number < 1){
			prev_page_number = 1;
		}

		// 다음 페이지보다 전체페이지 수보가 클경우
		if(next_page_number > total_page_count){
			next_page_number = total_page_count / parseInt(that.naviSize) * parseInt(that.naviSize) + 1;
		}
		
		let pagingArea = "";
		let prevArea = "";
		
		// 조회번호가 페이징네비게이션보다 클경우 << < 버튼을 생성 한다.
		if(Number(that.pgNbr) > Number(that.naviSize)) {
			prevArea += "<div class=\"ctr-btn\">";
			prevArea += "<button type=\"button\" class=\"btn-paging\" id=\"1\" ng-click=\""+that.scrnId+"commonIndexMovePaging\"><i class=\"fa fa-angle-double-left\"></i></button>";
			prevArea += "<button type=\"button\" class=\"btn-paging\" id=\""+prev_page_number+"\" ng-click=\""+that.scrnId+"commonIndexMovePaging\"><i class=\"fa fa-angle-left\"></i></button>";
			prevArea += "</div>";
		}
		
		pagingArea += prevArea;
		
		let pagingNums = "";
		
		page_start_number = page_start_number < 1 ? 1 : page_start_number;
		page_end_number = page_end_number < 1 ? 1 : page_end_number;
		
		// 페이징 번호 생성
		for(let i = page_start_number; i <= page_end_number; i++) {
			let currentPageClass = "";
			if(parseInt(that.pgNbr) == i) {
				currentPageClass = "on";
			}
			pagingNums += "<button type=\"button\" class=\"btn-paging "+currentPageClass+"\" id=\""+i+"\" ng-click=\""+that.scrnId+"commonIndexMovePaging\">"+i+"</button>";
		}
		
		pagingArea += pagingNums;
		
		// page_end_number 페이지 마지막번호 * 페이지건수 < 전체건수
		let nextArea = "";
		
		// 페이지의 끝 번호 * 조회사이즈가 전체 건수보다 작을경우 > >> 버튼을 생성 한다.
		if((page_end_number * parseInt(that.pageSize)) < parseInt(that.totalCount)) {
			nextArea += "<div class=\"ctr-btn\">";
			nextArea += "<button type=\"button\" class=\"btn-paging\" id=\""+next_page_number+"\" ng-click=\""+that.scrnId+"commonIndexMovePaging\"><i class=\"fa fa-angle-right\"></i></button>";
			nextArea += "<button type=\"button\" class=\"btn-paging\" id=\""+total_page_count+"\" ng-click=\""+that.scrnId+"commonIndexMovePaging\"><i class=\"fa fa-angle-double-right\"></i></button>";
			nextArea += "</div>";
		}
		
		pagingArea += nextArea;
		
		if (that.scope.$$phase == '$apply' || that.scope.$$phase == '$digest' ) {
			that.target.find("#cbp-paging-area").html(pagingArea);
		} else {
			this.scope.$apply(function() {
				that.target.find("#cbp-paging-area").html(pagingArea);
			});
		}
		
		that.target.find("#cbp-paging-area[scrnId='"+that.scrnId+"']").find('button').on("click", function(e) {
			typeof indexClickFn === 'function' && indexClickFn(e.currentTarget.id);
		});
    };
	
//    IndexPaging.prototype.setData = function(data) {
//        this.resetData();
//        this.store.loadData(data);
//    };

    
	return {
		getInstance : function(config) {
			return new IndexPaging(config);
		}
	};
} // end function