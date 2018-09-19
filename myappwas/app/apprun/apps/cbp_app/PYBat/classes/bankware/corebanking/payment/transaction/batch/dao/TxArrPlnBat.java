/**
 * DBIO 에디터에서 생성된 파일입니다. 인터페이스 파일을 직접 수정하지 마십시오.
 * @Generated Thu Oct 06 14:58:11 KST 2016
 */
package bankware.corebanking.payment.transaction.batch.dao;

import bxm.container.annotation.BxmDataAccess;
import bxm.common.annotaion.BxmCategory;

@SuppressWarnings({ "all" })
@BxmDataAccess(mapper = "bankware/corebanking/payment/transaction/batch/dao/TxArrPlnBat.dbio", datasource = "CBB")
@BxmCategory(logicalName = "TxArrPlnBat", description = "TxArrPlnBat")
public interface TxArrPlnBat
{

	/**
	 * @TestValues 	instCd=;	arrId=;	acctNbr=;	crncyCd=;	pdCd=;	arrOpnDt=;	arrMtrtyDt=;	arrStsCd=;	intPymntTrmDscd=;	intPymntRqstWayCd=;	trmntnWayDscd=;	baseDt=;	oprtnAcctNbr=;	startPdCd=;	endPdCd=;	plnSeqNbr=;	arrSrvcTpCd=;	nxtExctnPlnHhmm=;
	 */
	@BxmCategory(description = "")
	java.util.List<bankware.corebanking.payment.transaction.batch.dao.dto.TxArrPlnIO> selectPlans(bankware.corebanking.payment.transaction.batch.dao.dto.TxArrPlnIO txArrPlnIO);
}