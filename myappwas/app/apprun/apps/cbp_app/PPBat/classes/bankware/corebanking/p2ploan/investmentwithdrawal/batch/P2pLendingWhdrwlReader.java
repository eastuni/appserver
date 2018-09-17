package bankware.corebanking.p2ploan.investmentwithdrawal.batch;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrDeptMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndRng;
import bankware.corebanking.arrangement.enums.ArrDeptRelEnum;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.investmentwithdrawal.batch.dto.P2pLendingWhdrwlIO;
import bankware.corebanking.product.enums.PdCndEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;

/**
 *
 * Author	Kisu Kim
 * History
 *  2016.03.15	initial version for 3.0
 */
@CbbClassInfo(classType={"ITEM_READER"})
@BxmBean("P2pLendingWhdrwlReader")
@Scope("step")
@BxmCategory(logicalName = "P2P 투자자 출금 Reader", description = "투자자 출금 Reader")
public class P2pLendingWhdrwlReader implements ItemStream, ItemReader<P2pLendingWhdrwlIO>{

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CmnContext	cmnContext;
	private ArrDeptMngr	arrDeptMngr;

	private Iterator<ArrReal> iterator;
	private String deptId;
	private String startDt;
	private String endDt;

	@Override
	public P2pLendingWhdrwlIO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {

		P2pLendingWhdrwlIO p2pLendingWhdrwlIO = null;

		if(iterator.hasNext()) {
			Arr arr = (Arr) iterator.next();
			p2pLendingWhdrwlIO = new P2pLendingWhdrwlIO();

			p2pLendingWhdrwlIO.setArrId(arr.getArrId());
			p2pLendingWhdrwlIO.setAplctnAmt(_getApplicationAmount(arr));
		}

		return p2pLendingWhdrwlIO;
	}

	@Override
	public void close() throws ItemStreamException {

		DasUtils.disconnectDasExecutor(iterator);
	}

	@Override
	public void open(ExecutionContext arg0) throws ItemStreamException {

		try {
			List<ArrReal> lnArrList = _getArrDeptMngr().getListArrBasedOnStsHistory(deptId, ArrDeptRelEnum.ACCOUNTING_UNIT, ArrStsEnum.WINNING_BID, ArrStsEnum.WINNING_BID, startDt, endDt);
			List<ArrReal> lendingArrList = new ArrayList<ArrReal>();

			for(int i = 0; i < lnArrList.size(); i++) {
				lendingArrList.add(lnArrList.get(i));
			}

			iterator = lendingArrList.iterator();
		} catch (BizApplicationException e) {
			logger.error("ignore exception: ",e);
		}

		if(iterator == null){
			throw new ItemStreamException("connected result is not prepared.");
		}
	}

	@Override
	public void update(ExecutionContext arg0) throws ItemStreamException {
		// TODO Auto-generated method stub

	}

	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException{

		this.deptId = _getCmnContext().getDeptId();
		this.startDt = _getCmnContext().getTxDate();
		this.endDt = _getCmnContext().getTxDate();
	}

	private BigDecimal _getApplicationAmount(Arr arr) throws BizApplicationException {

		BigDecimal aplctnAmt = new BigDecimal(0);

		ArrCndRng arrCndRng = (ArrCndRng) arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue());
		aplctnAmt = arrCndRng.getRngVal();

		return aplctnAmt;
	}

	/**
	 * @return the cmnContext
	 */
	private CmnContext _getCmnContext() {
		if (cmnContext == null) {
			cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
		}
		return cmnContext;
	}

	/**
	 * @return the arrDeptMngr
	 */
	private ArrDeptMngr _getArrDeptMngr() {
		if (arrDeptMngr == null) {
			arrDeptMngr = (ArrDeptMngr) CbbApplicationContext.getBean(
					ArrDeptMngr.class, arrDeptMngr);
		}
		return arrDeptMngr;
	}
}
