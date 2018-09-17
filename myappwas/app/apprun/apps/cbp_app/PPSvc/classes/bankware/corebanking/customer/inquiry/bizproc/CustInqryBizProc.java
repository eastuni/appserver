package bankware.corebanking.customer.inquiry.bizproc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.actor.customer.interfaces.CustMngr;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("CustInqryBizProc")
@BxmCategory(logicalName = "Customer Inquiry BizProc")
public class CustInqryBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CustMngr	custMngr;

	/**
	 * Get Cust By Customer Identification
	 * 
	 * @param custId
	 * @return
	 * @throws BizApplicationException
	 */
	public Cust getCustomerByCustomerIdentification(String custId) throws BizApplicationException {

		Cust cust = _getCustMngr().getCust(custId);

		if(cust == null) {
			throw new BizApplicationException("AAPARE0269", null);
		}

		return cust;
	}

	/**
	 * @return the custMngr
	 */
	private CustMngr _getCustMngr() {
		if (custMngr == null) {
			custMngr = (CustMngr) CbbApplicationContext.getBean(CustMngr.class, custMngr);
		}
		return custMngr;
	}
}
