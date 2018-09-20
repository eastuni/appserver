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
public enum AccountNuberTypeEnum implements IEnum {


	MAIN_ACCOUNT_NUMBER                ("1"),    // 주계좌번호
	SUB_ACCOUNT_NUMBER                 ("2"),    // 부계좌번호
	MOTHER_ACCOUNT_NUMBER              ("3"),    // 부모계좌번호
	CHILDREN_ACCOUNT_NUMBER            ("4"),    // 자식계좌번호
	;


	private String value;




	AccountNuberTypeEnum(String value ) { 
    	this.value = value;


    }


    public String getValue() {
		return value;
	}


    public static AccountNuberTypeEnum getEnum (String value){
        for (AccountNuberTypeEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (AccountNuberTypeEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


