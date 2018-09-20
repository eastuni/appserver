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
@XmlType(propOrder={"feeCndCd", "feeCndNm", "levyFeeAmt", "bsicFeeAmt", "dscntFeeAmt"}, name="FeeSmltnSvcOutSub")
@XmlRootElement(name="FeeSmltnSvcOutSub")
@SuppressWarnings("all")
public class FeeSmltnSvcOutSub  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = -1687855351L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << feeCndCd >> [[ */
	
	@XmlTransient
	private boolean isSet_feeCndCd = false;
	
	protected boolean isSet_feeCndCd()
	{
		return this.isSet_feeCndCd;
	}
	
	protected void setIsSet_feeCndCd(boolean value)
	{
		this.isSet_feeCndCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="수수료조건코드", formatType="", format="", align="left", length=10, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String feeCndCd  = null;
	
	/**
	 * @Description 수수료조건코드
	 */
	public java.lang.String getFeeCndCd(){
		return feeCndCd;
	}
	
	/**
	 * @Description 수수료조건코드
	 */
	@JsonProperty("feeCndCd")
	public void setFeeCndCd( java.lang.String feeCndCd ) {
		isSet_feeCndCd = true;
		this.feeCndCd = feeCndCd;
	}
	
	/** Property set << feeCndCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << feeCndNm >> [[ */
	
	@XmlTransient
	private boolean isSet_feeCndNm = false;
	
	protected boolean isSet_feeCndNm()
	{
		return this.isSet_feeCndNm;
	}
	
	protected void setIsSet_feeCndNm(boolean value)
	{
		this.isSet_feeCndNm = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="수수료조건명", formatType="", format="", align="left", length=30, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String feeCndNm  = null;
	
	/**
	 * @Description 수수료조건명
	 */
	public java.lang.String getFeeCndNm(){
		return feeCndNm;
	}
	
	/**
	 * @Description 수수료조건명
	 */
	@JsonProperty("feeCndNm")
	public void setFeeCndNm( java.lang.String feeCndNm ) {
		isSet_feeCndNm = true;
		this.feeCndNm = feeCndNm;
	}
	
	/** Property set << feeCndNm >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << levyFeeAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_levyFeeAmt = false;
	
	protected boolean isSet_levyFeeAmt()
	{
		return this.isSet_levyFeeAmt;
	}
	
	protected void setIsSet_levyFeeAmt(boolean value)
	{
		this.isSet_levyFeeAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 징수수수료금액
	 */
	public void setLevyFeeAmt(java.lang.String value) {
		isSet_levyFeeAmt = true;
		this.levyFeeAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 징수수수료금액
	 */
	public void setLevyFeeAmt(double value) {
		isSet_levyFeeAmt = true;
		this.levyFeeAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 징수수수료금액
	 */
	public void setLevyFeeAmt(long value) {
		isSet_levyFeeAmt = true;
		this.levyFeeAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="징수수수료금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal levyFeeAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 징수수수료금액
	 */
	public java.math.BigDecimal getLevyFeeAmt(){
		return levyFeeAmt;
	}
	
	/**
	 * @Description 징수수수료금액
	 */
	@JsonProperty("levyFeeAmt")
	public void setLevyFeeAmt( java.math.BigDecimal levyFeeAmt ) {
		isSet_levyFeeAmt = true;
		this.levyFeeAmt = levyFeeAmt;
	}
	
	/** Property set << levyFeeAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << bsicFeeAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_bsicFeeAmt = false;
	
	protected boolean isSet_bsicFeeAmt()
	{
		return this.isSet_bsicFeeAmt;
	}
	
	protected void setIsSet_bsicFeeAmt(boolean value)
	{
		this.isSet_bsicFeeAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 기본수수료금액
	 */
	public void setBsicFeeAmt(java.lang.String value) {
		isSet_bsicFeeAmt = true;
		this.bsicFeeAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 기본수수료금액
	 */
	public void setBsicFeeAmt(double value) {
		isSet_bsicFeeAmt = true;
		this.bsicFeeAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 기본수수료금액
	 */
	public void setBsicFeeAmt(long value) {
		isSet_bsicFeeAmt = true;
		this.bsicFeeAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="기본수수료금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal bsicFeeAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 기본수수료금액
	 */
	public java.math.BigDecimal getBsicFeeAmt(){
		return bsicFeeAmt;
	}
	
	/**
	 * @Description 기본수수료금액
	 */
	@JsonProperty("bsicFeeAmt")
	public void setBsicFeeAmt( java.math.BigDecimal bsicFeeAmt ) {
		isSet_bsicFeeAmt = true;
		this.bsicFeeAmt = bsicFeeAmt;
	}
	
	/** Property set << bsicFeeAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << dscntFeeAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_dscntFeeAmt = false;
	
	protected boolean isSet_dscntFeeAmt()
	{
		return this.isSet_dscntFeeAmt;
	}
	
	protected void setIsSet_dscntFeeAmt(boolean value)
	{
		this.isSet_dscntFeeAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 할인수수료금액
	 */
	public void setDscntFeeAmt(java.lang.String value) {
		isSet_dscntFeeAmt = true;
		this.dscntFeeAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 할인수수료금액
	 */
	public void setDscntFeeAmt(double value) {
		isSet_dscntFeeAmt = true;
		this.dscntFeeAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 할인수수료금액
	 */
	public void setDscntFeeAmt(long value) {
		isSet_dscntFeeAmt = true;
		this.dscntFeeAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="할인수수료금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal dscntFeeAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 할인수수료금액
	 */
	public java.math.BigDecimal getDscntFeeAmt(){
		return dscntFeeAmt;
	}
	
	/**
	 * @Description 할인수수료금액
	 */
	@JsonProperty("dscntFeeAmt")
	public void setDscntFeeAmt( java.math.BigDecimal dscntFeeAmt ) {
		isSet_dscntFeeAmt = true;
		this.dscntFeeAmt = dscntFeeAmt;
	}
	
	/** Property set << dscntFeeAmt >> ]]
	*******************************************************************************************************************************/

	@Override
	public FeeSmltnSvcOutSub clone(){
		try{
			FeeSmltnSvcOutSub object= (FeeSmltnSvcOutSub)super.clone();
			if ( this.feeCndCd== null ) object.feeCndCd = null;
			else{
				object.feeCndCd = this.feeCndCd;
			}
			if ( this.feeCndNm== null ) object.feeCndNm = null;
			else{
				object.feeCndNm = this.feeCndNm;
			}
			if ( this.levyFeeAmt== null ) object.levyFeeAmt = null;
			else{
				object.levyFeeAmt = new java.math.BigDecimal(levyFeeAmt.toString());
			}
			if ( this.bsicFeeAmt== null ) object.bsicFeeAmt = null;
			else{
				object.bsicFeeAmt = new java.math.BigDecimal(bsicFeeAmt.toString());
			}
			if ( this.dscntFeeAmt== null ) object.dscntFeeAmt = null;
			else{
				object.dscntFeeAmt = new java.math.BigDecimal(dscntFeeAmt.toString());
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
		result = prime * result + ((feeCndCd==null)?0:feeCndCd.hashCode());
		result = prime * result + ((feeCndNm==null)?0:feeCndNm.hashCode());
		result = prime * result + ((levyFeeAmt==null)?0:levyFeeAmt.hashCode());
		result = prime * result + ((bsicFeeAmt==null)?0:bsicFeeAmt.hashCode());
		result = prime * result + ((dscntFeeAmt==null)?0:dscntFeeAmt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub other = (bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub)obj;
		if ( feeCndCd == null ){
			if ( other.feeCndCd != null ) return false;
		}
		else if ( !feeCndCd.equals(other.feeCndCd) )
			return false;
		if ( feeCndNm == null ){
			if ( other.feeCndNm != null ) return false;
		}
		else if ( !feeCndNm.equals(other.feeCndNm) )
			return false;
		if ( levyFeeAmt == null ){
			if ( other.levyFeeAmt != null ) return false;
		}
		else if ( !levyFeeAmt.equals(other.levyFeeAmt) )
			return false;
		if ( bsicFeeAmt == null ){
			if ( other.bsicFeeAmt != null ) return false;
		}
		else if ( !bsicFeeAmt.equals(other.bsicFeeAmt) )
			return false;
		if ( dscntFeeAmt == null ){
			if ( other.dscntFeeAmt != null ) return false;
		}
		else if ( !dscntFeeAmt.equals(other.dscntFeeAmt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub:\n");
		sb.append("\tfeeCndCd: ");
		sb.append(feeCndCd==null?"null":getFeeCndCd());
		sb.append("\n");
		sb.append("\tfeeCndNm: ");
		sb.append(feeCndNm==null?"null":getFeeCndNm());
		sb.append("\n");
		sb.append("\tlevyFeeAmt: ");
		sb.append(levyFeeAmt==null?"null":getLevyFeeAmt());
		sb.append("\n");
		sb.append("\tbsicFeeAmt: ");
		sb.append(bsicFeeAmt==null?"null":getBsicFeeAmt());
		sb.append("\n");
		sb.append("\tdscntFeeAmt: ");
		sb.append(dscntFeeAmt==null?"null":getDscntFeeAmt());
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
	
		messageLen+= 10; /* feeCndCd */
		messageLen+= 30; /* feeCndNm */
		messageLen+= 17; /* levyFeeAmt */
		messageLen+= 17; /* bsicFeeAmt */
		messageLen+= 17; /* dscntFeeAmt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("feeCndCd");
	
		fieldNames.add("feeCndNm");
	
		fieldNames.add("levyFeeAmt");
	
		fieldNames.add("bsicFeeAmt");
	
		fieldNames.add("dscntFeeAmt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("feeCndCd", get("feeCndCd"));
	
		fieldValueMap.put("feeCndNm", get("feeCndNm"));
	
		fieldValueMap.put("levyFeeAmt", get("levyFeeAmt"));
	
		fieldValueMap.put("bsicFeeAmt", get("bsicFeeAmt"));
	
		fieldValueMap.put("dscntFeeAmt", get("dscntFeeAmt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -221618252 : /* feeCndCd */
			return getFeeCndCd();
		case -221617902 : /* feeCndNm */
			return getFeeCndNm();
		case -305553026 : /* levyFeeAmt */
			return getLevyFeeAmt();
		case -1401886355 : /* bsicFeeAmt */
			return getBsicFeeAmt();
		case 1427119996 : /* dscntFeeAmt */
			return getDscntFeeAmt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -221618252 : /* feeCndCd */
			setFeeCndCd((java.lang.String) value);
			return;
		case -221617902 : /* feeCndNm */
			setFeeCndNm((java.lang.String) value);
			return;
		case -305553026 : /* levyFeeAmt */
			setLevyFeeAmt((java.math.BigDecimal) value);
			return;
		case -1401886355 : /* bsicFeeAmt */
			setBsicFeeAmt((java.math.BigDecimal) value);
			return;
		case 1427119996 : /* dscntFeeAmt */
			setDscntFeeAmt((java.math.BigDecimal) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
