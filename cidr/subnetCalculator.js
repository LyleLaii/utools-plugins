function total(){
    var a=document.getElementById('f').value;
    var b=document.getElementById('s').value;
    var total=Number(a)+Number(b);
    document.getElementById('result').innerHTML=total;
}

var cidr = document.getElementById("cidr");
cidr.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        calculateSubnet();
    }
});

function IPv4(a, b, c, d, nmLen) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.nmLen = nmLen; // nmLen networmMask Lenth

    this.ipS = ""
    this.a2 = "";
    this.b2 = "";
    this.c2 = "";
    this.d2 = "";
    this.nmStr = ""; // nmStr networkMask String
    this.nmPrefix = "" // nmPrefix network prefix

    this.parseCidrStr = function(cidr_str) {
        var s = cidr_str.split('/')
        var ips = s[0].split('.')
        this.a = ips[0]
        this.b = ips[1]
        this.c = ips[2]
        this.d = ips[3]
        this.nmLen = s[1]
    };

    this.transIP = function() {
        var aa = ((parseInt(this.a)<<24)>>>0);
        var bb = ((parseInt(this.b)<<16)>>>0);
        var cc = ((parseInt(this.c)<<8)>>>0);
        var dd = (parseInt(this.d)>>>0);
        this.ipS = (aa + bb + cc + dd).toString(2).padStart(32,'0')
        this.a2 = this.ipS.substr(0, 8)
        this.b2 = this.ipS.substr(8, 8)
        this.c2 = this.ipS.substr(16, 8)
        this.d2 = this.ipS.substr(24, 8)
        this.nmStr = "1".repeat(this.nmLen) + "0".repeat(32 - this.nmLen)
        this.nmPrefix = this.ipS.substr(0, this.nmLen) + "0".repeat(32 - this.nmLen)
      };
    
    this.calcIPRange = function() {
        var np = this.ipS.substr(0, this.nmLen)
        var firstIP = np + "0".repeat(32 - this.nmLen - 1) + "1"
        var lastIP = np + "1".repeat(32 - this.nmLen - 1) + "0"
        var boardcastIP = np + "1".repeat(32 - this.nmLen)
        var availableIPCount = (1 << (32 - this.nmLen)) - 2
        document.getElementById("firstIP").setAttribute("value", IPv4.transBStrToStr(firstIP))
        document.getElementById("lastIP").setAttribute("value", IPv4.transBStrToStr(lastIP))
        document.getElementById("boardcastIP").setAttribute("value", IPv4.transBStrToStr(boardcastIP))
        document.getElementById("availableIPCount").setAttribute("value", availableIPCount)
    }

    this.calcSubNet = function() {
        var subNet = []
        for (let i = this.nmLen; i <= 30; i++) {
            s = "1".repeat(i) + "0".repeat(32 - i)
            s = IPv4.transBStrToStr(s) + '/' + i.toString()
            subNet.push(s)
        }
        return subNet
    }

    this.calcSubNetCount = function() {
        var subNetList = []
        var maxSubNmLen = 32 - this.nmLen - 2
        for (let i = 0; i <= maxSubNmLen; i++) {
            subNetList.push(1 << i)   
        }
        return subNetList
    }

    this.calcSubHostCount = function() {
        var subHostList = []
        var maxSubNmLen = 32 - this.nmLen
        for (let i = maxSubNmLen; i >= 2; i--) {
            subHostList.push((1 << i) - 2)   
        }
        return subHostList
    }

    this.calcSubNetDetail = function(subNmMLen) {
        var subNetDetail = []
        nwPrefixN = parseInt(this.nmPrefix, 2)
        // subNwStep = parseInt("1".repeat(32 - this.nmLen), 2)
        subNwStepLen = 32 - subNmMLen
        subNwStep = 1 << subNwStepLen
        subNwCount = 1 << (subNmMLen - this.nmLen)
        for (let i = 0; i < subNwCount; i++) {
            s = nwPrefixN + subNwStep * i
            s = s.toString(2).padStart(32,'0')
            var subNet = IPv4.transBStrToStr(s)
            var subNetFirst = s.substr(0, subNmMLen) + "0".repeat(subNwStepLen - 1) + "1"
            subNetFirst = IPv4.transBStrToStr(subNetFirst)
            var subNetLast = s.substr(0, subNmMLen) + "1".repeat(subNwStepLen - 1) + "0"
            subNetLast = IPv4.transBStrToStr(subNetLast)
            var subNetBoardcast = s.substr(0, subNmMLen) + "1".repeat(subNwStepLen)
            subNetBoardcast = IPv4.transBStrToStr(subNetBoardcast)

            subNetDetail.push([i, subNet, subNetFirst, subNetLast, subNetBoardcast])
        }
        return subNetDetail
    }

  };

IPv4.transBStrToStr = function(b_str) {
    var a = parseInt(b_str.substr(0, 8), 2)
    var b = parseInt(b_str.substr(8, 8), 2)
    var c = parseInt(b_str.substr(16, 8), 2)
    var d = parseInt(b_str.substr(24, 8), 2)
    var r = a + "." + b + "." + c + "." + d
    return r

}; 

var ip4 = new IPv4();

function calculateSubnet() {
    var cidr_str = cidr.value
    if (!check_ipv4_cidr_format(cidr_str)) {
        document.getElementById("cidr_checker").innerHTML="cidr format error!";
        return
    }
    document.getElementById("cidr_checker").innerHTML="";
    ip4.parseCidrStr(cidr_str)
    ip4.transIP()

    ip4.calcIPRange()

    setSubNet(ip4.calcSubNet())
    setSubNetList(ip4.calcSubNetCount())
    setSubHostList(ip4.calcSubHostCount())

    var subNetDetailData = ip4.calcSubNetDetail(ip4.nmLen)
    updateSubNetDetail(subNetDetailData)


}

function check_ipv4_cidr_format(cidr_str) {
    var re = /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/
    if (re.test(cidr_str)) {
        return true
    } else {
        return false
    }
}

function setSubNet(subNetList){
    var subNet = document.getElementById("subNet");

    clearOptions(subNet)
    for (let i = 0; i < subNetList.length; i++) {
        addOption(subNet, subNetList[i], i)
    }

}

function setSubNetList(subNetList){
    var subNetCount = document.getElementById("subNetCount");

    clearOptions(subNetCount)
    for (let i = 0; i < subNetList.length; i++) {
        addOption(subNetCount, subNetList[i], i)
    }

}

function setSubHostList(subHostCountList){
    var subHostCount = document.getElementById("subHostCount");

    clearOptions(subHostCount)
    for (let i = 0; i < subHostCountList.length; i++) {
        addOption(subHostCount, subHostCountList[i], i)
    }

}

function updateSubNetworkDetail(value) {
    var subNet = document.getElementById("subNet");
    var subNetCount = document.getElementById("subNetCount");
    var subHostCount = document.getElementById("subHostCount");

    selectOption(subNet, value)
    selectOption(subNetCount, value)
    selectOption(subHostCount, value)

    var subNmMLen = getOptionText(subNet, value).split('/')[1]
    subNetDetailData = ip4.calcSubNetDetail(subNmMLen)
    updateSubNetDetail(subNetDetailData)

}

function clearOptions(elementId) {
	var length = elementId.options.length;
	for(var i=length-1;i>=0;i--)
    {
    	elementId.remove(i);
    }
}

function selectOption(elementId, value) {
	for (var i=0;i<elementId.length;i++){
		if(elementId[i].value == value){
			elementId.selectedIndex = i;
			break;
		}
	}
}

function addOption(elementId, text ,value) {
	var optionElement = document.createElement('option');
	optionElement.text = text;
	optionElement.value = value;
	try {
		elementId.add(optionElement, null);
	} catch(e) {
		elementId.add(optionElement);
	}
}

function getOptionText(elementId, value) {
	for (var i=0;i<elementId.length;i++){
		if(elementId[i].value == value){
			return elementId[i].text
		}
	}
}

function updateSubNetDetail(subNetDetail) {
    var subNetDetailTable = document.getElementById("subNetDetail").firstElementChild;

    var tableChild = subNetDetailTable.childNodes;
    
    for (let i = tableChild.length - 1; i > 0; i--) {
        subNetDetailTable.removeChild(tableChild[i])
    }

    for (let i = 0; i < subNetDetail.length; i++) {
        var tr = document.createElement("tr");
        html_s = "<td>" + subNetDetail[i].join("</td><td>") + "</td>"
        tr.innerHTML = html_s
        subNetDetailTable.appendChild(tr)
    }

}

window.onload = calculateSubnet()