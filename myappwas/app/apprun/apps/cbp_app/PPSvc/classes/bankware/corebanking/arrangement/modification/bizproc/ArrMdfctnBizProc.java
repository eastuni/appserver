package bankware.corebanking.arrangement.modification.bizproc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrStsChngIn;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("ArrMdfctnBizProc")
@BxmCategory(logicalName = "Arrangement Modification BizProc")
public class ArrMdfctnBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	/**
	 * Set Arrangement Status Change DTO
	 * 
	 * @param arrTx
	 * @return ArrStsChngIn
	 */
	public ArrStsChngIn setArrangementStatusChangeIn(ArrTx arrTx) {

		ArrStsChngIn arrStsChngIn = new ArrStsChngIn();

		arrStsChngIn.setArrStsChngDt(arrTx.getTxDt()); 
		arrStsChngIn.setTxDt(arrTx.getTxDt());
		arrStsChngIn.setTxSeqNbr(arrTx.getTxSeqNbr());

		return arrStsChngIn;
	}
}
