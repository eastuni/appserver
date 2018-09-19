define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
		  'bx-component/ext-grid/_ext-grid',
	 	  'text!app/views/page/CAPAT/301/_CAPAT301.html', 
		  'bx/views/workspace',
	      'bx-component/bx-tree/bx-tree'
	 	 ],


function(config, commonInfo, ExtGrid, tpl, workspaceView, bxTree) {


	var comboStore1 = {}; // 부서역할템플릿상태코드
	var roleList = {}; // 부서역할목록
	var rsltCnt; //검색건수


	var CAPAT301BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT301-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click .PAT004-reset-btn' : 'resetPAT004Base',
					'click #btn-tree-search' : 'loadTreeOrList', //트리 혹은 목록 조회
					'click .PAT004-role-save-btn' : 'savePAT004Base',
					'click .PAT004-tmplt-save-btn' : 'saveTmpltPAT004Base',
					'click .PAT004-delete-btn' : 'deletePAT004Base',
		            'click #btn-detail-modal' : 'popdetailLayerCtrl', //기본속성 영역 접기
		            'click #btn-role-select-modal': 'popRoleSelectLayerCtrl', // 역할목록 영역 접기
		            'click #btn-setting-modal' : 'popRoleSettingLayerCtrl', // 역할설정 영역 접기
			        'click #btn-tree-hide': 'hideTree', //트리숨기기
				    'click #btn-tree-show': 'showTree' //트리보이기
				},
				initialize : function(initData) {
					var that = this;


		            $.extend(that,initData);


		            // 페이지 템플릿 설정
		            that.$el.html(that.tpl());


		            // init data set
		            if(commonInfo.getInstInfo().instCd) {
		              	that.gInstCd = commonInfo.getInstInfo().instCd;
		            }
		            else {
		            	that.gInstCd = constantAdminInstCd;
		            }	


		            // 부서역할템플릿상태코드 
		            var sParam = {};
		            sParam.cdNbr = "A0471";
		            var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


		            // 부서역할정보조회 서비스호출 준비
		            var sRoleParam = {};
		            sRoleParam.instCd = that.gInstCd;
		            sRoleParam.clHrarcyId = "Role";
		            sRoleParam.clId = "Department";


		            var linkData2 = {"header": fn_getHeader("CAPCM1968400"), "CaRoleMgmtSvcGetRoleClassificationRelationListIn": sRoleParam};


  	                // 콤보데이터 로딩
  	                var sParam = {};


  	                // combobox 정보 셋팅
  	                sParam.className = "srchDeptRoleTmpltStsCd-wrap";
  	                sParam.targetId = "srchDeptRoleTmpltStsCd";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0471";
  	                sParam.viewType = "ValNm";
  	                // 콤보데이터 load
  	                fn_getCodeList(sParam, that);


  	                sParam = {};
  	                // combobox 정보 셋팅
  	                sParam.className = "roleTmpltStsCd-wrap";
  	                sParam.targetId = "roleTmpltStsCd";
  	                sParam.nullYn = "N";
  	                sParam.cdNbr = "A0471";
  	                sParam.selectVal = '02';
  	                //sParam.disabled = true;
  	                sParam.viewType = "ValNm";
  	                // 콤보데이터 load
  	                fn_getCodeList(sParam, that);




		            /* 부서템플릿 그리드 */
		            /* ========================================================== */
		            bxProxy.all([
		            /* ========================================================== */
		                  // 부서역할템플릿상태코드 콤보로딩
		                  {url: sUrl, param: JSON.stringify(linkData1), success: function(responseData) {
		                	  if(fn_commonChekResult(responseData)) {
		                		  comboStore1 = new Ext.data.Store({
		                              fields: ['cd', 'cdNm'],
		                              data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                          });
		                      }
		                  }}
		                 ,// 부서역할목록 조회 
		                  {url: sUrl, param: JSON.stringify(linkData2), success: function(responseData) {
		                	  if(fn_commonChekResult(responseData)) {
		                		  roleList = responseData.CaRoleMgmtSvcGetRoleClassificationRelationListOut.tblNm;
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
//	    					              ,gridConfig: {
//	    						  				multiSelect: false
//	    				        		  } // end of gridConfig
					                      , listeners: {click: {element: 'body',
				          			             fn: function(){
				          			          	   //클릭시 이벤트 발생
				          			           	   that.selectRole();
				          			             }
					                      	  }
					                      }
	    	                });


		                  	// 그리드 렌더
		                  	that.createGrid();




		                  } // end of success:.function
		            }); // end of bxProxy.all




	                //tree 생성
	                that.createTree();


				},
				render : function() {
					
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT301-wrap .PAT004-role-save-btn')
                                        		,this.$el.find('.CAPAT301-wrap .PAT004-tmplt-save-btn')
                                        		,this.$el.find('.CAPAT301-wrap .PAT004-delete-btn')
                                        			   ]);
					
					var that = this;


                	// 입력항목 초기화 
                	this.resetPAT004Base(true);


                	return this.$el;
				},


				//트리 생성
				createTree: function(){
	                var that = this;


	                that.subViews['CAPAT301Tree'] = new bxTree({
	                	fields: {id: 'roleTmpltId', value: 'roleTmpltNm'}
	                    , listeners: {
	                        clickItem: function(itemId, itemData, currentTarget, e) {
	                        	if(itemData.roleTmpltStsCd == null || itemData.roleTmpltStsCd == undefined){
	                        		fn_alertMessage("",bxMsg("cbb_items.SCRNITM#selectRoleTmplt"));
	                        	}else{		                        	
		                        	//부서역할템플릿정보set
		                        	var paramData = {};
		                        	paramData.roleTmpltId = itemData.roleTmpltId;
		                        	paramData.roleTmpltNm = itemData.roleTmpltNm;
		                        	paramData.roleTmpltStsCd = itemData.roleTmpltStsCd;
		                        	that.setPAT004BaseDtl(paramData);	                        		
	                        	}
	                         }
	                     }
	                 });


	                // DOM Element Cache
	                that.$unitTreeRoot = that.$el.find('.bx-tree-root');
	                that.$unitTreeRoot.html(this.subViews['CAPAT301Tree'].render());
	                that.loadAllTmpltList();
				},


	            /**
	             * Tree 데이터 set(전체 스태프 목록)
	             */
				loadAllTmpltList: function(){
	            	var that = this;
	                var sParam = {};
	                sParam.instCd = that.gInstCd;


	                var linkData = {"header": fn_getHeader("CAPAT0048403"), "CaDeptRoleTmpltTreeIn": sParam};
	                //그리드숨기기
	                that.$el.find('.roleTmpltTreeArea').show();
	                that.$el.find('.roleTmpltGridArea').hide();
	                that.treeList = [];


	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                   enableLoading: true,
	                    success: function (responseData) {
	                       if(fn_commonChekResult(responseData)) {
	                    	   that.subViews['CAPAT301Tree'].renderItem(responseData.CaDeptRoleTmpltTreeOut.deptRoleTmpltList);
	                       }
	                    }
	                });//end of bxProxy
	            },


	            /**
	             * 트리 혹은 목록 조회
	             */
	            loadTreeOrList: function(){
	            	var that = this;
	            	if(that.$el.find('#searchKey').val() != '' && that.$el.find('#searchKey').val() != undefined){
	            		//템플릿목록 그리드 생성
	            		that.createList();	            	
	            	}else{
	            		//전체 템플릿목록 조회
	            		that.loadAllTmpltList();
	            	}
	            },
	            /**
	             * 목록 생성
	             */
	            createList: function () {
	                var that = this;


	                that.CAPAT301GridItm = new ExtGrid({
	                    // 그리드 컬럼 정의
	                    fields: ['roleTmpltId', 'roleTmpltNm', 'roleTmpltStsCd']
	                    , id: 'CAPAT301Grid'
	                    , columns: [
	                        {
	                            text: bxMsg('cbb_items.AT#roleTmpltId'),
	                            flex: 1,
	                            dataIndex: 'roleTmpltId',
	                            style: 'text-align:center',
	                            height : 25, 
	                            align: 'center'
	                        },
	                        {
	                            text: bxMsg('cbb_items.AT#roleTmpltNm'),
	                            flex: 1,
	                            dataIndex: 'roleTmpltNm',
	                            style: 'text-align:center',
	                            align: 'center'
	                        },
	                        {
	                             text: bxMsg('cbb_items.AT#roleTmpltStsCd')
	                             , width : 0
	                             , dataIndex: 'roleTmpltStsCd'
	                             , hidden : true
	                        },
	                    ] // end of columns
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function () {
	                                that.getTmpltInfoListCAPAT301Base();
	                            }
	                        }
	                    }
	                });


	                that.$el.find('#roleTmplt-list-grid').html(that.CAPAT301GridItm.render({'height': '660px'})); 
	                that.loadGridList();
	            },


	            /**
	             * 그리드 데이터 set
	             */
	            loadGridList: function(){
	            	var that = this;	     
	            	//트리숨기기
	                that.$el.find('.roleTmpltTreeArea').hide();
	                that.$el.find('.roleTmpltGridArea').show();
	                var sParam = {};
	                sParam.instCd = that.gInstCd;
	                sParam.roleTmpltNm = that.$el.find('#searchKey').val();


	                var linkData = {"header": fn_getHeader("CAPAT0048404"), "CaDeptRoleTmpltSvcGetListIn": sParam};


	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            if (responseData.CaDeptRoleTmpltSvcGetListOut) {
	                                that.CAPAT301GridItm.setData(responseData.CaDeptRoleTmpltSvcGetListOut.deptRoleTmpltList);
	                            }
	                        }
	                    }
	                });


	            },


	            /**
	             * 목록에서 템플릿 선택
	             */
	            getTmpltInfoListCAPAT301Base: function(){
	                var that = this;
	                var selectedItem = that.CAPAT301GridItm.grid.getSelectionModel().selected.items[0];


	                if (!selectedItem) {
	                    return;
	                } else {
	                	// 초기화 
	                	that.resetPAT004Base();


	                	// 상세정보 set 
		                that.setPAT004BaseDtl(selectedItem.data);
	                }
	            },


	            // 그리드 생성
	            createGrid : function() {
                	this.$el.find("#PAT004-roleList-grid").html(this.PAT004DeptRoleListGrid.render({'height':"440px"}));


                	if(roleList != null) {
                		this.PAT004DeptRoleListGrid.setData(roleList);
                	}
	            }, // end of createGrid 
	            resetPAT004Base : function(isInit) {
					var that = this;


		        	// 입력값 clear
		        	var tblObj = that.$el.find('.deptRoletmpltTbl-wrap');


		        	tblObj.find('input[type="text"]').val("");
		        	tblObj.find('select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


		        	tblObj.find('[data-form-param="newSaveYn"]').val("Y"); // 신규저장 


		        	// 식별자 enable
		        	tblObj.find('[data-form-param="roleTmpltId"]').attr("disabled", false);
		        	//tblObj.find('[data-form-param="roleTmpltNm"]').attr("disabled", false);


		        	// 상태코드 
		        	tblObj.find('[data-form-param="roleTmpltStsCd"]').val("01");


		        	//역할설정영역도 초기화
		        	that.$el.find('[data-form-param="roleId"]').val("");
		        	that.$el.find('[data-form-param="roleNm"]').val("");
		        	that.$el.find('[data-form-param="authGrantYn"]').val("Y");


		        	// 역할목록 선택박스 clear 
		        	if(that.PAT004DeptRoleListGrid) {
		        		that.PAT004DeptRoleListGrid.resetData();


		        		if(roleList) {
		        			that.PAT004DeptRoleListGrid.setData(roleList);
		        		}
		        	}


				},
				//템플릿 등록
				saveTmpltPAT004Base: function(){

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
					var that = this;
					var tblObj = that.$el.find('.deptRoletmpltTbl-wrap');
					var param = {};
					var newSaveYn = tblObj.find('[data-form-param="newSaveYn"]').val();


					param.instCd = that.gInstCd;
					param.roleTmpltId = tblObj.find('[data-form-param="roleTmpltId"]').val();
					param.roleTmpltNm = tblObj.find('[data-form-param="roleTmpltNm"]').val();
					param.roleTmpltStsCd = tblObj.find('[data-form-param="roleTmpltStsCd"]').val();	


					// 입력값 validation check 
					if(param.roleTmpltId == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#roleTmpltId") + "]");
					}
					else if(param.roleTmpltNm == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#roleTmpltNm") + "]");
					}
					else {
						//역할은 빈 상태로 보냄(비어있으면 변경 처리 안함)
						param.deptRoleTmpltList = new Array();


						// header 정보 set
			            var header =  new Object();


			            if(newSaveYn == "Y") {


			            	header = fn_getHeader("CAPAT0048101");


				            var linkData = {"header": header, "CaDeptRoleTmpltSvcRgstIn": param};


				            // ajax호출
				            bxProxy.post(sUrl, JSON.stringify(linkData),{
				            	enableLoading: true,
				                success: function(responseData){
				                	if(fn_commonChekResult(responseData)) {
				                		fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	


				                		tblObj.find('[data-form-param="roleTmpltId"]').attr("disabled", true);
				                		//tblObj.find('[data-form-param="roleTmpltNm"]').attr("disabled", true);
				                		tblObj.find('[data-form-param="newSaveYn"]').val("N");


				                		// 재조회 
				                		that.loadTreeOrList();
				                	}
				                }   // end of suucess: fucntion
				            }); // end of bxProxy		
			            }
			            else {	
			            	header = fn_getHeader("CAPAT0048201");
				            var linkData = {"header": header, "CaDeptRoleTmpltSvcModifyIn": param};


				            // ajax호출
				            bxProxy.post(sUrl, JSON.stringify(linkData),{
				            	enableLoading: true,
				                success: function(responseData){
				                	if(fn_commonChekResult(responseData)) {
				                		fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	


				                		tblObj.find('[data-form-param="roleTmpltId"]').attr("disabled", true);
				                		//tblObj.find('[data-form-param="roleTmpltNm"]').attr("disabled", true);
				                		tblObj.find('[data-form-param="newSaveYn"]').val("N");


				                		// 재조회 
				                		that.loadTreeOrList();
				                    }
				                }   // end of suucess: fucntion
				            }); // end of bxProxy	
			            }
                   }
				},
				//역할 등록 
				savePAT004Base : function() {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

					var that = this;
					var tblObj = that.$el.find('.deptRoletmpltTbl-wrap');
					var param = {};
					var newSaveYn = tblObj.find('[data-form-param="newSaveYn"]').val();


					param.instCd = that.gInstCd;
					param.roleTmpltId = tblObj.find('[data-form-param="roleTmpltId"]').val();
					param.roleTmpltStsCd = tblObj.find('[data-form-param="roleTmpltStsCd"]').val();	


					// 입력값 validation check 
					if(param.roleTmpltId == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#roleTmpltId") + "]");
					}
					else if(param.roleTmpltNm == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#roleTmpltNm") + "]");
					}
					else {


						param.deptRoleTmpltList = new Array();
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
				                    row.delYn = "Y";
				                    param.deptRoleTmpltList.push(row);
		                		}else{
				                	var row = {};
				                    row.roleId = checkdedAllData[idx].roleId;  
				                    row.delYn = "N";
				                    param.deptRoleTmpltList.push(row);
		                		}
		                	}


		                }


		                //역할 설정에 있는 역할식별자가 템플릿에 등록되어 있지 않은 역할이고
		                if(registeredRoleYn == false){
	                		//역할설정에서 권한부여여부를 Y로 했으면 roleId 등록.
	                		if(that.$el.find('[data-form-param="authGrantYn"]').val() == "Y"){
			                	var row = {};
			                    row.roleId = that.$el.find('[data-form-param="roleId"]').val();
			                    row.delYn = "N";
			                    param.deptRoleTmpltList.push(row);
	                		}	          
		                }


						// header 정보 set
			            var header =  new Object();
		            	header = fn_getHeader("CAPAT0048201");


			            var linkData = {"header": header, "CaDeptRoleTmpltSvcModifyIn": param};


			            // ajax호출
			            bxProxy.post(sUrl, JSON.stringify(linkData),{
			            	enableLoading: true,
			                success: function(responseData){
			                	if(fn_commonChekResult(responseData)) {
			                		fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	


			                		tblObj.find('[data-form-param="roleTmpltId"]').attr("disabled", true);
			                		//tblObj.find('[data-form-param="roleTmpltNm"]').attr("disabled", true);
			                		tblObj.find('[data-form-param="newSaveYn"]').val("N");


			                		// 재조회 
			                		that.loadTreeOrList();
			            			//역할조회
			            			that.searchRoleList(param.roleTmpltId);
			                    }
			                }   // end of suucess: fucntion
			            }); // end of bxProxy		
                   }
				},
				// 삭제 
				deletePAT004Base : function() {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

					var that = this;
					var tblObj = that.$el.find('.deptRoletmpltTbl-wrap');
					var param = {};
					param.instCd = that.gInstCd;
					param.roleTmpltId = tblObj.find('[data-form-param="roleTmpltId"]').val();


					// 입력값 validation check 
					if(param.roleTmpltId == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#roleTmpltId") + "]");
					}
					else {
						fn_confirmMessage(event, '', bxMsg('cbb_items.SCRNITM#data-delete-msg'), function(){


    			            var linkData = {"header": fn_getHeader("CAPAT0048205"), "CaDeptRoleTmpltSvcDeleteIn": param};


    			            // ajax호출
    			            bxProxy.post(sUrl, JSON.stringify(linkData),{
    			            	enableLoading: true,
    			                success: function(responseData){
    			                	if(fn_commonChekResult(responseData)) {
    			                		fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	


    			                		// 재조회 
    			                		that.loadTreeOrList();
    			                    }
    			                }   // end of suucess: fucntion
    			            }); // end of bxProxy	


                    	});
                   }
				},
	            /* ============================================================== */
	            /*  Grid 클릭 - 상세조회 실행                                 */
	            /* ============================================================== */
	            /* 상세정보 set */
	            setPAT004BaseDtl: function(dtlData) {
	            	var that = this;


        			that.$el.find('[data-form-param="roleTmpltId"]').val(dtlData.roleTmpltId);
        			that.$el.find('[data-form-param="roleTmpltNm"]').val(dtlData.roleTmpltNm);
        			that.$el.find('[data-form-param="roleTmpltStsCd"]').val(dtlData.roleTmpltStsCd);


        			that.$el.find('[data-form-param="newSaveYn"]').val("N"); // 신규저장이 아님(수정저장)


		        	// 템플릿식별자 disable
        			that.$el.find('[data-form-param="roleTmpltId"]').attr("disabled", true);
        			//that.$el.find('[data-form-param="roleTmpltNm"]').attr("disabled", true);  


        			//역할조회
        			that.searchRoleList(dtlData.roleTmpltId);


	            },


	            /**
	             * 부서역할템플릿의 역할목록 조회
	             */
	            searchRoleList: function(roleTmpltId){
	            	var that = this;
        			// 역할정보 조회
        			var param = {};
        			param.instCd = that.gInstCd;
        			param.roleTmpltId = roleTmpltId;
		            var linkData = {"header": fn_getHeader("CAPAT0048401"), "CaDeptRoleTmpltSvcGetIn": param};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData),{
		            	enableLoading: true,   
		                success: function(responseData){


		                	if(fn_commonChekResult(responseData)) {
		                		if(responseData.CaDeptRoleTmpltSvcGetOut) {
		                			var searchedRoleList = responseData.CaDeptRoleTmpltSvcGetOut.deptRoleTmpltList;


		                			that.PAT004DeptRoleListGrid.resetData();
		        					var gridStore = new Array();


		        	                $(roleList).each(function(roleIdx, record) {
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
		                    }
		                }   // end of suucess: fucntion
		            });     // end of bxProxy	
	            },
	            /*역할조회*/
	            selectRole: function(){
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
	            },


	            /**
	             * 기타 화면 설정
	             */
	            popdetailLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#CAPAT301-detail-table"));
	            },
	            popRoleSelectLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#role-select-area"));
	            },
	            popRoleSettingLayerCtrl: function(){
	            	var that = this;
	            	fn_pageLayerCtrl(that.$el.find("#CAPAT301-role-setting-table"));
	            },


	            /**
	             * 트리 열기
	             */
	            showTree: function () {
	                var that = this;


	                that.$el.find('.col1').show();
	                that.$el.find('.col2').css('left', '260px');
	                that.$el.find('#btn-tree-show').hide();
	            },


	            /**
	             * 트리 접기
	             */
	            hideTree: function () {
	                var that = this;


	                that.$el.find('.col1').hide();
	                that.$el.find('.col2').css('left', '30px');
	                that.$el.find('#btn-tree-show').show();
	            }


			});


	return CAPAT301BaseView;
});
