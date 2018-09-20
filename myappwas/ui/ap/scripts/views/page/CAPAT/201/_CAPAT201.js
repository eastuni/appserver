define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
		  'bx-component/ext-grid/_ext-grid',
	      'bx-component/bx-tree/bx-tree',
	 	  'text!app/views/page/CAPAT/201/_CAPAT201.html',
		  'app/views/page/popup/CAPAT/popup-brnchCd',
		  'app/views/page/popup/CAPAT/popup-deptOrgnztnHist',
	      'app/views/page/popup/CAPCM/popup-kr-zipCd',
	      'app/views/page/popup/CAPAT/popup-deptRoleTmpltId',
		  'app/views/page/popup/CAPAT/popup-staffId',
		  'bx/views/workspace'
	 	 ],


function(config, commonInfo, ExtGrid, bxTree, tpl, popupDeptId, popupDeptOrgnztnHist, popupKrZipCd, popupDeptRoleTmpltId, popupStaffId, workspaceView) {


	var comboStore1 = {}; // 부서조직관계
	var comboStore2 = {}; // 부서상태코드
	var comboStore3 = {}; // 부서역할템플릿상태코드
	var roleList = {}; // 부서역할목록
	var instParams = {}; // 기관파라미터-주소입력유형 
	var currentDeptInfo = {}; // 선택한 부서의 정보
	var newUpDeptId = ""; //신규부서등록시 상위부서식별자
	var newUpDeptNm = ""; //신규부서등록시 상위부서이름
	var registerNewDept = false;


	var CAPAT201BaseView = Backbone.View.extend({
				tagName : 'section'
				, className : 'bx-container CAPAT201-page'
				, templates : {
					'tpl' : tpl
				}
				, events : {
					'click #btn-base-attribute-reset' : 'resetCAPAT201Base' //입력항목 초기화
					, 'click #btn-base-attribute-save' : 'saveCAPAT201Base' //부서신규 혹은 정보변경
					, 'click #btn-dept-orgnztn-save' : 'saveDeptOrgnztnBase' //부서조직관계만 변경
					, 'click #btn-role-save' : 'saveDeptRoleBase'//부서역할등록
					, 'click #btn-new-dept' : 'registerCAPAT201Base'//부서신규모드로 전환
					, 'keydown #searchKey' : 'pressEnterInTree' //트리 혹은 목록 조회
		            , 'click #btn-tree-search': 'loadTreeOrList' //부서목록조회
		            , 'click .CAPAT201-dept-orgnztn-rel-btn': 'orgnztnHistPopCAPAT201Base'//부서조직관계이력 팝업
		            , 'click .CAPAT201-check-dplctn-btn' : 'validateDeptIdCAPAT201Base' //부서식별자 중복체크
					, 'change [data-form-param="deptId"]' : 'changeDeptIdCAPAT201Base' //부서식별자중복체크요구
		            , 'click #btn-addr-search': 'popAddrSearch'//주소조회팝업
		            , 'click #btn-deptRoleTmplt-search': 'popDeptRoleTmpltSearch'//부서역할템플릿조회팝업
		            , 'click #btn-mgmtUser-search': 'popStaffSearch'//사용자조회팝업
		            , 'click #btn-supervisorDept-search' : 'popSprvsrDeptSearch'//기본상위부서조회팝업
		            , 'click #btn-acctgPrcsDept-search' : 'popAcctgDeptSearch'//회계부서조회팝업
		            , 'click #btn-base-attribute-toggle': 'popPageLayerCtrl' // 기본속성영역 접기       	
		            , 'click #btn-service-input-item-toggle': 'popGridLayerCtrl' // 그리드영역 접기
			        , 'click #btn-role-select-modal': 'popRoleSelectLayerCtrl' // 역할목록 영역 접기
			        , 'click #btn-setting-modal' : 'popRoleSettingLayerCtrl' // 역할설정 영역 접기
		            , 'click #btn-tree-hide': 'hideTree' //트리숨기기
		            , 'click #btn-tree-show': 'showTree' //트리보이기
				}


	            /* ================================================================================================
	             * ==========================================초기화================================================
	             * ================================================================================================
	             */
				, initialize : function(initData) {
					var that = this;


		            $.extend(that,initData);


		            // 페이지 템플릿 설정
		            that.$el.html(that.tpl());

					//set institution code
					this.instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);
					if(!this.instCd){
						this.instCd = $.sessionStorage('instCd');
					}

                    //공통코드정보 get
                    var sParam = {};
	                sParam.cdNbr = "11953"; // 부서조직관계
	                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
	                responseData = fn_callSyncSvc(linkData1);
	                if(!that.setCommonCodeInfoCAPAT201Base(responseData)) return;


	                //부서역할그리드 생성
		            that.createDeptRoleGrid();


		            //기관별 파라미터 get 
	                var sParam = {}; 
	                sParam.instCd = this.instCd;
	                var linkData = {"header" : fn_getHeader("CAPCM0308403") , "CaInstMgmtSvcGetParmIn" : sParam};


	                var responseData = fn_callSyncSvc(linkData);
	                if(!that.setInstParamInfoCAPAT201Base(responseData)) return;


	                that.setDatePicker();


					// 부서식별자 유효성 여부
					that.isValidDeptId = false;


	                //부서조직관계그리드 생성
	                that.initGridInfoCAPAT201Base();
	                //tree 생성
	                that.createTree();
				}


				/**
				 * 부서역할 그리드 생성
				 */
				, createDeptRoleGrid: function(){
					var that = this;
		            // 부서역할정보조회 서비스호출 준비
		            var sRoleParam = {};
		            sRoleParam.instCd = this.instCd;
		            sRoleParam.clHrarcyId = "Role";
		            sRoleParam.clId = "Department";


		            var linkData3 = {"header": fn_getHeader("CAPCM1968400"), "CaRoleMgmtSvcGetRoleClassificationRelationListIn": sRoleParam};


		            bxProxy.all([
		                 // 부서역할목록 조회 
		                  {url: sUrl, param: JSON.stringify(linkData3), success: function(responseData) {
		                	  if(fn_commonChekResult(responseData)) {
		                		  that.roleList = responseData.CaRoleMgmtSvcGetRoleClassificationRelationListOut.tblNm;
		                      }
		                  }}
		                  ], {
		                  success: function() {


	    	                //  역할 그리드 정의
	    	                that.PAT004DeptRoleListGrid = new ExtGrid({
	    	            	  fields: ['No', 'checkYn', 'roleId', 'roleNm']
	    	              		, id: 'PAT004DeptRoleListGrid'
	    	            	  , columns: [
	    	            	              {
	    	            	            	  text:'No'
	    	            	            		  ,dataIndex: 'rowIndex'
	    	            	            			  ,sortable : false
	    	            	            			  , height : 25, flex: 1, style: 'text-align:center', align: 'center'
	    	            	            				  // other config you need....
	    	            	            				  ,renderer : function(value, metaData, record, rowIndex, colIndex, sotre) {
	    	            	            					  return rowIndex+1;
	    	            	            				  }
	    	            	              }   	            	              
	    	            	              // 역할식별자
	    	            	              ,{text:bxMsg('cbb_items.AT#roleId'), flex: 5, dataIndex: 'roleId', style: 'text-align:center', align: 'center'}
	    	            	              // 역할명
	    	            	              ,{text:bxMsg('cbb_items.AT#roleNm'), flex: 5, dataIndex: 'roleNm', style: 'text-align:center', align: 'center'}
	    	            	              ,{text: bxMsg('cbb_items.SCRNITM#authGrantYn'),flex: 2,dataIndex: 'checkYn',style: 'text-align:center',align: 'center'
	                                      	, renderer : function(val) {
	                                    		var classNm = "s-no";
	                                    		if(val == true) {
	                                    			val = "Y";
	                                    			classNm = "s-yes";
	                                    		}else{
	                                    			val = "N";
	                                    		}
	                                    		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
	                                    	}
	    	            	              }
	    	            	              ] // end of columns
					                      , listeners: {click: {element: 'body',
				          			             fn: function(){
				          			          	   //클릭시 이벤트 발생
				          			           	   that.selectRole();
				          			             }
					                      	  }
					                      }
	    	                });


		                  	// 그리드 렌더
	                    	that.$el.find("#PAT004-roleList-grid").html(that.PAT004DeptRoleListGrid.render({'height':"200px"}));


	                    	if(that.roleList != null) {
	                    		that.PAT004DeptRoleListGrid.setData(that.roleList);
	                    	}




		                  } // end of success:.function
		            }); // end of bxProxy.all					
				}
				/**
				 * 기관 파라미터 set
				 */
				, setInstParamInfoCAPAT201Base : function(responseData) {
					var that = this;


					if(fn_commonChekResult(responseData)) {
						var instParamList = responseData.CaInstMgmtSvcGetParmOut.parmList;


		            	if(instParamList != null && instParamList != undefined) {
		        			$(instParamList).each(function (idx, item) {
		        				if(item.parmAtrbtNm == "addrHrarcyCd") {
		        					instParams.addrHrarcyCd = item.parmVal;
		        				}
		                    });	 
		        		}


		            	// 직접입력 
		            	if(instParams.addrHrarcyCd == null || instParams.addrHrarcyCd == "" || instParams.addrHrarcyCd == "NA") {
		            		that.$el.find('[data-form-param="addrHrarcyCd"]').val("NA"); 
		            	}	                        
		            	// 선택입력
		            	else {
							that.$el.find('[data-form-param="addrHrarcyCd"]').val(instParams.addrHrarcyCd);                                 		
		            	}
		            	return true;
					}
					else return false;
				}
				, render : function() {
					var that = this;

                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT201-wrap #btn-base-attribute-save')
                                        		,this.$el.find('.CAPAT201-wrap #btn-role-save')
                                        		,this.$el.find('.CAPAT201-wrap #btn-dept-orgnztn-save')
                                        			   ]);

                	// 입력항목 초기화 
                	this.resetCAPAT201Base();
                    this.setComboBoxes();


                	return this.$el;
				}


				/**
				 * setting date picker
				 */
	            , setDatePicker: function () {
	                var that = this;


	                fn_makeDatePicker(that.$el.find('[data-form-param="deptOpnDt"]'));
	                fn_makeDatePicker(that.$el.find('[data-form-param="deptClsDt"]'));
	            }


	            /**
	             * setting comboBoxes
	             */
	            , setComboBoxes: function () {
	                // 콤보데이터 로딩
	                var sParam = {};


	                // combobox 정보 셋팅
	                sParam.className = "CAPAT201-deptSts-wrap";
	                sParam.targetId = "deptSts";
	                sParam.nullYn = "N";
	                sParam.cdNbr = "12103";
	                // 콤보데이터 load
	                fn_getCodeList(sParam, this);


	                sParam = {};
	                // combobox 정보 셋팅
	                sParam.className = "CAPAT201-deptDs-wrap";
	                sParam.targetId = "deptDs";
	                sParam.nullYn = "N";
	                sParam.cdNbr = "A1103";
	                // 콤보데이터 load
	                fn_getCodeList(sParam, this);
	            }


				/**
				 * 공통코드정보 set
				 */
				, setCommonCodeInfoCAPAT201Base : function(responseData) {
					if(fn_commonChekResult(responseData)) {
                        comboStore1 = new Ext.data.Store({
                            fields: ['cd', 'cdNm'],
                            data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                        });


                        return true;
                    }
					else return false;
				}


				/**
				 * 부서조직관계 Grid 초기화
				 */
				, initGridInfoCAPAT201Base : function() {
					var that = this;


                    that.CAPAT201Grid = new ExtGrid({


                    // 그리드 컬럼 정의
                    fields: ['dtogRelCd', 'upDeptNm', 'searchUpDept', 'clearUpDept', 'upDeptId', 'dtogRelSeqNbr']
                    , id: 'CAPAT201Grid-dept'
                    , columns: [
                		  {
                            text: bxMsg('cbb_items.SCRNITM#deptOrgnztnRel')
                            , dataIndex: 'dtogRelCd'
                            , sortable: false
                            , flex: 7
                            , style: 'text-align:center'
                            , align: 'center'
                            , height : 25
                            , renderer: function(val) {
                            	index = comboStore1.findExact('cd', val);


                                if(index != -1) {
                                    rs = comboStore1.getAt(index).data;
                                    return rs.cdNm;
                                }
                            } // end of render
                		  }
                		 , {
                             text: bxMsg('cbb_items.SCRNITM#M_supervisorDept')
                             , flex : 7
                             , dataIndex: 'upDeptNm'
                             , editor: 'textfield'
                             , style: 'text-align:center'
                             , align: 'center'
                             , sortable : false 
                		 } 
                  		,{dataIndex: 'searchUpDept'
                   		  , xtype: 'actioncolumn'
                          , sortable : false
                   		  , flex : 1
                   		  , align: 'center' 
                   		  , style: 'text-align:center'
                   		  , items: [{
  									//  icon: 'images/icon/x-delete-16.png'
  									  iconCls : "bw-icon i-25 i-func-search"
  									  , tooltip: bxMsg('tm-layout.delete-field')
  									  , handler: function (grid, rowIndex, colIndex, item, e, record) {
  										  that.selectDeptCAPAT201Base(rowIndex, "N");
  									  }
  									}]
                           }
                 		,{dataIndex: 'clearUpDept'
                 		  , xtype: 'actioncolumn'
                   		  , sortable : false
                 		  , flex : 1
                 		  , align: 'center' 
                 		  , style: 'text-align:center'
                 		  , text: bxMsg('cbb_items.SCRNITM#del')
                 		  , items: [{
									//  icon: 'images/icon/x-delete-16.png'
									  iconCls : "bw-icon i-25 i-func-trash"
									  , tooltip: bxMsg('tm-layout.delete-field')
									  , handler: function (grid, rowIndex, colIndex, item, e, record) {
										  var dataList = that.CAPAT201Grid.getAllData();
	            	                	  dataList[rowIndex].upDeptNm = "";
	            	                	  dataList[rowIndex].upDeptId = "";
	
	            	                	  that.CAPAT201Grid.setData(dataList);
									  }
									}]
                         }
                 		, {
                             text: bxMsg('cbb_items.SCRNITM#upDeptId')
                             , width : 0
                             , dataIndex: 'upDeptId'
                             , hidden : true
                         }
                 		, {
                             text: bxMsg('cbb_items.SCRNITM#deptOrgnztnRelSeqNbr')
                             , width : 0
                             , dataIndex: 'dtogRelSeqNbr'
                             , hidden : true
                         }




                	] // end of columns
                  });


	                that.$el.find("#CAPAT201Grid-dept-orgnztn-rel").html(that.CAPAT201Grid.render({'height': '200px'}));//4개 조회
	                // 정보 출력 
	                comboStore1.each(function(record) {


	                	if(record.get("cd") != "01" && record.get("cd") != "11") {
		                	var printItem = {};
		                	printItem.dtogRelCd = record.get("cd");
		                	that.CAPAT201Grid.addData(printItem);
	                	}
	                });
				}


	            /* ================================================================================================
	             * ========================================부서트리/목록===============================================
	             * ================================================================================================
	             */

	            /**
	             * 부서명에서 enterkey 조회
	             */
	            , pressEnterInTree: function(event){
	                var event = event || window.event;
	                var keyID = (event.which) ? event.which : event.keyCode;
	                if(keyID == 13) { //enter
	                    this.loadTreeOrList();
	                }
	            }

	            /**
	             * load tree or list
	             */
	            , loadTreeOrList: function(){
	                var that = this;
	            	if(that.$el.find('#searchKey').val() == '' || that.$el.find('#searchKey').val() == undefined){
	                	//deptNm입력이 없으면 트리생성
	                    that.loadTree();
	            	}else{
	                	//deptNm입력이 있으면 목록조회
	                    that.createGrid();
	            	}
	            }


	            /**
	             * Tree 생성
	             */
	            , createTree: function () {
	                var that = this;


	                that.subViews['CAPAT201Tree'] = new bxTree({
	                	fields: {id: 'deptId', value: 'deptInfoCntnt'}
	                    , listeners: {
	                        clickItem: function(itemId, itemData, currentTarget, e) {
	                            that.selectTreeData(itemData);
	                         }
	                     }
	                 });


	                // DOM Element Cache
	                that.$unitTreeRoot = that.$el.find('.bx-tree-root');
	                that.$unitTreeRoot.html(this.subViews['CAPAT201Tree'].render());
	                that.loadTree();
	            }


	            /**
	             * load all of tree list
	             */
	            , loadTree: function () {
	                var that = this;
	                var sParam = {};

	                sParam.instCd = this.instCd;
	                sParam.dtogRelCd = '01'; //기본조직에 대해서 조회.


	                //폐점포함조회여부
	                if(that.$el.find('#incldClsDept').prop("checked") == true){
	                	sParam.includeCloseDeptYn = "Y";
	                }else{
	                	sParam.includeCloseDeptYn = "N";
	                }


	                var linkData = {"header": fn_getHeader("CAPDT2008402"), "CaDeptSrchSvcGetDeptListIn": sParam};
	                that.$el.find('.deptGridArea').hide();
	                that.$el.find('.deptTreeArea').show();
	                that.treeList = [];


	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                   enableLoading: true,
	                    success: function (responseData) {
	                       if(fn_commonChekResult(responseData)) {
	                    	   that.subViews['CAPAT201Tree'].renderItem(responseData.CaDeptSrchSvcGetDeptListOut.deptList);
	                           that.treeList = responseData.CaDeptSrchSvcGetDeptListOut.deptList;
	                       }
	                    }
	                });//end of bxProxy


	            }


	            /**
	             * 그리드 생성
	             */
	            , createGrid: function () {
	                var that = this;


	                that.CAPAT201GridInpItm = new ExtGrid({
	                    // 그리드 컬럼 정의
	                    fields: ['rowIndex', 'deptId', 'deptNm']
	                    , id: 'CAPAT201Grid-service-input-item'
	                    , columns: [
	                        {
	                            text: bxMsg('cbb_items.SCRNITM#deptId'),
	                            flex: 1,
	                            dataIndex: 'deptId',
	                            style: 'text-align:center',
	                            height : 25, 
	                            align: 'left'
	                        },
	                        {
	                            text: bxMsg('cbb_items.SCRNITM#deptNm'),
	                            flex: 1,
	                            dataIndex: 'deptNm',
	                            style: 'text-align:center',
	                            align: 'left'
	                        }
	                    ] // end of columns
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function () {
	                                that.clickGridOfDeptList();
	                            }
	                        }
	                    }
	                });


	                that.$el.find('#popup-service-grid').html(that.CAPAT201GridInpItm.render({'height': CaGridHeight})); 
	                that.loadList();
	            }


	            /**
	             * load Grid
	             */
	            , loadList: function(){
	                var that = this;
	                var sParam = {};


	                sParam.instCd = this.instCd;
	                sParam.deptNm = that.$el.find('#searchKey').val();
	                sParam.dtogRelCd = '01'; //기본조직에 대해서 조회.

	                //폐점포함조회여부
	                if(that.$el.find('#incldClsDept').prop("checked") == true){
	                	sParam.includeCloseDeptYn = "Y";
	                }else{
	                	sParam.includeCloseDeptYn = "N";
	                }


	                var linkData = {"header": fn_getHeader("CAPDT2008401"), "CaDeptSrchSvcGetDeptListIn": sParam};
	                that.$el.find('.deptTreeArea').hide();
	                that.$el.find('.deptGridArea').show();


	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                   enableLoading: true,
	                    success: function (responseData) {
	                       if(fn_commonChekResult(responseData)) {
	                           var data = responseData.CaDeptSrchSvcGetDeptListOut;
	                           if (data.deptList != null || data.deptList.length > 0) {
	                           	that.CAPAT201GridInpItm.setData(data.deptList);
	                           }
	                       }
	                    }
	                });//end of bxProxy
	            }


	            /**
	             * 트리 데이터 선택
	             */
	            , selectTreeData: function (itemData) {
	                var that = this;
	            	var param = {};


	                if (!itemData) {
	                    return;
	                } else {
	                    param.brnchCd = itemData.deptId;
	                    param.brnchNm = itemData.deptNm;
	                    param.deptId = itemData.deptId;
	                    param.deptNm = itemData.deptNm;
	                }


	                //부서선택했으므로 신규부서 등록 아닌 걸로 간주.
	                registerNewDept = false;
	                //search and set data
	                that.searchCAPAT201Base(param);
	            }


	            /**
	             * 그리드 데이터 선택
	             */
	            , clickGridOfDeptList: function(){
	                var that = this;
	                var selectedItem = that.CAPAT201GridInpItm.grid.getSelectionModel().selected.items[0];
	                var param = {};


	                if (!selectedItem) {
	                    return;
	                } else {
	                    param.brnchCd = selectedItem.data.deptId;
	                    param.brnchNm = selectedItem.data.deptNm;
	                    param.deptId = selectedItem.data.deptId;
	                    param.deptNm = selectedItem.data.deptNm;
	                }


	                //부서선택했으므로 신규부서 등록 아닌 걸로 간주.
	                registerNewDept = false;
	                //search and set data
	                that.searchCAPAT201Base(param);
	            }


	            /* ================================================================================================
	             * ==========================================부서정보조회==============================================
	             * ================================================================================================
	             */


	            /**
	             * search department data
	             */
				, searchCAPAT201Base: function(param) {
					var that = this;


					var header =  new Object(); 
	                header = fn_getHeader("CAPDT0020401");


	                var sParam = {}; 
	                sParam.instCd = this.instCd;
	                sParam.deptId = param.deptId;


	                var linkData = {"header" : header , "CaDeptChngSvcGetIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			that.currentDeptInfo = responseData.CaDeptChngSvcGetOut;


	                			that.setDeptInfCAPAT201Base(responseData.CaDeptChngSvcGetOut);


	                		}
	                	}
	                });	
				}


				/**
				 * set department data
				 */
				, setDeptInfCAPAT201Base: function(deptInfo) {
					var that = this;


					that.deptDetailInfo = deptInfo;


        			//입력항목, 버튼 disable      			
        			that.$el.find('.CAPAT201-check-dplctn-btn').attr("disabled", true);
        			that.$el.find('.CAPAT201-dept-orgnztn-rel-btn').attr("disabled", true);	
        			that.$el.find('[data-form-param="deptId"]').attr("disabled", true);
        			that.$el.find('[data-form-param="supervisorDept"]').attr("disabled", true);
        			that.$el.find('[data-form-param="mgmtStaff"]').attr("disabled", true);
        			that.$el.find('[data-form-param="deptRoleTmplt"]').attr("disabled", true);
    				that.$el.find('#btn-deptRoleTmplt-search').attr("disabled", true);	


        			//이력조회버튼 disable 풀기
					that.$el.find('.CAPAT201-dept-orgnztn-rel-btn').attr("disabled", false);


					that.$el.find('[data-form-param="deptId"]').val(deptInfo.deptId);
					that.$el.find('[data-form-param="deptNm"]').val(deptInfo.deptNm);
					that.$el.find('[data-form-param="deptSts"]').val(deptInfo.deptStsCd);
					that.$el.find('[data-form-param="deptAbrvtnNm"]').val(deptInfo.deptAbrvtnNm);
	                that.$el.find('[data-form-param="deptEngNm"]').val(deptInfo.deptEngNm);


	                if(deptInfo.roleTmpltId != null) {
	                	that.$el.find('[data-form-param="roleTmpltId"]').val(deptInfo.roleTmpltId);
	                	that.$el.find('[data-form-param="deptRoleTmplt"]').val(deptInfo.roleTmpltId + " " + deptInfo.roleTmpltNm);
	                }


	                if(deptInfo.opnDt != null && deptInfo.opnDt != "") {
	                	that.$el.find('[data-form-param="deptOpnDt"]').val(XDate(deptInfo.opnDt).toString('yyyy-MM-dd'));
	                }


	                if(deptInfo.clsrDt != null && deptInfo.clsrDt != "") {
                		that.$el.find('[data-form-param="deptClsDt"]').val(XDate(deptInfo.clsrDt).toString('yyyy-MM-dd'));
	                }else{
                		that.$el.find('[data-form-param="deptClsDt"]').val('9999-12-31');
	                }


	                that.$el.find('[data-form-param="deptDscd"]').val(deptInfo.deptDscd);
	                that.$el.find('[data-form-param="telNbr"]').val(deptInfo.telNbr);
	                that.$el.find('[data-form-param="faxNbr"]').val(deptInfo.faxNbr);
	                that.$el.find('[data-form-param="mgmtStaffId"]').val(deptInfo.mgmtStaffId);
                	that.$el.find('[data-form-param="mgmtStaff"]').val(deptInfo.mgmtStaffId + " " + deptInfo.mgmtStaffNm);


	                //주소
	                if(that.$el.find('[data-form-param="addrHrarcyCd"]').val() == "NA") {
						that.$el.find('[data-form-param="addrId"]').val("");							
					}
					else {
						that.$el.find('[data-form-param="addrId"]').val(deptInfo.addrId);
						that.$el.find('[data-form-param="addrCntnt"]').val(deptInfo.addrCntnt); 
					}
	                that.$el.find('[data-form-param="dtlAddrCntnt"]').val(deptInfo.dtlAddrCntnt);


	                //회계처리부서정보 출력]
	                that.$el.find('[data-form-param="acctgPrcsDept"]').val("");
	                that.$el.find('[data-form-param="acctgPrcsDeptId"]').val("");
	                var xtnAtrbtList = deptInfo.xtnAtrbtList;
	                if(xtnAtrbtList){
	                	$(xtnAtrbtList).each(function(idx, item){
	                		if(item.xtnAtrbtNm == 'acctgDeptId'){


	    	                	var acctgDeptId = item.xtnAtrbtCntnt
	    		                that.setAcctPrcsDeptIdNm(acctgDeptId);                	


	                		}
	                	});
	                }


	                // 기본부서조직관계 출력 
					$(deptInfo.orgnztnRelList).each(function(idx, item) {
						if(item.dtogRelCd == "01") {
							that.$el.find('[data-form-param="supervisorDept"]').val(item.upDeptId + " " + item.upDeptNm);
							that.$el.find('[data-form-param="defaultUpDeptId"]').val(item.upDeptId);
							that.$el.find('[data-form-param="defaultDtogRelSeqNbr"]').val(item.dtogRelSeqNbr);


							return;
						}
					});


					that.CAPAT201Grid.resetData();
					var gridStore = new Array();


	                comboStore1.each(function(record) {


	                	if(record.get("cd") != "01" && record.get("cd") != "11") {
		                	var printItem = {};
		                	printItem.dtogRelCd = record.get("cd");


		                	$(deptInfo.orgnztnRelList).each(function(idx, item) {
		                		if(printItem.dtogRelCd == item.dtogRelCd) {


		                			printItem.upDeptId = item.upDeptId;
		                			printItem.upDeptNm = item.upDeptId + " " + item.upDeptNm;
		                			printItem.dtogRelSeqNbr = item.dtogRelSeqNbr;


		                			return;
		                		}
		                	});
		                	gridStore.push(printItem);
		            	}
	                }); 
	                that.CAPAT201Grid.setData(gridStore);    




	                //부서역할그리드 출력
        			var searchedRoleList = deptInfo.deptRoleList;


        			that.PAT004DeptRoleListGrid.resetData();
					var gridStore = new Array();


	                $(that.roleList).each(function(roleIdx, record) {
	                	// ['No', 'checkYn', 'roleId', 'roleNm']
                		var printItem = {};
	                	printItem.roleId = record.roleId;
	                	printItem.roleNm = record.roleNm;
	                	printItem.checkYn = false;


	                	$(searchedRoleList).each(function(idx, item) {
	                		if(printItem.roleId == item.roleId) {
	                			printItem.checkYn = true;
	                			return false;
	                		}
	                	});
	                	gridStore.push(printItem);	        		            	
	                }); 
	                that.PAT004DeptRoleListGrid.setData(gridStore);	


				}


				/**
				 * 역할정보 선택
				 */
	            , selectRole: function(){
	                var that = this;
	                var selectedRole = that.PAT004DeptRoleListGrid.grid.getSelectionModel().selected.items[0];


	                if(!selectedRole){
	                    return;
	                }


        			that.$el.find('[data-form-param="roleId"]').val(selectedRole.data.roleId);
        			that.$el.find('[data-form-param="roleNm"]').val(selectedRole.data.roleNm);
        			if(selectedRole.data.checkYn == true || selectedRole.data.checkYn == "Y"){
            			that.$el.find('[data-form-param="authGrantYn"]').val("Y");        				
        			}else{
            			that.$el.find('[data-form-param="authGrantYn"]').val("N");        				
        			}
	            }




	            /* ================================================================================================
	             * ==========================================부서신규================================================
	             * ================================================================================================
	             */


	            /**
	             * 부서신규 or 부서정보변경
	             */
	            , saveCAPAT201Base: function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
	            	var that = this;
	            	if(registerNewDept){
	            		that.validateRegisterInput();
	            	}else{
	            		that.validateChangeInput();
	            	}
	            }


				/**
				 * register new department
				 */
				, registerCAPAT201Base: function(){
					var that = this;


					//상위부서식별자로 들어갈 값이 없으면 상위부서식별자 필수라는 메세지 보여주기
					if(that.$el.find('[data-form-param="deptId"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUIATE0029"));
					}else{


						registerNewDept = true;


						newUpDeptId = that.$el.find('[data-form-param="deptId"]').val(); //신규부서등록시 상위부서식별자
						newUpDeptNm = that.$el.find('[data-form-param="deptNm"]').val(); //신규부서등록시 상위부서명


						//입력항목 초기화
						fn_resetForRegisterUnderDeptCAPAT201(that, newUpDeptId, newUpDeptNm);		


					}
				}


				/**
				 * validate department identification
				 */
				, validateDeptIdCAPAT201Base: function(e){
					var that = this;


					if(that.$el.find('[data-form-param="deptId"]').val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptId") + "]");
					}
					else {


						that.isValidDeptId = false;	


		            	var header =  new Object(); 
		        		header = fn_getHeader("CAPDT0010401");


		        		var sParam = {}; 
		        		sParam.instCd = this.instCd;
		                sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();


		                var linkData = {"header" : header , "CaDeptRgstSvcCheckDeptIdIn" : sParam};


		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
	                				fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0008"));
		                			that.isValidDeptId = true;		                			
		                		}		                		
		                	}
		                });	
					}
				}




	            /**
	             * 부서신규 전 입력항목 검증
	             */
	            , validateRegisterInput: function(){


	            	var that = this;
                    var gridOrgnztnData = that.CAPAT201Grid.getAllData();


	            	if(!that.isValidDeptId) {
	            		fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.SCRNITM#deptId") + " " + bxMsg("cbb_items.SCRNITM#checkDplctn") + "]");
					}
					else if(that.$el.find('[data-form-param="deptNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptNm") + "]");
					}
					else if(that.$el.find('[data-form-param="deptDs"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptDs") + "]");
					}
					else if(that.$el.find('[data-form-param="deptEngNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptEngNm") + "]");
					}
					else if(that.$el.find('[data-form-param="deptAbrvtnNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptAbrvtnNm") + "]");
					}
					else if(that.$el.find('[data-form-param="defaultUpDeptId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#M_supervisorDept") + "]");
					}
					else if(that.$el.find('[data-form-param="deptOpnDt"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#opnDt") + "]");
					}
					else if(that.$el.find('[data-form-param="deptOpnDt"]').eq(0).val().replace(/\-/gi, '') < that.currDate) {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.SCRNITM#opnDt") + " >= " + bxMsg("cbb_items.SCRNITM#today") + "]");
					}
					else if(that.$el.find('[data-form-param="dtlAddrCntnt"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#addr") + "]");
					}
					else if(that.$el.find('[data-form-param="roleTmpltId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptRoleTmplt") + "]");
					}
					else if(that.$el.find('[data-form-param="mgmtStaff"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#mgmtUser") + "]");
					}
					else {
						// 신규실행 
						this.execRegisterCAPAT201Base();
					}
	            }




				/**
				 * execute registering new department
				 */
				, execRegisterCAPAT201Base: function(){
					var that = this;
	            	var header =  new Object(); 
	                header = fn_getHeader("CAPDT0010101");


	                var sParam = {}; 
	                sParam.instCd = this.instCd;
	                sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();
	                sParam.deptNm = that.$el.find('[data-form-param="deptNm"]').val();
	                sParam.deptAbrvtnNm = that.$el.find('[data-form-param="deptAbrvtnNm"]').val();
	                sParam.deptEngNm = that.$el.find('[data-form-param="deptEngNm"]').val();
	                sParam.deptDscd = that.$el.find('[data-form-param="deptDs"]').val();
	                sParam.addrHrarcyCd = that.$el.find('[data-form-param="addrHrarcyCd"]').val();
	                sParam.telNbr = that.$el.find('[data-form-param="telNbr"]').val();
	                sParam.faxNbr = that.$el.find('[data-form-param="faxNbr"]').val();
	                sParam.mgmtStaffId = that.$el.find('[data-form-param="mgmtStaffId"]').val();
	                sParam.opnDt = that.$el.find('[data-form-param="deptOpnDt"]').val().replace(/\-/g, "");
	                sParam.clsrDt = that.$el.find('[data-form-param="deptClsDt"]').val().replace(/\-/g, "");
	                sParam.roleTmpltId = that.$el.find('[data-form-param="roleTmpltId"]').val();


					sParam.addrId = that.$el.find('[data-form-param="addrId"]').val();
	                sParam.dtlAddrCntnt = that.$el.find('[data-form-param="dtlAddrCntnt"]').val();


	                //set extended attribute list
	                sParam.xtnAtrbtList = new Array();
	                var xtnAtrbt = {};
	                if(that.$el.find('[data-form-param="acctgPrcsDeptId"]').val() != ""
	                	&& that.$el.find('[data-form-param="acctgPrcsDeptId"]').val() != null){
		                xtnAtrbt.xtnAtrbtNm = 'acctgDeptId';
		                xtnAtrbt.xtnAtrbtCntnt = that.$el.find('[data-form-param="acctgPrcsDeptId"]').val();
		                sParam.xtnAtrbtList.push(xtnAtrbt);	                	
	                }


	                // set organization relation list
	                sParam.orgnztnRelList = new Array();


	                // set default data 
	                var orgnztnParam = {};
                    orgnztnParam.dtogRelCd = "01"; // default relation 
                    orgnztnParam.upDeptId = that.$el.find('[data-form-param="defaultUpDeptId"]').val();


                    sParam.orgnztnRelList.push(orgnztnParam);


//                    
//                    var gridOrgnztnData = that.CAPAT201Grid.getAllData();
//	                
//                    for (var idx in gridOrgnztnData) {
//                    	
//                    	if(gridOrgnztnData[idx].upDeptId != undefined && gridOrgnztnData[idx].upDeptId != null &&
//                    			gridOrgnztnData[idx].upDeptId != "") {
//		                    var orgnztnParam = {};
//		                    orgnztnParam.deptOrgnztnRelCd = gridOrgnztnData[idx].deptOrgnztnRelCd;
//		                    orgnztnParam.upDeptId = gridOrgnztnData[idx].upDeptId;
//		                    
//		                    sParam.orgnztnRelList.push(orgnztnParam);
//                    	}
//	                }								


	                var linkData = {"header" : header , "CaDeptRgstSvcIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
	                			fn_resetForRegisterCAPAT201(that, newUpDeptId, newUpDeptNm)
	                			that.loadTreeOrList();
	                		}
	                	}
	                });
				}


	            /* ================================================================================================
	             * ==========================================부서정보변경==============================================
	             * ================================================================================================
	             */


	            /**
	             * 부서정보변경 전 입력항목 검증(부서정보변경 or 폐점)
	             */
	            , validateChangeInput: function(){


					var that = this;
                    var gridOrgnztnData = that.CAPAT201Grid.getAllData();


					if(that.currentDeptInfo.deptStsCd != '01'){
						fn_alertMessage("", bxMsg("cbb_err_msg.AUIATE0028"));
					}else if(that.$el.find('[data-form-param="deptId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptId") + "]");
					}
					else if(that.$el.find('[data-form-param="deptNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptNm") + "]");
					}
					else if(that.$el.find('[data-form-param="deptDs"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptDs") + "]");
					}
					else if(that.$el.find('[data-form-param="deptEngNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptEngNm") + "]");
					}
					else if(that.$el.find('[data-form-param="deptAbrvtnNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptAbrvtnNm") + "]");
					}
					else if(that.$el.find('[data-form-param="defaultUpDeptId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#M_supervisorDept") + "]");
					}
					else if(that.$el.find('[data-form-param="roleTmpltId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptRoleTmplt") + "]");
					}
					else if(that.$el.find('[data-form-param="dtlAddrCntnt"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#addr") + "]");
					}
					else if(that.$el.find('[data-form-param="mgmtStaff"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#mgmtUser") + "]");
					}
					else {
						//폐쇄일자를 오늘 날짜로 하면 바로 폐점
						if(that.$el.find('[data-form-param="deptClsDt"]').val().replace(/\-/gi,"")
								== $.sessionStorage('txDt')){
							this.closureCAPAT201Base();
						}else{
							//부서정보변경(폐쇄일자가 미래인 경우 폐점 배치)
							this.execSaveSDT002Base();
						}
					}
	            }


	            /**
	             * 부서정보변경 실행
	             */
				, execSaveSDT002Base : function() {
					var that = this;
	            	var header =  new Object(); 
	                header = fn_getHeader("CAPDT0020201");


	                var sParam = {}; 
	                sParam.instCd = this.instCd;
	                sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();
	                sParam.deptNm = that.$el.find('[data-form-param="deptNm"]').val();
	                sParam.deptAbrvtnNm = that.$el.find('[data-form-param="deptAbrvtnNm"]').val();
	                sParam.deptEngNm = that.$el.find('[data-form-param="deptEngNm"]').val();
	                sParam.deptDscd = that.$el.find('[data-form-param="deptDs"]').val();
	                sParam.clsrDt = that.$el.find('[data-form-param="deptClsDt"]').val().replace(/\-/g, "");
	                sParam.addrHrarcyCd = that.$el.find('[data-form-param="addrHrarcyCd"]').val();
	                sParam.telNbr = that.$el.find('[data-form-param="telNbr"]').val();
	                sParam.faxNbr = that.$el.find('[data-form-param="faxNbr"]').val();
	                sParam.mgmtStaffId = that.$el.find('[data-form-param="mgmtStaffId"]').val();
	                sParam.roleTmpltId = that.$el.find('[data-form-param="roleTmpltId"]').val();
					sParam.addrId = that.$el.find('[data-form-param="addrId"]').val();
	                sParam.dtlAddrCntnt = that.$el.find('[data-form-param="dtlAddrCntnt"]').val();


	                //set extended attribute list
	                sParam.xtnAtrbtList = new Array();
	                if(that.$el.find('[data-form-param="acctgPrcsDeptId"]').val() != null &&
	                		that.$el.find('[data-form-param="acctgPrcsDeptId"]').val() != ""){
		                var xtnAtrbt = {};
		                xtnAtrbt.xtnAtrbtNm = 'acctgDeptId';
		                xtnAtrbt.xtnAtrbtCntnt = that.$el.find('[data-form-param="acctgPrcsDeptId"]').val();
		                sParam.xtnAtrbtList.push(xtnAtrbt);	                	
	                }


	                // set organization relation list
	                sParam.orgnztnRelList = new Array();


	                // set default data 
	                var orgnztnParam = {};
                    orgnztnParam.dtogRelCd = "01"; // default relation 
                    orgnztnParam.upDeptId = that.$el.find('[data-form-param="defaultUpDeptId"]').val();
                    orgnztnParam.dtogRelSeqNbr = that.$el.find('[data-form-param="defaultDtogRelSeqNbr"]').val();


                    sParam.orgnztnRelList.push(orgnztnParam);


//                    
//                    var gridOrgnztnData = that.CAPAT201Grid.getAllData();
//	                
//                    for (var idx in gridOrgnztnData) {
//	                    var orgnztnParam = {};
//	                    orgnztnParam.deptOrgnztnRelCd = gridOrgnztnData[idx].deptOrgnztnRelCd;
//	                    orgnztnParam.upDeptId = gridOrgnztnData[idx].upDeptId;
//	                    orgnztnParam.deptOrgnztnRelSeqNbr = gridOrgnztnData[idx].deptOrgnztnRelSeqNbr;
//	                    
//	                    sParam.orgnztnRelList.push(orgnztnParam);
//	                }								


	                var linkData = {"header" : header , "CaDeptChngSvcChngIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			var param = {};
	                			param.instCd = this.instCd;
	                			param.deptId = that.$el.find('[data-form-param="deptId"]').val();


	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
	                			that.searchCAPAT201Base(param);


	        	                that.loadTree();
	                		}
	                	}
	                });	
				}


				/**
				 * 부서조직관계만 변경
				 */
				, saveDeptOrgnztnBase : function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
					var that = this;
					
					if(that.currentDeptInfo.deptStsCd != '01'){
						fn_alertMessage("", bxMsg("cbb_err_msg.AUIATE0028"));
					}else{
						var that = this;
		            	var header =  new Object(); 
		                header = fn_getHeader("CAPDT0020204");


		                var sParam = {}; 
		                sParam.instCd = this.instCd;
		                sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();


		                // set organization relation list
		                sParam.orgnztnRelList = new Array();


	                    // set grid data 
	                    var gridOrgnztnData = that.CAPAT201Grid.getAllData();


	                    for (var idx in gridOrgnztnData) {
		                    var orgnztnParam = {};
		                    orgnztnParam.dtogRelCd = gridOrgnztnData[idx].dtogRelCd;
		                    orgnztnParam.upDeptId = gridOrgnztnData[idx].upDeptId;
		                    orgnztnParam.dtogRelSeqNbr = gridOrgnztnData[idx].dtogRelSeqNbr;


		                    sParam.orgnztnRelList.push(orgnztnParam);
		                }								


		                var linkData = {"header" : header , "CaDeptChngSvcChngIn" : sParam};


		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
		                			var param = {};
		                			param.instCd = this.instCd;
		                			param.deptId = that.$el.find('[data-form-param="deptId"]').val();


		                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
		                			that.searchCAPAT201Base(param);


		        	                that.loadTree();
		                		}
		                	}
		                });	
					}

				}


				/**
				 * 부서 역할 등록
				 */
				, saveDeptRoleBase: function(){

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

					var that = this;


					if(that.$el.find('[data-form-param="deptId"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptId") + "]");
					}else if(that.currentDeptInfo.deptStsCd != '01'){
						fn_alertMessage("", bxMsg("cbb_err_msg.AUIATE0028"));
					}else{


						var param = {};
						param.instCd = this.instCd;
						param.deptId = that.$el.find('[data-form-param="deptId"]').val();
						param.deptRoleList = new Array();
		                var checkdedAllData = that.PAT004DeptRoleListGrid.getFilteredRecords('checkYn', true); // 체크된 데이터 가지고 오기


		                var registeredRoleYn = false;
		                for (var idx in checkdedAllData) {
		                	//역할 설정에 있는 역할식별자가 이미 템플릿에 등록된 역할이고
		                	if(checkdedAllData[idx].roleId == that.$el.find('[data-form-param="roleId"]').val()){
		                		registeredRoleYn = true;
		                		//역할설정에서 권한부여여부를 N으로 했으면 skip.
		                		if(that.$el.find('[data-form-param="authGrantYn"]').val() == "N"){
				                	var row = {};
				                    row.roleId = checkdedAllData[idx].roleId;
				                    row.deptHldRoleStsCd = '2';//종료
				                    param.deptRoleList.push(row);
		                		}else{
				                	var row = {};
				                    row.roleId = checkdedAllData[idx].roleId;
				                    row.deptHldRoleStsCd = '1';//정상
				                    param.deptRoleList.push(row);		                			
		                		}
		                	}


		                }


		                //역할 설정에 있는 역할식별자가 템플릿에 등록되어 있지 않은 역할이고
		                if(registeredRoleYn == false){
	                		//역할설정에서 권한부여여부를 Y로 했으면 roleId 등록.
	                		if(that.$el.find('[data-form-param="authGrantYn"]').val() == "Y"){
			                	var row = {};
			                    row.roleId = that.$el.find('[data-form-param="roleId"]').val();	
			                    row.deptHldRoleStsCd = '1';//정상
			                    param.deptRoleList.push(row);
	                		}	          
		                }


						// header 정보 set
			            var header =  new Object();
		            	header = fn_getHeader("CAPDT0000402");


			            var linkData = {"header": header, "CaDeptRoleChngSvcIn": param};


			            // ajax호출
			            bxProxy.post(sUrl, JSON.stringify(linkData),{
			            	enableLoading: true,
			                success: function(responseData){
			                	if(fn_commonChekResult(responseData)) {
		                			var param = {};
		                			param.instCd = this.instCd;
		                			param.deptId = that.$el.find('[data-form-param="deptId"]').val();


		                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
		                			that.searchCAPAT201Base(param);


		        	                that.loadTree();
			                    }
			                }   // end of suucess: fucntion
			            }); // end of bxProxy	


					}
				}


	            /* ================================================================================================
	             * ==========================================부서폐점================================================
	             * ================================================================================================
	             */


				/**
				 * Close Department
				 */


				, closureCAPAT201Base : function() {
					var that = this;


					if(that.$el.find('[data-form-param="deptId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#deptId") + "]");
					}


					fn_confirmMessage(event, '', bxMsg('cbb_err_msg.AUIATE0016'), function(){  
						var header =  new Object(); 
		                header = fn_getHeader("CAPDT0020202");


		                var sParam = {}; 
		                if(!this.instCd){
		                	this.instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);
		                }
		                sParam.instCd = this.instCd;
		                sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();


		                var linkData = {"header" : header , "CaDeptChngSvcClsrIn" : sParam};


		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
		                			var param = {};
		                			param.instCd = this.instCd;
		                			param.deptId = that.$el.find('[data-form-param="deptId"]').val();


		                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
		                			//변경된 정보는 set
		                			that.execSaveSDT002Base();
		                			that.searchCAPAT201Base(param);
		                			that.loadTreeOrList();
		                		}
		                	}
		                });	
					});
				}


	            /* ================================================================================================
	             * ==========================================팝업==================================================
	             * ================================================================================================
	             */


				/**
				 * department organization relation history popup
				 */
				, orgnztnHistPopCAPAT201Base : function() {
					var that = this;
			    	var param = {};


			    	param.instCd = this.instCd;
			    	param.deptId = that.$el.find('[data-form-param="deptId"]').val();
			    	param.deptNm = that.$el.find('[data-form-param="deptNm"]').val();


				    var popupDeptOrgnztnHistObj = new popupDeptOrgnztnHist(param); // 팝업생성
				    popupDeptOrgnztnHistObj.render();
				}


				/**
				 * Staff Search popup
				 */
				, popStaffSearch: function(){
					var that = this;					
					var param = {};
					param.instCd = this.instCd;

				    var popStaffIdObj = new popupStaffId(param);

				    popStaffIdObj.render();
				    popStaffIdObj.on('popUpSetData', function (param) {
				    	that.$el.find('[data-form-param="mgmtStaff"]').val(param.staffId + " " + param.staffNm); 
				    	that.$el.find('[data-form-param="mgmtStaffId"]').val(param.staffId); 
				    });
				}




	            /**
	             * 상위부서조회 팝업
	             */
	            , selectDeptCAPAT201Base: function(rowIndex, basicYn){
					var that = this;					
					var param = {};
					param.instCd = this.instCd;


					if(rowIndex != null && rowIndex != undefined) {
						param.dtogRelCd = that.CAPAT201Grid.getAllData()[rowIndex].dtogRelCd;
					}
					else {
						param.dtogRelCd = '01';
					}


				    var popDeptIdObj = new popupDeptId(param);


				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {
				    	var dataList = that.CAPAT201Grid.getAllData();


				    	dataList[rowIndex].upDeptNm = param.brnchCd + " " + param.brnchNm;
				    	dataList[rowIndex].upDeptId = param.brnchCd;


				    	that.CAPAT201Grid.setData(dataList);
				    });


	            }


	            /**
	             * 기본상위부서조회 팝업
	             */
	            , popSprvsrDeptSearch: function(){
					var that = this;					
					var param = {};
					param.instCd = this.instCd;
					param.dtogRelCd = '01'; //기본조직


				    var popDeptIdObj = new popupDeptId(param);


				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {


				    	that.$el.find('[data-form-param="supervisorDept"]').val(param.brnchCd+" "+param.brnchNm);
				    	that.$el.find('[data-form-param="defaultUpDeptId"]').val(param.brnchCd);


				    	that.newUpDeptId = param.brnchCd;
				    	that.newUpDeptNm = param.brnchNm;


				    });
	            }


	            /**
	             * 회계처리부서조회 팝업
	             */
	            , popAcctgDeptSearch: function(){
					var that = this;					
					var param = {};
					param.instCd = this.instCd;
					param.dtogRelCd = '02'; //회계조직


				    var popDeptIdObj = new popupDeptId(param);


				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {


				    	that.$el.find('[data-form-param="acctgPrcsDept"]').val(param.brnchCd+" "+param.brnchNm);
				    	that.$el.find('[data-form-param="acctgPrcsDeptId"]').val(param.brnchCd);


				    });
	            }




	            /**
	             * 주소조회 팝업
	             */
	            , popAddrSearch: function(){
					var that = this;					
					var param = {};


				    var popZipCdObj = new popupKrZipCd(param);


				    popZipCdObj.render();
				    popZipCdObj.on('popUpSetData', function (param) {				        
				    	that.$el.find('[data-form-param="addrId"]').eq(0).val(param.addrId); 
				    	that.$el.find('[data-form-param="addrCntnt"]').val("[" + param.zipCd + "]" + param.roadAddr); 
				    	that.$el.find('[data-form-param="dtlAddrCntnt"]').val(param.dtlAddr);
				    	that.$el.find('[data-form-param="addrHrarcyCd"]').val(param.addrHrarcyCd);				    	
				    });


	            }


	            /**
	             * 부서역할템플릿조회 팝업
	             */
				, popDeptRoleTmpltSearch: function(){
					var that = this;					
					var param = {};
					param.instCd = this.instCd;
				    var popupDeptRoleTmpltIdObj = new popupDeptRoleTmpltId(param);


				    popupDeptRoleTmpltIdObj.render();
				    popupDeptRoleTmpltIdObj.on('popUpSetData', function (param) {
				    	that.$el.find('[data-form-param="deptRoleTmplt"]').val(param.roleTmpltId + " " + param.roleTmpltNm); 
				    	that.$el.find('[data-form-param="roleTmpltId"]').val(param.roleTmpltId); 
				    });
				}


	            /* ================================================================================================
	             * ==========================================기타화면================================================
	             * ================================================================================================
	             */




				/**
				 * 부서명 조회
				 */
				, setAcctPrcsDeptIdNm: function(deptId){
					if(deptId != "" && deptId != null){
						var that = this;
			            var sParam = {};
			            sParam.instCd = this.instCd;
			            sParam.deptId = deptId;
		                sParam.dtogRelCd = '01'; //기본조직에 대해서 조회.

			            var linkData = {
			                "header": fn_getHeader("CAPDT2008401")
			                , "CaDeptSrchSvcGetDeptListIn": sParam
			            };


			            //ajax 호출
			            bxProxy.post(sUrl, JSON.stringify(linkData), {
			                success: function (responseData) {
			                    //에러인지 아닌지 판별해서 에러이면 메시지를 띄워주고 아니면 재조회 한다.
			                    if (fn_commonChekResult(responseData)) {
			                        if (responseData.CaDeptSrchSvcGetDeptListOut) {
			                        	if(responseData.CaDeptSrchSvcGetDeptListOut.deptList[0]){
				                        	var acctgDeptNm = responseData.CaDeptSrchSvcGetDeptListOut.deptList[0].deptNm
				                        	that.$el.find('[data-form-param="acctgPrcsDept"]').val(acctgDeptNm + " " + deptId);
				                        	that.$el.find('[data-form-param="acctgPrcsDeptId"]').val(deptId);			                        		
			                        	}
			                        }
			                    }
			                }
			            });


					}
				}


	            /**
	             * 입력항목 초기화 reset
	             */
	            , resetCAPAT201Base: function(){
					var that = this;
					//신규부서등록모드
					registerNewDept = true;


					// 부서식별자 유효성 여부
					that.isValidDeptId = false;


					//초기화
					fn_resetForRegisterCAPAT201(that, newUpDeptId, newUpDeptNm);
	            }




	            /**
	             * 그리드영역 접기
	             */
	            , popGridLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#dept-orgnztn-grid-area"));
	            }
	            /**
	             * 조회영역 접기
	             */
	            , popPageLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#base-attribute-area"));
	            }
	            /**
	             * 트리 열기
	             */
	            , showTree: function () {
	                var that = this;


	                that.$el.find('.col1').show();
	                that.$el.find('.col2').css('left', '260px');
	                that.$el.find('#btn-tree-show').hide();
	            }


	            /**
	             * 트리 접기
	             */
	            , hideTree: function () {
	                var that = this;


	                that.$el.find('.col1').hide();
	                that.$el.find('.col2').css('left', '30px');
	                that.$el.find('#btn-tree-show').show();
	            }
	            /**
	             * 역할목록 영역 접기
	             */
	            , popRoleSelectLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#role-select-area"));
	            }
	            /**
	             * 역할설정 영역 접기
	             */
	            , popRoleSettingLayerCtrl: function(){
	            	var that = this;
	            	fn_pageLayerCtrl(that.$el.find("#CAPAT301-role-setting-table"));
	            }


	            /**
	             * 부서식별자 변경 시 검증여부 초기화
	             */
				, changeDeptIdCAPAT201Base :function() {
					this.isValidDeptId = false;
				}


			});


	return CAPAT201BaseView;
});




/**
 * Reset for registering new department under chosen department
 * @param that
 */
function fn_resetForRegisterUnderDeptCAPAT201(that, newUpDeptId, newUpDeptNm){


	that.deptDetailInfo = null;


	that.$el.find('input[type="text"]').each(function(){ 
		this.value = "";
	});


	that.$el.find('input[type="hidden"]').each(function(){ 
		if($(this).attr("data-form-param") != "xtnAtrbtNm" && $(this).attr("data-form-param") != "addrHrarcyCd") {
			this.value = ""; 	
		}		
	});


	that.$el.find('input[type="password"]').each(function(){ 
		this.value = "";
	});


	that.$el.find('input[type="checkbox"]').each(function(){ 
		$(this).attr("checked", false);
	});


	that.$el.find('input[type="radio"]').each(function(){ 
		$(this).attr("checked", false);
	});


	var gridOrgnztnData = that.CAPAT201Grid.getAllData();


	for (var idx in gridOrgnztnData) {
        gridOrgnztnData[idx].upDeptId = "";
        gridOrgnztnData[idx].upDeptNm = "";
    }


	that.$el.find('select').each(function(){ 
		this.selectedIndex = 0;
	});


	that.CAPAT201Grid.setData(gridOrgnztnData);


	// 역할목록 선택박스 clear 
	if(that.PAT004DeptRoleListGrid) {
		that.PAT004DeptRoleListGrid.resetData();


		if(that.roleList) {
			that.PAT004DeptRoleListGrid.setData(that.roleList);
		}
	}


	that.$el.find('.CAPAT201-check-dplctn-btn').attr("disabled", false);
	that.$el.find('.CAPAT201-dept-orgnztn-rel-btn').attr("disabled", true);	
	that.$el.find('[data-form-param="deptId"]').attr("disabled", false);
	that.$el.find('[data-form-param="supervisorDept"]').attr("disabled", true);
	that.$el.find('[data-form-param="mgmtStaff"]').attr("disabled", true);
	that.$el.find('[data-form-param="deptRoleTmplt"]').attr("disabled", true);
	that.$el.find('#btn-deptRoleTmplt-search').attr("disabled", false);


	//신규일자 오늘날짜로.
	that.$el.find('[data-form-param="deptOpnDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
	//상위부서는 현재 선택한 부서의 Id, Nm으로
	that.$el.find('[data-form-param="supervisorDept"]').val(newUpDeptId+" "+newUpDeptNm);
	that.$el.find('[data-form-param="defaultUpDeptId"]').val(newUpDeptId);


}


/**
 * Reset for registering new department
 * @param that
 */
function fn_resetForRegisterCAPAT201(that, newUpDeptId, newUpDeptNm){


	that.deptDetailInfo = null;


	that.$el.find('input[type="text"]').each(function(){ 
		this.value = "";
	});


	that.$el.find('input[type="hidden"]').each(function(){ 
		if($(this).attr("data-form-param") != "xtnAtrbtNm" && $(this).attr("data-form-param") != "addrHrarcyCd") {
			this.value = ""; 	
		}		
	});


	that.$el.find('input[type="password"]').each(function(){ 
		this.value = "";
	});


	that.$el.find('input[type="checkbox"]').each(function(){ 
		$(this).attr("checked", false);
	});


	that.$el.find('input[type="radio"]').each(function(){ 
		$(this).attr("checked", false);
	});


	var gridOrgnztnData = that.CAPAT201Grid.getAllData();


	for (var idx in gridOrgnztnData) {
        gridOrgnztnData[idx].upDeptId = "";
        gridOrgnztnData[idx].upDeptNm = "";
    }


	// 역할목록 선택박스 clear 
	if(that.PAT004DeptRoleListGrid) {
		that.PAT004DeptRoleListGrid.resetData();


		if(that.roleList) {
			that.PAT004DeptRoleListGrid.setData(that.roleList);
		}
	}


	that.$el.find('select').each(function(){ 
		this.selectedIndex = 0;
	});


	that.CAPAT201Grid.setData(gridOrgnztnData);


	that.$el.find('.CAPAT201-check-dplctn-btn').attr("disabled", false);
	that.$el.find('.CAPAT201-dept-orgnztn-rel-btn').attr("disabled", true);	
	that.$el.find('[data-form-param="deptId"]').attr("disabled", false);
	that.$el.find('[data-form-param="supervisorDept"]').attr("disabled", true);
	that.$el.find('[data-form-param="mgmtStaff"]').attr("disabled", true);
	that.$el.find('[data-form-param="deptRoleTmplt"]').attr("disabled", true);
	that.$el.find('#btn-deptRoleTmplt-search').attr("disabled", false);


	//신규일자 오늘날짜로.
	that.$el.find('[data-form-param="deptOpnDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
	//상위부서식별자 초기화
	newUpDeptId = "";
	newUpDeptNm = "";
	//상위부서는 현재 선택한 부서의 Id, Nm으로
	that.$el.find('[data-form-param="supervisorDept"]').val("");
	that.$el.find('[data-form-param="defaultUpDeptId"]').val("");
}
