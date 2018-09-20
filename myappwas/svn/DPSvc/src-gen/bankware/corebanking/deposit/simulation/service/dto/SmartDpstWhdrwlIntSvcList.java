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
@XmlType(propOrder={"calcnStartDt", "calcnEndDt", "aplyIntRt", "calcnBaseAmt", "intAmt", "nxtLvlAdventAmt"}, name="SmartDpstWhdrwlIntSvcList")
@XmlRootElement(name="SmartDpstWhdrwlIntSvcList")
@SuppressWarnings("all")
public class SmartDpstWhdrwlIntSvcList  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = -1295186122L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

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
	
	
	@BxmOmm_Field(referenceType="reference", description="계산시작종료일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String calcnEndDt  = null;
	
	/**
	 * @Description 계산시작종료일
	 */
	public java.lang.String getCalcnEndDt(){
		return calcnEndDt;
	}
	
	/**
	 * @Description 계산시작종료일
	 */
	@JsonProperty("calcnEndDt")
	public void setCalcnEndDt( java.lang.String calcnEndDt ) {
		isSet_calcnEndDt = true;
		this.calcnEndDt = calcnEndDt;
	}
	
	/** Property set << calcnEndDt >> ]]
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
	 * @Description 적용금리
	 */
	public void setAplyIntRt(java.lang.String value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 적용금리
	 */
	public void setAplyIntRt(double value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 적용금리
	 */
	public void setAplyIntRt(long value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="적용금리", formatType="", format="", align="right", length=18, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal aplyIntRt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 적용금리
	 */
	public java.math.BigDecimal getAplyIntRt(){
		return aplyIntRt;
	}
	
	/**
	 * @Description 적용금리
	 */
	@JsonProperty("aplyIntRt")
	public void setAplyIntRt( java.math.BigDecimal aplyIntRt ) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = aplyIntRt;
	}
	
	/** Property set << aplyIntRt >> ]]
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
	
	@BxmOmm_Field(referenceType="reference", description="계산기준금액", formatType="", format="", align="right", length=18, decimal=2, arrayReference="", fill="", comment="", validationRule="")
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
	* Property set << intAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_intAmt = false;
	
	protected boolean isSet_intAmt()
	{
		return this.isSet_intAmt;
	}
	
	protected void setIsSet_intAmt(boolean value)
	{
		this.isSet_intAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 이자금액
	 */
	public void setIntAmt(java.lang.String value) {
		isSet_intAmt = true;
		this.intAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 이자금액
	 */
	public void setIntAmt(double value) {
		isSet_intAmt = true;
		this.intAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 이자금액
	 */
	public void setIntAmt(long value) {
		isSet_intAmt = true;
		this.intAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="이자금액", formatType="", format="", align="right", length=18, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal intAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 이자금액
	 */
	public java.math.BigDecimal getIntAmt(){
		return intAmt;
	}
	
	/**
	 * @Description 이자금액
	 */
	@JsonProperty("intAmt")
	public void setIntAmt( java.math.BigDecimal intAmt ) {
		isSet_intAmt = true;
		this.intAmt = intAmt;
	}
	
	/** Property set << intAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << nxtLvlAdventAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_nxtLvlAdventAmt = false;
	
	protected boolean isSet_nxtLvlAdventAmt()
	{
		return this.isSet_nxtLvlAdventAmt;
	}
	
	protected void setIsSet_nxtLvlAdventAmt(boolean value)
	{
		this.isSet_nxtLvlAdventAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 다음단계도래금액
	 */
	public void setNxtLvlAdventAmt(java.lang.String value) {
		isSet_nxtLvlAdventAmt = true;
		this.nxtLvlAdventAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 다음단계도래금액
	 */
	public void setNxtLvlAdventAmt(double value) {
		isSet_nxtLvlAdventAmt = true;
		this.nxtLvlAdventAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 다음단계도래금액
	 */
	public void setNxtLvlAdventAmt(long value) {
		isSet_nxtLvlAdventAmt = true;
		this.nxtLvlAdventAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="다음단계도래금액", formatType="", format="", align="right", length=18, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal nxtLvlAdventAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 다음단계도래금액
	 */
	public java.math.BigDecimal getNxtLvlAdventAmt(){
		return nxtLvlAdventAmt;
	}
	
	/**
	 * @Description 다음단계도래금액
	 */
	@JsonProperty("nxtLvlAdventAmt")
	public void setNxtLvlAdventAmt( java.math.BigDecimal nxtLvlAdventAmt ) {
		isSet_nxtLvlAdventAmt = true;
		this.nxtLvlAdventAmt = nxtLvlAdventAmt;
	}
	
	/** Property set << nxtLvlAdventAmt >> ]]
	*******************************************************************************************************************************/

	@Override
	public SmartDpstWhdrwlIntSvcList clone(){
		try{
			SmartDpstWhdrwlIntSvcList object= (SmartDpstWhdrwlIntSvcList)super.clone();
			if ( this.calcnStartDt== null ) object.calcnStartDt = null;
			else{
				object.calcnStartDt = this.calcnStartDt;
			}
			if ( this.calcnEndDt== null ) object.calcnEndDt = null;
			else{
				object.calcnEndDt = this.calcnEndDt;
			}
			if ( this.aplyIntRt== null ) object.aplyIntRt = null;
			else{
				object.aplyIntRt = new java.math.BigDecimal(aplyIntRt.toString());
			}
			if ( this.calcnBaseAmt== null ) object.calcnBaseAmt = null;
			else{
				object.calcnBaseAmt = new java.math.BigDecimal(calcnBaseAmt.toString());
			}
			if ( this.intAmt== null ) object.intAmt = null;
			else{
				object.intAmt = new java.math.BigDecimal(intAmt.toString());
			}
			if ( this.nxtLvlAdventAmt== null ) object.nxtLvlAdventAmt = null;
			else{
				object.nxtLvlAdventAmt = new java.math.BigDecimal(nxtLvlAdventAmt.toString());
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
		result = prime * result + ((calcnStartDt==null)?0:calcnStartDt.hashCode());
		result = prime * result + ((calcnEndDt==null)?0:calcnEndDt.hashCode());
		result = prime * result + ((aplyIntRt==null)?0:aplyIntRt.hashCode());
		result = prime * result + ((calcnBaseAmt==null)?0:calcnBaseAmt.hashCode());
		result = prime * result + ((intAmt==null)?0:intAmt.hashCode());
		result = prime * result + ((nxtLvlAdventAmt==null)?0:nxtLvlAdventAmt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList other = (bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList)obj;
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
		if ( aplyIntRt == null ){
			if ( other.aplyIntRt != null ) return false;
		}
		else if ( !aplyIntRt.equals(other.aplyIntRt) )
			return false;
		if ( calcnBaseAmt == null ){
			if ( other.calcnBaseAmt != null ) return false;
		}
		else if ( !calcnBaseAmt.equals(other.calcnBaseAmt) )
			return false;
		if ( intAmt == null ){
			if ( other.intAmt != null ) return false;
		}
		else if ( !intAmt.equals(other.intAmt) )
			return false;
		if ( nxtLvlAdventAmt == null ){
			if ( other.nxtLvlAdventAmt != null ) return false;
		}
		else if ( !nxtLvlAdventAmt.equals(other.nxtLvlAdventAmt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList:\n");
		sb.append("\tcalcnStartDt: ");
		sb.append(calcnStartDt==null?"null":getCalcnStartDt());
		sb.append("\n");
		sb.append("\tcalcnEndDt: ");
		sb.append(calcnEndDt==null?"null":getCalcnEndDt());
		sb.append("\n");
		sb.append("\taplyIntRt: ");
		sb.append(aplyIntRt==null?"null":getAplyIntRt());
		sb.append("\n");
		sb.append("\tcalcnBaseAmt: ");
		sb.append(calcnBaseAmt==null?"null":getCalcnBaseAmt());
		sb.append("\n");
		sb.append("\tintAmt: ");
		sb.append(intAmt==null?"null":getIntAmt());
		sb.append("\n");
		sb.append("\tnxtLvlAdventAmt: ");
		sb.append(nxtLvlAdventAmt==null?"null":getNxtLvlAdventAmt());
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
	
		messageLen+= 8; /* calcnStartDt */
		messageLen+= 8; /* calcnEndDt */
		messageLen+= 18; /* aplyIntRt */
		messageLen+= 18; /* calcnBaseAmt */
		messageLen+= 18; /* intAmt */
		messageLen+= 18; /* nxtLvlAdventAmt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("calcnStartDt");
	
		fieldNames.add("calcnEndDt");
	
		fieldNames.add("aplyIntRt");
	
		fieldNames.add("calcnBaseAmt");
	
		fieldNames.add("intAmt");
	
		fieldNames.add("nxtLvlAdventAmt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("calcnStartDt", get("calcnStartDt"));
	
		fieldValueMap.put("calcnEndDt", get("calcnEndDt"));
	
		fieldValueMap.put("aplyIntRt", get("aplyIntRt"));
	
		fieldValueMap.put("calcnBaseAmt", get("calcnBaseAmt"));
	
		fieldValueMap.put("intAmt", get("intAmt"));
	
		fieldValueMap.put("nxtLvlAdventAmt", get("nxtLvlAdventAmt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case 1588752793 : /* calcnStartDt */
			return getCalcnStartDt();
		case -1374580334 : /* calcnEndDt */
			return getCalcnEndDt();
		case -1002076683 : /* aplyIntRt */
			return getAplyIntRt();
		case -1141673410 : /* calcnBaseAmt */
			return getCalcnBaseAmt();
		case -1183797415 : /* intAmt */
			return getIntAmt();
		case -690837928 : /* nxtLvlAdventAmt */
			return getNxtLvlAdventAmt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case 1588752793 : /* calcnStartDt */
			setCalcnStartDt((java.lang.String) value);
			return;
		case -1374580334 : /* calcnEndDt */
			setCalcnEndDt((java.lang.String) value);
			return;
		case -1002076683 : /* aplyIntRt */
			setAplyIntRt((java.math.BigDecimal) value);
			return;
		case -1141673410 : /* calcnBaseAmt */
			setCalcnBaseAmt((java.math.BigDecimal) value);
			return;
		case -1183797415 : /* intAmt */
			setIntAmt((java.math.BigDecimal) value);
			return;
		case -690837928 : /* nxtLvlAdventAmt */
			setNxtLvlAdventAmt((java.math.BigDecimal) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
