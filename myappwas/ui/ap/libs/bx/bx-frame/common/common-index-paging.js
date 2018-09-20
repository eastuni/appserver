define(
    [
		'text!bx/common/common-index-paging.html'
    ],
    function (
    		tpl
    		) {
        var commonPagingView = Backbone.View.extend({
        	 	tagName: 'section'
        	 	, className: 'cbp-paging'
                , events: {
                    'click .btn-paging': 'movePaging'
                }

        		, templates: {
                	tpl: tpl
                }

        		, initialize: function (config) {
                    var that = this;
                    $.extend(that, config);
                    
                    console.log(config);
                    
                    that.pgNbr = config.pgNbr;
                    that.pageSize = config.pageSize;
                    that.totalCount = config.totalCount;
                    that.naviSize = config.naviSize;
                    
                    that.$el.html(that.tpl());

                    that.$pageArea =  that.$el.find('#cbp-paging-area');
                }
                
        		, render: function () {
                    return this.$el;
                }
        		
        		, setPaging : function(pgNbr, totalCount) {
        			var that = this;
        			that.pgNbr = pgNbr;
        			that.totalCount = totalCount;
        			
        			var record_end_number = parseInt(parseInt(that.pgNbr) * parseInt(that.pageSize)); // 페이징 네이게이션의 마지막 번호	
        			
        			var record_start_number = parseInt(record_end_number - (parseInt(that.pageSize) - 1));
        			if(record_end_number > parseInt(that.totalCount)){
        				record_end_number = parseInt(that.totalCount);
        			}
        			
        			// 전체 페이지 건수
        			var total_page_count = parseInt(parseInt(that.totalCount) / parseInt(that.pageSize) + (parseInt(that.totalCount) % parseInt(that.pageSize) > 0 ? 1 : 0));
        			if(that.pgNbr > total_page_count){
        				that.pgNbr = total_page_count;
        			}
        			
        			// 현재 그룹번호 
        			var group_number = parseInt(parseInt(that.pgNbr) / parseInt(that.naviSize) + (parseInt(that.pgNbr) % parseInt(that.naviSize) > 0 ? 1:0)); // 그룹번호 
        			// 보여지는 번호중 끝 번호
        			var page_end_number = parseInt(group_number * parseInt(that.naviSize));		// 현재 페이징의 끝 번호
        			// 보여지는 번호중 시작 번호
        			var page_start_number = parseInt(page_end_number - (parseInt(that.naviSize) - 1)); // 현재 페이징의 시작 번호
        			
//        			현재 그룹 끝 번호가 전체페이지 수 보다 클 경우	현재 끝 번호를 마지막 번호로 넣는다.
        			if(page_end_number > total_page_count){
    					page_end_number = total_page_count;
    				}
        			// 이전 페이지 번호
        			var prev_page_number = parseInt(page_start_number - parseInt(that.naviSize));
        			// 다음 페이지 번호
        			var next_page_number = parseInt(page_start_number + parseInt(that.naviSize));
        			
//        				이전 페이지 번호가 1보다 작을 경우 1을 설정 한다.		
        			if(prev_page_number < 1){
        				prev_page_number = 1;
        			}

        			// 다음 페이지보다 전체페이지 수보가 클경우
        			if(next_page_number > total_page_count){
        				next_page_number = total_page_count / parseInt(that.naviSize) * parseInt(that.naviSize) + 1;
        			}
        			
        			var pagingArea = "";
        			var prevArea = "";
        			
        			// 조회번호가 페이징네비게이션보다 클경우 << < 버튼을 생성 한다.
        			if(Number(that.pgNbr) > Number(that.naviSize)) {
        				prevArea += "<div class=\"ctr-btn\">";
        				prevArea += "<button type=\"button\" class=\"btn-paging\" id=\"1\"><i class=\"fa fa-angle-double-left\"></i></button>";
        				prevArea += "<button type=\"button\" class=\"btn-paging\" id=\""+prev_page_number+"\"><i class=\"fa fa-angle-left\"></i></button>";
        				prevArea += "</div>";
        			}
        			
        			pagingArea += prevArea;
        			
        			var pagingNums = "";
        			
//        			console.log(page_start_number);
//        			console.log(page_end_number);
        			
        			page_start_number = page_start_number < 1 ? 1 : page_start_number;
        			page_end_number = page_end_number < 1 ? 1 : page_end_number;
        			
        			// 페이징 번호 생성
        			for(var i = page_start_number; i <= page_end_number; i++) {
        				var currentPageClass = "";
        				if(parseInt(that.pgNbr) == i) {
        					currentPageClass = "on";
        				}
        				pagingNums += "<button type=\"button\" class=\"btn-paging "+currentPageClass+"\" id=\""+i+"\">"+i+"</button>";
        			}
        			
        			pagingArea += pagingNums;
        			
        			// page_end_number 페이지 마지막번호 * 페이지건수 < 전체건수
        			var nextArea = "";
        			
        			// 페이지의 끝 번호 * 조회사이즈가 전체 건수보다 작을경우 > >> 버튼을 생성 한다.
        			if((page_end_number * parseInt(that.pageSize)) < parseInt(that.totalCount)) {
        				nextArea += "<div class=\"ctr-btn\">";
        				nextArea += "<button type=\"button\" class=\"btn-paging\" id=\""+next_page_number+"\"><i class=\"fa fa-angle-right\"></i></button>";
        				nextArea += "<button type=\"button\" class=\"btn-paging\" id=\""+total_page_count+"\"><i class=\"fa fa-angle-double-right\"></i></button>";
        				nextArea += "</div>";
        			}
        			
        			pagingArea += nextArea;
        			that.$pageArea.html(pagingArea);
        		}
        		
        		, movePaging : function(event) {
        			// 페이징 클릭시 부모창에 조회번호를 전달 한다.
        			this.trigger('paginSetData', event.currentTarget.id);
        		}
            }
        );

        return commonPagingView;
    }
)
;