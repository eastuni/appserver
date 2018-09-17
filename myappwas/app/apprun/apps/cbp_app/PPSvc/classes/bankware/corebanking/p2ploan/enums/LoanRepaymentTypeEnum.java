package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;

/**
 * Loan Repayment TYpe
 *
 * Author	Hokeun Lee
 * History
 *  2016.01.27	initial version for 3.0
 */
@BxmCategory(logicalName = "Loan Repayment Type")
@CbbClassInfo(classType={"ENUM"})
public enum LoanRepaymentTypeEnum implements IEnum  {

	REGULAR_REPAYMENT("01", "REGULAR REPAYMENT"),     			//repayment Type : regular repayment 
	EARLY_REPAYMENT  ("02", "EARLY REPAYMENT"),     			//repayment Type : early   repayment 
	IRREGULAR_REPAYMENT  ("04", "IRREGULAR REPAYMENT");      	 //repayment Type : irregular repayment

	/** Value */
	private final String value;

	/** Description */
	private final String description;

	/**
	* Constructor
	*
	* @param value      Enum Value
	* @param description Description
	*/
	LoanRepaymentTypeEnum(String value, String description) {
	    this.value = value;
	    this. description = description;
	}

	/**
	* Getter method for property <tt>value</tt>.
	*
	* @return property value of value
	*/
	@Override
	public String getValue() {
	    return value;
	}

	/**
	* Getter method for property <tt>description</tt>.
	*
	* @return property value of description
	*/
	public String getDescription() {
	    return description;
	}

	/**
	* Search Enum value
	* 
	* @param value
	* @return LnRepaymentTypeEnum
	*/
	public static LoanRepaymentTypeEnum getByValue(String value) {
	    for (LoanRepaymentTypeEnum item : LoanRepaymentTypeEnum.values()) {
	        if (value.equals(item.getValue())) {
	            return item;
	        }
	    }
	    return null;
	}

	/**
	* Search Enum value
	* 
	* @param description
	* @return AplctnStsCdEnum
	*/
	public static LoanRepaymentTypeEnum getByDescription(String description) {
	    for (LoanRepaymentTypeEnum item : LoanRepaymentTypeEnum.values()) {
	        if (description.equals(item.getDescription())) {
	            return item;
	        }
	    }

	    return null;
	}

	/**
	* Check value
	* 
	* @param value
	* @return 
	*/
	public static boolean isValid(String value) {
	    for (LoanRepaymentTypeEnum item : LoanRepaymentTypeEnum.values()) {
	        if (value.equals(item.getValue())) {
	           return true;
	        }
	    }

	    return false;
	}

}
