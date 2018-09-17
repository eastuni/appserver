<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@page import="java.lang.*"%>
<%@page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@page import="bankware.corebanking.data.validator.*"%>
<%@page import="java.util.List"%>

<%!public String getRISummary() throws Exception {
		List<RIRule> risList = RIValidator.getInstance().getRIRules();

		String tableHtml = "<table border=1><tr>" + "<td align='center'>CmpntCd</td>"
				+ "<td align='center'>TblNn</td><td align='center'>ClmnNm</td>"
				+ "<td align='center'>SeqNbr</td><td align='center'>AtrbtVldtnWayCd</td>"
				+ "<td align='center'>vldtnDesc</td><td align='center'>VldtnRuleCntnt</td>"
				+ "<td align='center'>UseYN</td></tr>";
		for (RIRule ris : risList) {
			tableHtml += "<tr>";
			tableHtml += "<td>" + ris.getCmpntCd() + "</td>";
			tableHtml += "<td>" + ris.getTblNm() + "</td>";
			tableHtml += "<td>" + ris.getClmnNm() + "</td>";
			tableHtml += "<td>" + ris.getSeqNbr() + "</td>";
			tableHtml += "<td>" + ris.getAtrbtVldtnWayCd() + "</td>";
			tableHtml += "<td>" + ris.getVldtnDesc() + "</td>";
			tableHtml += "<td>" + ris.getVldtnRuleCntnt() + "</td>";
			tableHtml += "<td>" + ris.getUseYn() + "</td>";
			tableHtml += "</tr> ";
		}
		tableHtml += "</table><br>";

		String result = "| Total Cnt: " + risList.size()+" |<br><br>";
		result += "Rule List <br>"+ tableHtml;
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
	RI Rules <br>
	<hr><br>
		<%
				out.println(getRISummary());
		%>
	<br><hr><br>

</body>
</html>
