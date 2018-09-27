var instParams = {};


define(
		[ 'bx/common/config',
		  'app/views/page/popup/CAPCM/popup-kr-zipCd',
		  'bx/common/common-info',
		  'bx-component/date-picker/_date-picker',
		  'app/views/page/popup/CAPAT/popup-brnchCd',
	 	  'text!app/views/page/CAPAT/101/_CAPAT101.html',
	      'bx-component/ext-grid/_ext-grid',
	      'bx-component/bx-tree/bx-tree'
	 	 ],


function(config, popupKrZipCd, commonInfo, datePicker, popupDeptId, tpl, ExtGrid, bxTree) {
	var CAPAT101StaffInfoData = null;
	var CAPAT101StaffDeptInfoList = new Array();
	var CAPAT101StaffRoleInfoList = new Array();
	var deleteDeptHistList = new Array();
	var deleteRoleHistList = new Array();
	var registerStaff = true; //신규스태프등록가능여부
	var CAPAT101BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT101-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click #btn-tree-search' : 'loadTreeOrList', //트리 혹은 목록 조회
					'keydown #searchKey' : 'pressEnterInTree', //트리 혹은 목록 조회
					'click #btn-base-attribute-reset' : 'resetCAPAT101Base', //전체 입력항목초기화(스태프신규가능모드)
					'click #btn-dept-hist-reset' :'resetCAPAT101DeptHist', //소속부서이력 그리드 초기화
					'click #btn-dept-info-reset' : 'resetCAPAT101DeptInfo', //소속부서정보 입력항목초기화
					'click #btn-role_hist-reset' : 'resetCAPAT101RoleHist', //스태프역할이력 그리드초기화
					'click #btn-role-info-reset' : 'resetCAPAT101RoleInfo', //스태프역할정보 입력항목초기화
					'click #btn-contact-point-reset' : 'resetCAPAT101CntntPnt', //연락처정보 입력항목초기화


					'click #btn-addr-search' : 'officeAddrPopCAPAT101Base', //주소검색팝업
					'click #btn-dept-search' : 'deptIdPopCAPAT101Base', //부서검색팝업
					'click #btn-role-dept-search' : 'roleDeptIdPopCAPAT101Base', //부서검색팝업(역할검색용)


					'click #btn-base-attribute-save' : 'saveCAPAT101Base', //스태프신규/변경 저장
					'click #btn-dept-hist-save' : 'deleteDeptHistory', //소속부서이력그리드 저장(삭제)
					'click #btn-role-hist-save' : 'deleteRoleHistory', //스태프역할이력그리드 저장(삭제)
					'click #btn-belonged-dept-info-save' : 'saveBelongedDeptInfo', //소속부서정보만 저장
					'click #btn-role-info-save' : 'saveStaffRoleInfo', //스태프역할정보만 저장
					'click #btn-contact-point-save' : 'saveCntctPnt', //연락처정보만 저장
					'click .CAPAT101-validateLoinIdNbr-btn' : 'validateLoinIdNbrCAPAT101Base', //로그인아이디 중복체크
					'click .CAPAT101-resetPswd-btn' : 'resetPswdCAPAT101Base', //비밀번호재설정
					'change .loinIdNbr' : 'changeLoginIdNbrCAPAT101Base', //로그인아이디변경 시 중복체크 요구
					'change .actorUnqIdNbrTpCd-wrap' : 'changeUnqIdNbrTp', //신분증번호유형변경 시 신분증번호 입력항목 초기화


		            'click #btn-tree-hide': 'hideTree', //트리숨기기
			        'click #btn-tree-show': 'showTree', //트리보이기
		            'click #btn-base-attribute-toggle': 'popBaseAtrbtLayerCtrl', //기본속성영역 접기
		            'click #btn-dept-hist-toggle': 'popDeptHistLayerCtrl', //소속부서이력영역 접기
		            'click #btn-dept-info-toggle' : 'popDeptInfoLayerCtrl', //소속부서정보영역 접기
		            'click #btn-role-hist-toggle' : 'popRoleHistLayerCtrl', //스태프역할이력영역 접기
		            'click #btn-role-info-toggle' : 'popRoleInfoLayerCtrl', //스태프역할정보영역 접기
		            'click #btn-contact-point-toggle': 'popCntctPntLayerCtrl' //연락처정보영역 접기	




				},


	            /* ================================================================================================
	             * ==========================================초기화================================================
	             * ================================================================================================
	             */
				initialize : function(initData) {


					var that = this;

					//set institution code
					this.instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);
					if(!this.instCd){
						this.instCd = $.sessionStorage('instCd');
					}

		            //콤보박스 생성
		            that.makeComboBoxes();


					$.extend(that, initData);
					that.$el.html(that.tpl());
					// 기관별파라미터 저장
					var instParamList = null;


					// 기관별파라미터 get
	            	var header =  new Object();
	                header = fn_getHeader("CAPCM0308403");
	                var sParam = {};
	                sParam.instCd = this.instCd;
	                var linkData = {"header" : header , "CaInstMgmtSvcGetParmIn" : sParam};
	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			instParamList = responseData.CaInstMgmtSvcGetParmOut.parmList;
	                		}
	                	},
	                	complete: function(jqXHR, textStatus) {
	                		if(instParamList != null && instParamList != undefined) {
	                			$(instParamList).each(function (idx, item) {
	                				if(item.parmAtrbtNm == "lngCd") {
	                					instParams.lngCd = item.parmVal;
	                				}
	                				else if(item.parmAtrbtNm == "natCd") {
	                					instParams.natCd = item.parmVal;
	                				}
	                				else if(item.parmAtrbtNm == "addrHrarcyCd") {
	                					instParams.addrHrarcyCd = item.parmVal;
	                				}
	                            });
	                		}
                        	// find out institution specific address hierarchy code
                        	if(instParams.addrHrarcyCd == null || instParams.addrHrarcyCd == "" || instParams.addrHrarcyCd == "NA") {
                        		that.$el.find('[data-form-param="addrHrarcyCd"]').eq(4).val("NA");
                        	}
                        	//
                        	else {
            					that.$el.find('[data-form-param="addrHrarcyCd"]').eq(4).val(instParams.addrHrarcyCd);
                        	}
	                	}
	                });//기관별 파라미터 get 끝


	                //tree 생성
	                that.createTree();


	                //소속부서이력 grid 초기화
	                that.initGridInfoCAPAT101Base();


	                //스태프역할이력 grid 초기화
	                that.initGridRoleHistoryCAPAT101Base();


	                //전체입력항목 초기화
	                that.resetCAPAT101Base();
				},


				/**
				 * 콤보박스 생성
				 */
				makeComboBoxes: function(){
					var that = this;


					var sParam = {};
					var selectStyle = {};
					// combobox: actor unique id number type code
					sParam = {};
					selectStyle = {};
					sParam.className = "actorUnqIdNbrTpCd-wrap";
					sParam.targetId = "actorUnqIdNbrTpCd";
					sParam.nullYn = "N";
					sParam.cdNbr = "40018";
					sParam.selectVal = "002";
					fn_getCodeList(sParam, that, selectStyle);


					// combobox: staff type code
					sParam = {};
					selectStyle = {};
					sParam.className = "staffTpCd-wrap";
					sParam.targetId = "staffTpCd";
					sParam.nullYn = "N";
					sParam.cdNbr = "A1104";
					fn_getCodeList(sParam, that, selectStyle);
					// combobox: user group code
					sParam = {};
					selectStyle = {};
					sParam.className = "userGrpCd-wrap";
					sParam.targetId = "userGrpCd";
					sParam.nullYn = "N";
					sParam.cdNbr = "A1105";
					sParam.selectVal = "02";
					//사용자그룹코드의 경우 01(고객), 04(시스템), 05(대외망)는 출력하지 않기 위해 fn_getCAPAT101CodeList를 별도로 사용
					fn_getCAPAT101CodeList(sParam, that, selectStyle);


					//combobox: staff Status Code
					sParam = {};
					selectStyle = {};
					sParam.className = "staffStsCd-wrap";
					sParam.targetId = "staffStsCd";
					sParam.nullYn = "N";
					sParam.cdNbr = "11957";
					sParam.selectVal = "02";
					fn_getCodeList(sParam, that, selectStyle);


				},


				render : function() {
					var that = this;

                	//배포처리반영[버튼비활성화]
//                    fn_btnCheckForDistribution([
//                                        		this.$el.find('.CAPAT101-wrap #btn-base-attribute-save')
//                                        		,this.$el.find('.CAPAT101-wrap #btn-dept-hist-save')
//                                        		,this.$el.find('.CAPAT101-wrap #btn-belonged-dept-info-save')
//                                        		,this.$el.find('.CAPAT101-wrap #btn-role-hist-save')
//                                        		,this.$el.find('.CAPAT101-wrap #btn-role-info-save')
//                                        		,this.$el.find('.CAPAT101-wrap #btn-contact-point-save')
//                                        			   ]);
					// 데이터 피커 로드
					this.loadDatePicker();
					return this.$el;
				},


				/**
				 * load Date Picker
				 */
	            loadDatePicker: function() {


	                var that = this;


	                fn_makeDatePicker(that.$el.find('[data-form-param="hiredDt"]'));
	                fn_makeDatePicker(that.$el.find('[data-form-param="retireDt"]'));
	                fn_makeDatePicker(that.$el.find('[data-form-param="startDt"]'));
	                fn_makeDatePicker(that.$el.find('[data-form-param="endDt"]'));
	                fn_makeDatePicker(that.$el.find('[data-form-param="roleStartDt"]'));
	                fn_makeDatePicker(that.$el.find('[data-form-param="roleEndDt"]'));
					that.$el.find('[data-form-param="retireDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));
					that.$el.find('[data-form-param="endDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));
					that.$el.find('[data-form-param="roleEndDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));


	            },


	            /**
	             * 소속부서이력 Grid 생성
	             */
	            initGridInfoCAPAT101Base: function(){
	            	var that = this;


	                that.dataGrid = new ExtGrid({
	                    fields: ['No', 'deptId', 'deptNm', 'efctvStartDt', 'efctvEndDt', 'clearStartEndDt', 'roleId',
	                             'dtsfRelSeqNbr']
	                    , columns: [
	                        {
	                            text: "No"
	                            , dataIndex: 'rowIndex'
	                            , sortable: false
	                            , height: 25
	                            , flex: 1
	                            , style: 'text-align:center', align: 'center'
	                            , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
	                            	return rowIndex + 1;
	                            }
	                        }
	                        , {
	                            text: bxMsg('cbb_items.AT#deptNm'),
	                            flex: 7,
	                            dataIndex: 'deptNm',
	                            style: 'text-align:center',
	                            align: 'center'
	                        }
	                        , {
	                            text: bxMsg('cbb_items.SCRNITM#startDate'),
	                            flex: 5,
	                            dataIndex: 'efctvStartDt',
	                            style: 'text-align:center',
	                            align: 'center',
	                            renderer: function(val) {
	                            	return val.substring(0,4)+"-"+val.substring(4,6)+"-"+val.substring(6,8);
	                            } // end of render
	                        }
	                        , {
	                            text: bxMsg('cbb_items.SCRNITM#endDate'),
	                            flex: 7,
	                            dataIndex: 'efctvEndDt',
	                            style: 'text-align:center',
	                            align: 'center',
	                            renderer: function(val) {
	                            	return val.substring(0,4)+"-"+val.substring(4,6)+"-"+val.substring(6,8);
	                            }
	                        }
	                 		,{dataIndex: 'clearStartEndDt'
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
	                   	                	   if(CAPAT101StaffInfoData.staffStsCd == '04'){
	                 	                		  fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
	                 	                	   }else{
		                    	                	   //소속부서이력삭제
		                    	                	   var dataList = that.dataGrid.getAllData();
		                    	                	   var data = {};
		                    	                	   data.deptId = dataList[rowIndex].deptId;
		                    	                	   data.deptNm = dataList[rowIndex].deptNm;
		                    	                	   data.roleId = dataList[rowIndex].roleId;
		                    	                	   data.efctvStartDt = dataList[rowIndex].efctvStartDt;
		                    	                	   data.dtsfRelSeqNbr = dataList[rowIndex].dtsfRelSeqNbr;
		                    	                	   deleteDeptHistList.push(data);
	
		                    	   					   grid.store.remove(record);
	                 	                	   }
	  									  }
	  									}]
	                           }
	                 		, {
	                             text: bxMsg('cbb_items.AT#dtsfRelSeqNbr')
	                             , width : 0
	                             , dataIndex: 'dtsfRelSeqNbr'
	                             , hidden : true
	                         }


	                    ]//end of columns
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function () {
	                            	that.insertStaffDeptYn = false;
	                                that.setStaffDeptInfo(null);
	                            }
	                        }
	                    }
	                });
	                that.$el.find(".data-grid").html(that.dataGrid.render({'height': "240px"}));//5건조회
	                that.dataGrid.resetData();
	            },


	            /**
	             * 스태프역할이력 Grid 생성
	             */
	            initGridRoleHistoryCAPAT101Base: function(){
	            	var that = this;


	                that.roleDataGrid = new ExtGrid({
	                    fields: ['No', 'deptId', 'deptNm', 'roleId', 'roleNm', 'efctvStartDt', 'efctvEndDt', 'clearStartEndDt'
	                             ,'dtsfRelSeqNbr', 'staffRoleSeqNbr']
	                    , columns: [
	                        {
	                            text: "No"
	                            , dataIndex: 'rowIndex'
	                            , sortable: false
	                            , height: 25
	                            , flex: 1
	                            , style: 'text-align:center', align: 'center'
	                            , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
	                            	return rowIndex + 1;
	                            }
	                        }
	                        , {
	                            text: bxMsg('cbb_items.AT#deptNm'),
	                            flex: 5,
	                            dataIndex: 'deptNm',
	                            style: 'text-align:center',
	                            align: 'center'
	                        }
	                        , {
	                            text: bxMsg('cbb_items.AT#roleId'),
	                            flex: 5,
	                            dataIndex: 'roleId',
	                            style: 'text-align:center',
	                            align: 'center'
	                        }
	                        , {
	                            text: bxMsg('cbb_items.AT#roleNm'),
	                            flex: 7,
	                            dataIndex: 'roleNm',
	                            style: 'text-align:center',
	                            align: 'center'
	                        }
	                        , {
	                            text: bxMsg('cbb_items.SCRNITM#startDate'),
	                            flex: 5,
	                            dataIndex: 'efctvStartDt',
	                            style: 'text-align:center',
	                            align: 'center',
	                            renderer: function(val) {
	                            	return val.substring(0,4)+"-"+val.substring(4,6)+"-"+val.substring(6,8);
	                            } // end of render
	                        }
	                        , {
	                            text: bxMsg('cbb_items.SCRNITM#endDate'),
	                            flex: 7,
	                            dataIndex: 'efctvEndDt',
	                            style: 'text-align:center',
	                            align: 'center',
	                            renderer: function(val) {
	                            	return val.substring(0,4)+"-"+val.substring(4,6)+"-"+val.substring(6,8);
	                            }
	                        }
	                 		,{dataIndex: 'clearStartEndDt'
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
	                    	                	   if(CAPAT101StaffInfoData.staffStsCd == '04'){
		                    	                		  fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
		                    	                	   }else{
			                    	                	   //스태프역할이력삭제
			                    	                	   var dataList = that.roleDataGrid.getAllData();
			                    	                	   var data = {};
			                    	                	   data.deptId = dataList[rowIndex].deptId;
			                    	                	   data.deptNm = dataList[rowIndex].deptNm;
			                    	                	   data.roleId = dataList[rowIndex].roleId;
			                    	                	   data.efctvStartDt = dataList[rowIndex].efctvStartDt;
			                    	                	   data.dtsfRelSeqNbr = dataList[rowIndex].dtsfRelSeqNbr;
			                    	                	   data.staffRoleSeqNbr = dataList[rowIndex].staffRoleSeqNbr;
			                    	                	   deleteRoleHistList.push(data);

			                    	                	   grid.store.remove(record);
		                    	                	   }
		  									  }
		  									}]
		                           }
	                 		, {
	                             text: bxMsg('cbb_items.AT#dtsfRelSeqNbr')
	                             , width : 0
	                             , dataIndex: 'dtsfRelSeqNbr'
	                             , hidden : true
	                         }
	                 		, {
	                             text: bxMsg('cbb_items.AT#staffRoleSeqNbr')
	                             , width : 0
	                             , dataIndex: 'staffRoleSeqNbr'
	                             , hidden : true
	                         }
	                    ]//end of columns
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function () {
	                            	that.insertStaffRoleYn = false;
	                                that.setStaffRoleInfo();
	                            }
	                        }
	                    }
	                });
	                that.$el.find(".role-data-grid").html(that.roleDataGrid.render({'height': "240px"}));//5건조회
	                that.roleDataGrid.resetData();
	            },


	            /* ================================================================================================
	             * ==========================================스태프트리================================================
	             * ================================================================================================
	             */

	            /**
	             * 스태프명에서 enterkey 조회
	             */
	            pressEnterInTree: function(event){
	                var event = event || window.event;
	                var keyID = (event.which) ? event.which : event.keyCode;
	                if(keyID == 13) { //enter
	                    this.loadTreeOrList();
	                }
	            },

	            /**
	             * 트리 혹은 목록 조회
	             */
	            loadTreeOrList: function(){
	            	var that = this;
	            	if(that.$el.find('#searchKey').val() != '' && that.$el.find('#searchKey').val() != undefined){
	            		//스태프목록 그리드 생성
	            		that.createGrid();	            	
	            	}else{
	            		//전체 스태프목록 조회
	            		that.loadAllStaffList();
	            	}
	            },


	            /**
	             * Tree 생성
	             */
	            createTree: function () {
	                var that = this;


	                that.subViews['CAPAT101Tree'] = new bxTree({
	                	fields: {id: 'rltdId', value: 'rltdNm'}
	                    , listeners: {
	                        clickItem: function(itemId, itemData, currentTarget, e) {
	                        	//스태프정보조회
	                        	if(itemData.staffStsCd == null){
	                        		//staffStsCd가 null이면 부서라고 판단
	        						fn_alertMessage("",bxMsg("cbb_items.SCRNITM#selectStaff"));
	                        	}else{
		                            that.getStaffInfoCAPAT101Base(itemData.rltdId);	                        		
	                        	}
	                         }
	                     }
	                 });


	                // DOM Element Cache
	                that.$unitTreeRoot = that.$el.find('.bx-tree-root');
	                that.$unitTreeRoot.html(this.subViews['CAPAT101Tree'].render());
	                that.loadAllStaffList();
	            },


	            /**
	             * 그리드 생성
	             */
	            createGrid: function () {
	                var that = this;


	                that.CAPAT101GridItm = new ExtGrid({
	                    // 그리드 컬럼 정의
	                    fields: ['deptNm', 'staffNm', 'staffId']
	                    , id: 'CAPAT101Grid'
	                    , columns: [
	                        {
	                            text: bxMsg('cbb_items.SCRNITM#deptNm'),
	                            flex: 1,
	                            dataIndex: 'deptNm',
	                            style: 'text-align:center',
	                            height : 25, 
	                            align: 'center'
	                        },
	                        {
	                            text: bxMsg('cbb_items.SCRNITM#staffNm'),
	                            flex: 1,
	                            dataIndex: 'staffNm',
	                            style: 'text-align:center',
	                            align: 'center'
	                        },
	                        {
	                             text: bxMsg('cbb_items.SCRNITM#staffId')
	                             , width : 0
	                             , dataIndex: 'staffId'
	                             , hidden : true
	                        },
	                    ] // end of columns
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function () {
	                                that.getStaffInfoGridCAPAT101Base();
	                            }
	                        }
	                    }
	                });


	                that.$el.find('#staff-list-grid').html(that.CAPAT101GridItm.render({'height': '660px'})); 
	                that.loadGridList();
	            },


	            /**
	             * 그리드 데이터 set
	             */
	            loadGridList: function(){
	            	var that = this;	     
	            	//트리숨기기
	                that.$el.find('.staffTreeArea').hide();
	                that.$el.find('.staffGridArea').show();
	                var sParam = {};
	                sParam.instCd = this.instCd;
	                sParam.staffNm = that.$el.find('#searchKey').val();
	                //퇴사자포함조회여부
	                if(that.$el.find('#incldRetireStaff').prop("checked") == true){
	                	sParam.includeRtrmntStaffInqryYn = "Y";
	                }else{
	                	sParam.includeRtrmntStaffInqryYn = "N";
	                }


	                var linkData = {"header": fn_getHeader("CAPSF0038402"), "CaStaffSrchSvcGetStaffListIn": sParam};


	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            if (responseData.CaStaffSrchSvcGetStaffListOut) {
	                                that.CAPAT101GridItm.setData(responseData.CaStaffSrchSvcGetStaffListOut.staffList);
	                            }
	                        }
	                    }
	                });


	            },


	            /**
	             * Tree 데이터 set(전체 스태프 목록)
	             */
	            loadAllStaffList: function(){
	            	var that = this;
	                var sParam = {};
	                sParam.instCd = this.instCd;


	                //퇴사자포함조회여부
	                if(that.$el.find('#incldRetireStaff').prop("checked") == true){
	                	sParam.includeRtrmntStaffInqryYn = "Y";
	                }else{
	                	sParam.includeRtrmntStaffInqryYn = "N";
	                }


	                var linkData = {"header": fn_getHeader("CAPSF1020402"), "CaStaffInqrySvcGetStaffTreeIn": sParam};
	                //그리드숨기기
	                that.$el.find('.staffTreeArea').show();
	                that.$el.find('.staffGridArea').hide();
	                that.treeList = [];


	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                   enableLoading: true,
	                    success: function (responseData) {
	                       if(fn_commonChekResult(responseData)) {
	                    	   that.subViews['CAPAT101Tree'].renderItem(responseData.CaStaffInqrySvcGetStaffTreeListOut.staffTree);
	                           that.treeList = responseData.CaStaffInqrySvcGetStaffTreeListOut.staffTree;
	                       }
	                    }
	                });//end of bxProxy
	            },


	            /**
	             * 그리드에서 스태프 선택
	             */
	            getStaffInfoGridCAPAT101Base: function(){
	                var that = this;
	                var selectedItem = that.CAPAT101GridItm.grid.getSelectionModel().selected.items[0];


	                if (!selectedItem) {
	                    return;
	                } else {
	                	//스태프정보조회
	                	that.getStaffInfoCAPAT101Base(selectedItem.data.staffId);
	                }
	            },            




	            /* ================================================================================================
	             * ==========================================입력항목리셋==============================================
	             * ================================================================================================
	             */


	            /**
	             * 전체 입력항목 초기화
	             */
	            resetCAPAT101Base : function() {
					var that = this;
					//신규스태프등록가능
					that.registerStaff = true;
					fn_resetCAPAT101(that);
				},


				/**
				 * 소속부서이력 초기화
				 */
				resetCAPAT101DeptHist: function(){
					var that = this;
				    that.dataGrid.setData(that.CAPAT101StaffDeptInfoList);
				    deleteDeptHistList = new Array();
				},


				/**
				 * 스태프역할이력 초기화
				 */
				resetCAPAT101RoleHist: function(){
					var that = this;
					that.roleDataGrid.setData(that.CAPAT101StaffRoleInfoList);
					deleteRoleHistList = new Array();
				},


				/**
				 * 소속부서정보 초기화
				 */
				resetCAPAT101DeptInfo: function(){
					var that = this;


					that.insertStaffDeptYn = true;
					that.$el.find('[data-form-param="startDt"]').attr('disabled', false);
					that.$el.find("#btn-dept-search").attr('disabled', false);


					that.$el.find('[data-form-param="deptNm"]').val("");
					that.$el.find('[data-form-param="startDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
					that.$el.find('[data-form-param="endDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));


				},


				/**
				 * 스태프역할정보 초기화
				 */
				resetCAPAT101RoleInfo: function(){
					var that = this;


					that.insertStaffRoleYn = true;
					that.$el.find('[data-form-param="roleStartDt"]').attr('disabled', false);
					that.$el.find("#btn-role-dept-search").attr('disabled', false);
					that.$el.find('[data-form-param="roleId"]').attr('disabled', false);


					that.$el.find('[data-form-param="roleDeptNm"]').val("");
					that.$el.find('[data-form-param="roleId"]').val("");
					that.$el.find('[data-form-param="roleStartDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
					that.$el.find('[data-form-param="roleEndDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));


				},


				/**
				 * 연락처 정보 초기화
				 */
				resetCAPAT101CntntPnt: function(){
					var that = this;
					that.$el.find('#cntct-pnt-area input[type="text"]').each(function(){
						this.value = "";
					});
					that.$el.find('#cntct-pnt-area input[type="hidden"]').each(function(){
						this.value = "";
					});
				},


	            /* ================================================================================================
	             * ==========================================입력항목검증==============================================
	             * ================================================================================================
	             */


				/**
				 * 스태프 신규, 정보변경 전 입력항목 검증
				 */
				saveCAPAT101Base : function() {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
					var that = this;
					var pwdVal = that.$el.find('[data-form-param="pswd"]').val();


					if(that.$el.find('[data-form-param="actorNm"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#staffNm") + "]");
					}
					else if(that.$el.find('[data-form-param="actorUnqIdNbr"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#IdntyNbr") + "]");
					}
					else if(that.$el.find('[data-form-param="loinIdNbr"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#loinIdNbr") + "]");
					}
					else if(that.$el.find('[data-form-param="pswd"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#pswd") + "]");
					}
					else if(that.$el.find('[data-form-param="hiredDt"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#hiredDt") + "]");
					}
					else if(pwdVal.length < 6 || pwdVal.length > 10) {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#pswd") + " Length : 6 ~ 10]");
					}
					else if(that.$el.find('[data-form-param="deptId"]').eq(0).val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.SCRNITM#dept") + "]");
					}
					else if(that.$el.find('[data-form-param="startDt"]').val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.SCRNITM#startDt") + "]");
					}
					else {
						if(that.registerStaff){
							//스태프신규등록-중복체크필수
							if(that.$el.find('[data-form-param="isValidLoinId"]').val() == "") {
								fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.SCRNITM#checkDplctn") + "]");
							}else{
								this.execSaveCAPAT101Base();								
							}
						}else{
							if(that.$el.find('[data-form-param="retireDt"]').val().replace(/\-/gi,"")
									== $.sessionStorage('txDt')){
								//퇴사일자가 오늘이면 바로 퇴사
								this.execRetireCAPAT101Base();
							}else{
								if(CAPAT101StaffInfoData.staffStsCd == '04'){
									fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
								}else{
									//스태프정보변경
									this.execChngCAPAT101Base();																	
								}
							}
						}
					}
				},


	            /* ================================================================================================
	             * ==========================================스태프신규===============================================
	             * ================================================================================================
	             */


				/**
				 * 스태프 신규 서비스 실행
				 */
				execSaveCAPAT101Base : function() {
					var that = this;
	                var sParam = {};


	                sParam.instCd = this.instCd;


	                //set name list
	                sParam.actorNmList = new Array();
					that.$el.find('[data-form-param="actorNmTpCd"]').each(function(index){
						var dtlParam = new Object();
						dtlParam.actorNmTpCd = this.value;
						dtlParam.actorNm = that.$el.find('[data-form-param="actorNm"]').eq(index).val();
						sParam.actorNmList[index] = dtlParam;
					});
	                //set base components
	                sParam.staffEmplymntTpCd = that.$el.find('[data-form-param="staffTpCd"]').val();
	                sParam.actorUnqIdNbr = that.$el.find('[data-form-param="actorUnqIdNbr"]').val();
	                sParam.actorUnqIdNbrTpCd = that.$el.find('[data-form-param="actorUnqIdNbrTpCd"]').val();
	                sParam.staffStsCd = that.$el.find('[data-form-param="staffStsCd"]').val();


	                if(that.$el.find('[data-form-param="vldtnErrOvrrdYn"]').attr('checked')) {
	                	sParam.vldtnErrOvrrdYn = "Y";
	                }
	                else {
	                	sParam.vldtnErrOvrrdYn = "N";
	                }


	                sParam.loinIdNbr = that.$el.find('[data-form-param="loinIdNbr"]').val();
	                sParam.pswd = that.$el.find('[data-form-param="pswd"]').val();
	                sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();
	                sParam.natyIsoNatCd = "KR";
	                sParam.rsdncLctnIsoNatCd = "KR";
	                sParam.lngCd ='ko';


	                //set hidden components
	                sParam.actorDtlTpCd = that.$el.find('[data-form-param="actorDtlTpCd"]').val();
	                sParam.unqIdChngRsnCd = that.$el.find('[data-form-param="unqIdChngRsnCd"]').val();
	                sParam.actorTpCd = that.$el.find('[data-form-param="actorTpCd"]').val();
	                sParam.infoRgstrnOriginTpCd = that.$el.find('[data-form-param="infoRgstrnOriginTpCd"]').val();
	                sParam.actorStsCd = that.$el.find('[data-form-param="actorStsCd"]').val();
	                sParam.actorStsChngRsnCd = that.$el.find('[data-form-param="actorStsChngRsnCd"]').val();
	                sParam.pswdChngRsnCd = that.$el.find('[data-form-param="pswdChngRsnCd"]').val();
	                
	                
	                //set address list
	            	var addrList = [];
	            	var addr = {};
	            	addr.cntctMthdTpCd = '07';
	            	addr.ctcptTpCd = '02';
	            	addr.addrHrarcyCd = "KR";
	            	addr.addrId = that.$el.find('[data-form-param="addrId"]').val();
	            	addr.zipCd = that.$el.find('[data-form-param="zipCd"]').val();
	            	addr.bsicAddrCntnt = that.$el.find('[data-form-param="addrCntnt"]').val();
	            	addr.dtlAddrCntnt = that.$el.find('[data-form-param="dtlAddrCntnt"]').val();
	            	addr.rprsntvCtcptYn = "Y";
	            	addr.authYn = "Y";
	            	addr.cntctPrhbtnTpCd = "01";
	            	addrList.push(addr);

	        		sParam.addrList = addrList;
	        		
	        		//set telephone number list
	            	var telNbrList = [];
	            	
	            	//휴대전화
	            	var telNbr = {};
	            	telNbr.cntctMthdTpCd = '01';
	            	telNbr.ctcptTpCd = '01';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="mobilePhone"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="mobilePhone"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="mobilePhone"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="mobilePhone"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	           		//직장전화
	            	telNbr = {};
	            	telNbr.cntctMthdTpCd = '02';
	            	telNbr.ctcptTpCd = '02';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="officePhone"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="officePhone"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="officePhone"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="officePhone"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	           		//팩스번호
	            	telNbr = {};
	            	telNbr.cntctMthdTpCd = '05';
	            	telNbr.ctcptTpCd = '02';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="faxNbr"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="faxNbr"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="faxNbr"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="faxNbr"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	        		sParam.telNbrList = telNbrList;
	        		
	        		//set electronic address list
	            	var elctrncAddrList = [];
	            	
	            	var elctrncAddr = {};
	            	elctrncAddr.cntctMthdTpCd = '03';
	            	elctrncAddr.ctcptTpCd = '01';
	            	elctrncAddr.elctrncAddr = that.$el.find('[data-form-param="email"]').val();
	            	elctrncAddr.rprsntvCtcptYn = "Y";
	            	elctrncAddr.authYn = "Y";
	            	elctrncAddr.cntctPrhbtnTpCd = "01";
	            	elctrncAddrList.push(elctrncAddr);

	        		sParam.elctrncAddrList = elctrncAddrList;

					// set extend attribute list
	                var actorXtnInflList = new Array();
	                var xtnParam = new Object();
	                xtnParam.xtnAtrbtNm = 'frstRgstrnDt';
	                xtnParam.xtnAtrbtCntnt = that.$el.find('[data-form-param="hiredDt"]').val().replace(/\-/gi, '');
	                xtnParam.actorDscd = 'S';
	                actorXtnInflList.push(xtnParam);


	                var xtnParam = new Object();
	                xtnParam.xtnAtrbtNm = 'retireDt';
	                if(that.$el.find('[data-form-param="retireDt"]').val() == "" || that.$el.find('[data-form-param="retireDt"]').val() == null){
	                	xtnParam.xtnAtrbtCntnt = "99991231";
	                }else{
		                xtnParam.xtnAtrbtCntnt = that.$el.find('[data-form-param="retireDt"]').val().replace(/\-/gi, '');	                	
	                }
	                xtnParam.actorDscd = 'S';
	                actorXtnInflList.push(xtnParam);


	                var xtnParam = new Object();
	                xtnParam.xtnAtrbtNm = 'userGrpCd';
	                xtnParam.xtnAtrbtCntnt = that.$el.find('[data-form-param="userGrpCd"]').val();
	                xtnParam.actorDscd = 'S';
	                actorXtnInflList.push(xtnParam);


	                sParam.actorXtnInflList = actorXtnInflList;


	                var linkData = {"header" : fn_getHeader("CAPSF0010001") , "CaStaffRegtIndvSvcIn" : sParam};
	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
	                			//신규스태프등록가능
	                			that.registerStaff = true;
	                			//입력항목초기화
	                			fn_resetCAPAT101(that);
	                			//트리정보 다시 set
	                			that.loadTreeOrList();
	                		}
	                	}
	                });
				},




				/**
				 * 로그인 아이디 중복체크
				 */
				validateLoinIdNbrCAPAT101Base : function() {
					var that = this;


					if(that.$el.find('[data-form-param="loinIdNbr"]').val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#loinIdNbr") + "]");
					}
					else {
		            	var header =  new Object();
		        		header = fn_getHeader("CAPSF0010401");
		        		var sParam = {};
		        		sParam.instCd = this.instCd;
		                sParam.loinIdNbr = that.$el.find('[data-form-param="loinIdNbr"]').val();
		                var linkData = {"header" : header , "CaStaffRgstSvcGetLoinIdNbrIO" : sParam};
		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
		                			if(responseData != null && responseData.CaStaffRgstSvcGetLoinIdNbrIO.loinIdNbr != null && responseData.CaStaffRgstSvcGetLoinIdNbrIO.loinIdNbr != "" ) {
		                				fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0007") + "[" + bxMsg("cbb_items.AT#loinIdNbr") + "]");
		                				that.$el.find('[data-form-param="loinIdNbr"]').val("");
		                			}
		                			else {
		                				fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0008") + "[" + bxMsg("cbb_items.AT#loinIdNbr") + "]");
		                				that.$el.find('[data-form-param="isValidLoinId"]').val("true");
		                			}
		                		}
		                	}
		                });
					}
				},


				/**
				 * 로그인아이디 변경 시 중복체크 요구
				 */
				changeLoginIdNbrCAPAT101Base :function() {
					var that = this;
					that.$el.find('[data-form-param="isValidLoinId"]').val("");
				},




	            /* ================================================================================================
	             * ==========================================스태프변경===============================================
	             * ================================================================================================
	             */


				/**
				 * 스태프 정보 변경
				 */
				execChngCAPAT101Base: function(){
					var that = this;

					var header = new Object();
					header = fn_getHeader("CAPSF0100501");
					var sParam = {};
					sParam.instCd = this.instCd;
					sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();

					// set extend attribute list
	                var actorXtnInflList = new Array();
	                var xtnParam = new Object();
	                xtnParam.xtnAtrbtNm = 'frstRgstrnDt';
	                xtnParam.xtnAtrbtCntnt = that.$el.find('[data-form-param="hiredDt"]').val().replace(/\-/gi, '');
	                xtnParam.actorDscd = 'S';
	                actorXtnInflList.push(xtnParam);


	                var xtnParam = new Object();
	                xtnParam.xtnAtrbtNm = 'retireDt';
	                if(that.$el.find('[data-form-param="retireDt"]').val() == "" || that.$el.find('[data-form-param="retireDt"]').val() == null){
	                	xtnParam.xtnAtrbtCntnt = "99991231";
	                }else{
		                xtnParam.xtnAtrbtCntnt = that.$el.find('[data-form-param="retireDt"]').val().replace(/\-/gi, '');	                	
	                }
	                xtnParam.actorDscd = 'S';
	                actorXtnInflList.push(xtnParam);


	                var xtnParam = new Object();
	                xtnParam.xtnAtrbtNm = 'userGrpCd';
	                xtnParam.xtnAtrbtCntnt = that.$el.find('[data-form-param="userGrpCd"]').val();
	                xtnParam.actorDscd = 'S';
	                actorXtnInflList.push(xtnParam);


	                sParam.actorXtnInflList = actorXtnInflList;
	                
	                //set address list
	            	var addrList = [];
	            	var addr = {};
	            	addr.actorCtcptId = that.$el.find('[data-form-param="addrCtcptId"]').val();
	            	addr.cntctMthdTpCd = '07';
	            	addr.ctcptTpCd = '02';
	            	addr.addrHrarcyCd = "KR";
	            	addr.addrId = that.$el.find('[data-form-param="addrId"]').val();
	            	addr.zipCd = that.$el.find('[data-form-param="zipCd"]').val();
	            	addr.bsicAddrCntnt = that.$el.find('[data-form-param="addrCntnt"]').val();
	            	addr.dtlAddrCntnt = that.$el.find('[data-form-param="dtlAddrCntnt"]').val();
	            	addr.rprsntvCtcptYn = "Y";
	            	addr.authYn = "Y";
	            	addr.cntctPrhbtnTpCd = "01";
	            	addrList.push(addr);

	        		sParam.addrList = addrList;
	        		
	        		//set telephone number list
	            	var telNbrList = [];
	            	
	            	//휴대전화
	            	var telNbr = {};
	            	telNbr.actorCtcptId = that.$el.find('[data-form-param="mobilePhoneCtcptId"]').val();
	            	telNbr.cntctMthdTpCd = '01';
	            	telNbr.ctcptTpCd = '01';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="mobilePhone"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="mobilePhone"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="mobilePhone"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="mobilePhone"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	           		//직장전화
	            	telNbr = {};
	            	telNbr.actorCtcptId = that.$el.find('[data-form-param="officePhoneCtcptId"]').val();
	            	telNbr.cntctMthdTpCd = '02';
	            	telNbr.ctcptTpCd = '02';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="officePhone"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="officePhone"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="officePhone"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="officePhone"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	           		//팩스번호
	            	telNbr = {};
	            	telNbr.actorCtcptId = that.$el.find('[data-form-param="faxNbrCtcptId"]').val();
	            	telNbr.cntctMthdTpCd = '05';
	            	telNbr.ctcptTpCd = '02';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="faxNbr"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="faxNbr"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="faxNbr"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="faxNbr"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	        		sParam.telNbrList = telNbrList;
	        		
	        		//set electronic address list
	            	var elctrncAddrList = [];
	            	
	            	var elctrncAddr = {};
	            	elctrncAddr.actorCtcptId = that.$el.find('[data-form-param="emailCtcptId"]').val();
	            	elctrncAddr.cntctMthdTpCd = '03';
	            	elctrncAddr.ctcptTpCd = '01';
	            	elctrncAddr.elctrncAddr = that.$el.find('[data-form-param="email"]').val();
	            	elctrncAddr.rprsntvCtcptYn = "Y";
	            	elctrncAddr.authYn = "Y";
	            	elctrncAddr.cntctPrhbtnTpCd = "01";
	            	elctrncAddrList.push(elctrncAddr);

	        		sParam.elctrncAddrList = elctrncAddrList;

	                //Staff Bsic(emplymntTpCd)
	                sParam.staffEmplymntTpCd = that.$el.find('[data-form-param="staffTpCd"]').val();


	                //Staff role
					for(var i = 0 ; i < that.CAPAT101StaffDeptInfoList.length ; i++){
						//해당 스태프가 소속된 부서식별자와 입력된 부서 식별자가 다르면 변경실행
						if(that.CAPAT101StaffDeptInfoList[i].roleId == 'DfltRole' &&
								that.CAPAT101StaffDeptInfoList[i].efctvStartDt <= $.sessionStorage('txDt') &&
								that.CAPAT101StaffDeptInfoList[i].efctvEndDt >= $.sessionStorage('txDt') &&
								that.CAPAT101StaffDeptInfoList[i].deptId != that.$el.find('[data-form-param="deptId"]').val()){
							sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();
							sParam.efctvStartDt = that.$el.find('[data-form-param="startDt"]').val().replace(/\-/gi, '');
							sParam.efctvEndDt = that.$el.find('[data-form-param="endDt"]').val().replace(/\-/gi, '');
							break;
						}
					}


	                //Staff Status - 현재 스태프상태와 다를 때만 정보변경
					if(CAPAT101StaffInfoData.staffStsCd != that.$el.find('[data-form-param="staffStsCd"]').val()){
		                sParam.staffStsCd = that.$el.find('[data-form-param="staffStsCd"]').val();
		                var staffStsChngRsnCd = null;
		                if(that.$el.find('[data-form-param="staffStsCd"]').val() == '03'){
		                	staffStsChngRsnCd = '03'; //휴직
		                }else if(that.$el.find('[data-form-param="staffStsCd"]').val() == '04'){
		                	staffStsChngRsnCd = '02'; //퇴사
		                }
		                sParam.staffStsChngRsnCd = staffStsChngRsnCd;
					}


	                /*
	                 * Actor unique id number
	                 */
	                var newUnqIdTpCd = true; //새로운 신분증번호유형인지 여부
	                for(var i = 0 ; i< CAPAT101StaffInfoData.actorUnqIdNbrList.length ; i++){
	                	var item = CAPAT101StaffInfoData.actorUnqIdNbrList[i]
	                	// 현재 item의 신분증유형코드와 화면에서 선택한 신분증유형코드가 같으면
	                	if(item.actorUnqIdNbrTpCd == that.$el.find('[data-form-param="actorUnqIdNbrTpCd"]').val()){
	                		newUnqIdTpCd = false;//기등록된 신분증번호유형
	                		//신분증번호가 바뀌었을 때만 변경 태움
	                		if(item.actorUnqIdNbr != that.$el.find('[data-form-param="actorUnqIdNbr"]').val()){
		    	                sParam.actorUnqIdNbr = that.$el.find('[data-form-param="actorUnqIdNbr"]').val();
		    	                sParam.actorUnqIdNbrTpCd = that.$el.find('[data-form-param="actorUnqIdNbrTpCd"]').val();
		    	                if(that.$el.find('[data-form-param="vldtnErrOvrrdYn"]').attr('checked')) {
		    	                	sParam.vldtnErrOvrrdYn = "Y";
		    	                }
		    	                else {
		    	                	sParam.vldtnErrOvrrdYn = "N";
		    	                }
	                		}
	                	}
	                }
	                if(newUnqIdTpCd == true){
	                	//새로운 신분증유형이므로 update해줘야 함
    	                sParam.actorUnqIdNbr = that.$el.find('[data-form-param="actorUnqIdNbr"]').val();
    	                sParam.actorUnqIdNbrTpCd = that.$el.find('[data-form-param="actorUnqIdNbrTpCd"]').val();
    	                if(that.$el.find('[data-form-param="vldtnErrOvrrdYn"]').attr('checked')) {
    	                	sParam.vldtnErrOvrrdYn = "Y";
    	                }
    	                else {
    	                	sParam.vldtnErrOvrrdYn = "N";
    	                }
	                }


	                if(that.$el.find('[data-form-param="staffStsCd"]').val() == '04'){
		                fn_confirmMessage(event, '', bxMsg('cbb_err_msg.AUIATE0027'), function(){  


							var linkData = {
								"header" : header,
								"CaStaffChngSvcIndvIn" : sParam
							};
							// ajax 호출
							bxProxy.post(sUrl, JSON.stringify(linkData), {
								enableLoading : true,
								success : function(responseData) {
									if (fn_commonChekResult(responseData)) {

										if(that.$el.find('[data-form-param="pswd"]').attr('type') == 'text'){
											//비밀번호 변경
											that.changeStaffPswd();
										}
										
										fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
										that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());
			                			//트리정보 다시 set
			                			that.loadTreeOrList();
									}
								}
							});	
		                });	
	                }else{
						var linkData = {
								"header" : header,
								"CaStaffChngSvcIndvIn" : sParam
							};
							// ajax 호출
							bxProxy.post(sUrl, JSON.stringify(linkData), {
								enableLoading : true,
								success : function(responseData) {
									if (fn_commonChekResult(responseData)) {
										if(that.$el.find('[data-form-param="pswd"]').attr('type') == 'text'){
											//비밀번호 변경
											that.changeStaffPswd();
										}
										
										fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
										that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());
			                			//트리정보 다시 set
			                			that.loadTreeOrList();
									}
								}
							});	
	                }				
				},


				/**
				 * 스태프 소속부서만 변경
				 */
				saveBelongedDeptInfo: function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
					var that = this;


					if(CAPAT101StaffInfoData.staffStsCd == '04'){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
					}						
					else if(that.$el.find('[data-form-param="deptId"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004")+"["+bxMsg("cbb_items.SCRNITM#dept")+"]");
					}
					else if(that.$el.find('[data-form-param="startDt"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004")+"["+bxMsg("cbb_items.SCRNITM#startDt")+"]");
					}
					else if(that.$el.find('[data-form-param="endDt"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004")+"["+bxMsg("cbb_items.SCRNITM#endDt")+"]");
					}
					//종료일은 시작일 이후여야 함
					else if(that.$el.find('[data-form-param="endDt"]').val().replace(/\-/gi, '') < 
							that.$el.find('[data-form-param="startDt"]').val().replace(/\-/gi, '')){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.SCRNITM#endDt") + " >= " + bxMsg("cbb_items.SCRNITM#startDt") + "]");
					}
					else{


						if(that.insertStaffDeptYn){
							//시작일은 오늘 이후여야 함
							if(that.$el.find('[data-form-param="startDt"]').val().replace(/\-/gi, '') < $.sessionStorage('txDt')){
								fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.AT#opnDt") + " >= " + bxMsg("cbb_items.SCRNITM#today") + "]");
							}else{
								that.insertStaffDept();


							}
						}else{
							that.updateStaffDept();
						}
					}
				},


				/**
				 * 스태프 소속부서이력 삭제
				 */
				deleteDeptHistory: function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

					if(deleteDeptHistList.length == 0){
						return;
					}

					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF1010508");


					var deptHistList = new Array();
					for(var i = 0 ; i < deleteDeptHistList.length ; i++){
						var deptHist = {};

						deptHist.instCd = this.instCd;
						deptHist.staffId = that.$el.find('[data-form-param="staffId"]').val();
						deptHist.deptId = deleteDeptHistList[i].deptId;
						deptHist.roleId = deleteDeptHistList[i].roleId;
						deptHist.efctvStartDt = deleteDeptHistList[i].efctvStartDt;
						deptHist.dtsfRelSeqNbr = deleteDeptHistList[i].dtsfRelSeqNbr;

						deptHistList.push(deptHist);
					}

					var sParam = {};
					sParam.deptHistList = deptHistList;

					fn_confirmMessage(event, '', bxMsg('cbb_items.SCRNITM#data-delete-msg'), function(){
						var linkData = {"header" : header, "CaStaffRoleMgmtSvcDeleteHistListIn" : sParam};
						bxProxy.post(sUrl, JSON.stringify(linkData), {
							enableLoading : true,
							success : function(responseData) {
								if (fn_commonChekResult(responseData)) {
									fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
									that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());


		                			//트리정보 다시 set
		                			that.loadTreeOrList();
								}
							}
						});	
					});					
				},


				/**
				 * 스태프 부서이력 insert
				 */
				insertStaffDept: function(){
					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF1010506");
					var sParam = {};
					sParam.instCd = this.instCd;
					sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();
					sParam.roleId = "DfltRole";
					sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();
					sParam.efctvStartDt = that.$el.find('[data-form-param="startDt"]').val().replace(/\-/gi, '');
					sParam.efctvEndDt = that.$el.find('[data-form-param="endDt"]').val().replace(/\-/gi, '');


					var linkData = {"header" : header, "CaStaffRoleMgmtSvcStaffRoleIn" : sParam};
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading : true,
						success : function(responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
								that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());


	                			//트리정보 다시 set
	                			that.loadTreeOrList();
							}
						}
					});	


				},


				/**
				 * 스태프 부서이력 update
				 */
				updateStaffDept: function(){
					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF1010507");
					var sParam = {};
					sParam.instCd = this.instCd;
					sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();
					sParam.roleId = "DfltRole";					
					sParam.deptId = that.$el.find('[data-form-param="deptId"]').val();
					sParam.efctvStartDt = that.$el.find('[data-form-param="startDt"]').val().replace(/\-/gi, '');
					sParam.efctvEndDt = that.$el.find('[data-form-param="endDt"]').val().replace(/\-/gi, '');
					sParam.dtsfRelSeqNbr = that.$el.find('[data-form-param="belongDtsfRelSeqNbr"]').val();


					var linkData = {"header" : header, "CaStaffRoleMgmtSvcStaffRoleIn" : sParam};
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading : true,
						success : function(responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
								that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());


	                			//트리정보 다시 set
	                			that.loadTreeOrList();
							}
						}
					});	
				},


				/**
				 * 스태프 역할정보 변경
				 */
				saveStaffRoleInfo: function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
					var that = this;


					if(CAPAT101StaffInfoData.staffStsCd == '04'){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
					}						
					//종료일은 시작일 이후여야 함
					else if(that.$el.find('[data-form-param="roleEndDt"]').val().replace(/\-/gi, '') < 
							that.$el.find('[data-form-param="roleStartDt"]').val().replace(/\-/gi, '')){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.SCRNITM#endDt") + " >= " + bxMsg("cbb_items.SCRNITM#startDt") + "]");
					}
					else if(that.$el.find('[data-form-param="roleDeptId"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004")+"["+bxMsg("cbb_items.SCRNITM#dept")+"]");
					}
					else if(that.$el.find('[data-form-param="roleStartDt"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004")+"["+bxMsg("cbb_items.SCRNITM#startDt")+"]");
					}
					else if(that.$el.find('[data-form-param="roleEndDt"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004")+"["+bxMsg("cbb_items.SCRNITM#endDt")+"]");
					}
					//역할식별자는 필수입력
					else if(that.$el.find('[data-form-param="roleId"]').val() == null){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#roleId") + "]");
					}
					else{

						if(that.insertStaffRoleYn){
							//시작일은 오늘 이후여야 함
							if(that.$el.find('[data-form-param="roleStartDt"]').val().replace(/\-/gi, '') < $.sessionStorage('txDt')){
								fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0005") + "[" + bxMsg("cbb_items.AT#opnDt") + " >= " + bxMsg("cbb_items.SCRNITM#today") + "]");
							}else{
								//기등록된 역할 중 부서식별자, 역할식별자, 시작일자가 동일한 게 있으면 에러처리
								var dplctnRole = that.checkRgstrnStaffRole();
								//기등록된 역할이 없으면 스태프역할 등록
								if(!dplctnRole){
									that.insertStaffRole();
								}
							}
						}else{
							//스태프역할 변경
							that.updateStaffRole();
						}
					}
				},
				
				/**
				 * 기등록된 스태프역할인지 검증
				 */
				checkRgstrnStaffRole: function(){
					var that = this;
					
					var dplctnRole = false;
					$(that.CAPAT101StaffRoleInfoList).each(function(idx, item){
						if(item.deptId == that.$el.find('[data-form-param="roleDeptId"]').val()
								&& item.roleId == that.$el.find('[data-form-param="roleId"]').val()
								&& item.efctvStartDt == that.$el.find('[data-form-param="roleStartDt"]').val().replace(/\-/gi, '')){
							dplctnRole = true;
							fn_alertMessage("",bxMsg("cbb_err_msg.AUIATE0034"));
						}
					});
							
					return dplctnRole;
				},


				/**
				 * 스태프 역할이력 삭제
				 */
				deleteRoleHistory: function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

					if(deleteRoleHistList.length == 0){
						return;
					}

					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF1010503");


					var deptHistList = new Array();
					for(var i = 0 ; i < deleteRoleHistList.length ; i++){
						var deptHist = {};


						deptHist.instCd = this.instCd;
						deptHist.staffId = that.$el.find('[data-form-param="staffId"]').val();
						deptHist.deptId = deleteRoleHistList[i].deptId;
						deptHist.roleId = deleteRoleHistList[i].roleId;
						deptHist.efctvStartDt = deleteRoleHistList[i].efctvStartDt;
						deptHist.dtsfRelSeqNbr = deleteRoleHistList[i].dtsfRelSeqNbr;
						deptHist.staffRoleSeqNbr = deleteRoleHistList[i].staffRoleSeqNbr;

						deptHistList.push(deptHist);
					}


					var sParam = {};
					sParam.deptHistList = deptHistList;


					fn_confirmMessage(event, '', bxMsg('cbb_items.SCRNITM#data-delete-msg'), function(){
						var linkData = {"header" : header, "CaStaffRoleMgmtSvcDeleteHistListIn" : sParam};
						bxProxy.post(sUrl, JSON.stringify(linkData), {
							enableLoading : true,
							success : function(responseData) {
								if (fn_commonChekResult(responseData)) {
									fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
									that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());


		                			//트리정보 다시 set
		                			that.loadTreeOrList();
								}
							}
						});	
					});					
				},


				/**
				 * 스태프 역할정보 insert
				 */
				insertStaffRole: function(){
					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF1010504");
					var sParam = {};
					sParam.instCd = this.instCd;
					sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();
					sParam.roleId = that.$el.find('[data-form-param="roleId"]').val();
					sParam.deptId = that.$el.find('[data-form-param="roleDeptId"]').val();
					sParam.efctvStartDt = that.$el.find('[data-form-param="roleStartDt"]').val().replace(/\-/gi, '');
					sParam.efctvEndDt = that.$el.find('[data-form-param="roleEndDt"]').val().replace(/\-/gi, '');


					var linkData = {"header" : header, "CaStaffRoleMgmtSvcStaffRoleIn" : sParam};
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading : true,
						success : function(responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
								that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());


	                			//트리정보 다시 set
	                			that.loadTreeOrList();
							}
						}
					});	


				},


				/**
				 * 스태프 역할정보 update
				 */
				updateStaffRole: function(){
					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF1010505");
					var sParam = {};
					sParam.instCd = this.instCd;
					sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();
					sParam.roleId = that.$el.find('[data-form-param="roleId"]').val();					
					sParam.deptId = that.$el.find('[data-form-param="roleDeptId"]').val();
					sParam.efctvStartDt = that.$el.find('[data-form-param="roleStartDt"]').val().replace(/\-/gi, '');
					sParam.efctvEndDt = that.$el.find('[data-form-param="roleEndDt"]').val().replace(/\-/gi, '');
					sParam.dtsfRelSeqNbr = that.$el.find('[data-form-param="dtsfRelSeqNbr"]').val();
					sParam.staffRoleSeqNbr = that.$el.find('[data-form-param="staffRoleSeqNbr"]').val();

					var linkData = {"header" : header, "CaStaffRoleMgmtSvcStaffRoleIn" : sParam};
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading : true,
						success : function(responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
								that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());


	                			//트리정보 다시 set
	                			that.loadTreeOrList();
							}
						}
					});	
				},


				/**
				 * 스태프 연락처정보 변경 전 입력항목 검증
				 */
				saveCntctPnt: function(){
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
					var that = this;
					if(that.$el.find('[data-form-param="mobilePhone"]').val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#mobilePhone") + "]");
					}
					else if(that.$el.find('[data-form-param="officePhone"]').val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#ofcTelNbr") + "]");
					}
					else if(!fn_isEmailValueCAPAT101(that.$el.find('[data-form-param="email"]').val())) {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.ABRVTN#email") + " " + bxMsg("cbb_items.ABRVTN#format") + "]");
					}
					else if(that.$el.find('[data-form-param="addrCntnt"]').val() == "" && that.$el.find('[data-form-param="dtlAddrCntnt"]').val() == "") {
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#officeAddr") + "]");
					}else if(CAPAT101StaffInfoData.staffStsCd == '04'){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
					}else if(that.$el.find('[data-form-param="email"]').val() == ""){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.ABRVTN#email") + "]");
					}
					else{
						that.execSaveCntctPnt()
					}
				},


				/**
				 * 스태프 연락처정보만 변경
				 */
				execSaveCntctPnt: function(){
					var that = this;


					var header = new Object();
					header = fn_getHeader("CAPSF0100501");
					var sParam = {};
					sParam.instCd = this.instCd;
					sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();

	                //set address list
	            	var addrList = [];
	            	var addr = {};
	            	addr.actorCtcptId = that.$el.find('[data-form-param="addrCtcptId"]').val();
	            	addr.cntctMthdTpCd = '07';
	            	addr.ctcptTpCd = '02';
	            	addr.addrHrarcyCd = "KR";
	            	addr.addrId = that.$el.find('[data-form-param="addrId"]').val();
	            	addr.zipCd = that.$el.find('[data-form-param="zipCd"]').val();
	            	addr.bsicAddrCntnt = that.$el.find('[data-form-param="addrCntnt"]').val();
	            	addr.dtlAddrCntnt = that.$el.find('[data-form-param="dtlAddrCntnt"]').val();
	            	addr.rprsntvCtcptYn = "Y";
	            	addr.authYn = "Y";
	            	addr.cntctPrhbtnTpCd = "01";
	            	addrList.push(addr);

	        		sParam.addrList = addrList;
	        		
	        		//set telephone number list
	            	var telNbrList = [];
	            	
	            	//휴대전화
	            	var telNbr = {};
	            	telNbr.actorCtcptId = that.$el.find('[data-form-param="mobilePhoneCtcptId"]').val();
	            	telNbr.cntctMthdTpCd = '01';
	            	telNbr.ctcptTpCd = '01';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="mobilePhone"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="mobilePhone"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="mobilePhone"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="mobilePhone"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	           		//직장전화
	            	telNbr = {};
	            	telNbr.actorCtcptId = that.$el.find('[data-form-param="officePhoneCtcptId"]').val();
	            	telNbr.cntctMthdTpCd = '02';
	            	telNbr.ctcptTpCd = '02';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="officePhone"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="officePhone"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="officePhone"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="officePhone"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	           		//팩스번호
	            	telNbr = {};
	            	telNbr.actorCtcptId = that.$el.find('[data-form-param="faxNbrCtcptId"]').val();
	            	telNbr.cntctMthdTpCd = '05';
	            	telNbr.ctcptTpCd = '02';
	            	telNbr.idTelNbr = that.$el.find('[data-form-param="faxNbr"]').val().substring(0,3);
	            	telNbr.telExNbr = that.$el.find('[data-form-param="faxNbr"]').val().substring(3,7);
	            	telNbr.serialTelNbr =that.$el.find('[data-form-param="faxNbr"]').val().substring(7,11);
	            	telNbr.rprsntvCtcptYn = "Y";
	            	telNbr.authYn = "Y";
	            	telNbr.cntctPrhbtnTpCd = "01";
	            	if(that.$el.find('[data-form-param="faxNbr"]').val()){
	                	telNbrList.push(telNbr);    		
	            	}

	        		sParam.telNbrList = telNbrList;
	        		
	        		//set electronic address list
	            	var elctrncAddrList = [];
	            	
	            	var elctrncAddr = {};
	            	elctrncAddr.actorCtcptId = that.$el.find('[data-form-param="emailCtcptId"]').val();
	            	elctrncAddr.cntctMthdTpCd = '03';
	            	elctrncAddr.ctcptTpCd = '01';
	            	elctrncAddr.elctrncAddr = that.$el.find('[data-form-param="email"]').val();
	            	elctrncAddr.rprsntvCtcptYn = "Y";
	            	elctrncAddr.authYn = "Y";
	            	elctrncAddr.cntctPrhbtnTpCd = "01";
	            	elctrncAddrList.push(elctrncAddr);

	        		sParam.elctrncAddrList = elctrncAddrList;

					var linkData = {
							"header" : header,
							"CaStaffChngSvcIndvIn" : sParam
						};
						// ajax 호출
						bxProxy.post(sUrl, JSON.stringify(linkData), {
							enableLoading : true,
							success : function(responseData) {
								if (fn_commonChekResult(responseData)) {
									fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
									that.getStaffInfoCAPAT101Base(that.$el.find('[data-form-param="staffId"]').val());
								}
							}
						});	
				},


				/**
				 * 스태프 비밀번호 변경
				 */
				changeStaffPswd: function(){
					var that = this;


					if(CAPAT101StaffInfoData.staffStsCd == '04'){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
					}else{


		                  var sParam = {};
		                  sParam.instCd = this.instCd;
		                  sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();
		                  sParam.pswdChngPrcsDscd = '02';//분실변경
		                  sParam.afChngPswd = that.$el.find('[data-form-param="pswd"]').val();
		                  sParam.chngAfCnfrmtnPswd = that.$el.find('[data-form-param="pswd"]').val();


		                  var header =  new Object();
		                  header = fn_getHeader("CAPSF0110501");
		                  var linkData = {"header": header, "CaStaffPswdChngSvcIn": sParam};
		                  bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	  enableLoading: true,
		                	  success: function(responseData) {
		                		  if(fn_commonChekResult(responseData)) {
		                			  //fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
		                		  }
		                	  }
		                  });


					}
				},


				/**
				 * 스태프 퇴사
				 */
				execRetireCAPAT101Base: function(){
					var that = this;


					if(CAPAT101StaffInfoData.staffStsCd == '04'){
						fn_alertMessage("",bxMsg("cbb_err_msg.AUICUE0012"));
					}else{


						var that = this;
						var sParam = {};
						sParam.instCd = this.instCd;
						sParam.staffId = that.$el.find('[data-form-param="staffId"]').val();
						sParam.staffStsCd = '04'; //퇴사
						sParam.staffStsChngRsnCd = '03'; //퇴사


						fn_confirmMessage(event, '', bxMsg('cbb_err_msg.AUIATE0027'), function(){						
							var header = fn_getHeader("CAPSF0100502");
							var linkData = {"header": header, "":sParam};
			                bxProxy.post(sUrl, JSON.stringify(linkData),{
			                	enableLoading: true,
			                	success: function(responseData) {
			                		if(fn_commonChekResult(responseData)) {
										fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));


			                			//입력항목초기화
			                			fn_resetCAPAT101(that);									
			                		}
			                	}
			                });


						})


					}
				},


				/**
				 * 신분증번호유형코드 변경 시 신분증번호 입력항목 초기화
				 */
				changeUnqIdNbrTp : function(){
					var that = this;
					that.$el.find('[data-form-param="actorUnqIdNbr"]').val("");
				},


				/**
				 * 비밀번호 리셋
				 */
				resetPswdCAPAT101Base: function(){
					var that = this;


					that.$el.find('.CAPAT101-resetPswd-btn').attr('disabled', false);
					that.$el.find('[data-form-param="pswd"]').attr('type', 'text');
					that.$el.find('[data-form-param="pswd"]').attr('disabled', false);
					that.$el.find('[data-form-param="pswd"]').val('');
				},


	            /* ================================================================================================
	             * ==========================================스태프조회===============================================
	             * ================================================================================================
	             */


				/**
				 * 스태프정보조회
				 */
				getStaffInfoCAPAT101Base : function(staffId) {
					if (staffId == "") {
						alertMessage.error(bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#staffId") + "]");
					} else {


						var that = this;
						var header = new Object();
						header = fn_getHeader("CAPSF0100401");


						var sParam = {};
						sParam.staffId = staffId;
						sParam.instCd = this.instCd;


						var linkData = {
							"header" : header,
							"CaStaffChngSvcGetIndvInfoIn" : sParam
						};
						bxProxy.post(sUrl, JSON.stringify(linkData), {
							enableLoading : true,
							success : function(responseData) {
								if (fn_commonChekResult(responseData)) {
									CAPAT101StaffInfoData = responseData.CaStaffChngSvcGetIndvInfoOut;
									that.setStaffInfo(that);

									//스태프역할정보 set
									that.CAPAT101StaffDeptInfoList = responseData.CaStaffChngSvcGetIndvInfoOut.staffDfltRoleList;
									that.CAPAT101StaffRoleInfoList = responseData.CaStaffChngSvcGetIndvInfoOut.staffRoleList;
							    	that.dataGrid.setData(that.CAPAT101StaffDeptInfoList);
							    	that.roleDataGrid.setData(that.CAPAT101StaffRoleInfoList);
							    	that.insertStaffRoleYn = true;
							    	that.setStaffDeptInfo(that.CAPAT101StaffDeptInfoList);

							    	//이력삭제그리드 초기화
							    	deleteDeptHistList = new Array();
							    	deleteRoleHistList = new Array();
							    	
							    	//스태프역할정보영역 초기화
							    	that.resetCAPAT101RoleInfo();
								}
							}
						});
					}
				},


				/**
				 * 스태프 정보 입력
				 */
				setStaffInfo : function(that) {

					//변경저장버튼 활성화
					that.$el.find('#btn-dept-hist-save').attr('disabled', false);
					that.$el.find('#btn-belonged-dept-info-save').attr('disabled', false);
					that.$el.find('#btn-role-hist-save').attr('disabled', false);
					that.$el.find('#btn-role-info-save').attr('disabled', false);
					that.$el.find('#btn-contact-point-save').attr('disabled', false);


					//스태프역할정보 입력항목 초기화
					that.resetCAPAT101RoleInfo();


					that.$el.find('[data-form-param="editDtlCntctPntCntnt"]').val("");
					that.$el.find('[data-form-param="cntctPntSupplInfoCntnt"]').val("");
					that.$el.find('[data-form-param="addrCntnt"]').val("");
					that.$el.find('[data-form-param="dtlCntctPntCntnt"]').val("");
					that.$el.find('[data-form-param="addrId"]').val("");
					that.$el.find('[data-form-param="zipCd"]').val("");
					that.$el.find('[data-form-param="cntctPntSeqNbr"]').val("");


					if (CAPAT101StaffInfoData != null && CAPAT101StaffInfoData != undefined) {
						that.$el.find('[data-form-param="instCd"]').val(CAPAT101StaffInfoData.instCd);
						that.$el.find('[data-form-param="staffId"]').val(CAPAT101StaffInfoData.staffId);
						that.$el.find('[data-form-param="actorNm"]').val(CAPAT101StaffInfoData.actorNm);
						that.$el.find('[data-form-param="loinIdNbr"]').val(CAPAT101StaffInfoData.loinIdNbr);
						that.$el.find('[data-form-param="deptId"]').val(CAPAT101StaffInfoData.deptId);				
						that.$el.find('[data-form-param="deptNm"]').val(CAPAT101StaffInfoData.deptNm);
		                that.$el.find('[data-form-param="staffTpCd"]').val(CAPAT101StaffInfoData.staffEmplymntTpCd);
		                that.$el.find('[data-form-param="staffStsCd"]').val(CAPAT101StaffInfoData.staffStsCd);


		                //고유식별번호 set
		                $(CAPAT101StaffInfoData.actorUnqIdNbrList).each(function(idx, item){
			                that.$el.find('[data-form-param="actorUnqIdNbrTpCd"]').val(item.actorUnqIdNbrTpCd);
			                that.$el.find('[data-form-param="actorUnqIdNbr"]').val(item.actorUnqIdNbr);
		                });




						//확장속성 set
						$(CAPAT101StaffInfoData.actorXtnInfList).each(function(idx, item){
							var retireDtExist = false;
							for(var i = 0 ; i < CAPAT101StaffInfoData.actorXtnInfList.length ; i++){
								if(CAPAT101StaffInfoData.actorXtnInfList[i].xtnAtrbtNm == 'retireDt'){
									retireDtExist = true;
									break;
								}
							}
							//retireDt가 확장속성에 등록되어 있지 않으면 99991231 넣어주기
							if(!retireDtExist){
								that.$el.find('[data-form-param="retireDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));
							}
							if(item.xtnAtrbtNm == "frstRgstrnDt"){
								that.$el.find('[data-form-param="hiredDt"]').val(XDate(item.xtnAtrbtCntnt).toString('yyyy-MM-dd'));
							}else if(item.xtnAtrbtNm == "retireDt"){
								that.$el.find('[data-form-param="retireDt"]').val(XDate(item.xtnAtrbtCntnt).toString('yyyy-MM-dd'));
							}else if(item.xtnAtrbtNm == "userGrpCd"){
								that.$el.find('[data-form-param="userGrpCd"]').val(item.xtnAtrbtCntnt);
							}
						});


						//연락처정보 set
				    	$(CAPAT101StaffInfoData.addrList).each(function(idx, item){
				    		//직장주소
				    		if(item.cntctMthdTpCd == '07' && item.ctcptTpCd == '02'){
				    			that.$el.find('[data-form-param="addrHrarcyCd"]').val(item.addrHrarcyCd);
				    			that.$el.find('[data-form-param="addrId"]').val(item.addrId);
				    			that.$el.find('[data-form-param="addrCntnt"]').val(item.bsicAddrCntnt);
				    			that.$el.find('[data-form-param="dtlAddrCntnt"]').val(item.dtlAddrCntnt);
				    			that.$el.find('[data-form-param="zipCd"]').val(item.zipCd);
				    			that.$el.find('[data-form-param="addrCtcptId"]').val(item.actorCtcptId);
				    		}
				    	});
				    	$(CAPAT101StaffInfoData.telNbrList).each(function(idx, item){
				    		//휴대전화
				    		if(item.cntctMthdTpCd == '01' && item.ctcptTpCd == '01'){
				    			that.$el.find('[data-form-param="mobilePhone"]').val(item.idTelNbr + item.telExNbr + item.serialTelNbr);
				    			that.$el.find('[data-form-param="mobilePhoneCtcptId"]').val(item.actorCtcptId);
				    		}
				    		//직장전화
				    		if(item.cntctMthdTpCd == '02' && item.ctcptTpCd == '02'){
				    			that.$el.find('[data-form-param="officePhone"]').val(item.idTelNbr + item.telExNbr + item.serialTelNbr);
				    			that.$el.find('[data-form-param="officePhoneCtcptId"]').val(item.actorCtcptId);
				    		}
				    		//팩스번호
				    		if(item.cntctMthdTpCd == '05' && item.ctcptTpCd == '02'){
				    			that.$el.find('[data-form-param="faxNbr"]').val(item.idTelNbr + item.telExNbr + item.serialTelNbr);
				    			that.$el.find('[data-form-param="faxNbrCtcptId"]').val(item.actorCtcptId);
				    		}
				    	});
				    	$(CAPAT101StaffInfoData.elctrncAddrList).each(function(idx, item){
				    		//이메일주소
				    		if(item.cntctMthdTpCd == '03' && item.ctcptTpCd == '01'){
				    			that.$el.find('[data-form-param="email"]').val(item.elctrncAddr);
				    			that.$el.find('[data-form-param="emailCtcptId"]').val(item.actorCtcptId);
				    		}
				    	});

						
						$(CAPAT101StaffInfoData.actorCntctPntList).each(function(idx, item) {
							var objIdx = -1;
							// mobile phone
							if (item.cntctMthdTpCd == "01" && item.cntctPntTpCd == "01") {
								objIdx = 0;
							}
							// office address
							else if (item.cntctMthdTpCd == "07" && item.cntctPntTpCd == "02") {
								objIdx = 4;
							}
							// office phone
							else if (item.cntctMthdTpCd == "02" && item.cntctPntTpCd == "02") {
								objIdx = 1;
							}
							// office fax
							else if (item.cntctMthdTpCd == "05" && item.cntctPntTpCd == "02") {
								objIdx = 2;
							}
							// email
							else if (item.cntctMthdTpCd == "03" && item.cntctPntTpCd == "01") {
								objIdx = 3;
							}
							if (objIdx == 4) {
								that.$el.find('[data-form-param="editDtlCntctPntCntnt"]').eq(objIdx).val(item.dtlCntctPntCntnt);
								that.$el.find('[data-form-param="cntctPntSupplInfoCntnt"]').eq(objIdx).val(item.cntctPntSupplInfoCntnt);
								that.$el.find('[data-form-param="dtlCntctPntCntnt"]').eq(objIdx).val(item.dtlCntctPntCntnt);
								that.$el.find('[data-form-param="cntctPrhbtnTpCd"]').eq(objIdx).val(item.cntctPrhbtnTpCd);
								that.$el.find('[data-form-param="addrHrarcyCd"]').eq(objIdx).val(item.addrHrarcyCd);
								that.$el.find('[data-form-param="addrId"]').eq(objIdx).val(item.addrId);
								that.$el.find('[data-form-param="zipCd"]').eq(objIdx).val(item.zipCd);
								that.$el.find('[data-form-param="addrCntnt"]').eq(objIdx).val(item.addrCntnt);
								that.$el.find('[data-form-param="cntctPntSeqNbr"]').eq(objIdx).val(item.cntctPntSeqNbr);
							} else if (objIdx != -1) {
								that.$el.find('[data-form-param="dtlCntctPntCntnt"]').eq(objIdx).val(item.dtlCntctPntCntnt);
								that.$el.find('[data-form-param="cntctPrhbtnTpCd"]').eq(objIdx).val(item.cntctPrhbtnTpCd);
								that.$el.find('[data-form-param="telecomcarrId"]').eq(objIdx).val(item.telecomcarrId);
								that.$el.find('[data-form-param="cntctPntSeqNbr"]').eq(objIdx).val(item.cntctPntSeqNbr);
								if (objIdx == 0) SSF010MobilePhoneNum = item.dtlCntctPntCntnt;
							}
						});
					}


					//스태프명, 로그인ID 변경불가
					that.$el.find('[data-form-param="actorNm"]').prop("disabled", true);
					that.$el.find('[data-form-param="loinIdNbr"]').prop("disabled", true);


					//스태프신규등록 불가능
					that.registerStaff = false;
					//사용자정보변경 - 중복체크 비활성화, 비밀번호 리셋 활성화.
					that.$el.find('[data-form-param="isValidLoinId"]').val("");
					that.$el.find('.CAPAT101-validateLoinIdNbr-btn').attr('disabled', true);
					that.$el.find('.CAPAT101-resetPswd-btn').attr('disabled', false);
					//비밀번호 변경 불가
					that.$el.find('[data-form-param="pswd"]').attr('type', 'password');
					that.$el.find('[data-form-param="pswd"]').attr('disabled', true);
					that.$el.find('[data-form-param="pswd"]').val('********');
				},




				/**
				 * 스태프소속부서정보 set
				 */
				setStaffDeptInfo(selectedParam){
					var that = this;


					if(selectedParam == null){


						var selectedItem = that.dataGrid.grid.getSelectionModel().selected.items[0]


					}else{
						for(var i = 0 ; i < selectedParam.length ; i++){
							//해당 스태프가 현재 소속된 부서이면
							if(selectedParam[i].roleId == 'DfltRole'){
								var selectedItem = new Object();
								selectedItem.data = selectedParam[i];
								break;
							}
						}						
					}


	                var param = {};


	                if (!selectedItem) {
	                    return;
	                } else {
	                    param.deptNm = selectedItem.data.deptNm;
	                    param.efctvStartDt = selectedItem.data.efctvStartDt;
	                    param.efctvEndDt = selectedItem.data.efctvEndDt;
	                    param.deptId = selectedItem.data.deptId;
	                    param.dtsfRelSeqNbr = selectedItem.data.dtsfRelSeqNbr;


						that.$el.find('[data-form-param="deptNm"]').val(param.deptNm);
						that.$el.find('[data-form-param="deptId"]').val(param.deptId);
						that.$el.find('[data-form-param="startDt"]').val(XDate(param.efctvStartDt).toString('yyyy-MM-dd'));
						that.$el.find('[data-form-param="endDt"]').val(XDate(param.efctvEndDt).toString('yyyy-MM-dd'));
						that.$el.find('[data-form-param="belongDtsfRelSeqNbr"]').val(param.dtsfRelSeqNbr);


						//신규등록 시에는 그리드를 선택해도 부서정보 입력가능해야 함.
						if(param.deptId != "" && param.deptId != null){
							that.$el.find('[data-form-param="startDt"]').attr('disabled', true);
							that.$el.find("#btn-dept-search").attr('disabled', true);
						}
	                }


				},


				/**
				 * 스태프역할정보 set
				 */
				setStaffRoleInfo(){
					var that = this;
					var selectedItem = that.roleDataGrid.grid.getSelectionModel().selected.items[0]


	                var param = {};


	                if (!selectedItem) {
	                    return;
	                } else {
	                    param.deptNm = selectedItem.data.deptNm;
	                    param.efctvStartDt = selectedItem.data.efctvStartDt;
	                    param.efctvEndDt = selectedItem.data.efctvEndDt;
	                    param.roleId = selectedItem.data.roleId;
	                    param.deptId = selectedItem.data.deptId;
	                    param.dtsfRelSeqNbr = selectedItem.data.dtsfRelSeqNbr;
	                    param.staffRoleSeqNbr = selectedItem.data.staffRoleSeqNbr;


						that.$el.find('[data-form-param="roleDeptNm"]').val(param.deptNm);
						that.$el.find('[data-form-param="roleDeptId"]').val(param.deptId);
						that.$el.find('[data-form-param="roleStartDt"]').val(XDate(param.efctvStartDt).toString('yyyy-MM-dd'));
						that.$el.find('[data-form-param="roleEndDt"]').val(XDate(param.efctvEndDt).toString('yyyy-MM-dd'));
						that.$el.find('[data-form-param="dtsfRelSeqNbr"]').val(param.dtsfRelSeqNbr);
						that.$el.find('[data-form-param="staffRoleSeqNbr"]').val(param.staffRoleSeqNbr);

						that.searchRoleId(param.roleId);
						that.$el.find('[data-form-param="roleId"]').val(param.roleId);
						//신규등록시에는 그리드를 클릭해도 역할정보 입력 가능해야 함.
						if(param.roleId != null && param.roleId != ""){							
							that.$el.find('[data-form-param="roleStartDt"]').attr('disabled', true);
							that.$el.find("#btn-role-dept-search").attr('disabled', true);
							that.$el.find('[data-form-param="roleId"]').attr('disabled', true);
						}
	                }
				},


				/**
				 * 부서에 따른 역할조회
				 */
				searchRoleId: function(selectVal){
					var that = this;


					var header =  new Object();
	        		header = fn_getHeader("CAPDT0000401");


	        		var sParam = {};
	        		sParam.instCd = this.instCd;
	                sParam.deptId = that.$el.find('[data-form-param="roleDeptId"]').val();
	                var linkData = {"header" : header , "CaDeptRoleSrchSvcGetRoleListIn" : sParam};
	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                    success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            if (responseData.CaDeptRoleSrchSvcGetRoleListOut) {
	                           		that.$el.find('[data-form-param="roleId"]').empty();
		                           	$(responseData.CaDeptRoleSrchSvcGetRoleListOut.roleList).each(function (idx, item) {


		                                var optionText = item.roleNm;
		                                var optionValue = item.roleId;
		                                var option = $(document.createElement('option')).val(optionValue).text(optionValue+" "+optionText);


		                                that.$el.find('[data-form-param="roleId"]').append(option);


		                                if(selectVal != null){
		                                	that.$el.find('[data-form-param="roleId"]').val(selectVal);
		                                }
		                             });
	                            }
	                        }
	                    }
	                });


				},




	            /* ================================================================================================
	             * ==========================================팝업창==================================================
	             * ================================================================================================
	             */


				/**
				 * 부서검색 팝업
				 */
				deptIdPopCAPAT101Base: function(){
					var that = this;
					var param = {};


					param.instCd = this.instCd;
					param.dtogRelCd = '01'; //기본조직 조회


				    var popDeptIdObj = new popupDeptId(param);
				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {
				    	that.$el.find('[data-form-param="deptNm"]').val(param.brnchCd + " " + param.brnchNm);
				    	that.$el.find('[data-form-param="deptId"]').val(param.brnchCd);
				    	that.$el.find('[data-form-param="startDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
				    	that.$el.find('[data-form-param="endDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));
				    });
				},


				/**
				 * 부서검색 팝업(역할검색용)
				 */
				roleDeptIdPopCAPAT101Base: function(){
					var that = this;
					var param = {};


					param.instCd = this.instCd;
					param.dtogRelCd = '01'; //기본조직 조회


				    var popDeptIdObj = new popupDeptId(param);
				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {
				    	that.$el.find('[data-form-param="roleDeptNm"]').val(param.brnchCd + " " + param.brnchNm);
				    	that.$el.find('[data-form-param="roleDeptId"]').val(param.brnchCd);
				    	that.$el.find('[data-form-param="roleStartDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
				    	that.$el.find('[data-form-param="roleEndDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));


				    	that.searchRoleId(null);
				    });
				},


				/**
				 * 주소검색 팝업
				 */
				officeAddrPopCAPAT101Base : function() {
					var that = this;


			    	var param = {};
				    var popKrZipCdObj = new popupKrZipCd(param);
				    popKrZipCdObj.render();


				    popKrZipCdObj.on('popUpSetData', function (param) {
				    	that.$el.find('[data-form-param="addrId"]').val(param.addrId);
				    	that.$el.find('[data-form-param="zipCd"]').val(param.zipCd);
				    	that.$el.find('[data-form-param="addrCntnt"]').val("[" + param.zipCd + "]" + param.roadAddr);
				    	that.$el.find('[data-form-param="dtlAddrCntnt"]').val(param.dtlAddr);


				    });
				},


	            /* ================================================================================================
	             * ==========================================기타화면================================================
	             * ================================================================================================
	             */


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
	            },


	            /**
	             * 기본속성영역 접기
	             */
	            popBaseAtrbtLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#base-attribute-area"));
	            },


	            /**
	             * 소속부서이력영역 접기
	             */
	            popDeptHistLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#dept-hist-area"));
	            },


	            /**
	             * 소속부서정보영역 접기
	             */
	            popDeptInfoLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#dept-info-area"));
	            },


	            /**
	             * 스태프역할이력영역 접기
	             */
	            popRoleHistLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#CAPAT101Grid-role-hist"));
	            },


	            /**
	             * 스태프역할정보영역 접기
	             */
	            popRoleInfoLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#role-info-area"));
	            },


	            /**
	             * 연락처정보영역 접기
	             */
	            popCntctPntLayerCtrl: function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#cntct-pnt-area"));
	            }


			});
	return CAPAT101BaseView;
});




/**
 * 이메일값여부 확인
 * @param targetObj
 * @returns
 */
function fn_isEmailValueCAPAT101(emailCntnt) {
	if(emailCntnt != "") {
		var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z\s]{2,4}$/;
		return emailPattern.test(emailCntnt);
	}
	else return true;
}
/**
 * Reset
 * @param that
 */
function fn_resetCAPAT101(that) {
	that.$el.find('input[type="text"]').each(function(){
		this.value = "";
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


	that.$el.find('[data-form-param="addrId"]').val("");
	that.$el.find('[data-form-param="zipCd"]').val("");


    that.dataGrid.resetData();
    that.roleDataGrid.resetData();


	//로그인아이디, 스태프명 변경 가능
	that.$el.find('[data-form-param="loinIdNbr"]').attr('disabled', false);
	that.$el.find('[data-form-param="actorNm"]').attr('disabled', false);


	//신규사용자 등록 - 중복체크 활성화, 비밀번호 리셋 비활성화.
	that.$el.find('[data-form-param="isValidLoinId"]').val("");
	that.$el.find('.CAPAT101-validateLoinIdNbr-btn').attr('disabled', false);
	that.$el.find('.CAPAT101-resetPswd-btn').attr('disabled', true);
	//비밀번호 변경 가능
	that.$el.find('[data-form-param="pswd"]').attr('type', 'text');
	that.$el.find('[data-form-param="pswd"]').attr('disabled', false);
	that.$el.find('[data-form-param="pswd"]').val('');
	//startDt, endDt set
	that.$el.find('[data-form-param="startDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
	that.$el.find('[data-form-param="endDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));
	that.$el.find('[data-form-param="hiredDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
	that.$el.find('[data-form-param="retireDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));
	that.$el.find('[data-form-param="roleStartDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
	that.$el.find('[data-form-param="roleEndDt"]').val(XDate('99991231').toString('yyyy-MM-dd'));


	that.$el.find('[data-form-param="startDt"]').attr('disabled', false);
	that.$el.find("#btn-dept-search").attr('disabled', false);


	that.$el.find('[data-form-param="roleStartDt"]').attr('disabled', false);
	that.$el.find("#btn-role-dept-search").attr('disabled', false);
	that.$el.find('[data-form-param="roleId"]').attr('disabled', false);

	//신규저장 이외의 저장버튼 비활성화
	that.$el.find('#btn-dept-hist-save').attr('disabled', true);
	that.$el.find('#btn-belonged-dept-info-save').attr('disabled', true);
	that.$el.find('#btn-role-hist-save').attr('disabled', true);
	that.$el.find('#btn-role-info-save').attr('disabled', true);
	that.$el.find('#btn-contact-point-save').attr('disabled', true);

	that.deleteDeptHistList = new Array();
	that.deleteRoleHistList = new Array();


	that.CAPAT101StaffDeptInfoList = new Array();
	that.CAPAT101StaffRoleInfoList = new Array();

	//역할입력항목 초기화(역할 insert되게)
	that.resetCAPAT101RoleInfo();

	that.makeComboBoxes();
}


/**
 * 코드조회
 * @param sParam
 * @param that
 * @param selectStyle
 * @param fn
 */
function fn_getCAPAT101CodeList(sParam, that, selectStyle, fn) {
    var param = {};


    param.cdNbr = sParam.cdNbr;


    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};


    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
            	var $targetArea;




            	if(sParam.pageType && sParam.pageType == "popup") {
            		$targetArea = that.find("." + sParam.className);
            	}
            	else {
            		$targetArea = that.$el.find("." + sParam.className);
            	}


            	$targetArea.html("");


            	// 비활성화 처리
            	 if (sParam.disabled) {
            		 $targetArea.attr("disabled", true);
                 }
            	 else {
            		 $targetArea.attr("disabled", false);
            	 }


            	 // 숨김처리
            	 if (sParam.hidden) {
            		 $targetArea.attr("hidden", true);
                 }


            	 // 빈값 처리
            	 if (sParam.nullYn == "Y") {
                     var option = $(document.createElement('option')).val("").text(sParam.allNm);
                     $targetArea.append(option);
                 }


            	 $(data.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
                     var optionText = item.cdNm;
                     var optionValue = item.cd;
                     var option = $(document.createElement('option')).val(optionValue).text(optionText);


                     if (sParam.viewType) {
                         if (sParam.viewType == "ValNm") {
                             option = $(document.createElement('option')).val(optionValue).text(item.cd + " " + optionText);
                         }
                         else if (sParam.viewType == "val") {
                             option = $(document.createElement('option')).val(optionValue).text(optionValue);
                         }
                     }


                     if(item.cd != '01' && item.cd != '04' && item.cd != '05'){
                    	 //사용자그룹코드의 경우 01(고객), 04(시스템), 05(대외망)는 출력하지 않음.
                         $targetArea.append(option);                    	 
                     }
                 });


            	 if (sParam.selectVal) {
            		 $targetArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                 }


                typeof fn === 'function' && fn();
            }
        }
    });
}
