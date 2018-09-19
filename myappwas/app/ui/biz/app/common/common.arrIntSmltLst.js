/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonArrIntSmltLst', __service);

function __service($commonService, $commonProxy, $commonUiGenerator, $commonExtGrid){
    return {
    	
    	fn_arrIntSmltLst : function(sParam,thatCtrl) {
		  	
		    var copySection = "";
      		var label = "";
    		var tblList = sParam;
    		
       		this.fn_createSmltTable(tblList,thatCtrl);
       		    
		},
		
		fn_createSmltTable : function(tbList,thatCtrl) {		
			
			var that = this;
			that.i18n = $commonService.makeBxI18n();
			
			var tbListCnt = tbList.length;
			var countGrid=0;      
			
			//오브젝트 단위로 데이터들이 들어옴.
			$(tbList).each(function (idx, data) {
				
					var tbl = "";
					var className = 'className'+idx;
					var startDt = $.find('[name="startDt"]');
					var isTable=false;
					var tableNode;
					
					for(var i=0;i<startDt.length;i++){
						var startDtVal = $commonService.fn_setDateFormat(startDt[i].value,false);
						if(startDtVal===data.startDt){
							isTable=true;
							tableNode = startDt[i].parentElement.parentElement.parentNode.parentNode.id; 
							break;
						}
					}
					
					if(isTable===true){
						var resultData = that.setSmltData(data);
						that.arrIntRtGrid.addData(resultData);
					}
					else{
						tbl += "<table class=\"w-100 add-mg-t\" id=\""+className+idx+"-table"+"\" >";
						tbl += "	<tr>";
						tbl += "		<td class=\"td-w-33\">";
						tbl += "			<div class=\"input-wrap fix-label clr\" ><label class=\"bw-label \"  data-i18n=\"{%=cbb_items.AT#startDt%}\"></label>";
						tbl += "				<input type=\"text\" class=\"bw-input a-center\"  readonly=\"readonly\" name=\"startDt\" data-form-param=\""+className+"-Readable\" value=\""+$commonService.fn_setDateFormat(data.startDt,true)+"\"></input>";
						tbl += "			</div>";
						tbl += "		</td>";
						tbl += "		<td class=\"td-w-33\">";
						tbl += "			<div class=\"input-wrap fix-label clr\" ><label class=\"bw-label \"  data-i18n=\"{%=cbb_items.AT#endDt%}\"></label>";
						tbl += "				<input type=\"text\" class=\"bw-input a-center\"  readonly=\"readonly\" data-form-param=\""+className+"-Readable\" value=\""+$commonService.fn_setDateFormat(data.endDt,true)+"\"></input>";
						tbl += "			</div>";
						tbl += "		</td>";
						tbl += "		<td>";
						tbl += "			&nbsp;";
						tbl += "		</td>";
						tbl += "	</tr>";
						tbl += "</table>";
						tbl += "<div id=\"arrIntRtGrid"+data.startDt+"\">";
						tbl += "	<section class=\"bw-grid\" >";
						tbl += "	</section>";
						tbl += "</div>";

						$('#smltnIntRt').append(tbl);

						that.createInitGrid(thatCtrl,data.startDt,countGrid);
						var resultData = that.setSmltData(data);
						that.arrIntRtGrid.addData(resultData);
//						countGrid++;
					}
					
			});
			
	
		},
		
		createInitGrid : function(thatCtrl,gridId,countGrid){
			var that = this;
			var afterLayoutCnt = 0;
			
			that.arrIntRtGrid = $commonExtGrid.getInstance();
			that.arrIntRtGrid.initialize({
	              /* ------------------------------------------------------------ */
	                  fields: ['rowIndex','aplyRt','rtElmnt','tierElmnt']
	              	  , id: 'arrIntRtGrid'+gridId
	              	  
	                  , columns: [ 
						{
							text: that.i18n.getValue('{%=cbb_items.SCRNITM#No%}')
							,editor: 				'textfield'
							,dataIndex: 'rowIndex'
							,height: 25
							,width: 50
							, style: 'text-align:center'
							,align: 'center'
							,renderer: function (value, metaData, record, rowIndex) {
							return rowIndex + 1;
							}
						}
	                    ,{text:that.i18n.getValue('{%=cbb_items.AT#aplyRt%}'), width: 95, dataIndex: 'aplyRt', editor: 'textfield', align: 'right', style: 'text-align:center',sortable: false
	                    	  ,renderer: function(value, metaData, record, row, col, store, gridView, e){
	                    		  return value+'%';
	                    	  } // end of render
	                     }
	                    ,{text:that.i18n.getValue('{%=cbb_items.SCRNITM#rtElmntList%}'), width: 300, dataIndex: 'rtElmnt', editor: 'textfield' , align: 'left', style: 'text-align:center',sortable: false, multiline: true
	                    	,renderer: function(value, metaData, record, row, col, store, gridView, e){
	                    		return value.replace(/\n/gi,"<br>");
	                    	}
	                    }
	                    ,{text:that.i18n.getValue('{%=cbb_items.SCRNITM#tierElmntList%}'), flex:1, dataIndex: 'tierElmnt', editor: 'textfield', align: 'left', style: 'text-align:center',sortable: false
	                    	,renderer: function(value, metaData, record, row, col, store, gridView, e){
	                    		return value.replace(/\n/gi,"<br>");
	                    	}
	                    }
	                    
	                  
	                    ] // end of columns

	              		, listeners : {
	              			//disable click event 
	              			beforeselect : function() {
	              				return false;
	              			},
							afterlayout: function(record) {
								
								var height;
								var headerHeight;
								afterLayoutCnt++;
								
								if(afterLayoutCnt === 2) {
									afterLayoutCnt = 0;									
									headerHeight = 25;
									height = $("#arrIntRtGrid"+gridId+"").children().children().children().children()[1].clientHeight+15;
									height = height + headerHeight;
									record.setHeight(height);
									$("#arrIntRtGrid"+gridId+"").height(height);
									//that.fn_centerCell(thatCtrl,gridId,3);
								}
							}
	              		}
					    , viewConfig: {
					        forceFit: true
					    }
	                    ,gridConfig: {
	                    	//disable mouse over
	                    	trackMouseOver: false,
	                     } // end of gridConfig
	                    
	                  });
			
			angular.element(document).ready(function () {
				that.arrIntRtGrid.render({'height': "300px"});
			});
			
	         
	         
		},
		
		setSmltData : function(data){
      	  	var smltList=[];
      	  	var resultData={};
			var aplyRt = data.aplyRt;
			var tierElmntList = data.tierElmntAsRdblFormCntnt;
			var rtElmntList = data.intRtElmntAsRdblFormCntnt;
			
			resultData.tierElmnt = tierElmntList;
			resultData.rtElmnt = rtElmntList;
			resultData.aplyRt = aplyRt;
			smltList.push(resultData);
			
			return smltList;
		},
		
		fn_centerCell : function(thatCtrl,gridId, columnCnt){
//			var rows = 	that.$el.find('.SDP'+gridId+'-arrIntRt-grid').find('tbody').find('tr');
//			for (var i = 0; i < rows.length; i++ ) {
//				for (var j = 0; j < columnCnt; j++ ) {
//					var cell = $(rows[i]).find("td").eq(j); // header
//					$(cell).attr("style", 'vertical-align:middle;');
//				}
//			}
			
			var rows = 	$("#arrIntRtGrid").find('tbody').find('tr');
			for (var i = 0; i < rows.length; i++ ) {
				for (var j = 0; j < columnCnt; j++ ) {
					var cell = $(rows[i]).find("td").eq(j); // header
					$(cell).attr("style", 'vertical-align:middle;');
				}
			}
		}
    } // end return
} // end function