<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@page import="java.lang.*"%>
<%@page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@page import="bankware.corebanking.data.validator.*"%>
<%@page import="java.util.List"%>

<%!public String getRISummary() throws Exception {
		RIValidator instance = RIValidator.getInstance();
		List<RISummary> risList = instance.getRIReports();
		List<RIErrorSummary> errorList = instance.getRIErrorReports();

		String succTable = "<table border=1><tr>" + "<td align='center'>TxDt</td><td align='center'>CmpntCd</td>"
				+ "<td align='center'>TblNn</td><td align='center'>ClmnNm</td>"
				+ "<td align='center'>SeqNbr</td><td align='center'>AtrbtVldtnWayCd</td>"
				+ "<td align='center'>vldtnDesc</td><td align='center'>cnt</td></tr>";

		for (RISummary ris : risList) {
			succTable += "<tr>";
			succTable += "<td>" + ris.getTxDt() + "</td>";
			succTable += "<td>" + ris.getCmpntCd() + "</td>";
			succTable += "<td>" + ris.getTblNm() + "</td>";
			succTable += "<td>" + ris.getClmnNm() + "</td>";
			succTable += "<td>" + ris.getSeqNbr() + "</td>";
			succTable += "<td>" + ris.getAtrbtVldtnWayCd() + "</td>";
			succTable += "<td>" + ris.getVldtnDesc() + "</td>";
			succTable += "<td>" + ris.getCnt() + "</td>";
			succTable += "</tr> ";
		}

		succTable += "</table><br>";

		String errorTable = "<table border=1><tr>" + "<td align='center'>TxDt</td><td align='center'>CmpntCd</td>"
				+ "<td align='center'>TblNn</td><td align='center'>ClmnNm</td>"
				+ "<td align='center'>SeqNbr</td><td align='center'>AtrbtVldtnWayCd</td>"
				+ "<td align='center'>VldtnDesc</td><td align='center'>VldtnRuleCntnt</td><td align='center'>VldtnRsltCntnt</td></tr>";

		for (RIErrorSummary ris : errorList) {
			errorTable += "<tr>";
			errorTable += "<td>" + ris.getTxDt() + "</td>";
			errorTable += "<td>" + ris.getCmpntCd() + "</td>";
			errorTable += "<td>" + ris.getTblNm() + "</td>";
			errorTable += "<td>" + ris.getClmnNm() + "</td>";
			errorTable += "<td>" + ris.getSeqNbr() + "</td>";
			errorTable += "<td>" + ris.getAtrbtVldtnWayCd() + "</td>";
			errorTable += "<td>" + ris.getVldtnDesc() + "</td>";
			errorTable += "<td>" + ris.getVldtnRuleCntnt() + "</td>";
			errorTable += "<td>" + ris.getVldtnRsltCntnt() + "</td>";
			errorTable += "</tr> ";
		}
		errorTable += "</table><br>";

		String result = "| Total Cnt: " + instance.getTotalRIRuleCnt();
		result += "| Query Success Cnt: " + risList.size();
		result += "| Query Error Cnt: " + errorList.size() + " |<br><br>";
		result += "Success List <br>" + succTable + "<hr><br>Error List <br>" + errorTable;
		return result;
	}

	public String fromStr(Serializable o) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ObjectOutputStream oos = new ObjectOutputStream(baos);
		oos.writeObject(o);
		oos.close();
		return baos.toString();
	}

	public String toStr(Object o) throws IOException, Exception {
		if (o == null)
			return "";
		log("" + o.toString());
		String result = new String((byte[]) o, "UTF8");
		return result;
	}%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">

	function submitAction(action) {
		//alert(selectCachenames.value);
		document.myform.action.value=action;
		document.myform.submit();
	}
</script>

<title>List Cache Information</title>
</head>
<body>
	<%
		out.println(new Date(System.currentTimeMillis()) + "<br>");
	%>
	<br>
	RI Report <br>
	<hr><br>
		<%
				out.println(getRISummary());
		%>
	<br><hr><br>

</body>
</html>
