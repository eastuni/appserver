package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.enums.IEnum;
import bankware.corebanking.frm.app.BizApplicationException;

/**
 * 
 * Author	
 * History
 */
public enum P2pCrdtRatingEnum implements IEnum{

	AAA		(300,	Integer.MAX_VALUE,	"AAA",	30000000)
	, AA	(250,	299, 				"AA",	20000000)
	, A		(210,	249, 				"A",	10000000)
	, BBB	(180,	209, 				"BBB",	8000000)
	, BB	(150,	179, 				"BB",	5000000)
	, B		(120,	149, 				"B",	3000000)
	, C		(90,	119, 				"C",	2000000)
	, D		(60,	89, 				"D",	100000)
	, E		(40,	59,					"E",	0)
	, F		(0,		39,					"F",	0)
	;

	/** Minimum value */
	private final int minScore;

	/** Maximum value */
	private final int maxScore;

	/** Grade */
	private final String grade;

	/** Limit */
	private final int limit;

	/**
	* Constructor
	*
	* @param minScore	Minimum score
	* @param maxScore	Maximum score
	* @param grade		Grade
	* @param limit		Limit
	*/
	P2pCrdtRatingEnum(int minScore, int maxScore, String grade, int limit) {

		this.minScore 	= minScore;
		this.maxScore 	= maxScore;
		this.grade 		= grade;
		this.limit		= limit;
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
	 * Getter method for property limit
	 * 
	 * @return limit
	 */
	public int getLimit() {

		return limit;
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
	 * Get the credit rating by score
	 * 
	 * @param score
	 * @return grade
	 * @throws BizApplicationException 
	 */
	public static String getCreditRatingGradeByScore(int score) throws BizApplicationException {

		if(Integer.valueOf(score) == null) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pCrdtRatingEnum item: P2pCrdtRatingEnum.values()) {
			if(item.getMinimumScore() <= score && score <= item.getMaximumScore()) {
				return item.getGrade();
			}
		}

		return null;
	}
}
