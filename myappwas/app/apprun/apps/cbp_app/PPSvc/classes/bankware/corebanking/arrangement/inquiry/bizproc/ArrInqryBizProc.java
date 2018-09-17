package bankware.corebanking.arrangement.inquiry.bizproc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("ArrInqryBizProc")
@BxmCategory(logicalName = "Arrangement Inquiry BizProc")
public class ArrInqryBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrMngr	arrMngr;

	/**
	 * Get Arrangament By Arrangement Identification
	 * 
	 * @param arrId
	 * @return
	 * @throws BizApplicationException
	 */
	public Arr getArrangementByArrangementIdentification(String arrId) throws BizApplicationException {

		Arr arr = _getArrMngr().getArr(arrId);

		if(arr == null) {
			// arrangement is not exist
          throw new BizApplicationException("AAPARE0007", null);
		}

		return arr;
	}

	/**
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
	}
}
