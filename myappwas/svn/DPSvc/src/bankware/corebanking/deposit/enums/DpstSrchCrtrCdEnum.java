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
@BxmCategory(logicalName = "Deposit search criteria code" )
@CbbClassInfo(classType={"ENUM"})
public enum DpstSrchCrtrCdEnum implements IEnum {


    ACCOUNT_NUMBER                   ("1"),    // 계좌번호
    CARD_NUMBER        				 ("2"),    // 카드번호


    ;


    private String value;




    DpstSrchCrtrCdEnum(String value ) {
        this.value = value;


    }


    public String getValue() {
        return value;
    }


    public static DpstSrchCrtrCdEnum getEnum (String value){
        for (DpstSrchCrtrCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (DpstSrchCrtrCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


