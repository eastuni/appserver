/**
 * DBIO 에디터에서 생성된 파일입니다. 인터페이스 파일을 직접 수정하지 마십시오.
 * @Generated Thu Aug 24 10:36:04 KST 2017
 */
package bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dao;

import bxm.container.annotation.BxmDataAccess;
import bxm.common.annotaion.BxmCategory;
import org.apache.ibatis.annotations.Param;

@SuppressWarnings({ "all" })
@BxmDataAccess(mapper = "bankware/cloudbanking/payment/transaction/periodictrnsfrexctn/batch/dao/ArArrPlnMBat.dbio", datasource = "CBB")
@BxmCategory(logicalName = "ArArrPlnMBat", description = "ArArrPlnMBat")
public interface ArArrPlnMBat
{

	/**
	 * @TestValues 	instCd=;	arrSrvcTpCd=;	baseDt=;
	 */
	@BxmCategory(description = "")
	java.util.List<bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dao.dto.ArArrPlnMIO> selectList(
			@Param("instCd") java.lang.String instCd,
			@Param("arrSrvcTpCd") java.lang.String arrSrvcTpCd,
			@Param("baseDt") java.lang.String baseDt);
}