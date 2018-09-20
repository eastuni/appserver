define(
	[
		'bx/common/config'
		, 'bx-component/message/message-alert'
		, 'bx-component/message/message-confirm'
        , 'bx/common/common-info'
        ,'bx-component/ext-grid/_ext-grid'
	 ]
	, function(
			 config
	        , alertMessage
	        , confirmMessage
	        , commonInfo
	        ,ExtGrid

	) {
		var instCd;
		var arrIntRtGrid = [];
		var prevValue=null;
		fn_arrIntSmltLst = function(sParam,that) {
			  	
		    var copySection = "";
      		var label = "";
			
    		var tblList = sParam;

    		
       		fn_createSmltTable(tblList,that);
       		    
		};		
		
		 fn_createSmltTable = function(tbList,that) {			
			var tbListCnt = tbList.length;
			var countGrid=0;
			startSection = '<section class="bx-container bx-panel-body">';
			that.$el.find('#copyDivArea').append(startSection);
			//오브젝트 단위로 데이터들이 들어옴.
			$(tbList).each(function (idx, data) {
					var tbl = "";
					var className = 'className'+idx;
					var startDt = $.find('[name="startDt"]');
					var isTable=false;
					var tableNode;
					
					for(var i=0;i<startDt.length;i++){
						if(startDt[i].textContent===data.startDt){
							isTable=true;
							tableNode = startDt[i].parentElement.parentElement.parentNode.parentNode.id; 
							break;
						}
					}
					if(isTable===true){
						var resultData = setSmltData(data);
						arrIntRtGrid[countGrid].addData(resultData);
					}
					else{
						tbl += "<table class=\"bx-info-table\" id=\""+className+idx+"-table"+"\" >";
						tbl += "	<tr>";
						tbl += "    	<th data-tooltip=\""+bxMsg('cbb_items.AT#startDt')+"\" style=\"text-align: right;\">"+bxMsg('cbb_items.AT#startDt')+"  : "+"</th>";
						tbl += "		<td>";
						tbl += "		 	<p name=\"startDt\" data-form-param=\""+className+"-Readable\" style=\"text-align: left;\" value=\""+data.startDt+"\">"+data.startDt+"</p>";
						tbl += "		</td>";
						tbl += "    	<th data-tooltip=\""+bxMsg('cbb_items.AT#endDt')+"\" style=\"text-align: right;\">"+bxMsg('cbb_items.AT#endDt')+"  : "+"</th>";
						tbl += "		<td>";
						tbl += "	 		<p name=\"endDt\" data-form-param=\""+className+"-Readable\" style=\"text-align: left;\" value=\""+data.endDt+"\">"+data.endDt+"</p>";
						tbl += "		</td>";
						tbl += "		<td>";
						tbl += "		</td>";
						tbl += "		<td>";
						tbl += "		</td>";
						tbl += "	</tr>";
						tbl += "	<tr>";
						tbl += "		<td colspan='6'>";
						tbl += "			<div class=\"bx-tab-container\">"
						tbl += "				<section class=\"bx-tab-body\" data-layout=\"card\">"
						tbl += "					<div class = \"bx-container bx-tab-page\" data-link=\"SDP"+data.startDt+"-arrIntRt-tab\">"
						tbl += "						<section class=\"SDP"+data.startDt+"-arrIntRt-grid\"></section>"
						tbl += "					</div>"
						tbl += "				</section>"
						tbl += "			</div>"
						tbl += "		</td>";
						tbl += "	</tr>";
						tbl += "</table>";
						that.$el.find('#copyDivArea').append(tbl);

						createInitGrid(that,data.startDt,countGrid);

						var resultData = setSmltData(data);
						arrIntRtGrid[countGrid].addData(resultData);
//						countGrid++;
					}
					
			});
	
			lastSection = "</section>";
			that.$el.find('#copyDivArea').append(lastSection);
		};
		
		setSmltData = function(data){
      	  	var smltList=[];
      	  	var resultData={};
			var aplyRt = data.aplyRt;
			var tierElmntList = data.tierElementAsRdblForm;
			var rtElmntList = data.intRtElementAsRdblForm;
			
			resultData.tierElmnt = tierElmntList;
			resultData.rtElmnt = rtElmntList;
			resultData.aplyRt = aplyRt;
			smltList.push(resultData);
			
			
			return smltList;
			
			
		};
		

		createInitGrid = function(that,gridId,countGrid){
			var afterLayoutCnt = 0;

		    arrIntRtGrid[countGrid] = new ExtGrid({
	              /* ------------------------------------------------------------ */
	                  fields: ['aplyRt','rtElmnt','tierElmnt']
	              	  , id: 'SDP'+gridId+'ArrIntRtGrid'
	              	  
	                  , columns: [ 
	                     {text:bxMsg('cbb_items.AT#aplyRt'), width: 80, dataIndex: 'aplyRt', editor: 'textfield', align: 'center', style: 'text-align:center',sortable: false
	                    	  ,renderer: function(value, metaData, record, row, col, store, gridView, e){
	                    		  return value+'%';
	                    	  } // end of render
	                     }
	                    ,{text:bxMsg('cbb_items.SCRNITM#rtElmntList'), width: 300, dataIndex: 'rtElmnt', editor: 'textfield' , align: 'center', style: 'text-align:center',sortable: false, multiline: true
	                    	,renderer: function(value, metaData, record, row, col, store, gridView, e){
	                    		return value.replace(/\n/gi,"<br>");
	                    	}
	                    }
	                    ,{text:bxMsg('cbb_items.SCRNITM#tierElmntList'), width: 590, dataIndex: 'tierElmnt', editor: 'textfield', align: 'center', style: 'text-align:center',sortable: false
	                    	,renderer: function(value, metaData, record, row, col, store, gridView, e){
	                    		return value;
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
								afterLayoutCnt++;
								if(afterLayoutCnt === 2) {
									afterLayoutCnt = 0;
//									fn_mergeCell(that,gridId,2);
									headerHeight = that.$el.find(".SDP"+gridId+"-arrIntRt-grid").children().children().children().children()[0].clientHeight;
									height = that.$el.find(".SDP"+gridId+"-arrIntRt-grid").children().children().children().children().children()[1].clientHeight+15;
									height = height + headerHeight;
									record.setHeight(height);
									that.$el.find(".SDP"+gridId+"-arrIntRt-grid").height(height);
									fn_centerCell(that,gridId,3);
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
		    
	         that.$el.find(".SDP"+gridId+"-arrIntRt-grid").html(arrIntRtGrid[countGrid].render({'height': CgridHeight}));
	         
		};
		
		fn_centerCell = function(that,gridId, columnCnt){
			var rows = 	that.$el.find('.SDP'+gridId+'-arrIntRt-grid').find('tbody').find('tr');
			for (var i = 0; i < rows.length; i++ ) {
				for (var j = 0; j < columnCnt; j++ ) {
					var cell = $(rows[i]).find("td").eq(j); // header
					$(cell).attr("style", 'vertical-align:middle;');
				}
			}
			
			
		}
//		fn_mergeCell = function (that,gridId,param) {
//       		// variable 정의
//       		var first = true;
//       		var prevRowspan = 1; 
//       		var prevCell = null;
//       		// tr 모두 추출
//       		var rows = 	that.$el.find('.SDP'+gridId+'-arrIntRt-grid').find('tbody').find('tr');
//       		
//       		
//       		for (var i = 0; i < rows.length; i++ ) {
//       			// first row
//       			if (first) {
//       				var prevRow = rows[i];
//       				prevCell = $(prevRow).find("td").eq(param); // header
//       				
//       				first = false;
//       				continue;
//       			}
//       			var row = rows[i]; // row
//       			var tdList = $(row).find("td"); // row > td 리스트
//
//       			var firstCell = $(tdList).eq(param);
//
//       			var firstCellText = $(firstCell).text();
//
//       			// 두 번째 row 부터 텍스트 비교
//       			if(prevCell.text() != "") {
//       				if (prevCell.text() == firstCellText) {
//       					prevRowspan++;
//       					$(prevCell).attr("rowspan" , prevRowspan);
//       					$(prevCell).attr("style", 'vertical-align:middle;');
//       					$(firstCell).remove();
//       				}
//       				else {
//       					prevRowspan = 1;
//       					prevCell = firstCell;
//       				}
//       			}
//       		}
//     	}
	} // end of define function
);  // end of define