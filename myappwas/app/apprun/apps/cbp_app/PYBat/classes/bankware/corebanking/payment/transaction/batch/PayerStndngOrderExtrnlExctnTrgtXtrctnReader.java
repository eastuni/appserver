package bankware.corebanking.payment.transaction.batch;
 
import java.math.BigDecimal;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.payment.enums.PyBzDscdEnum;
import bankware.corebanking.payment.enums.PyCntrCtIdEnum;
import bankware.corebanking.payment.enums.PyMsgPrcsngStsCdEnum;
import bankware.corebanking.payment.externalInterface.daobatch.PyMsgRcvdBat;
import bankware.corebanking.payment.externalInterface.daobatch.dto.PyMsgRcvdBatIO;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.payment.transaction.batch.dto.PayerStndngOrderExtrnlExctnTrgtIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;
 
/**
 * This abstraction class implements ItemStream and ItemReader.
 * This class is used for extracting target of payer standing order from external.
 *
 * Author	Seungjun Choi
 * History
 *  2016.01.28	initial version for 3.0
 */
@CbbClassInfo(classType={"ITEM_READER"})
@BxmBean("PayerStndngOrderExtrnlExctnTrgtXtrctnReader")
@Scope("step")
@BxmCategory(logicalName = "Payer Standing Order Execution External Target Extraction Reader")
public class PayerStndngOrderExtrnlExctnTrgtXtrctnReader implements ItemStream, ItemReader<PayerStndngOrderExtrnlExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private PyMsgRcvdBat pyMsgRcvdBat;        // Payment Message Received Information Master DBIO
	  
	private Iterator<PyMsgRcvdBatIO> iterator;
	private String instCd;
	private String ccId;
	private String baseDt;
	private BigDecimal dataSeqNbr = BigDecimal.ZERO;
	private int crrntItmCnt = 0;
	private static final String READ_COUNT = "read.count";
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemStream#open(org.springframework.batch.item.ExecutionContext)
	 */
	@Override
	public void open(ExecutionContext executionContext) throws ItemStreamException {
		if(executionContext.containsKey(READ_COUNT)) {
			this.crrntItmCnt = executionContext.getInt(READ_COUNT);
		}
		
		PyMsgRcvdBatIO inParam = new PyMsgRcvdBatIO();
		inParam.setInstCd(instCd); // 기관코드
		inParam.setCcId(ccId); // 센터컷식별자
		inParam.setPrcsngDt(baseDt);
		inParam.setTrnsfrBizKndCd(PyBzDscdEnum.PAYER_STANDING_ORDER.getValue()); // 이체업무구분코드 : 납부자자동이체
		inParam.setMsgPrcsngStsCd(PyMsgPrcsngStsCdEnum.NON_EXTRACTION.getValue()); // 미처리
		
		iterator = _getPyMsgRcvdBat().selectTrnsfrTrgt(inParam).iterator();
		
		/*
		 * Update a processing status of payment external message table
		 */
		inParam.setRsltMsgPrcsngStsCd(PyMsgPrcsngStsCdEnum.ALREADY_EXTRACTION.getValue()); // 처리
		_getPyMsgRcvdBat().updateMsgPrcsSts(inParam);
		
		// FIXME 거래내역 H insert 추가필요
		  
		if(iterator == null) throw new ItemStreamException("connected result is not prepared");
	}

	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemReader#read()
	 */
	@Override
	public PayerStndngOrderExtrnlExctnTrgtIO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException { 
		PayerStndngOrderExtrnlExctnTrgtIO out = null; 
		
		/*
		 * Reading the accounts which were chosen, and set the plan sequence number
		 */
		if(iterator.hasNext()) {
			this.crrntItmCnt++;
			PyMsgRcvdBatIO row = iterator.next();
			
			out = new PayerStndngOrderExtrnlExctnTrgtIO();
			out.setInstCd(row.getInstCd());
			out.setCcId(row.getCcId());
			out.setPrcsngDt(row.getPrcsngDt());
			out.setExtrnlInstCd(row.getExtrnlInstCd());
			out.setFtpFileNm(row.getFtpFileNm());
			out.setDataTpCd(row.getDataTpCd());
			out.setBlockNbr(row.getBlockNbr());
			out.setSeqNbr(row.getSeqNbr());
			out.setDataSeqNbr(row.getDataSeqNbr());
			dataSeqNbr = row.getDataSeqNbr();
			out.setDpstAcctNbr(row.getDpstAcctNbr());
			out.setMnyRcvdBnkCd(row.getMnyRcvdBnkCd());
			out.setTrnsfrAmt(row.getTrnsfrAmt());
		}
		
		/*
		 * 누락된 일련번호가 있는지 검증
		 */
		if(dataSeqNbr.compareTo(new BigDecimal(crrntItmCnt)) != 0) throw new BizApplicationException("AAPSTE0050", null);
		
		return out;
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemStream#update(org.springframework.batch.item.ExecutionContext)
	 */
	@Override
	public void update(ExecutionContext executionContext) throws ItemStreamException {
		executionContext.putInt(READ_COUNT, this.crrntItmCnt);
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemStream#close()
	 */
	@Override
	public void close() throws ItemStreamException {
		DasUtils.disconnectDasExecutor(iterator);
	}
	
	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException {
		// Get the job parameter to set member variable
		this.instCd = (String) stepExecution.getJobExecution().getExecutionContext().get("instCd");
		this.ccId = (String) stepExecution.getJobExecution().getExecutionContext().get("ccId");
		this.baseDt = (String) stepExecution.getJobExecution().getExecutionContext().get("baseDt");
		
		_isPrcsngTrgt();
	}
	
	/**
	 * Input Validation
	 */
	private void _isPrcsngTrgt() throws BizApplicationException {
		// FIXME : 1. 센터컷식별자 검증 / 2. 작업일과 당일 비교 검증 / 3. 작업일의 휴일여부 검증
		String trgtCcId = ccId.substring(0, 6);
		if(logger.isDebugEnabled()) {
			logger.debug("{}==dd=",trgtCcId);
		}
		
		if(PyCntrCtIdEnum.PAYER_STANDING_ORDER_EXTERNAL.getValue().compareTo(trgtCcId) != 0) {
			throw new BizApplicationException("AAPSTE0083", null);
		}else {
			ccId = trgtCcId;
		}
	}

	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution) {
		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())) {
			_debug("@AfterStep step COMMITED");
		}
		
		else if(ExitStatus.FAILED.equals(stepExecution.getExitStatus())) {
			_debug("@AfterStep step FAILED");
		}
		
		return stepExecution.getExitStatus();
	}
	
	private void _debug(String msg) {
		if(logger.isDebugEnabled()) {
			logger.debug(msg);
		}
	}

	/**
	 * @return the pyMsgRcvdBat
	 */
	private PyMsgRcvdBat _getPyMsgRcvdBat() {
		if (pyMsgRcvdBat == null) {
			pyMsgRcvdBat = (PyMsgRcvdBat) CbbApplicationContext.getBean(
					PyMsgRcvdBat.class, pyMsgRcvdBat);
		}
		return pyMsgRcvdBat;
	}
}

