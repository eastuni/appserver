package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * Product Type Code Enumeration for Deposit
 * 
 * @author KYLEE
 * @history
 * 2016.01.06 Initial
 */
@BxmCategory(logicalName = "Product Type Code Enumeration")
@CbbClassInfo(classType = { "ENUM" })
public enum DpstPdTypeCdEnum implements IEnum {


    DPST_DEMAND             ("10"), // 요구불
    DPST_INSTALLMENT        ("20"), // 적립식
    DPST_TERM               ("30"), // 거치식
    ;


    private String value; // Value


    DpstPdTypeCdEnum(String value) {
        this.value = value;
    }


    public String getValue() {
        return value;
    }


    public static DpstPdTypeCdEnum getEnum(String value) {
        for (DpstPdTypeCdEnum enumObject : values()) {
            if (enumObject.getValue().equals(value)) {
                return enumObject;
            }
        }
        return null;
    }


    public static boolean isValid(String value) {
        for (DpstPdTypeCdEnum enumObject : values()) {
            if (enumObject.getValue().equals(value)) {
                return true;
            }
        }
        return false;
    }
}
