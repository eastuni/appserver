package bankware.corebanking.accounting.settlement.batch;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.enums.StlmntCrctnDscdEnum;
import bankware.corebanking.accounting.generalledger.interfaces.Coa;
import bankware.corebanking.accounting.settlement.daobatch.AcManualDataRcvDBat;
import bankware.corebanking.accounting.settlement.daobatch.AcStlmntDataRcvDBat;
import bankware.corebanking.accounting.settlement.daobatch.AcStlmntGlMBat;
import bankware.corebanking.accounting.settlement.daobatch.dto.AcManualDataRcvDBatIO;
import bankware.corebanking.accounting.settlement.daobatch.dto.AcStlmntDataRcvDBatIO;
import bankware.corebanking.accounting.settlement.daobatch.dto.AcStlmntGlMBatIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.enums.BsisDscdEnum;
import bankware.corebanking.core.accounting.enums.DbtcdtdscdEnum;
import bankware.corebanking.core.accounting.generalledger.interfaces.dto.CoaDtlIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * @file         bankware.corebanking.accounting.settlement.batch.StlmntCrctn.java
 * @filetype     java source file
 * @brief		  
 * @author       Yoonyeong Ha
 * @version      0.1
 * @history
 * <pre>
 * 버전          				성명                   		일자              			변경내용
 * -------       ----------------       -----------       -----------------
 * 0.1           	Yoonyeong Ha       	2017. 09. 11.       	신규 작성
 * </pre>
 */

@BxmBean("StlmntCrctn")
@Scope("step")
@BxmCategory(logicalName = "Settlement Correction", description = "결산보정처리")
public class StlmntCrctn implements Tasklet {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private AcStlmntDataRcvDBat 	acStlmntDataRcvDBat;
	private AcManualDataRcvDBat		acManualDataRcvDBat;
	private AcStlmntGlMBat 			acStlmntGlMBat;
	private CmnContext				cmnContext;
	private Coa						coa;

	private String					instCd;
	private String					baseDt;
	private Integer					maxStlmntNth;

	@Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {

		/*
		 * [결산보정처리 배치]
		 * 업무팀에서 넘겨 받은 보정자료를 결산시스템의 결산원장에 반영하는 프로세스
		 */
		instCd = _getCmnContext().getInstCode(); // 기관코드
		baseDt = (String)arg1.getStepContext().getJobExecutionContext().get("baseDt"); // 작업일자
		maxStlmntNth = _getAcStlmntGlMBat().selectMaxStlmntNth(instCd, baseDt); // 결산기준년월일 결산회차 max값
		
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > START");
			logger.debug("## StlmntCrctn > instCd : {}", instCd);
			logger.debug("## StlmntCrctn > baseDt : {}", baseDt);
			logger.debug("## StlmntCrctn > maxStlmntNth : {}", maxStlmntNth);
		}
		
		// 온라인 보정처리
		_processOnlineCrctn();
		
		// 비온라인 보정처리
		_processManualEntryCrctn();
		
		// 결산 후 잔액갱신
		_modifyStlmntAfBal();
		
		
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > END");
		}
		
		return RepeatStatus.FINISHED;
	}
	
	
	/**
	 * Modify Settlement After Balance
	 * 결산 후 잔액 수정
	 * @throws BizApplicationException 
	 */
	private void _modifyStlmntAfBal() throws BizApplicationException {
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > _calculateStlmntAfBal > START");
		}

		// 결산후잔액 업데이트를 위한 결산총계정원장 조회
		List<AcStlmntGlMBatIO> stlmntGlBatList = _getListStlmntGlM();
		
		// 결산후잔액 산출
		for (AcStlmntGlMBatIO inItem : stlmntGlBatList) {
			
			AcStlmntGlMBatIO acStlmntGlMBatIO = new AcStlmntGlMBatIO();
			_getCmnContext().setHeaderColumn(acStlmntGlMBatIO);
			
			acStlmntGlMBatIO.setInstCd(inItem.getInstCd());
			acStlmntGlMBatIO.setStlmntBaseDt(inItem.getStlmntBaseDt());
			acStlmntGlMBatIO.setStlmntNth(inItem.getStlmntNth());
			acStlmntGlMBatIO.setDeptId(inItem.getDeptId());
			acStlmntGlMBatIO.setCrncyCd(inItem.getCrncyCd());
			acStlmntGlMBatIO.setAcctgDscd(inItem.getAcctgDscd());
			acStlmntGlMBatIO.setAcctgItmCd(inItem.getAcctgItmCd());
			acStlmntGlMBatIO.setStlmntAfBal(_calculateStlmntAfBal(inItem));

			// 결산후잔액 update
			_getAcStlmntGlMBat().updateStlmntAfBal(acStlmntGlMBatIO);
		}
		
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > _calculateStlmntAfBal > END");
		}
	}


	/**
	 * Calculate Settlement After Balance
	 * 결산후잔액 산출
	 * @param inItem
	 * @return
	 * @throws BizApplicationException 
	 */
	private BigDecimal _calculateStlmntAfBal(AcStlmntGlMBatIO inItem) throws BizApplicationException {
		
		BigDecimal onlineAccruedAmt = inItem.getOnlineAccruedIncomeAmt().add(inItem.getOnlineAccruedExpnsAmt()); // 온라인 미수/미지급
		BigDecimal manualEntryAccruedAmt = inItem.getManualEntryAccruedIncomeAmt().add(inItem.getManualEntryAccruedExpnsAmt()); // 비온라인 미수/미지급
		BigDecimal onlinePrepaidAmt = inItem.getOnlineUnrndRevenueAmt().add(inItem.getOnlinePrepaidExpnsAmt()); // 온라인 선수/선급
		BigDecimal manualEntryPrepaidAmt = inItem.getManualEntryUnrndRevenueAmt().add(inItem.getManualEntryPrepaidExpnsAmt()); // 비온라인 선수/선급
		

		// 결산후잔액 = 결산전잔액 - 전기보정금액 + 온라인 미수/미지급 + 비온라인 미수/미지급 - 온라인 선수/선급 - 비온라인 선수/선급 + 온라인장부조정 + 비온라인장부조정
		BigDecimal stlmntAfBal = inItem.getStlmntBfBal().subtract(inItem.getPrcdTrmCrctnAmt()).add(onlineAccruedAmt)
				.add(manualEntryAccruedAmt).subtract(onlinePrepaidAmt).subtract(manualEntryPrepaidAmt)
				.add(inItem.getOnlineLdgrAdjstmntAmt()).add(inItem.getManualEntryLdgrAdjstmntAmt());
		
		return stlmntAfBal;
	}


	/**
	 * Get Settlement General Ledger for updating settlement after balance
	 * 결산후잔액 업데이트를 위한 결산총계정원장 조회
	 * @return
	 */
	private List<AcStlmntGlMBatIO> _getListStlmntGlM() {
		
		AcStlmntGlMBatIO in = new AcStlmntGlMBatIO();
		in.setInstCd(instCd);
		in.setStlmntBaseDt(baseDt);
		in.setStlmntNth(maxStlmntNth);
		
		return _getAcStlmntGlMBat().selectList(in);
	}


	/**
	 * Process Manual Entry Correction
	 * 비온라인보정처리
	 * @param instCd
	 * @param baseDt
	 * @throws BizApplicationException 
	 */
	private void _processManualEntryCrctn() throws BizApplicationException {
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > _processManualEntryCrctn > START");
		}
		
		// 수기데이터수보상세 (AC_MANUAL_ENTRY_DATA_RCV_D) 조회 
		List<AcManualDataRcvDBatIO> manualDataRcvList = _getListManualDataRcv();
		
		// 결산총계정기본(AC_STLMNT_GL_M)에 비온라인보정 관련 금액 업데이트
		if (!manualDataRcvList.isEmpty()) {
			
			for (AcManualDataRcvDBatIO inItem : manualDataRcvList) {
				
				CoaDtlIO coa = _getCoa().getCoa(instCd, inItem.getAcctgDscd(), inItem.getAcctgItmCd());
				
				AcStlmntGlMBatIO acStlmntGlMBatIO = new AcStlmntGlMBatIO();
				_getCmnContext().setHeaderColumn(acStlmntGlMBatIO);
				
				// 결산총계정 금액 기본 셋팅
				_setBasicAmt(acStlmntGlMBatIO);
				// 비온라인보정금액 확정
				_setManualEntryCrctnAmt(inItem, coa);
				
				acStlmntGlMBatIO.setInstCd(inItem.getInstCd());// set [기관코드]
				acStlmntGlMBatIO.setStlmntBaseDt(inItem.getStlmntBaseDt());// set [결산기준년월일]
				acStlmntGlMBatIO.setStlmntNth(maxStlmntNth);// set [결산회차]
				acStlmntGlMBatIO.setDeptId(inItem.getDeptId());// set [부서식별자]
				acStlmntGlMBatIO.setCrncyCd(inItem.getCrncyCd());// set [통화코드]
				acStlmntGlMBatIO.setAcctgDscd(inItem.getAcctgDscd());// set [회계구분코드]
				acStlmntGlMBatIO.setAcctgItmCd(inItem.getAcctgItmCd());// set [계정과목코드]
				
				// BS계정일 경우 비온라인장부가액에 보정금액 SET
				if (BsisDscdEnum.BS.getValue().equals(coa.getBsisDscd())) {
					acStlmntGlMBatIO.setManualEntryLdgrAdjstmntAmt(inItem.getCrctnAmt());
				} 
				// IS계정일 경우 미수/미지급/선수/선급 관련 금액에 보정금액 SET
				else {
					acStlmntGlMBatIO.setManualEntryAccruedIncomeAmt(StlmntCrctnDscdEnum.CRCTN_ACCRUED_INCOME.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [비온라인미수수익금액]
					acStlmntGlMBatIO.setManualEntryAccruedExpnsAmt(StlmntCrctnDscdEnum.CRCTN_ACCRUED_EXPNS.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [비온라인미지급비용금액]
					acStlmntGlMBatIO.setManualEntryUnrndRevenueAmt(StlmntCrctnDscdEnum.CRCTN_UNRND_REVENUE.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [비온라인선수수익금액]
					acStlmntGlMBatIO.setManualEntryPrepaidExpnsAmt(StlmntCrctnDscdEnum.CRCTN_PREPAID_EXPNS.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [비온라인선급비용금액]
				}
				
				// 비온라인 보정내역 갱신
				int cnt = _getAcStlmntGlMBat().updateManualEntryAmt(acStlmntGlMBatIO);
				// 업데이트할 내역이 없으면 insert
				if (cnt == 0) {
					_getAcStlmntGlMBat().insert(acStlmntGlMBatIO);
				}
			}
		}
		
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > _processManualEntryCrctn > END");
		}
	}


	/**
	 * Set Manual Entry Correction Amount
	 * 수기보정금액 확정
	 * @param inItem
	 * @param coa2
	 */
	private void _setManualEntryCrctnAmt(AcManualDataRcvDBatIO inItem, CoaDtlIO coa) {
		
		// 차변
		if (DbtcdtdscdEnum.DEBIT.getValue().equals(coa.getDebitCrdtDscd())) {
			// 입금이면 - 출금이면 +
			if (DbtcdtdscdEnum.DEBIT.getValue().equals(inItem.getDebitCrdtDscd())) {
				inItem.setCrctnAmt(inItem.getCrctnAmt().multiply(BigDecimal.valueOf(-1)));
			} else {
				inItem.setCrctnAmt(inItem.getCrctnAmt());
			}
		} 
		// 대변
		else {
			// 입금이면 + 출금이면 -
			if (DbtcdtdscdEnum.DEBIT.getValue().equals(inItem.getDebitCrdtDscd())) {
				inItem.setCrctnAmt(inItem.getCrctnAmt());
			} else {
				inItem.setCrctnAmt(inItem.getCrctnAmt().multiply(BigDecimal.valueOf(-1)));
			}
		}
	}


	/**
	 * Set Basic Amount for Settlement General Ledger Update
	 * 결산총계정원장 업데이트를 위한 기본금액정보 설정
	 * @param acStlmntGlMBatIO
	 */
	private void _setBasicAmt(AcStlmntGlMBatIO acStlmntGlMBatIO) {

		acStlmntGlMBatIO.setStlmntBfBal(BigDecimal.ZERO);// set [결산전잔액]
		acStlmntGlMBatIO.setPrcdTrmCrctnAmt(BigDecimal.ZERO);// set [전기보정금액]
		acStlmntGlMBatIO.setOnlineAccruedIncomeAmt(BigDecimal.ZERO);// set [온라인미수수익금액]
		acStlmntGlMBatIO.setOnlineAccruedExpnsAmt(BigDecimal.ZERO);// set [온라인미지급비용금액]
		acStlmntGlMBatIO.setOnlineUnrndRevenueAmt(BigDecimal.ZERO);// set [온라인선수수익금액]
		acStlmntGlMBatIO.setOnlinePrepaidExpnsAmt(BigDecimal.ZERO);// set [온라인선급비용금액]
		acStlmntGlMBatIO.setManualEntryAccruedIncomeAmt(BigDecimal.ZERO);// set [비온라인미수수익금액]
		acStlmntGlMBatIO.setManualEntryAccruedExpnsAmt(BigDecimal.ZERO);// set [비온라인미지급비용금액]
		acStlmntGlMBatIO.setManualEntryUnrndRevenueAmt(BigDecimal.ZERO);// set [비온라인선수수익금액]
		acStlmntGlMBatIO.setManualEntryPrepaidExpnsAmt(BigDecimal.ZERO);// set [비온라인선급비용금액]
		acStlmntGlMBatIO.setOnlineLdgrAdjstmntAmt(BigDecimal.ZERO);// set [온라인장부조정금액]
		acStlmntGlMBatIO.setManualEntryLdgrAdjstmntAmt(BigDecimal.ZERO);// set [비온라인장부조정금액]
		acStlmntGlMBatIO.setStlmntAfBal(BigDecimal.ZERO);// set [결산후잔액]
		acStlmntGlMBatIO.setAcctgDmnthAcmltdAmt(BigDecimal.ZERO);// set [계리월중적수]
		acStlmntGlMBatIO.setAcctgDtrmAcmltdAmt(BigDecimal.ZERO);// set [계리기중적수]
	}


	/**
	 * Get List of Manual Entry Data Receive History
	 * 결산 수기수보내역 조회
	 * @return
	 */
	private List<AcManualDataRcvDBatIO> _getListManualDataRcv() {

		AcManualDataRcvDBatIO in = new AcManualDataRcvDBatIO();
		in.setInstCd(instCd);
		in.setStlmntBaseDt(baseDt);
		
		return _getAcManualDataRcvDBat().selectListAmtSum(in);
	}


	/**
	 * Process Online Correction
	 * 온라인보정처리
	 * @param baseDt 
	 * @param instCd 
	 * @throws BizApplicationException 
	 */
	private void _processOnlineCrctn() throws BizApplicationException {
		
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > _processOnlineCrctn > START");
		}
		
		// 온라인 수보내역 조회
		List<AcStlmntDataRcvDBatIO> stlmntDataRcvList = _getListStlmntDataRcv();
		
		// 결산총계정원장에 온라인보정 관련 금액 업데이트
		if (!stlmntDataRcvList.isEmpty()) {
			
			for (AcStlmntDataRcvDBatIO inItem : stlmntDataRcvList) {
				
				// 계정과목코드 조회
				CoaDtlIO coa = _getCoa().getCoa(instCd, inItem.getAcctgDscd(), inItem.getAcctgItmCd());
				
				AcStlmntGlMBatIO acStlmntGlMBatIO = new AcStlmntGlMBatIO();
				_getCmnContext().setHeaderColumn(acStlmntGlMBatIO);

				// 결산총계정 기본금액 셋팅
				_setBasicAmt(acStlmntGlMBatIO);
				
				acStlmntGlMBatIO.setInstCd(inItem.getInstCd());// set [기관코드]
				acStlmntGlMBatIO.setStlmntBaseDt(inItem.getStlmntBaseDt());// set [결산기준년월일]
				acStlmntGlMBatIO.setStlmntNth(maxStlmntNth);// set [결산회차]
				acStlmntGlMBatIO.setDeptId(inItem.getDeptId());// set [부서식별자]
				acStlmntGlMBatIO.setCrncyCd(inItem.getCrncyCd());// set [통화코드]
				acStlmntGlMBatIO.setAcctgDscd(inItem.getAcctgDscd());// set [회계구분코드]
				acStlmntGlMBatIO.setAcctgItmCd(inItem.getAcctgItmCd());// set [계정과목코드]
				
				// BS계정일 경우 온라인장부가액에 보정금액 SET
				if (BsisDscdEnum.BS.equals(coa.getBsisDscd())) {
					acStlmntGlMBatIO.setOnlineLdgrAdjstmntAmt(inItem.getCrctnAmt());// set [온라인장부조정금액]
				} 
				// IS계정일 경우 미수/미지급/선수/선급 관련 금액에 보정금액 SET
				else {
					acStlmntGlMBatIO.setOnlineAccruedIncomeAmt(StlmntCrctnDscdEnum.CRCTN_ACCRUED_INCOME.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [온라인미수수익금액]
					acStlmntGlMBatIO.setOnlineAccruedExpnsAmt(StlmntCrctnDscdEnum.CRCTN_ACCRUED_EXPNS.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [온라인미지급비용금액]
					acStlmntGlMBatIO.setOnlineUnrndRevenueAmt(StlmntCrctnDscdEnum.CRCTN_UNRND_REVENUE.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [온라인선수수익금액]
					acStlmntGlMBatIO.setOnlinePrepaidExpnsAmt(StlmntCrctnDscdEnum.CRCTN_PREPAID_EXPNS.getValue().equals
							(inItem.getStlmntCrctnDscd()) ? inItem.getCrctnAmt() : BigDecimal.ZERO);// set [온라인선급비용금액]
				}
				
				// 온라인 보정내역 갱신
				int cnt = _getAcStlmntGlMBat().updateOnlineAmt(acStlmntGlMBatIO);
				// 업데이트할 내역이 없으면 insert
				if (cnt == 0) {
					_getAcStlmntGlMBat().insert(acStlmntGlMBatIO);
				}
			}
		}
		
		if (logger.isDebugEnabled()) {
			logger.debug("## StlmntCrctn > _processOnlineCrctn > END");
		}
	}


	/**
	 * Get List of Settlement Data Receive History
	 * 결산 온라인수보내역 조회
	 * @return
	 */
	private List<AcStlmntDataRcvDBatIO> _getListStlmntDataRcv() {
		
		AcStlmntDataRcvDBatIO in = new AcStlmntDataRcvDBatIO();
		in.setInstCd(instCd);
		in.setStlmntBaseDt(baseDt);
		in.setDataRcvNth(_getAcStlmntDataRcvDBat().selectMaxDataRcvNth(instCd, baseDt)); //set 데이터수보최종회차
		
		return _getAcStlmntDataRcvDBat().selectListAmtSum(in);
	}


	/**
	 * @return the acStlmntDataRcvDBat
	 */
	private AcStlmntDataRcvDBat _getAcStlmntDataRcvDBat() {
		if (acStlmntDataRcvDBat == null) {
			acStlmntDataRcvDBat = (AcStlmntDataRcvDBat) CbbApplicationContext.getBean(AcStlmntDataRcvDBat.class, acStlmntDataRcvDBat);
		}
		return acStlmntDataRcvDBat;
	}

	/**
	 * @return the acManualDataRcvDBat
	 */
	private AcManualDataRcvDBat _getAcManualDataRcvDBat() {
		if (acManualDataRcvDBat == null) {
			acManualDataRcvDBat = (AcManualDataRcvDBat) CbbApplicationContext.getBean(AcManualDataRcvDBat.class, acManualDataRcvDBat);
		}
		return acManualDataRcvDBat;
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
	 * @return the acStlmntGlMBat
	 */
	private AcStlmntGlMBat _getAcStlmntGlMBat() {
		if (acStlmntGlMBat == null) {
			acStlmntGlMBat = (AcStlmntGlMBat) CbbApplicationContext.getBean(AcStlmntGlMBat.class, acStlmntGlMBat);
		}
		return acStlmntGlMBat;
	}
	
	/**
	 * @return the coa
	 */
	private Coa _getCoa() {
		if (coa == null) {
			coa = (Coa) CbbApplicationContext.getBean(Coa.class, coa);
		}
		return coa;
	}
		
}