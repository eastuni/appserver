package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.enums.IEnum;
import bankware.corebanking.frm.app.BizApplicationException;

/**
 * 
 * Author	Kisu Kim
 * History
 */
public enum P2pActvtyEnum implements IEnum{

	AAA		(100,	Integer.MAX_VALUE,	"AAA")
	, AA	(70,	99, 				"AA")
	, A		(50,	69, 				"A")
	, BBB	(40,	49, 				"BBB")
	, BB	(30,	39, 				"BB")
	, B		(20,	29, 				"B")
	, C		(10,	19, 				"C")
	, D		(0,		9, 					"D")
//	, E()
//	, F()
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
	* @param grade		Grade
	*/
	P2pActvtyEnum(int minScore, int maxScore, String grade) {

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

		for(P2pActvtyEnum item: P2pActvtyEnum.values()) {
			if(item.getMinimumScore() <= score && score <= item.getMaximumScore()) {
				return item.getGrade();
			}
		}

		return null;
	}
}
