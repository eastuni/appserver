package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.enums.IEnum;
import bankware.corebanking.frm.app.BizApplicationException;

/**
 * 
 * Author	
 * History
 */
public enum P2pLnRatingEnum implements IEnum{

	AAA		(390,	Integer.MAX_VALUE,	"AAA",	true,	7,	8)
	, AA	(330,	289, 				"AA",	true,	9,	10)
	, A		(280,	329, 				"A",	true,	11,	12)
	, BBB	(240,	279, 				"BBB",	true,	13, 14)
	, BB	(200,	239, 				"BB",	true,	15,	16)
	, B		(160,	199, 				"B",	true,	17,	18)
	, C		(120,	159, 				"C",	true,	19,	20)
	, D		(80,	119, 				"D",	true,	21,	22)
	, E		(50,	79,					"E",	false,	0,	0)
	, F		(0,		49,					"F",	false,	0,	0)
	;

	/** Minimum value */
	private final int minScore;

	/** Maximum value */
	private final int maxScore;

	/** Grade */
	private final String grade;

	/** Limit */
	private final boolean lnAbl;

	/** Minimum interest rate */
	private final double minIntRt;

	/** Maximum interest rate */
	private final double maxIntRt;

	/**
	* Constructor
	*
	* @param minScore	Minimum score
	* @param maxScore	Maximum score
	* @param grade		Grade
	* @param lnAbl		Loan able
	* @param minIntRt	Minimum interest rate
	* @param maxIntRt	Maximum interest rate
	*/
	P2pLnRatingEnum(int minScore, int maxScore, String grade, boolean lnAbl, double minIntRt, double maxIntRt) {

		this.minScore 	= minScore;
		this.maxScore 	= maxScore;
		this.grade 		= grade;
		this.lnAbl		= lnAbl;
		this.minIntRt 	= minIntRt;
		this.maxIntRt 	= maxIntRt;
	}

	/**
	 * Getter method for property minimum score
	 * 
	 * @return minScore
	 */
	public int getMinimumScore() {

		return minScore;
	}

	/**
	 * Getter method for property maximum score
	 * 
	 * @return maxScore
	 */
	public int getMaximumScore() {

		return maxScore;
	}

	/**
	 * Getter method for property grade
	 * 
	 * @return grade
	 */
	public String getGrade() {

		return grade;
	}

	/**
	 * Getter method for property loan able
	 * 
	 * @return lnAble
	 */
	public boolean getLoanAble() {

		return lnAbl;
	}

	/**
	 * Getter method for property minimum interest rate
	 * 
	 * @return minScore
	 */
	public double getMinimumInterestRate() {

		return minIntRt;
	}

	/**
	 * Getter method for property maximum interest rate
	 * 
	 * @return maxScore
	 */
	public double getMaximumInterestRate() {

		return maxIntRt;
	}

	/**
	 * Getter method for property value
	 * 
	 * @return null
	 */
	@Override
	@Deprecated
	public String getValue() {

		return null;
	}

	/**
	 * Get the loan rating by score
	 * 
	 * @param score
	 * @return grade
	 * @throws BizApplicationException 
	 */
	public static String getLoanRatingGradeByScore(int score) throws BizApplicationException {

		if(Integer.valueOf(score) == null) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pLnRatingEnum item: P2pLnRatingEnum.values()) {
			if(item.getMinimumScore() <= score && score <= item.getMaximumScore()) {
				return item.getGrade();
			}
		}

		return null;
	}


}
