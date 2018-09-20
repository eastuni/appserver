package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * This Enum class is used to classify transfer cycle code for standing order processing
 *
 * Author	Heejung Park
 * History
 *  2015.09.10	initial version for 2.2
 */
@BxmCategory(logicalName = "The deposit transaction distinction code" )
@CbbClassInfo(classType={"ENUM"})
public enum ArrSrchDscdEnum implements IEnum {


	MAIN_ARRANGEMENT                ("1")    // 본계약
	, SUB_ARRANGEMENT               ("2")    // 주계약
	;


	private String value;




	ArrSrchDscdEnum(String value ) { 
    	this.value = value;


    }


    public String getValue() {
		return value;
	}


    public static ArrSrchDscdEnum getEnum (String value){
        for (ArrSrchDscdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (ArrSrchDscdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


