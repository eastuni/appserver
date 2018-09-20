<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@page import="java.util.*"%>


<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">
	function submitAction(action) {
		//alert(selectCachenames.value);
		document.myform.action.value = action;
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
	<ul>
		<li><a href="./CacheInfo.jsp">Cache Info</a></li>
		<li><a href="./log4jLevel.jsp">Change Log Level</a></li>
		<li><a href="./RIReport.jsp">RI Report</a></li>
		<li><a href="./RIRules.jsp">RI Rules</a></li>
		<li><a href="./LoaderStatus.jsp">BXM Class Loader Status</a></li>
	</ul>
</body>
</html>
