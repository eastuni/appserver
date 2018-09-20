package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * Product Template Code Enumeration For Virtual Account
 * 
 * @author Jungyeon Lee
 * @history
 * 2017.10.11 Initial
 */
@BxmCategory(logicalName = "Product Template Code Enumeration For Virtual Account")
@CbbClassInfo(classType = { "ENUM" })
public enum VrtlAcctPdTemplateCdEnum implements IEnum {


	PD_TMPLT_VRTL_ACCT_FEE    ("0904010"), // 일회성계약관리(수수료가상계좌)
	PD_TMPLT_VRTL_ACCT_LOAN   ("0904012"), // 사용자전용계약(여신이자상환)
    
    ;


    private String value; // Value


    VrtlAcctPdTemplateCdEnum(String value) {
        this.value = value;
    }


    public String getValue() {
        return value;
    }


    public static VrtlAcctPdTemplateCdEnum getEnum(String value) {
        for (VrtlAcctPdTemplateCdEnum enumObject : values()) {
            if (enumObject.getValue().equals(value)) {
                return enumObject;
            }
        }
        return null;
    }


    public static boolean isValid(String value) {
        for (VrtlAcctPdTemplateCdEnum enumObject : values()) {
            if (enumObject.getValue().equals(value)) {
                return true;
            }
        }
        return false;
    }
}
