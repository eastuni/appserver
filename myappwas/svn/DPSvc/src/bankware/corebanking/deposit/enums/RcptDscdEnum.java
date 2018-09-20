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
@BxmCategory(logicalName = "Receipt distinction code" )
@CbbClassInfo(classType={"ENUM"})
public enum RcptDscdEnum implements IEnum {


    CASH                   	("00"),    // 현금
    TRNSFR        			("01"),    // 대체
    CHECK     				("02"),    // 자기앞
    OTHER_CHECK         	("03"),    // 기타타점


    ;


    private String value;




    RcptDscdEnum(String value ) {
        this.value = value;


    }


    public String getValue() {
        return value;
    }


    public static RcptDscdEnum getEnum (String value){
        for (RcptDscdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (RcptDscdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


