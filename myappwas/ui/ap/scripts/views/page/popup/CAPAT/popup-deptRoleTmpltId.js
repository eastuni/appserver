define(
    [
        'bx-component/popup/popup'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPAT/popup-deptRoleTmpltId-tpl.html'
        , 'bx/common/common-message'
    ],
    function (Popup
        , ExtGrid
        , tpl) {


    	var comboStore1 = null; // 부서역할템플릿상태코드 
    	var rsltCnt; //검색건수


        var BxpUserPopup = Popup.extend({
            //태그 이름 설정
            tagName: 'section',


            //클래스 이름 설정
            className: 'popup-page',


            //템플릿설정
            templates: {
                'tpl': tpl
            },


            attributes: {
              	'style': 'width: 1020px; height: 800px;'
            },


            events: {
                'click .search-btn': 'fn_loadList'
                , 'click .cancel-btn': 'close'
                , 'click .select-btn': 'fn_select'
                , 'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기       	
                , 'click #btn-popup-tree-modal': 'popGridLayerCtrl' // 그리드영역 접기
                , 'click #btn-popup-service-reset': 'reset' // 초기화
            },


            initialize: function (initConfig) {
                var that = this;


                // Set Page
                this.$el.html(this.tpl());


                // Set Page modal 설정
                if (new String(initConfig.modal) == 'false') {
                    that.enableDim = false;
                } else {
                    that.enableDim = true;
                }


                if (typeof initConfig == 'undefined') {
                    that.gInstCd = $.sessionStorage('instCd');
                }
                else {
                    that.gInstCd = initConfig.instCd;
                }


                //combobox 정보 셋팅
	            // 부서역할템플릿상태코드 
	            var sParam = {};
	            sParam.cdNbr = "A0471";
	            var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                bxProxy.all([
                    // 부서역할템플릿상태코드 콤보코드 로딩
                    {
                        url: sUrl, param: JSON.stringify(linkData), success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            comboStore1 = new Ext.data.Store({
                                fields: ['cd', 'cdNm'],
                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                            });
                        }
                    }
                    }
                ], {
                    success: function () {


	  	                  /* ------------------------------------------------------------ */
	                  	  that.dataGrid = new ExtGrid({
	                  	  /* ------------------------------------------------------------ */
	                  		  // 문서목록 그리드 컬럼 정의
	                          fields: ['No', 'roleTmpltId', 'roleTmpltNm', 'roleTmpltStsCd']
	                        , id: 'dataGrid'
	                        , columns: [{text:'No' ,dataIndex: 'rowIndex' ,sortable : false ,flex: 1, style: 'text-align:center', height : 25, align: 'center'
	                                       ,renderer : function(value, metaData, record, rowIndex, colIndex, sotre) {
	                                       		rsltCnt = rowIndex + 1;
	                                            return rowIndex+1;
	                                        }
	                                    }
				                        ,{text:bxMsg('cbb_items.SCRNITM#deptRoleTmpltId'), flex: 5, dataIndex: 'roleTmpltId', style: 'text-align:center', height: 25, align: 'center', editor: 'textfield'}
		                                ,{text:bxMsg('cbb_items.SCRNITM#deptRoleTmpltNm'), flex: 7, dataIndex: 'roleTmpltNm', style: 'text-align:center', align: 'center', editor: 'textfield'}
		                                ,{text:bxMsg('cbb_items.ABRVTN#sts'), flex: 4, dataIndex: 'roleTmpltStsCd', style: 'text-align:center', align: 'center', editor: 'textfield'
	                                	   ,renderer: function(val) {
	                                            index = comboStore1.findExact('cd', val);
	                                            if(index != -1) {
	                                                rs = comboStore1.getAt(index).data;
	                                                return rs.cdNm;
	                                            }
	                                        } // end of render
	                                	}		                                   
	                          ] // end of columns
	                        , listeners: {click: {element: 'body',
	  	                   			               fn: function(){
	  	                   			            	   //더블클릭시 이벤트 발생
	  	                   			            	   that.fn_select();
	  	                   			               }
	  	                   				}
	  	                	}
	                  	});


                        that.$el.find(".data-grid").html(that.dataGrid.render({'height': CaPopGridHeight}));
                        that.dataGrid.resetData();
                        that.show();


                    } // end of success:.function
                }); // end of bxProxy.all




            },


            render: function () {


//                 return this.$el;
            },


            fn_loadList: function (e, param) {
                var that = this;
                var sParam = {};
                sParam.instCd = that.gInstCd;
                sParam.roleTmpltId = this.$el.find('[data-form-param="srchDeptRoleTmpltId"]').val();
                sParam.roleTmpltNm = this.$el.find('[data-form-param="srchDeptRoleTmpltNm"]').val();
                sParam.roleTmpltStsCd = "02"; // 활동상태 


				that.dataGrid.resetData();


				// header 정보 set
	            var header =  new Object();
	            header = fn_getHeader("CAPAT0048402");


	            var linkData = {"header": header, "CaDeptRoleTmpltSvcGetListIn": sParam};


	            // ajax호출
	            bxProxy.post(sUrl, JSON.stringify(linkData),{
	            	enableLoading: true,   
	                success: function(responseData){


	                	if(fn_commonChekResult(responseData)) {
	                		if(responseData.CaDeptRoleTmpltSvcGetListOut) {
	                			var tbList = responseData.CaDeptRoleTmpltSvcGetListOut.deptRoleTmpltList;
                      		  	that.dataGrid.setData(tbList); 
                                //검색건수
                            	that.$el.find('#rsltCnt').html(rsltCnt);
	            			}		                          
	                    }
	                }   // end of suucess: fucntion
	            });     // end of bxProxy		
            },


            fn_select: function () {
                var selectedData = this.dataGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                	param.roleTmpltId = selectedData.data.roleTmpltId;
                    param.roleTmpltNm = selectedData.data.roleTmpltNm;
                }


                this.trigger('popUpSetData', param);
                this.close();
            },


            afterClose: function () {
                this.remove();
            },


            /**
             * 그리드영역 접기
             */
            popGridLayerCtrl: function(){
        		var that = this;
        		fn_pageLayerCtrl(that.$el.find("#popup-service-grid"));
            },


            /**
             * 조회영역 접기
             */
            popPageLayerCtrl: function(){
        		var that = this;


        		fn_pageLayerCtrl(that.$el.find("#popup-search-area"));
            },


            /**
             * 입력항목 초기화
             */
            reset: function(){
        		var that = this;
        	  	that.$el.find(".popup-service-table [data-form-param='srchDeptRoleTmpltId']").val("");
        	  	that.$el.find(".popup-service-table [data-form-param='srchDeptRoleTmpltNm']").val("");
            }
        });


        return BxpUserPopup;
    }
);
