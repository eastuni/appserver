package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * Product Template Code Enumeration for Deposit
 * 
 * @author KYLEE
 * @history
 * 2016.01.06 Initial
 */
@BxmCategory(logicalName = "Product Template Code Enumeration For Deposit")
@CbbClassInfo(classType = { "ENUM" })
public enum DpstPdTemplateCdEnum implements IEnum {


	/* 요구불 Demand Deposit */
	DEMAND                  ("0110001"), // 요구불


    /* 적립식 Installment Deposit */
    FIXED_AMOUNT_INSTLMNT   ("0120001"), // 정액적립식
    FREE_AMOUNT_INSTLMNT    ("0120002"), // 자유적립식


    /* 거치식 */
    TERM                    ("0130001"), // 정기예금
    NOTICE                  ("0130004"), // 통지예금
    ;


    private String value; // Value


    DpstPdTemplateCdEnum(String value) {
        this.value = value;
    }


    public String getValue() {
        return value;
    }


    public static DpstPdTemplateCdEnum getEnum(String value) {
        for (DpstPdTemplateCdEnum enumObject : values()) {
            if (enumObject.getValue().equals(value)) {
                return enumObject;
            }
        }
        return null;
    }


    public static boolean isValid(String value) {
        for (DpstPdTemplateCdEnum enumObject : values()) {
            if (enumObject.getValue().equals(value)) {
                return true;
            }
        }
        return false;
    }
}
