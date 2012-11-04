var scanType = 1;
var strIp;
var startPort;
var endPort;
var cur_port = 0;
var open_port_max = 300;
var closed_port_max = 2000;
var bloked_ports_list = [0,1,7,9,11,13,15,17,19,20,21,22,23,25,37,42,43,53,77,79,87,95,101,102,103,104,109,110,111,113,115,117,119,123,135,139,143,179,389,465,512,513,514,515,526,530,531,532,540,556,563,587,601,636,993,995,2049,4045,6000];
var openPortList = []
var closedPortList = []
var timeoutPortList = []
function portScan () 
{
	//端口扫描主函数
	if(!("WebSocket" in window))
	{
		alert("当前浏览器不支持WebSockets,请使用Chorme|Firefox.");
		return;
	} 
	reset()
	scanType = 1;
	strIp = document.getElementById('InputIP').value;
	startPort = document.getElementById('InputStartPort').value;
	endPort = document.getElementById('InputEndPort').value;
	if (!(check_ip(strIp.split(".")) && check_port(startPort) && check_port(endPort) && (parseInt(endPort) > parseInt(startPort))))
	{
		document.getElementById('result').innerHTML += "<p class=\"text-error\">[-] Invalid ip address or port number.</p>";
		return;
	}
	cur_port = 0;
	openPortList = [];
	closedPortList = [];
	timeoutPortList = [];
	document.getElementById('result').innerHTML +="<p class=\"text-info\">[+] Start scanning....</p>";
	setTimeout("scan_port_ws()",1);
}

function check_ip (arg) {
	//检查IP是否合法
	if(((arg[0] > 0) && (arg[0] <= 223)) && ((arg[1] >= 0) && (arg[1] <= 254)) && ((arg[2] >= 0)&&(arg[2] <= 254)) && ((arg[3] >= 0 )&&(arg[3] <= 254)))
	{
		return true;
	}else
	{
		return false;
	}

}

function check_port (arg) {
	//检查端口是否合法
	if((arg > 0) && (arg < 65535))
	{
		return true;
	}else
	{
		return false;
	}
}

function reset () {
	// 扫描结束重置函数
	document.getElementById('result').innerHTML = "";
}

function scan_port_ws () {
	//使用WebSockets扫描端口
	if(init_port())
	{
		return;
	}
	if(is_blocked(cur_port))
	{
		log("[*] "+cur_port+":BLOCKED:(");
		setTimeout("scan_port_ws()",1);
		return;
	}
	startTime = (new Date).getTime();
	try
	{
		ws = new WebSocket("ws://"+strIp+":"+cur_port);
		setTimeout("check_port_scan_ps()",5);
	}catch(err)
	{
		document.getElementById('result').innerHTML("<p class=\"text-error\">[-] Error raised...scan stoped.</p>");
		return;
	}
}

function check_port_scan_ps () {
	// 实时检查扫描进度并输出
	var interval = (new Date).getTime() - startTime;
	if(ws.readyState == 0)
	{
		if(interval > closed_port_max)
		{
			log("[-] "+cur_port+":TIME OUT:|");
			timeoutPortList.push(cur_port)
			setTimeout("scan_port_ws()",1);
		}else
		{
			setTimeout("check_port_scan_ps()",5);
		}
	}else
	{
		if(interval < open_port_max)
		{
			log("[+] "+cur_port+":OPEN:)");
			openPortList.push(cur_port)
		}else
		{
			log("[-] "+cur_port+":CLOSED:(");
			closedPortList.push(cur_port)
		}
		setTimeout("scan_port_ws()",1);
	}
}

function init_port () 
{
	//每次扫描设置新的IP
	if (cur_port == 0) 
	{
		cur_port = startPort;
	}else if (cur_port == endPort) 
	{
		log("[-] Scan process is stoped.");
		return true;
	}else
	{
		cur_port++;
	}
	return false;
}

function is_blocked (port_number) {
	// 判断当前端口是否在黑名单中
	for(var i=0;i<bloked_ports_list.length;i++)
	{
		if(bloked_ports_list[i] == port_number)
		{
			return true;
		}
	}
	return false;
}

function log (msg) {
	// 实时写入扫描日志
	document.getElementById('result').innerHTML += "<p class=\"text-info\">"+msg+"</p>";
}