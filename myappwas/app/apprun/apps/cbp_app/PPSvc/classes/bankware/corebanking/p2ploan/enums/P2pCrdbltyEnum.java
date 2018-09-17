package bankware.corebanking.p2ploan.enums;

import bankware.corebanking.enums.IEnum;
import bankware.corebanking.frm.app.BizApplicationException;

/**
 * 
 * Author	
 * History
 */
public enum P2pCrdbltyEnum implements IEnum{

	AAA		(0,	100,"AAA")
	, AA	(1,	90, "AA")
	, A		(2,	80, "A")
	, BBB	(3,	70, "BBB")
	, BB	(4,	60, "BB")
	, B		(5,	50, "B")
	, C		(6,	40, "C")
	, D		(7,	30, "D")
	, E		(8, 20, "E")
	, F		(9, 10, "F")
	;

	/** Overdue count */
	private final int ovrduCnt;

	/** Score */
	private final int score;

	/** Grade */
	private final String grade;

	/**
	* Constructor
	*
	* @param ovrduCnt	Overdue count
	* @param score		Score
	* @param grade		Grade
	*/
	P2pCrdbltyEnum(int ovrduCnt, int score, String grade) {

		this.ovrduCnt 	= ovrduCnt;
		this.score 		= score;
		this.grade 		= grade;
	}

	/**
	 * Get the overdue count
	 * 
	 * @return ovrduCnt
	 */
	public int getOverdueCount() {

		return ovrduCnt;
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
	 * Get the score by overdue count
	 * 
	 * @return score
	 * @throws BizApplicationException 
	 */
	public static int getScoreByOverdueCount(int ovrduCnt) throws BizApplicationException {

		if(Integer.valueOf(ovrduCnt) == null) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pCrdbltyEnum item: P2pCrdbltyEnum.values()) {
			if(ovrduCnt == item.getOverdueCount()) {
				return item.getScore();
			}
		}
		return 0;
	}

	/**
	 * Get the grade by overdue count
	 * 
	 * @return grade
	 * @throws BizApplicationException 
	 */
	public static String getGradeByOverdueCount(int ovrduCnt) throws BizApplicationException {

		if(Integer.valueOf(ovrduCnt) == null) {
			throw new BizApplicationException("AAAAAAAA", null);
		}

		for(P2pCrdbltyEnum item: P2pCrdbltyEnum.values()) {
			if(ovrduCnt == item.getOverdueCount()) {
				return item.getGrade();
			}
		}

		return P2pCrdbltyEnum.F.getGrade();
	}
}
