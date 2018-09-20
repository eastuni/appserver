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
public enum AcctSrchDscdEnum implements IEnum {


    ACCOUNT_SEARCH                   ("1"),    // 계좌조회
    MEMBER_ARRANGEMENT_SEARCH        ("2"),    // 회원계약조회
    FUNDS_PAYMENT_ACCOUNT_SEARCH     ("3"),    // 자금결제계좌조회
    SCF_USE_AGREEMENT_SEARCH         ("4"),    // SCF이용약정조회
    SUSPENSE_ACCOUNT_SEARCH         ("5"),    // 가수가지급계좌조회


    ;


    private String value;




    AcctSrchDscdEnum(String value ) {
        this.value = value;


    }


    public String getValue() {
        return value;
    }


    public static AcctSrchDscdEnum getEnum (String value){
        for (AcctSrchDscdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (AcctSrchDscdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


