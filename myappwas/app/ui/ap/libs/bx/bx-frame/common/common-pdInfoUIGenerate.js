define(
    [
         'bx/common/config'
        , 'bx-component/message/message-alert'
        , 'bx-component/message/message-confirm'
        , 'bx/common/common-info'

    ]
    , function(
        config
        , alertMessage
        , confirmMessage
    ) {

        /* ======================================================================== */
        /* Generate Condition UI By Using Response Data							    */
        /* ======================================================================== */
        fn_generatePdInfo = function (pdCd, format, thatDiv) {

        	var that = this;
            
        	var sParam = {};
        	var cndCdList = ["A0005", "I0067", "L0211", "L0063", "L0149", "D0005", "Y0143", "Y0147", "K0008", "K0009"];
            // 입력 Key값 set
        	sParam.pdCd = pdCd;
        	sParam.cndCdList = cndCdList;
            
            var linkData = {"header": fn_getHeader("SPD0020404"), "PdQrySvcGetPdCndValBriefListIn": sParam};              

            // ajax호출
            bxProxy.post(sUrl, JSON.stringify(linkData),{
            	enableLoading: true,
                success: function(responseData){
              	  if(fn_commonChekResult(responseData)) {
              		_generatePdInfoUIWithData(responseData, format, thatDiv);
                    }
                 }   // end of suucess: fucntion
             });         	
        };

        /* ======================================================================== */
        /* Generate Condition UI By Using Response Data							    */
        /* ======================================================================== */
        _generatePdInfoUIWithData = function (data, format, thatDiv) {
        	
            var displayData = data.PdQrySvcGetPdCndValBriefListOut;
            var cndSection = _generateCnd(displayData.pdCndValBriefList,format);
            var mainSection = "<div class=\"pdInfoMain\" name=\""+displayData.pdCd+ "\">"  + cndSection + "</div>";
           
             $(thatDiv).append(mainSection);
        };

        function _generateCnd(pdCndValBriefList,format) {

            var returnSection = "";
            if (pdCndValBriefList == null || pdCndValBriefList.length < 1) return returnSection;
            var itemCnt = 0;
            var oneItem;

            $(pdCndValBriefList).each(function (idx, data) {
                oneItem = _setCndLabel(data,format);
                //oneItem +=_cndCommon(data,format);
                
/*                switch (data.cndTpCd) {
                    case "01":
                        oneItem += _cndListType(data,format);
                        break;
                    default :
                        oneItem += _cndOtherType(data,format);
                }*/
                
                oneItem += _cndOtherType(data,format);
                returnSection += _buildLine(oneItem, format, itemCnt++);
            });

            returnSection +=_fillBlankcell(format,itemCnt);
            returnSection = "<table class=\"bx-info-table cndAtrbtNm-table\" id=\"cnd-table\">" + returnSection + "</table>";
            return _buildSection(returnSection);
        }

        function _setCndLabel(data,format) {

            var measurementUnit = "";
            var label = data.cndNm;

            var returnString = "<th data-tooltip=\"" + label + "\" style=\"text-align: right;\"> " + label + "</th>";
            return  returnString;
        }
        
        function _cndOtherType (data,format){

            var cndVal = {};

            if (!fn_isEmpty(data.pdCndVal)) {
            	cndVal = JSON.parse(data.cndVal);
            }

            var basicVal = "";
            var disabled = "";
            var returnString = ""


            returnString += "<td>";
            returnString += "<input type=\"text\" value=\""+data.cndVal+"\"  data-form-param=\""+data.cndCd+"\"  class=\"bx-form-item bx-component-small arrCndVal\" style=\"float: left; text-align: right;\" disabled />";
            returnString += "</td>";

            return returnString;
        }

        function _buildLine(oneItem,format,itemCnt) {

            var returnString = oneItem;
            if (itemCnt % format.colCount == 0) {
                returnString = "<tr>" + returnString;
            }

            if ((itemCnt % format.colCount + 1) == format.colCount) {
                returnString += "</tr>";
            }

            return returnString;
        }

        function _fillBlankcell(format,itemCnt) {
            var returnString ="";

            if (itemCnt % format.colCount == 0)  return returnString;

            var loopCnd = format.colCount - itemCnt % format.colCount;

            for(var i = 0; i < loopCnd; i++){
                returnString += "<th></th><td></td>";
            }

            return returnString;
        }

        function _buildSection(inStirng) {
            return ("<section class=\"bx-container bx-panel-body\">" +  inStirng + "</section>");
        }

    }

);  // end of define