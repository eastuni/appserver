/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonSmltCndLst', __service);

function __service($commonService, $commonProxy, $commonUiGenerator){
    return {
    	
    	fn_smltCndLst : function (sParam, that, selectStyle) {
    		var tbList = sParam.tbList;
        	  
    		var readableFormYn   = sParam.readableFormYn; //readableForm Display Yn 
    		var colCount         = sParam.colCount; //Display Column Count
    		var totalColumnCount = sParam.totalColumnCount; //Total Column Count
    		  
    		//상품조건리스트 셋팅
            if(tbList != null || tbList.length > 0) {
            	var arrCndVal 
            	var copySection = "";
            	var label = "";
            	var createTable = "";
           		
            	copySection += "<section class=\"bx-container bx-panel-body cndInfo\">";
            	createTable  = this.fn_createTable(tbList, readableFormYn, colCount, totalColumnCount);

           		copySection += createTable;
           		copySection += "</section>";
            	$('#copyDivArea').append(copySection);
            	
           		if(createTable !=""){
                	
                	$(tbList).each(function (idx, item) {
                		var listCdList = JSON.parse(item.pdCndVal);
//              		  	var sectionArea = $(document.createElement('section'));
//                    	var selectArea = $(document.createElement('select'));
              		 
                  		if(item.cndTpCd == "01"){
                  			  
//                  			label = item.cndCd+"-wrap";
//                  		  
//                  			sectionArea.addClass("bx-combo-box-wrap");
//                            $("." + item.cndCd).html("");
//                            
//                            $(selectArea).addClass("bw-input ipt-select");
//                            selectStyle && $(selectArea).css(selectStyle);
//                            $(selectArea).attr("data-form-param", item.cndCd);
                            if(listCdList!==null){
                            	$(listCdList.listCdList).each(function (idx1, item1) {
                            		var optionText = item1.listCdNm;
//                          		  	var option = $(document.createElement('option')).val(item1.listCd).text(optionText);
                          		  	
                          		  	$("[data-form-param='"+item.cndCd+"']").append($(document.createElement('option')).val(item1.listCd).text(optionText));
//                          		  	$(selectArea).append(option);
                          	  	}); 
                          	  
                          	  	if(item.arrCndVal != undefined || item.arrCndVal != null){
                          	  		$("[data-form-param='"+item.cndCd+"']").attr("disabled",true);
                          	  		$("[data-form-param='"+item.cndCd+"']").val(item.arrCndVal);
                          	  	}
                            }
                            
//                            $(sectionArea).html(selectArea);
//                          	$('.'+label).html(sectionArea);
                            
                  		  }else{
                  			  label = "";
                  		  }
                		
                		
                	});
           		}
            }

    	 	that.trigger('pdCndLstLoaded');
    	},
    	
    	fn_createTable : function(tbList, readableFormYn, pColCount, pTotalColumnCount) {
			var tbl = "";
			var tbListCnt = tbList.length;
			var loopCnt   = 0; 
			tbl += "<table class=\"w-100\" id=\"cnd-table\">";
			
			$(tbList).each(function (pIdx, pData) {
				
				var label = pData.cndNm;
				var pdCndValAsReadableForm = pData.pdCndValAsReadableForm;
				var className = pData.cndCd;
				var align = "left";
				
				if(label===null){
					label = pData.cndCd;
				}				
	
				//1 column base html tag  = 1.<th> : label  2.<td> : input box 3.<th> : msurUnitCd  4.<td> area readableForm 
				//cndTpcd = "01" - 목록형, "02" 이후 ...
				
				//default value set : input box align set 
				if(pData.cndTpCd == "01"){
					align = "left";
				} else {
					align = "right";
				}
				if (loopCnt % pColCount == 0) {
					tbl += "<tr>"
					
				}
				//1.<th> : label 
				if(pData.cndTpCd == "01"||pData.cndTpCd == null){
//					tbl += "    <th data-tooltip=\""+label+"\" style=\"text-align: right;\">"+label+"</th>"; //1
					tbl += "<td class=\"td-w-33\">";
					tbl += "	<div class=\"input-wrap fix-label clr\" >";
					tbl += "		<label class=\"bw-label \"  data-tooltip=\""+label+"\">"+label+"</label>";
					tbl += "		<select class=\"bw-input ipt-select\" data-form-param=\""+pData.cndCd+"\"></select>";
					tbl += "	</div>";
					tbl += "</td>";
		            
				} else {
					if(pdCndValAsReadableForm!=null&&pdCndValAsReadableForm.indexOf('msurUnitNm') != -1 ){
						
						var listCdList = JSON.parse(pData.pdCndVal);			            
			            
						tbl += "<td class=\"td-w-33\">";
						tbl += "	<div class=\"input-wrap fix-label clr\" >";
						tbl += "		<label class=\"bw-label \"  data-tooltip=\""+label+"\">"+label+"</label>";
						tbl += "			<input type=\"text\" class=\"bw-input a-left\"   data-form-param=\""+className+"\" value=\"\" /> ";
//						tbl += "    <th data-tooltip=\""+label+"\" style=\"text-align: right;\">"; //1
//						tbl += "	<font type=\"text\" data-form-param=\""+className+"-msurUnitNm\" \">"+label+" ["+listCdList.msurUnitNm+"]</font></th>";	
//						tbl += "	<th  hidden=\"true\">";
//						tbl += "		<input type=\"text\" data-form-param=\""+className+"msurUnitNm\" value=\""+listCdList.msurUnitCd+"\" class=\"bx-form-item bx-component-small\"/>";
					} else {
//						tbl += "    <th data-tooltip=\""+label+"\" style=\"text-align: right;\">"+label+"</th>"; //1
						tbl += "<td class=\"td-w-33\">";
						tbl += "	<div class=\"input-wrap fix-label clr\" >";
						tbl += "		<label class=\"bw-label \"  data-tooltip=\""+label+"\">"+label+"</label>";
						tbl += "			<input type=\"text\" class=\"bw-input a-left\"   data-form-param=\""+className+"\" value=\"\" /> ";
					} 
				}
				//2.<td> : input box
				if(pData.cndTpCd == "01"||pData.cndTpCd == null){
					//tbl += "	<td class=\"td-w-33\"><span class=\"" +className+"-wrap\"></span></td>"; //2
				} else if(pData.cndTpCd == "02" && pdCndValAsReadableForm!=null&&pdCndValAsReadableForm.indexOf('msurUnitNm') == -1){
//					tbl += "	<td class=\"td-w-33\">";
//					tbl += "		<input type=\"text\" id=\"amount\" data-form-param=\""+className+"\" value=\"\" class=\"bx-form-item bx-component-small\" style=\"float: left; text-align: "+align+";\"/>";
//					tbl += "	</td>";
					tbl += "			<input type=\"text\" class=\"bw-input a-left\" id=\"amount\"  data-form-param=\""+className+"\" value=\"\" />";
//					tbl += "	</td>";
				} else {
					if(pData.pdCndVal!==''){
						var listCdList = JSON.parse(pData.pdCndVal);						
					}else{
						var listCdList = '';
					}
					
					if(pdCndValAsReadableForm!=null&&pdCndValAsReadableForm.indexOf('msurUnitNm') != -1 ){
//						tbl += "	<td class=\"td-w-33\">";
//						tbl += "		<input type=\"text\" data-form-param=\""+className+"\" value=\"\" class=\"bx-form-item bx-component-small\" style=\"float: left; text-align: "+align+";\"/>";
//						tbl += "	</td>";
					}else{
//						tbl += "	<td class=\"td-w-33\">";
//						tbl += "		<input type=\"text\" data-form-param=\""+className+"\" value=\"\" class=\"bx-form-item bx-component-small\" style=\"float: left; text-align: "+align+";\"/>";
//						tbl += "	</td>";
					}
				}
				
				tbl += "</div>";
				tbl += "	</td>";
				tbl += "	<td  class=\"td-w-33\" hidden=\"true\">";
				tbl += "		<input type=\"text\" data-form-param=\""+className+"cndCd\" value=\""+className+"\" class=\"bw-input a-left\"/>";
				tbl += "	</td>";
				
				//4.<td> area readableForm 
				if ( readableFormYn == "Y") {
					tbl += "	<td  class=\"td-w-33\" id=\"readableForm\" colspan=\"3\">";
					tbl += "		<p id=\"readableForm\" data-form-param=\""+className+"-Readable\" style=\"text-align: left;\">"+pdCndValAsReadableForm+"</p>";
					tbl += "	</td>";
					tbl += "</tr>";
					
				//5. </tr> 
				}else if((loopCnt % pColCount + 1) == pColCount ){
						tbl += "</tr>";
				}
				loopCnt+=1;
			});
			
			if(tbListCnt < pColCount ){
				for(var i = tbListCnt; i < pColCount; i++){
					tbl += "<td  class=\"td-w-33\"></td>";
				}
			}
			
			tbl += "</table>";
			return tbl;
		}

        
    } // end return
} // end function