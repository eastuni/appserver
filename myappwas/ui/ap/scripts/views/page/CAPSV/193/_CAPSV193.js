/*
@Screen number  CAPSV193
@brief          후행모니터링
@author         inbok.kim
@history        2016.05.24      생성
*/
define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/193/_CAPSV193.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-tree-grid'
        // tree grid
        //, 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/message/message-alert'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtTreeGrid
        , alertMessage) {


        /**
         * Backbone
         */
        var CAPSV193View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV193-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {


                         'click #btn-search-condition-inquire': 'inquire',  //조회수행
                         'click #btn-search-condition-reset': 'resetSearchCondition', // 조회조건초기화
                         'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                         'click #btn-search-condition-toggle': 'toggleSearchCondition', // 조회영역


                         'click #btn-search-result-toggle': 'toggleSearchResult', // 그리드 결과 영역
                         'click #btn-base-toggle': 'toggleBaseAttribute', // 상세 영역
                         'click #CAPSV193-base-refresh-button': 'refreshData' // 새로고침 영역
                    ,    'click .grid-dfrdStsUpdt-btn' : 'refreshDeferredStatus'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    var sParam1 = {};
                    sParam1.cdNbr = "A0609"; // 후행메인상태코드




                    bxProxy.all([
                       {
                            // 채널코드콤보 로딩
                            url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	comboCAPSV193 = new Ext.data.Store({
                                        fields: ['cd', 'cdNm'],
                                        data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                    });
                                }
                            }
                      	 }
                      ]
                        , {
                    	success: function () {
		                    that.CAPSV193TreeGrid = new ExtTreeGrid({
		                        url: null
		                        , httpMethod: 'post'
		                        , fields: ['dfrdId', 'dfrdNm', 'bizDt', 'dfrdMainStsCd', 'nodeNbr', 'startSeqNbr', 'endSeqNbr', 'lastSeqNbr','children'
		                                   ,'incmpltNbrgCnt','incmpltDataCnt']
		                        , id: 'CAPSV193TreeGrid'
		                        , columns: [
		                            {
		                                xtype: 'treecolumn'
		                                , text: bxMsg('cbb_items.AT#dfrdId')
		                                , flex: 4
		                                , height: 25
		                                , style: 'text-align:center'
		                                , dataIndex: 'dfrdId'
		                                , editor: 'textfield'
		                                , getClass: function () { }
		                            }
		                            , {
		                                text: bxMsg('cbb_items.AT#bizDt'), flex: 2, dataIndex: 'bizDt', editor: 'textfield'
		                                , style: 'text-align:center'
		                                , align: 'center'
	                                	, renderer: function(val)
	                                    {
	                                        return val;
	                                    }
		                            }
		                            , {
		                                text: bxMsg('cbb_items.AT#dfrdMainStsCd'), flex: 3, dataIndex: 'dfrdMainStsCd', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                                , renderer: function (val) {
                                            var index = comboCAPSV193.findExact('cd', val);


                                            if (index != -1) {
                                                var rs = comboCAPSV193.getAt(index).data;


                                                return rs.cdNm;
                                            }


                                        }
		                            }
		                            , {
		                                text: bxMsg('cbb_items.AT#nodeNbr'), flex: 2, dataIndex: 'nodeNbr', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                            }
		                            , { //시작일련번호
		                                text: bxMsg('cbb_items.AT#startSeqNbr'), flex: 3, dataIndex: 'startSeqNbr', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                            }
		                            , {//종료일련번호
		                                text: bxMsg('cbb_items.AT#endSeqNbr'), flex: 3, dataIndex: 'endSeqNbr', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                            }
		                            , {//최종일련번호
		                                text: bxMsg('cbb_items.AT#lastSeqNbr'), flex: 3, dataIndex: 'lastSeqNbr', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                            }
		                            , { //미완료 넘버링 건수
		                                text: bxMsg('cbb_items.AT#incmpltNbrgCnt'), flex: 4, dataIndex: 'incmpltNbrgCnt', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                            }
		                            , { //미완료 데이터 건수
		                                text: bxMsg('cbb_items.AT#incmpltDataCnt'), flex: 4, dataIndex: 'incmpltDataCnt', editor: 'textfield'
		                                , style: 'text-align:center', align: 'left'
		                            }
							        , { dataIndex: 'dfrdMainStsCd', renderer: function(value, p, record, idx){
							        	  if(value !== ''){
							        		  return Ext.String.format(
							        				  '<button class="bx-btn bx-btn-link grid-dfrdStsUpdt-btn" data-id="{0}" data-status="{1}">{2}</button>'
							        				  , record.data.dfrdId, record.data.dfrdMainStsCd, bxMsg('cbb_items.ABRVTN#restart')
							        		  );
							        	  }
						        	  },
						        	  //재시작
						        	  text: bxMsg('cbb_items.ABRVTN#restart'),
						        	  sortable: false,
						        	  align: 'center',
						        	  flex: 2
						          }


		                        ] // end of columns
		                        , viewConfig: {
		                            toggleOnDblClick: false
		                            , plugins: {
		                                ptype: 'treeviewdragdrop'
		                                , containerScroll: true
		                            }
		                        }


		                    });


		                    that.createGrid();
                    	} // end of success:.function
                    }); // end of bxProxy.all
                }




                // 첫번째 탭 활성화 설정
                , render: function () {
                    var that = this;


                    //that.$gridWrap = that.$el.find('.CAPSV193-tree-list-wrap');
                    //that.$gridWrap = that.$el.find('.CAPSV193TreeGrid');
                    that.loadUserAssignList();
                    //that.$gridWrap.html(that.CAPSV193TreeGrid.render({'height': CgridHeight}));


                    return that.$el;
                }


    			//그리드 생성
                , createGrid: function () {
                    var that = this;


                   this.$el.find(".CAPSV193TreeGrid").html(that.CAPSV193TreeGrid.render({'height': CgridHeight}));


                } // end of createGrid


                , loadUserAssignList: function () {
                    var that = this;


/*                    that.CAPSV193TreeGrid.loadData({
                        isReset: true
                    });*/
                }
				, refreshDeferredStatus: function(e){
					var that = this,
						dfrdId = $(e.currentTarget).attr('data-id'),
						statusCd = $(e.currentTarget).attr('data-status');


					var rs;
                    var index = comboCAPSV193.findExact('cd', statusCd);


                    if (index != -1) {
                        rs = comboCAPSV193.getAt(index).data;
                    }


					if(statusCd === '3' || statusCd === '5' || statusCd === '6'){
						param = {};
						param.dfrdId = dfrdId;




                        var linkData = {
                                "header": fn_getHeader("PMT0448201")
                                , "DfrdStsWorkSvcIn": param
                            };




                        // ajax호출
                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                            enableLoading: true
                            , success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                            	   if (responseData.ResponseCode) {
                            		   var msg = bxMsg('cbb_items.SCRNITM#success');
                            		   msg = msg.concat("<br>")
                            		   .concat(bxMsg('cbb_items.AT#dfrdMainStsCd'))
                            		   .concat(':')
                            		   .concat(rs.cdNm);
                            		   fn_alertMessage("",msg);
                            		   that.queryBaseArea();
                            	   }
                                }
                            }   // end of suucess: fucntion
                        }); // end of bxProxy
					} else{
						var msg = bxMsg('cbb_err_msg.AUISCE0027');
						msg = msg.concat("<br>")
						.concat(bxMsg('cbb_items.AT#dfrdMainStsCd'))
						.concat(':')
						.concat(rs.cdNm);
						fn_alertMessage("",msg);
						return false;
					}
				}
                /**
                 * 기본부 리셋
                 */
                , resetSearchCondition: function () {
                	var that = this;


                	that.$el.find('[data-form-param="dfrdId"]').val(""); //기관코드 텍스트 박스 리셋
                	that.$el.find('#rsltCnt').html(0);
                    that.CAPSV193TreeGrid.reloadData(); //그리드 데이터 리셋


                }


                /**
                 * 기본부 조회 버튼 클릭
                 */
                , inquire: function () {
                    var that = this;
                    var sParam = bxUtil.makeParamFromForm($('#CAPSV193-base-table'));


                    that.inquiryBaseData(sParam);
                }


                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = param;


                    var linkData = {
                        "header": fn_getHeader("PMT0448401")
                        , "DfrdStsWorkSvcIn": sParam
                    };


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                        	   if (responseData.DfrdStsWorkSvcOut) {
	                                var tbList = responseData.DfrdStsWorkSvcOut.dfrdStsWorkList;
	                                var param = {};
	                                param.menuLvlVal = 2;
	                                that.CAPSV193TreeGrid.setStoreRootNode(tbList);
	                                that.$el.find('#rsltCnt').html(responseData.DfrdStsWorkSvcOut.totCnt);
	                                that.trigger('select-menuLvl', param);
	                                that.CAPSV193TreeGrid.expandAll();


                        	   }
                            }
                        }   // end of suscess: fucntion
                    }); // end of bxProxy
                } // end
                /**
                 * 화면 리프레시
                 */
                , refreshData: function () {
                    var that = this;
                    var timeVal= that.$el.find('#refreshIntvl').val();


                    //토글로 처리
                    if(that.isRefresh){
                    	// refresh가 수행중 중지를 누른 경우
                    	that.isRefresh=false;
                    	//버튼의 label을 refresh로 변경
                    	that.$el.find('#CAPSV193-base-refresh-button').prop("innerHTML",bxMsg('cbb_items.SCRNITM#refresh') );
                    	//검색조건들을 enable 시킴 - 항상 disabled이므로 필요 없음
                    	if (that.go) { //실행중인 refresh를 중지시킴
                    		clearInterval(that.go);
                    	}
                    } else { // refresh가 처음 선택된 경우
                    	that.isRefresh=true;
                    	//버튼의 label을 중지로 변경
                    	that.$el.find('#CAPSV193-base-refresh-button').prop("innerHTML",bxMsg('cbb_items.ABRVTN#stop') );
                    	if(timeVal) {
                			var nTimeVal=parseInt(timeVal);  //정수로 바꾸기
                			if(nTimeVal>0){
                				that.go=setInterval(function(){
 		                			//call_inquiry
 		                			//alert("this is test");
 		                			that.inquire();
 		                		},nTimeVal*1000);
 	                		}
                    	}
                    }
                }
            })
            ; // end of Backbone.View.extend({


        return CAPSV193View;
    } // end of define function
)
; // end of define
