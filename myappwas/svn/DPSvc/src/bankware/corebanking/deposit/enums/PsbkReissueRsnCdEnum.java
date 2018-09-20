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
@BxmCategory(logicalName = "Passbook reissue reason code" )
@CbbClassInfo(classType={"ENUM"})
public enum PsbkReissueRsnCdEnum implements IEnum {


	  CARRIED_OVER              ("1")    // 이월
	, LOST        		        ("2")    // 분실
	, DAMAGED                   ("3")    // 훼손
	;


	private String value;




	PsbkReissueRsnCdEnum(String value ) { 
    	this.value = value;


    }


    public String getValue() {
		return value;
	}


    public static PsbkReissueRsnCdEnum getEnum (String value){
        for (PsbkReissueRsnCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (PsbkReissueRsnCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


