/******************************************************************************
 * Bxm Object Message Mapping(OMM) - Source Generator V6-1
 *
 * 생성된 자바파일은 수정하지 마십시오.
 * OMM 파일 수정시 Java파일을 덮어쓰게 됩니다.
 *
 ******************************************************************************/

package bankware.corebanking.deposit.simulation.service.dto;


import bxm.omm.annotation.BxmOmm_Field;
import bxm.omm.predict.Predictable;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Hashtable;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlRootElement;
import bxm.omm.root.IOmmObject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import bxm.omm.predict.FieldInfo;

/**
 * @Description 
 */
@XmlType(propOrder={"amtTpCd", "prchsRtrnYn", "dpstWhdrwlDscd", "calcnBaseAmt", "calcnStartDt", "calcnEndDt", "calcnDayCnt", "calcnMnthCnt", "stlmntDtlTpCntnt", "aplyIntRt", "stlmntAmt"}, name="ClsSmltnSvcOutSub")
@XmlRootElement(name="ClsSmltnSvcOutSub")
@SuppressWarnings("all")
public class ClsSmltnSvcOutSub  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = -1100700243L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << amtTpCd >> [[ */
	
	@XmlTransient
	private boolean isSet_amtTpCd = false;
	
	protected boolean isSet_amtTpCd()
	{
		return this.isSet_amtTpCd;
	}
	
	protected void setIsSet_amtTpCd(boolean value)
	{
		this.isSet_amtTpCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="금액유형코드", formatType="", format="", align="left", length=5, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String amtTpCd  = null;
	
	/**
	 * @Description 금액유형코드
	 */
	public java.lang.String getAmtTpCd(){
		return amtTpCd;
	}
	
	/**
	 * @Description 금액유형코드
	 */
	@JsonProperty("amtTpCd")
	public void setAmtTpCd( java.lang.String amtTpCd ) {
		isSet_amtTpCd = true;
		this.amtTpCd = amtTpCd;
	}
	
	/** Property set << amtTpCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << prchsRtrnYn >> [[ */
	
	@XmlTransient
	private boolean isSet_prchsRtrnYn = false;
	
	protected boolean isSet_prchsRtrnYn()
	{
		return this.isSet_prchsRtrnYn;
	}
	
	protected void setIsSet_prchsRtrnYn(boolean value)
	{
		this.isSet_prchsRtrnYn = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="환입환출여부", formatType="", format="", align="left", length=1, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String prchsRtrnYn  = null;
	
	/**
	 * @Description 환입환출여부
	 */
	public java.lang.String getPrchsRtrnYn(){
		return prchsRtrnYn;
	}
	
	/**
	 * @Description 환입환출여부
	 */
	@JsonProperty("prchsRtrnYn")
	public void setPrchsRtrnYn( java.lang.String prchsRtrnYn ) {
		isSet_prchsRtrnYn = true;
		this.prchsRtrnYn = prchsRtrnYn;
	}
	
	/** Property set << prchsRtrnYn >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << dpstWhdrwlDscd >> [[ */
	
	@XmlTransient
	private boolean isSet_dpstWhdrwlDscd = false;
	
	protected boolean isSet_dpstWhdrwlDscd()
	{
		return this.isSet_dpstWhdrwlDscd;
	}
	
	protected void setIsSet_dpstWhdrwlDscd(boolean value)
	{
		this.isSet_dpstWhdrwlDscd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="입출금구분코드", formatType="", format="", align="left", length=1, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String dpstWhdrwlDscd  = null;
	
	/**
	 * @Description 입출금구분코드
	 */
	public java.lang.String getDpstWhdrwlDscd(){
		return dpstWhdrwlDscd;
	}
	
	/**
	 * @Description 입출금구분코드
	 */
	@JsonProperty("dpstWhdrwlDscd")
	public void setDpstWhdrwlDscd( java.lang.String dpstWhdrwlDscd ) {
		isSet_dpstWhdrwlDscd = true;
		this.dpstWhdrwlDscd = dpstWhdrwlDscd;
	}
	
	/** Property set << dpstWhdrwlDscd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << calcnBaseAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_calcnBaseAmt = false;
	
	protected boolean isSet_calcnBaseAmt()
	{
		return this.isSet_calcnBaseAmt;
	}
	
	protected void setIsSet_calcnBaseAmt(boolean value)
	{
		this.isSet_calcnBaseAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 계산기준금액
	 */
	public void setCalcnBaseAmt(java.lang.String value) {
		isSet_calcnBaseAmt = true;
		this.calcnBaseAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 계산기준금액
	 */
	public void setCalcnBaseAmt(double value) {
		isSet_calcnBaseAmt = true;
		this.calcnBaseAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 계산기준금액
	 */
	public void setCalcnBaseAmt(long value) {
		isSet_calcnBaseAmt = true;
		this.calcnBaseAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="계산기준금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal calcnBaseAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 계산기준금액
	 */
	public java.math.BigDecimal getCalcnBaseAmt(){
		return calcnBaseAmt;
	}
	
	/**
	 * @Description 계산기준금액
	 */
	@JsonProperty("calcnBaseAmt")
	public void setCalcnBaseAmt( java.math.BigDecimal calcnBaseAmt ) {
		isSet_calcnBaseAmt = true;
		this.calcnBaseAmt = calcnBaseAmt;
	}
	
	/** Property set << calcnBaseAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << calcnStartDt >> [[ */
	
	@XmlTransient
	private boolean isSet_calcnStartDt = false;
	
	protected boolean isSet_calcnStartDt()
	{
		return this.isSet_calcnStartDt;
	}
	
	protected void setIsSet_calcnStartDt(boolean value)
	{
		this.isSet_calcnStartDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계산시작년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String calcnStartDt  = null;
	
	/**
	 * @Description 계산시작년월일
	 */
	public java.lang.String getCalcnStartDt(){
		return calcnStartDt;
	}
	
	/**
	 * @Description 계산시작년월일
	 */
	@JsonProperty("calcnStartDt")
	public void setCalcnStartDt( java.lang.String calcnStartDt ) {
		isSet_calcnStartDt = true;
		this.calcnStartDt = calcnStartDt;
	}
	
	/** Property set << calcnStartDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << calcnEndDt >> [[ */
	
	@XmlTransient
	private boolean isSet_calcnEndDt = false;
	
	protected boolean isSet_calcnEndDt()
	{
		return this.isSet_calcnEndDt;
	}
	
	protected void setIsSet_calcnEndDt(boolean value)
	{
		this.isSet_calcnEndDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계산종료년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String calcnEndDt  = null;
	
	/**
	 * @Description 계산종료년월일
	 */
	public java.lang.String getCalcnEndDt(){
		return calcnEndDt;
	}
	
	/**
	 * @Description 계산종료년월일
	 */
	@JsonProperty("calcnEndDt")
	public void setCalcnEndDt( java.lang.String calcnEndDt ) {
		isSet_calcnEndDt = true;
		this.calcnEndDt = calcnEndDt;
	}
	
	/** Property set << calcnEndDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << calcnDayCnt >> [[ */
	
	@XmlTransient
	private boolean isSet_calcnDayCnt = false;
	
	protected boolean isSet_calcnDayCnt()
	{
		return this.isSet_calcnDayCnt;
	}
	
	protected void setIsSet_calcnDayCnt(boolean value)
	{
		this.isSet_calcnDayCnt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계산일수", formatType="", format="", align="right", length=3, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.Integer calcnDayCnt  = 0;
	
	/**
	 * @Description 계산일수
	 */
	public java.lang.Integer getCalcnDayCnt(){
		return calcnDayCnt;
	}
	
	/**
	 * @Description 계산일수
	 */
	@JsonProperty("calcnDayCnt")
	public void setCalcnDayCnt( java.lang.Integer calcnDayCnt ) {
		isSet_calcnDayCnt = true;
		this.calcnDayCnt = calcnDayCnt;
	}
	
	/** Property set << calcnDayCnt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << calcnMnthCnt >> [[ */
	
	@XmlTransient
	private boolean isSet_calcnMnthCnt = false;
	
	protected boolean isSet_calcnMnthCnt()
	{
		return this.isSet_calcnMnthCnt;
	}
	
	protected void setIsSet_calcnMnthCnt(boolean value)
	{
		this.isSet_calcnMnthCnt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계산월수", formatType="", format="", align="right", length=5, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.Integer calcnMnthCnt  = 0;
	
	/**
	 * @Description 계산월수
	 */
	public java.lang.Integer getCalcnMnthCnt(){
		return calcnMnthCnt;
	}
	
	/**
	 * @Description 계산월수
	 */
	@JsonProperty("calcnMnthCnt")
	public void setCalcnMnthCnt( java.lang.Integer calcnMnthCnt ) {
		isSet_calcnMnthCnt = true;
		this.calcnMnthCnt = calcnMnthCnt;
	}
	
	/** Property set << calcnMnthCnt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << stlmntDtlTpCntnt >> [[ */
	
	@XmlTransient
	private boolean isSet_stlmntDtlTpCntnt = false;
	
	protected boolean isSet_stlmntDtlTpCntnt()
	{
		return this.isSet_stlmntDtlTpCntnt;
	}
	
	protected void setIsSet_stlmntDtlTpCntnt(boolean value)
	{
		this.isSet_stlmntDtlTpCntnt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="정산상세유형", formatType="", format="", align="left", length=100, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String stlmntDtlTpCntnt  = null;
	
	/**
	 * @Description 정산상세유형
	 */
	public java.lang.String getStlmntDtlTpCntnt(){
		return stlmntDtlTpCntnt;
	}
	
	/**
	 * @Description 정산상세유형
	 */
	@JsonProperty("stlmntDtlTpCntnt")
	public void setStlmntDtlTpCntnt( java.lang.String stlmntDtlTpCntnt ) {
		isSet_stlmntDtlTpCntnt = true;
		this.stlmntDtlTpCntnt = stlmntDtlTpCntnt;
	}
	
	/** Property set << stlmntDtlTpCntnt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << aplyIntRt >> [[ */
	
	@XmlTransient
	private boolean isSet_aplyIntRt = false;
	
	protected boolean isSet_aplyIntRt()
	{
		return this.isSet_aplyIntRt;
	}
	
	protected void setIsSet_aplyIntRt(boolean value)
	{
		this.isSet_aplyIntRt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 적용이율
	 */
	public void setAplyIntRt(java.lang.String value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 적용이율
	 */
	public void setAplyIntRt(double value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 적용이율
	 */
	public void setAplyIntRt(long value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="적용이율", formatType="", format="", align="right", length=8, decimal=4, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal aplyIntRt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 적용이율
	 */
	public java.math.BigDecimal getAplyIntRt(){
		return aplyIntRt;
	}
	
	/**
	 * @Description 적용이율
	 */
	@JsonProperty("aplyIntRt")
	public void setAplyIntRt( java.math.BigDecimal aplyIntRt ) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = aplyIntRt;
	}
	
	/** Property set << aplyIntRt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << stlmntAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_stlmntAmt = false;
	
	protected boolean isSet_stlmntAmt()
	{
		return this.isSet_stlmntAmt;
	}
	
	protected void setIsSet_stlmntAmt(boolean value)
	{
		this.isSet_stlmntAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 정산금액
	 */
	public void setStlmntAmt(java.lang.String value) {
		isSet_stlmntAmt = true;
		this.stlmntAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 정산금액
	 */
	public void setStlmntAmt(double value) {
		isSet_stlmntAmt = true;
		this.stlmntAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 정산금액
	 */
	public void setStlmntAmt(long value) {
		isSet_stlmntAmt = true;
		this.stlmntAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="정산금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal stlmntAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 정산금액
	 */
	public java.math.BigDecimal getStlmntAmt(){
		return stlmntAmt;
	}
	
	/**
	 * @Description 정산금액
	 */
	@JsonProperty("stlmntAmt")
	public void setStlmntAmt( java.math.BigDecimal stlmntAmt ) {
		isSet_stlmntAmt = true;
		this.stlmntAmt = stlmntAmt;
	}
	
	/** Property set << stlmntAmt >> ]]
	*******************************************************************************************************************************/

	@Override
	public ClsSmltnSvcOutSub clone(){
		try{
			ClsSmltnSvcOutSub object= (ClsSmltnSvcOutSub)super.clone();
			if ( this.amtTpCd== null ) object.amtTpCd = null;
			else{
				object.amtTpCd = this.amtTpCd;
			}
			if ( this.prchsRtrnYn== null ) object.prchsRtrnYn = null;
			else{
				object.prchsRtrnYn = this.prchsRtrnYn;
			}
			if ( this.dpstWhdrwlDscd== null ) object.dpstWhdrwlDscd = null;
			else{
				object.dpstWhdrwlDscd = this.dpstWhdrwlDscd;
			}
			if ( this.calcnBaseAmt== null ) object.calcnBaseAmt = null;
			else{
				object.calcnBaseAmt = new java.math.BigDecimal(calcnBaseAmt.toString());
			}
			if ( this.calcnStartDt== null ) object.calcnStartDt = null;
			else{
				object.calcnStartDt = this.calcnStartDt;
			}
			if ( this.calcnEndDt== null ) object.calcnEndDt = null;
			else{
				object.calcnEndDt = this.calcnEndDt;
			}
			if ( this.calcnDayCnt== null ) object.calcnDayCnt = null;
			else{
				object.calcnDayCnt = this.calcnDayCnt;
			}
			if ( this.calcnMnthCnt== null ) object.calcnMnthCnt = null;
			else{
				object.calcnMnthCnt = this.calcnMnthCnt;
			}
			if ( this.stlmntDtlTpCntnt== null ) object.stlmntDtlTpCntnt = null;
			else{
				object.stlmntDtlTpCntnt = this.stlmntDtlTpCntnt;
			}
			if ( this.aplyIntRt== null ) object.aplyIntRt = null;
			else{
				object.aplyIntRt = new java.math.BigDecimal(aplyIntRt.toString());
			}
			if ( this.stlmntAmt== null ) object.stlmntAmt = null;
			else{
				object.stlmntAmt = new java.math.BigDecimal(stlmntAmt.toString());
			}
			
			return object;
		} 
		catch(Exception e){
			throw new bxm.omm.exception.CloneFailedException(e);
		}
	}

	
	@Override
	public int hashCode(){
		final int prime=31;
		int result = 1;
		result = prime * result + ((amtTpCd==null)?0:amtTpCd.hashCode());
		result = prime * result + ((prchsRtrnYn==null)?0:prchsRtrnYn.hashCode());
		result = prime * result + ((dpstWhdrwlDscd==null)?0:dpstWhdrwlDscd.hashCode());
		result = prime * result + ((calcnBaseAmt==null)?0:calcnBaseAmt.hashCode());
		result = prime * result + ((calcnStartDt==null)?0:calcnStartDt.hashCode());
		result = prime * result + ((calcnEndDt==null)?0:calcnEndDt.hashCode());
		result = prime * result + ((calcnDayCnt==null)?0:calcnDayCnt.hashCode());
		result = prime * result + ((calcnMnthCnt==null)?0:calcnMnthCnt.hashCode());
		result = prime * result + ((stlmntDtlTpCntnt==null)?0:stlmntDtlTpCntnt.hashCode());
		result = prime * result + ((aplyIntRt==null)?0:aplyIntRt.hashCode());
		result = prime * result + ((stlmntAmt==null)?0:stlmntAmt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub other = (bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub)obj;
		if ( amtTpCd == null ){
			if ( other.amtTpCd != null ) return false;
		}
		else if ( !amtTpCd.equals(other.amtTpCd) )
			return false;
		if ( prchsRtrnYn == null ){
			if ( other.prchsRtrnYn != null ) return false;
		}
		else if ( !prchsRtrnYn.equals(other.prchsRtrnYn) )
			return false;
		if ( dpstWhdrwlDscd == null ){
			if ( other.dpstWhdrwlDscd != null ) return false;
		}
		else if ( !dpstWhdrwlDscd.equals(other.dpstWhdrwlDscd) )
			return false;
		if ( calcnBaseAmt == null ){
			if ( other.calcnBaseAmt != null ) return false;
		}
		else if ( !calcnBaseAmt.equals(other.calcnBaseAmt) )
			return false;
		if ( calcnStartDt == null ){
			if ( other.calcnStartDt != null ) return false;
		}
		else if ( !calcnStartDt.equals(other.calcnStartDt) )
			return false;
		if ( calcnEndDt == null ){
			if ( other.calcnEndDt != null ) return false;
		}
		else if ( !calcnEndDt.equals(other.calcnEndDt) )
			return false;
		if ( calcnDayCnt == null ){
			if ( other.calcnDayCnt != null ) return false;
		}
		else if ( !calcnDayCnt.equals(other.calcnDayCnt) )
			return false;
		if ( calcnMnthCnt == null ){
			if ( other.calcnMnthCnt != null ) return false;
		}
		else if ( !calcnMnthCnt.equals(other.calcnMnthCnt) )
			return false;
		if ( stlmntDtlTpCntnt == null ){
			if ( other.stlmntDtlTpCntnt != null ) return false;
		}
		else if ( !stlmntDtlTpCntnt.equals(other.stlmntDtlTpCntnt) )
			return false;
		if ( aplyIntRt == null ){
			if ( other.aplyIntRt != null ) return false;
		}
		else if ( !aplyIntRt.equals(other.aplyIntRt) )
			return false;
		if ( stlmntAmt == null ){
			if ( other.stlmntAmt != null ) return false;
		}
		else if ( !stlmntAmt.equals(other.stlmntAmt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub:\n");
		sb.append("\tamtTpCd: ");
		sb.append(amtTpCd==null?"null":getAmtTpCd());
		sb.append("\n");
		sb.append("\tprchsRtrnYn: ");
		sb.append(prchsRtrnYn==null?"null":getPrchsRtrnYn());
		sb.append("\n");
		sb.append("\tdpstWhdrwlDscd: ");
		sb.append(dpstWhdrwlDscd==null?"null":getDpstWhdrwlDscd());
		sb.append("\n");
		sb.append("\tcalcnBaseAmt: ");
		sb.append(calcnBaseAmt==null?"null":getCalcnBaseAmt());
		sb.append("\n");
		sb.append("\tcalcnStartDt: ");
		sb.append(calcnStartDt==null?"null":getCalcnStartDt());
		sb.append("\n");
		sb.append("\tcalcnEndDt: ");
		sb.append(calcnEndDt==null?"null":getCalcnEndDt());
		sb.append("\n");
		sb.append("\tcalcnDayCnt: ");
		sb.append(calcnDayCnt==null?"null":getCalcnDayCnt());
		sb.append("\n");
		sb.append("\tcalcnMnthCnt: ");
		sb.append(calcnMnthCnt==null?"null":getCalcnMnthCnt());
		sb.append("\n");
		sb.append("\tstlmntDtlTpCntnt: ");
		sb.append(stlmntDtlTpCntnt==null?"null":getStlmntDtlTpCntnt());
		sb.append("\n");
		sb.append("\taplyIntRt: ");
		sb.append(aplyIntRt==null?"null":getAplyIntRt());
		sb.append("\n");
		sb.append("\tstlmntAmt: ");
		sb.append(stlmntAmt==null?"null":getStlmntAmt());
		sb.append("\n");
		sb.append("]\n");
	
		return sb.toString();
	}

	/**
	 * Only for Fixed-Length Data
	 */
	@Override
	public long predictMessageLength(){
		long messageLen= 0;
	
		messageLen+= 5; /* amtTpCd */
		messageLen+= 1; /* prchsRtrnYn */
		messageLen+= 1; /* dpstWhdrwlDscd */
		messageLen+= 17; /* calcnBaseAmt */
		messageLen+= 8; /* calcnStartDt */
		messageLen+= 8; /* calcnEndDt */
		messageLen+= 3; /* calcnDayCnt */
		messageLen+= 5; /* calcnMnthCnt */
		messageLen+= 100; /* stlmntDtlTpCntnt */
		messageLen+= 8; /* aplyIntRt */
		messageLen+= 17; /* stlmntAmt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("amtTpCd");
	
		fieldNames.add("prchsRtrnYn");
	
		fieldNames.add("dpstWhdrwlDscd");
	
		fieldNames.add("calcnBaseAmt");
	
		fieldNames.add("calcnStartDt");
	
		fieldNames.add("calcnEndDt");
	
		fieldNames.add("calcnDayCnt");
	
		fieldNames.add("calcnMnthCnt");
	
		fieldNames.add("stlmntDtlTpCntnt");
	
		fieldNames.add("aplyIntRt");
	
		fieldNames.add("stlmntAmt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("amtTpCd", get("amtTpCd"));
	
		fieldValueMap.put("prchsRtrnYn", get("prchsRtrnYn"));
	
		fieldValueMap.put("dpstWhdrwlDscd", get("dpstWhdrwlDscd"));
	
		fieldValueMap.put("calcnBaseAmt", get("calcnBaseAmt"));
	
		fieldValueMap.put("calcnStartDt", get("calcnStartDt"));
	
		fieldValueMap.put("calcnEndDt", get("calcnEndDt"));
	
		fieldValueMap.put("calcnDayCnt", get("calcnDayCnt"));
	
		fieldValueMap.put("calcnMnthCnt", get("calcnMnthCnt"));
	
		fieldValueMap.put("stlmntDtlTpCntnt", get("stlmntDtlTpCntnt"));
	
		fieldValueMap.put("aplyIntRt", get("aplyIntRt"));
	
		fieldValueMap.put("stlmntAmt", get("stlmntAmt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -876138011 : /* amtTpCd */
			return getAmtTpCd();
		case -861544897 : /* prchsRtrnYn */
			return getPrchsRtrnYn();
		case -1262118575 : /* dpstWhdrwlDscd */
			return getDpstWhdrwlDscd();
		case -1141673410 : /* calcnBaseAmt */
			return getCalcnBaseAmt();
		case 1588752793 : /* calcnStartDt */
			return getCalcnStartDt();
		case -1374580334 : /* calcnEndDt */
			return getCalcnEndDt();
		case 297672262 : /* calcnDayCnt */
			return getCalcnDayCnt();
		case 404126299 : /* calcnMnthCnt */
			return getCalcnMnthCnt();
		case -1386931873 : /* stlmntDtlTpCntnt */
			return getStlmntDtlTpCntnt();
		case -1002076683 : /* aplyIntRt */
			return getAplyIntRt();
		case -1104460864 : /* stlmntAmt */
			return getStlmntAmt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -876138011 : /* amtTpCd */
			setAmtTpCd((java.lang.String) value);
			return;
		case -861544897 : /* prchsRtrnYn */
			setPrchsRtrnYn((java.lang.String) value);
			return;
		case -1262118575 : /* dpstWhdrwlDscd */
			setDpstWhdrwlDscd((java.lang.String) value);
			return;
		case -1141673410 : /* calcnBaseAmt */
			setCalcnBaseAmt((java.math.BigDecimal) value);
			return;
		case 1588752793 : /* calcnStartDt */
			setCalcnStartDt((java.lang.String) value);
			return;
		case -1374580334 : /* calcnEndDt */
			setCalcnEndDt((java.lang.String) value);
			return;
		case 297672262 : /* calcnDayCnt */
			setCalcnDayCnt((java.lang.Integer) value);
			return;
		case 404126299 : /* calcnMnthCnt */
			setCalcnMnthCnt((java.lang.Integer) value);
			return;
		case -1386931873 : /* stlmntDtlTpCntnt */
			setStlmntDtlTpCntnt((java.lang.String) value);
			return;
		case -1002076683 : /* aplyIntRt */
			setAplyIntRt((java.math.BigDecimal) value);
			return;
		case -1104460864 : /* stlmntAmt */
			setStlmntAmt((java.math.BigDecimal) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
