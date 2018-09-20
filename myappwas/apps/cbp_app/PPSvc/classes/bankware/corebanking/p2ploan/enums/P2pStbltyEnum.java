package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.enums.IEnum;
import bankware.corebanking.frm.app.BizApplicationException;

/**
 * 
 * Author	
 * History
 */
public enum P2pStbltyEnum implements IEnum{
	AAA		(90,	Integer.MAX_VALUE,	"AAA")
	, AA	(80,	99, 				"AA")
	, A		(70,	79, 				"A")
	, BBB	(60,	69, 				"BBB")
	, BB	(50,	59, 				"BB")
	, B		(40,	49, 				"B")
	, C		(30,	39, 				"C")
	, D		(20,	29, 				"D")
	, E		(10,	19, 				"E")
	, F		(0,		9,					"F")
	;

	/** Minimum value */
	private final int minScore;

	/** Maximum value */
	private final int maxScore;

	/** Grade */
	private final String grade;

	/**
	* Constructor
	*
	* @param minScore	Minimum score
	* @param maxScore	Maximum score
	* @param grade		grade
	*/
	P2pStbltyEnum(int minScore, int maxScore, String grade) {

		this.minScore 	= minScore;
		this.maxScore 	= maxScore;
		this.grade 		= grade;
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
	 * Get the grade by score
	 * 
	 * @param score
	 * @return grade
	 * @throws BizApplicationException 
	 */
	public static String getGradeByScore(int score) throws BizApplicationException {

		if(Integer.valueOf(score) == null) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pStbltyEnum item: P2pStbltyEnum.values()) {
			if(item.getMinimumScore() <= score && score <= item.getMaximumScore()) {
				return item.getGrade();
			}
		}

		return null;
	}
}
