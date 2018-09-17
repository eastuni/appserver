package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.enums.IEnum;
import bankware.corebanking.frm.app.BizApplicationException;

/**
 * 
 * Author	Kisu Kim
 * History
 */
public enum P2pObjctvtyEnum implements IEnum{

	AAA		("AAA",	100,	"AAA")
	, AA	("AA",	100,	"AAA")
	, A		("A",	100,	"AAA")
	, BBB	("BBB",	90,		"AA")
	, BB	("BB",	80,		"A")
	, B		("B",	70,		"BBB")
	, CCC	("CCC",	60,		"BB")
	, CC	("CC",	50,		"B")
	, C		("C",	40,		"C")
	, D		("D", 	30,		"D")
	, E		("E", 	20,		"E")
	, F		("F", 	10,		"F")
	;

	/** External credit rating */
	private final String extrnlCrdtRating;

	/** Score */
	private final int score;

	/** Grade */
	private final String grade;

	/**
	* Constructor
	*
	* @param extrnlCrdtRating	External credit rating
	* @param score				Score
	* @param grade				Grade
	*/
	P2pObjctvtyEnum(String extrnlCrdtRating, int score, String grade) {

		this.extrnlCrdtRating	= extrnlCrdtRating;
		this.score 				= score;
		this.grade 				= grade;
	}

	/**
	 * Get the external credit rating
	 * 
	 * @return ovrduCnt
	 */
	public String getExternalCreditRating() {

		return extrnlCrdtRating;
	}

	/**
	 * Get the score
	 * 
	 * @return score
	 */
	public int getScore() {

		return score;
	}

	/**
	 * Get the grade
	 * 
	 * @return grade
	 */
	public String getGrade() {

		return grade;
	}

	/**
	 * Getter method for property value
	 * 
	 * @return val
	 */
	@Override
	@Deprecated
	public String getValue() {

		return null;
	}

	/**
	 * Get the score by external credit rating
	 * 
	 * @return score
	 * @throws BizApplicationException 
	 */
	public static int getScoreByExternalCreditRating(String extrnlCrdtRating) throws BizApplicationException {

		if(StringUtils.isEmpty(extrnlCrdtRating)) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pObjctvtyEnum item: P2pObjctvtyEnum.values()) {
			if(extrnlCrdtRating.equals(item.getExternalCreditRating())) {
				return item.getScore();
			}
		}

		return 0;
	}

	/**
	 * Get the grade by external credit rating
	 * 
	 * @return grade
	 * @throws BizApplicationException 
	 */
	public static String getGradeByExternalCreditRating(String extrnlCrdtRating) throws BizApplicationException {

		if(StringUtils.isEmpty(extrnlCrdtRating)) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pObjctvtyEnum item: P2pObjctvtyEnum.values()) {
			if(extrnlCrdtRating.equals(item.getExternalCreditRating())) {
				return item.getGrade();
			}
		}

		return P2pObjctvtyEnum.F.getGrade();
	}
}
