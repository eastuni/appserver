package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.core.actor.enums.CustGradeKndTpEnum;
import bankware.corebanking.enums.IEnum;

/**
 * 
 * Author	Kisu Kim
 * History
 */
public enum CrdtInvstgtnTpEnum implements IEnum{

	CREDIBILITY	("credibility",		CustGradeKndTpEnum.P2P_CREDIBILITY)
	, OBJECTIVITY("objectivity",	CustGradeKndTpEnum.P2P_OBJECTIVITY)
	, ACTIVITY("activity", 			CustGradeKndTpEnum.P2P_ACTIVITY)
	, STABILITY("stability", 		CustGradeKndTpEnum.P2P_STABILITY)
	, CREDIT_RATING("creditRating", CustGradeKndTpEnum.P2P_CREDIT_RATING)
	, LOAN_RATION("loanRating", 	CustGradeKndTpEnum.P2P_LOAN_RATING)
	;

	/** value */
	private String value;

	/** ENUM */
	private CustGradeKndTpEnum custGradeKndTpEnum;

	/**
	 * Constructor
	 * 
	 * @param value value
	 */
	CrdtInvstgtnTpEnum(String value, CustGradeKndTpEnum custGradeKndTpEnum) {

		this.value = value;
		this.custGradeKndTpEnum = custGradeKndTpEnum;
	}

	@Override
	public String getValue() {

		return value;
	}

	public CustGradeKndTpEnum getCustomerGradeKindTypeEnum() {

		return custGradeKndTpEnum;
	}
}
