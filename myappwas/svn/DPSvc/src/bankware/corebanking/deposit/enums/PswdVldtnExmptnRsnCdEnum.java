package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * This Enum class is used to classify password validation exemption reason code for withdrawal service processing
 *
 * Author	Seunghyun Kim
 * History
 *  2016.05.11	initial version for 3.1
 */
@BxmCategory(logicalName = "Password Validation Exemption Reason Code")
@CbbClassInfo(classType={"ENUM"})
public enum PswdVldtnExmptnRsnCdEnum implements IEnum {


	DELEGATED_BY_CUSTOMER                ("001"),    // 사전고객위임
	SYSTEM_INVOKED		                 ("002"),    // 자동처리
	CENTERCUT							 ("003"),	 // 센터컷
	CANCEL_PAYMENT_CASHBACK				 ("004"),	 // 캐쉬백취소
	INHERITANCE_WITHDRAWAL				 ("005"),	 // 상속출금
	DISTRAINT_REMITTING					 ("006"),	 // 압류추심
	MINUS_PASSBOOK_LOAN					 ("007"),	 // 마이너스통장대출 피해환급금지급 관련
	PAYMENT_GATEWAY						 ("008"),	 // PG망
	;


	private String value;


	PswdVldtnExmptnRsnCdEnum(String value){
		this.value = value;
	}


	public String getValue() {
		return value;
	}


	public static PswdVldtnExmptnRsnCdEnum getEnum (String value){
        for (PswdVldtnExmptnRsnCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (PswdVldtnExmptnRsnCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}
