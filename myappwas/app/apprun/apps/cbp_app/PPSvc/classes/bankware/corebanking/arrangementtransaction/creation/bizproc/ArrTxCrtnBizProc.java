package bankware.corebanking.arrangementtransaction.creation.bizproc;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.ArrTxStdFrmtIn;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.EntryIn;
import bankware.corebanking.core.settlement.enums.CashTrnsfrEnum;
import bankware.corebanking.core.settlement.enums.DpstWhdrwlEnum;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTxMngr;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("ArrTxCrtnBizProc")
@BxmCategory(logicalName = "Arrangement Transaction Creation BizProc")
public class ArrTxCrtnBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private Cd					cd;
	private ArrCndInqryBizProc	arrCndInqryBizProc;
	private ArrTxMngr			arrTxMngr;

	/**
	 * Create Transaction History
	 * 
	 * @param arr
	 * @return ArrTx
	 * @throws BizApplicationException
	 */
	public ArrTx createArrangementTransactionHistory(Arr arr) throws BizApplicationException {

		ArrTxStdFrmtIn  arrTxStdFrmtIn = new ArrTxStdFrmtIn();

		arrTxStdFrmtIn.setTxCustId(arr.getMainCust().getCustId());
		ArrCndLst arrCndLst = (ArrCndLst) arr.getArrCnd(PdCndEnum.CURRENCY.getValue());
		arrTxStdFrmtIn.setCrncyCd(arrCndLst.getListCd());

		return _getArrTxMngr().createArrTx(arrTxStdFrmtIn, arr);
	}

	/**
	 * Create Transaction history
	 * 
	 * @param arr
	 * @param entryInList
	 * @return ArrTx
	 * @throws BizApplicationException
	 */
	public ArrTx createArrangementTransactionHistory(Arr arr, List<EntryIn> entryInList) throws BizApplicationException {

		// Setting Settlement Transaction Data
		ArrTxStdFrmtIn arrTxStdFrmtIn = new ArrTxStdFrmtIn();
		arrTxStdFrmtIn.setTxCustId(arr.getMainCust().getCustId());

		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		if(crncyCd != null){
			arrTxStdFrmtIn.setCrncyCd(crncyCd);
		}

		if(entryInList != null){
			arrTxStdFrmtIn.setTxEntry(entryInList);
		}

		return _getArrTxMngr().createArrTx(arrTxStdFrmtIn, arr);
	}

	/**
	 * Create Entry List
	 * 
	 * @param arr
	 * @param entryMap
	 * @param entryInList
	 * @param dpstWhdrwlEnum
	 * @return List<EntryIn>
	 * @throws BizApplicationException
	 */
	public List<EntryIn> createEntryInList(Arr arr, HashMap<String, String> entryMap, List<EntryIn> entryInList, DpstWhdrwlEnum dpstWhdrwlEnum) throws BizApplicationException {

		String crncyCd = null;

		// in case that the arrangement is child(lending)
		if(arr.getMthrArr() != null){
			crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getMthrArr().getArrCnd(PdCndEnum.CURRENCY.getValue()));
		}else{
			crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		}

		if(entryInList == null){
			entryInList = new ArrayList<EntryIn>();
		}

		EntryIn entryIn = null;
		for (Map.Entry<String, String> entry : entryMap.entrySet()) {
			entryIn = new EntryIn();

			entryIn.setAmtTpCd(entry.getKey());
			entryIn.setCrncyCd(crncyCd);
			entryIn.setDpstWhdrwlDscd(dpstWhdrwlEnum.getValue());		
			entryIn.setCashTrnsfrDscd(CashTrnsfrEnum.TRNSFR.getValue());
			entryIn.setTxAmt(entry.getValue());

			entryInList.add(entryIn);
		}

		return entryInList;
	}

	/**
	 * Create Remark
	 * 
	 * @param entryMap
	 * @param arr
	 * @return String
	 * @throws BizApplicationException
	 */
	public String createRemark(HashMap<String, String> entryMap, Arr arr) throws BizApplicationException {

		StringBuilder stringBuilder = new StringBuilder();
		stringBuilder.append(arr.getAplctnNbr() + " ( ");

		for (Map.Entry<String, String> entry : entryMap.entrySet()) {
			// 금액유형코드
			if (!stringBuilder.toString().equals(arr.getAplctnNbr() + " ( ")) {
				stringBuilder.append(", ");
			}
			stringBuilder.append(_getCd().getCode("50026", entry.getKey()));
			stringBuilder.append(" : ");
			stringBuilder.append(entry.getValue());
		}
		stringBuilder.append(" ) ");
		return stringBuilder.toString();
	}

	/**
	 * @return the cd
	 */
	private Cd _getCd() {
		if (cd == null) {
			cd = (Cd) CbbApplicationContext.getBean(Cd.class, cd);
		}
		return cd;
	}

	/**
	 * @return the arrCndInqryBizProc
	 */
	private ArrCndInqryBizProc _getArrCndInqryBizProc() {
		if (arrCndInqryBizProc == null) {
			arrCndInqryBizProc = (ArrCndInqryBizProc) CbbApplicationContext.getBean(
					ArrCndInqryBizProc.class, arrCndInqryBizProc);
		}
		return arrCndInqryBizProc;
	}

	/**
	 * @return the arrTxMngr
	 */
	private ArrTxMngr _getArrTxMngr() {
		if (arrTxMngr == null) {
			arrTxMngr = (ArrTxMngr) CbbApplicationContext.getBean(ArrTxMngr.class, arrTxMngr);
		}
		return arrTxMngr;
	}
}
