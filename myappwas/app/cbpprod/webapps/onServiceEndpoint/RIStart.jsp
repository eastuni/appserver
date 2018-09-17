<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@page import="java.lang.*"%>
<%@page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@page import="bankware.corebanking.data.validator.*"%>
<%@page import="java.util.List"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<title>Start RI</title>
</head>
<body>
	<%
		RIValidator instance = RIValidator.getInstance();

		long currentTimeMillis = System.currentTimeMillis();
		long diffTime = currentTimeMillis - instance.getLastRunningTime();
		if (diffTime > 60000L) {
			instance.startRIValidationThread();
		} else {
			long waitTime = (60000L - diffTime) / 1000L;
			out.println("It's Cool Time. Wait " + waitTime + " seconds.");
		}

		String status = "RI Valdation Thread " + (instance.isRunning() ? "is Running." : "is stoped.");
		status += "\n" + instance.getExecutedRuleCnt() + "/" + instance.getTotalRIRuleCnt();
		out.println(status);
	%>
</body>
</html>
