package bankware.corebanking.deposit.modification.bizproc;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.enums.ArrSrvcBlockingEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.deposit.blocking.service.dto.SrvcBlckngTrmntSvcIn;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("DpstMdfctnBizProc")
@BxmCategory(logicalName = "Deposit Modification BizProc")
public class DpstMdfctnBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	/**
	 * Clear Freezing Amount
	 * 
	 * @param arr
	 * @param whdrwlAcctNbr
	 * @param crncyCd
	 * @throws BizApplicationException
	 */
	public void clearFreezingAmount(Arr arr, String whdrwlAcctNbr, String crncyCd) throws BizApplicationException {

		String arrSrvcBlckngSeqNbr = arr.getExtendAttribute(ArrXtnInfoEnum.ARR_SRVC_BLCKNG_SEQ_NBR);

		SrvcBlckngTrmntSvcIn arrSrvcBlckngSvcTrmntnIn = new SrvcBlckngTrmntSvcIn();

		arrSrvcBlckngSvcTrmntnIn.setAcctNbr(whdrwlAcctNbr);
		arrSrvcBlckngSvcTrmntnIn.setArrSrvcBlckngSeqNbr(arrSrvcBlckngSeqNbr);
		arrSrvcBlckngSvcTrmntnIn.setSeqNbr(BigDecimal.ZERO);
		arrSrvcBlckngSvcTrmntnIn.setArrSrvcBlckngCd(ArrSrvcBlockingEnum.RETENTION.getValue()); //지급제한

		CbbInternalServiceExecutor.execute("SDP0500601", arrSrvcBlckngSvcTrmntnIn);
	}
}
