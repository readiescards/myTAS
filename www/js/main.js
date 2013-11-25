var SERVER_IP_ADDRESS = "192.168.1.75";
//var SERVER_IP_ADDRESS = "192.168.1.6:22005";
//var SERVER_IP_ADDRESS = "82.69.35.201:22003";

var AppState = {asUninitialized: 0, asNotLoggedOn: 1, asLoggedOnAvailable: 2, asLoggedOnDoNotDisturb: 3}; //enums not work in JS as yet
var APP_STATUS = AppState.asUninitialized;

function init() {
    console.log('init');
	if(APP_STATUS!=AppState.asUninitialized)
	{
		console.log('init APP_STATUS!=AppState.asUninitialized');
		return;
	}
	
	"use strict";
    //define the global TAS_NAME for this app
    window.TAS_NAME="myTAS";

    //setup image click reactions
    document.getElementById("submitLoginButton").onclick = submitLogin;
    document.getElementById("butLogout").onclick = butLogoutClicked;
    document.getElementById("butUpdateMe").onclick = butUpdateMeClicked;
    document.getElementById("imgMore").onclick = moreClicked;
    document.getElementById("butSubmitStatus").onclick=butSubmitStatusClicked;

    if(mobilecheck(navigator.userAgent) || mobilecheck(navigator.vendor) )// || mobilecheck(window.opera))
	{
         document.addEventListener('deviceready', onDeviceReady, false);
		 console.log('set on device ready');
	}
    else
        startup();//call directly
};

function onDeviceReady()//called by Cordova
{
    console.log('onDeviceReady');
    startup();
};

function startup()
{
    console.log('startup');
    showAppState();
	
	//does not work parent.document.title=window.TAS_NAME;
    //do we have a username and password if not show login div
    if(typeof(Storage)=="undefined")
    {
        alert("Browser does not support storage");
    }
    else
    {
        if(!localStorage.getItem("username"))
            showPage("loginPage");
        else
        {
            fetchMe();
            fetchMyCalls();
            showPage("mainPage");
			fetchStatuses();
        }
    }

    showAppState();
};

function setNewAppState(newState)
{
    console.log('setNewAppState');
	if(APP_STATUS==newState)
		return;

	APP_STATUS=newState;
	showAppState();
}

function showAppState()
{
    console.log('showAppState');
    if(APP_STATUS==AppState.asLoggedOnAvailable)
        document.images["imgLogo"].src="img/logoAvailable.png";
	else
    if(APP_STATUS==AppState.asLoggedOnDoNotDisturb)
        document.images["imgLogo"].src="img/logoDoNotDisturb.png";
	else
	{
        document.images["imgLogo"].src="img/logoOffline.png";
		
	    var eleMyCurrentStatus = document.getElementById("myCurrentStatus");
		if(!eleMyCurrentStatus)
			throw Error("!eleMyCurrentStatus");
		eleMyCurrentStatus.innerHTML="Offline";		

	    var eleMyCurrentShortNote = document.getElementById("myCurrentShortNote");
		if(!eleMyCurrentShortNote)
			throw Error("!eleMyCurrentShortNote");
		eleMyCurrentShortNote.innerHTML="";		
	}
}

function showPage(pageName)
{
    console.log('showPage');
    var divToShow = document.getElementById(pageName);
    if(divToShow==null)
        alert("no divToShow");
    else
    {
        if(divToShow.style.display=="block")
            return;

        var pages = document.querySelectorAll('[data-app-page]');
        for (var i=0; i<pages.length; i++)
        {
            pages[i].style.display="none";
        }

        divToShow.style.display="block";
    }
}


function submitLogin()
{
    console.log('submitLogin');
	var username = document.getElementById("username");
    if(username==null)
        alert("username=null");

    var password = document.getElementById("password");
    if(password==null)
        alert("password=null");

    var usernameValue = username.value;
    if(usernameValue==null)
        alert("Please enter a username");

    var passwordValue = password.value;
    if(passwordValue==null)
        alert("Please enter a password");

    localStorage.username=usernameValue;
    localStorage.password=passwordValue;

    fetchMe();

    fetchMyCalls();

    showPage("mainPage");
}

function butUpdateMeClicked()
{
    console.log('butUpdateMeClicked');
    try
    {
        var xmlDoc = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<contact>";
		xmlDoc+="<status>"+"In"+"</status>";
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"name_title","Title");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"name_title","Title");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"name_firstname","Firstname");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"name_lastname","Lastname");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"address_1","Address1");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"address_2","Address2");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"address_3","Address3");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"address_4","Address4");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"address_postcode","Postcode");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"address_country","Country");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_email","Email");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_telday","TelDay");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_telext","TelExt");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_televe","TelEve");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_mobile","Mobile");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_telvm","TelVm");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"contact_fax","Fax");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"company_name","Client");
        //setElementByIdToXMLValue(xmlDoc,"company_website","Title");
        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"company_jobtitle","JobTitle");
        xmlDoc+="</contact>";

		console.log(xmlDoc);

        var url='http://'+SERVER_IP_ADDRESS+'/v1/me.xml';
        var basicAuth;

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = reqMeListener;
        oReq.open("put", url, true);
        oReq.setRequestHeader("Authorization", getBasicAuth());
        oReq.setRequestHeader("Content-type","application/xml");
        oReq.send(xmlDoc);
    }
    catch(err)
    {
        txt+="Error: " + err.message + "\n\n";
        alert(txt);
    }
}

function butSubmitStatusClicked()
{
    console.log('butSubmitStatusClicked');
    try
    {
	
	    var radios = document.getElementsByName("contactStatus");

		var statusLabel="";
		for (var i = 0; i < radios.length; i++) 
		{       
			if (radios[i].checked) 
			{
				statusLabel=radios[i].value;
				break;
			}	
		}
		
		if(statusLabel=="")
		{
			alert("Please select a status");
		}

        var xmlDoc = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<contact>";
		xmlDoc+='<status>'+statusLabel+'</status>';
		
		var docElement = document.getElementById('Short_notes');
		if(!docElement)
			throw Error("Missing doc element: "+shortNotes);

		var xmlElement = '<' + 'Short_notes' + '>' + docElement.value + '</' + 'Short_notes' + '>';
		xmlDoc+=xmlElement;
        xmlDoc+="</contact>";
		
		console.log(xmlDoc);

        var url='http://'+SERVER_IP_ADDRESS+'/v1/me.xml';
        var basicAuth;

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = reqMeListener;
        oReq.open("put", url, true);
        oReq.setRequestHeader("Authorization", getBasicAuth());
        oReq.setRequestHeader("Content-type","application/xml");
        oReq.send(xmlDoc);
    }
    catch(err)
    {
        var txt="Error: " + err.message + "\n\n";
        alert(txt);
    }
}

function butLogoutClicked()
{
	logout();
}

function logout()
{
    console.log('logout');
    //localStorage.getItem("password").value="";
    document.getElementById("password").value="";
	setNewAppState(AppState.asNotLoggedOn);
    showPage("loginPage");
}

function getBasicAuth()
{
    console.log('getBasicAuth');
    var logindetails = localStorage.username;
    logindetails+=":";
    logindetails+=localStorage.password;
    basicAuth = "Basic " + Base64.encode(logindetails,Base64.NO_WRAP );

    return basicAuth;
}

function fetchMe()
{
    console.log('fetchMe');
    var txt="";
    try
    {
        var url='http://'+SERVER_IP_ADDRESS+'/v1/me.xml';
        var basicAuth;

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = reqMeListener;
        oReq.open("get", url, true);
        oReq.setRequestHeader("Authorization", getBasicAuth());
        oReq.send("");
    }
    catch(err)
    {
        txt+="Error: " + err.message + "\n\n";
        alert(txt);
    }
}

function fetchMyCalls()
{
    console.log('fetchMyCalls');
    var txt="";
    try
    {
        var url='http://'+SERVER_IP_ADDRESS+'/v1/calls.xml';
        var basicAuth;

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = reqCallsListener;
        oReq.open("get", url, true);
        oReq.setRequestHeader("Authorization", getBasicAuth());
        oReq.send("");
    }
    catch(err)
    {
        txt+="Error: " + err.message + "\n\n";
        alert(txt);
    }
}

function fetchStatuses()
{
    console.log('fetchStatuses');
    var txt="";
    try
    {
        var url='http://'+SERVER_IP_ADDRESS+'/v1/contact_status.xml';
        var basicAuth;

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = evStatusesReceived;
        oReq.open("get", url, true);
        oReq.setRequestHeader("Authorization", getBasicAuth());
        oReq.send("");
    }
    catch(err)
    {
        txt+="Error: " + err.message + "\n\n";
        alert(txt);
    }
}

function submitStatus(status)
{
    console.log('submitStatus');
    try
    {
        var xmlDoc = "<status>";

        xmlDoc=addXMLNodeWithElementIdValue(xmlDoc,"status",status);

        xmlDoc+="</status>";

        var url='http://'+SERVER_IP_ADDRESS+'/v1/contact_status.xml';
        var basicAuth;

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = evSubmittedStatus;
        oReq.open("put", url, true);
        oReq.setRequestHeader("Authorization", getBasicAuth());
        oReq.setRequestHeader("Content-type","application/xml");
        oReq.send(xmlDoc);
    }
    catch(err)
    {
        txt+="Error: " + err.message + "\n\n";
        alert(txt);
    }
}


function getServerTime()
{
    console.log('getServerTime');
    var txt="";
    try
    {
        var url='http://'+SERVER_IP_ADDRESS+'/time.xml';

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("loadstart", loadStart, false);
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);
        oReq.addEventListener("abort", transferCanceled, false);
        oReq.addEventListener("loadend", loadEnd, false);
        oReq.onload = reqTimeListener;
        oReq.open("get", url, true);
        oReq.send("");
    }
    catch(err)
    {
        txt+="Error: " + err.message + "\n\n";
        alert(txt);
    }
}

function loadStart(evt)
{
  //alert("Starting request");
}

function transferComplete(evt)
{
  //alert("The transfer is complete.");
}

function transferFailed(evt)
{
//    alert("Failed to connect to server please check login details.");
    showPage("loginPage");
}

function transferCanceled(evt)
{
//  alert("The transfer has been cancelled by the user.");
}

function loadEnd(e)
{
  //alert("The transfer finished (although we don't know if it succeeded or not).");
}

function reqMeListener()
{
    console.log('reqMeListener');
//    console.log(this.responseText);

    if(this.status!==200)
        throw Error("this.status!==200");

	setNewAppState(AppState.asLoggedOnAvailable);

    var responseMIMEType = this.getResponseHeader('Content-Type');
    var xmlDoc=this.responseXML;

    document.getElementById("login_username").value=localStorage.getItem("username");

    if(xmlDoc===null)
        throw Error("Failed to retrieve your information, please check login details");

    setElementByIdToXMLValue(xmlDoc,"name_title","Title");
    setElementByIdToXMLValue(xmlDoc,"name_firstname","Firstname");
    setElementByIdToXMLValue(xmlDoc,"name_lastname","Lastname");
    setElementByIdToXMLValue(xmlDoc,"address_1","Address1");
    setElementByIdToXMLValue(xmlDoc,"address_2","Address2");
    setElementByIdToXMLValue(xmlDoc,"address_3","Address3");
    setElementByIdToXMLValue(xmlDoc,"address_4","Address4");
    setElementByIdToXMLValue(xmlDoc,"address_postcode","Postcode");
    setElementByIdToXMLValue(xmlDoc,"address_country","Country");
    setElementByIdToXMLValue(xmlDoc,"contact_email","Email");
    setElementByIdToXMLValue(xmlDoc,"contact_telday","TelDay");
    setElementByIdToXMLValue(xmlDoc,"contact_telext","TelExt");
    setElementByIdToXMLValue(xmlDoc,"contact_televe","TelEve");
    setElementByIdToXMLValue(xmlDoc,"contact_mobile","Mobile");
    setElementByIdToXMLValue(xmlDoc,"contact_telvm","TelVm");
    setElementByIdToXMLValue(xmlDoc,"contact_fax","Fax");
    setElementByIdToXMLValue(xmlDoc,"company_name","Client");
    //setElementByIdToXMLValue(xmlDoc,"company_website","Title");
    setElementByIdToXMLValue(xmlDoc,"company_jobtitle","JobTitle");

    setElementInnerHTMLByIdToXMLValue(xmlDoc,"myCurrentStatus","Status");
    setElementInnerHTMLByIdToXMLValue(xmlDoc,"myCurrentShortNote","Short_notes");

	showPage("mainPage");
};

function setElementByIdToXMLValue(xmlDoc,elementId,xmlElementName)
{
    var docElement = document.getElementById(elementId);
    if(!docElement)
    {
        alert("Missing doc element: "+elementId);
        return;
    }

    var xmlElements=xmlDoc.getElementsByTagName(xmlElementName);
    if(!xmlElements)
    {
        alert("Missing xml element: "+xmlElementName);
        return;
    }

    if(xmlElements[0].childNodes.length == 0)
    {
        docElement.value = "";
        return;
    }

    docElement.value=xmlElements[0].childNodes[0].nodeValue;
}

function setElementInnerHTMLByIdToXMLValue(xmlDoc,elementId,xmlElementName)
{
    var docElement = document.getElementById(elementId);
    if(!docElement)
    {
        alert("Missing doc element: "+elementId);
        return;
    }

    var xmlElements=xmlDoc.getElementsByTagName(xmlElementName);
    if(!xmlElements)
    {
        alert("Missing xml element: "+xmlElementName);
        return;
    }

    if(!xmlElements[0])
    {
        docElement.innerHTML = "";
        return;
    }

    if(xmlElements[0].childNodes.length == 0)
    {
        docElement.innerHTML = "";
        return;
    }

    docElement.innerHTML=xmlElements[0].childNodes[0].nodeValue;
}

function addXMLNodeWithElementIdValue(xmlStr,elementId,xmlElementName)
{
    var docElement = document.getElementById(elementId);
    if(!docElement)
        throw Error("Missing doc element: "+elementId);

    var xmlElement = '<' + xmlElementName + '>' + docElement.value + '</' + xmlElementName + '>';
    xmlStr += xmlElement;

    return xmlStr;
}

function reqTimeListener()
{
    console.log('reqTimeListener');
    var $res = $('.results');

    var newHTML;
    newHTML = "<p><h1>Time:</h1>";
    newHTML+=this.responseText;
    newHTML += "</p>";
    $res.html(newHTML);
};

function evStatusesReceived()
{
    console.log('evStatusesReceived');
    //console.log(this.responseText);

    if(this.status!==200)
        throw Error("this.status!==200");

    var responseMIMEType = this.getResponseHeader('Content-Type');
    var xmlDoc=this.responseXML;

    if(xmlDoc===null)
        throw Error("Failed to retrieve statuses, please check login details");

    var divStatuses=document.getElementById("listStatuses");
    if(!divStatuses)
        throw Error("!divStatuses");

    var vHTML="";

    var x=this.responseXML.documentElement.getElementsByTagName("Contact_statu");
    for (i=0;i<x.length;i++)
    {
        var sStatusLabel,sStatusID;

        var xx=x[i].getElementsByTagName("Label");
		if(!xx)
			throw Error("!xx");
		if(xx.length)
		{
			try
			{
				sStatusLabel=xx[0].firstChild.nodeValue;
			}
			catch(er)
			{
			}
		}
		
		if(sStatusLabel=="")
			continue;
					
        var xx=x[i].getElementsByTagName("ID");
		if(!xx)
			throw Error("!xx");
		if(xx.length)
		{
			try
			{
				sStatusID=xx[0].firstChild.nodeValue;
			}
			catch(er)
			{
			}
		}
		
		if(sStatusID=="")
			continue;
			

		vHTML += "<div class='rbStatus'><input type = 'radio' ";
		vHTML += "name='contactStatus' ";
        vHTML += "id = 'rbStatus"+sStatusID+"' ";
		vHTML += "value = '"+sStatusLabel+"'/>";
		vHTML += "<label for = 'rbStatus"+sStatusID+"'>"+sStatusLabel+"</label></div>";
    }

    divStatuses.innerHTML=vHTML;
}

function reqCallsListener()
{
    console.log('reqCallsListener');
    //console.log(this.responseText);

    if(this.status!==200)
        throw Error("this.status!==200");

    var responseMIMEType = this.getResponseHeader('Content-Type');
    var xmlDoc=this.responseXML;

    if(xmlDoc===null)
        throw Error("Failed to retrieve your calls, please check login details");

    var messagesDiv=document.getElementById("messageList");
    if(!messagesDiv)
        throw Error("!messagesDiv");

    var msgsHTML="<ul id='msgsTable'>";

    var x=this.responseXML.documentElement.getElementsByTagName("Call");
    for (i=0;i<x.length;i++)
    {
        var sCallStart="&lt;Unknown date time&gt;";
		var sCallerName="&lt;Unknown caller name&gt;";
		var sCallerNumber="&lt;Unknown caller number&gt;";
		var sNotes="";

        var xx=x[i].getElementsByTagName("CallStart");
		if(xx.length)
        {
            try
            {
                sCallStart=xx[0].firstChild.nodeValue;
            }
            catch(er)
            {
            }
        }
        xx=x[i].getElementsByTagName("CallerName");
		if(xx.length)
        {
            try
            {
                sCallerName=xx[0].firstChild.nodeValue;
            }
            catch (er)
            {
            }
        }
        xx=x[i].getElementsByTagName("CallerNumber");
		if(xx.length)
        {
            try
            {
                sCallerNumber=xx[0].firstChild.nodeValue;
            }
            catch (er)
            {
            }
        }
        xx=x[i].getElementsByTagName("NotesLarge");
		if(xx.length)
        {
            try
            {
                sNotes=xx[0].firstChild.nodeValue;
            }
            catch (er)
            {
            }
        }
		if(sNotes!="")
		{
			xx=x[i].getElementsByTagName("NotesSmall");
			if(xx.length)
			{
				try
				{
					sNotes=xx[0].firstChild.nodeValue;
				}
				catch (er)
				{
				}
			}
		}

        var sItem='<li>';
        sItem+='<div class="msgTime">'+sCallStart+'</div>';
        sItem+='<a href="tel:' + sCallerNumber+'">'+sCallerName+'</a>'
        sItem+='<div class="msgNotes">'+sNotes+'</div>';
        sItem+="</li>";
        msgsHTML+=sItem;
    }

    msgsHTML=msgsHTML + "</ul>";
    messagesDiv.innerHTML=msgsHTML;
};

function evSubmittedStatus()
{
    console.log('evSubmittedStatus');
    console.log(this.responseText);

    if(this.status!==200)
        throw Error("this.status!==200");

    var responseMIMEType = this.getResponseHeader('Content-Type');
    var xmlDoc=this.responseXML;

    if(xmlDoc===null)
        throw Error("Failed to submit your status");

    var messagesDiv=document.getElementById("messageList");
    if(!messagesDiv)
        throw Error("!messagesDiv");

    var msgsHTML="<ul id='msgsTable'>";

    var x=this.responseXML.documentElement.getElementsByTagName("Call");
    for (i=0;i<x.length;i++)
    {
        var sCallStart, sCallerName, sCallerNumber, sNotesSmall;

        var xx=x[i].getElementsByTagName("CallStart");
        {
            try
            {
                sCallStart=xx[0].firstChild.nodeValue;
            }
            catch(er)
            {
                sCallStart="??";
            }
        }
        xx=x[i].getElementsByTagName("CallerName");
        {
            try
            {
                sCallerName=xx[0].firstChild.nodeValue;
            }
            catch (er)
            {
                sCallerName="??";
            }
        }
        xx=x[i].getElementsByTagName("CallerNumber");
        {
            try
            {
                sCallerNumber=xx[0].firstChild.nodeValue;
            }
            catch (er)
            {
                sCallerNumber="??";
            }
        }
        xx=x[i].getElementsByTagName("NotesSmall");
        {
            try
            {
                sNotesSmall=xx[0].firstChild.nodeValue;
            }
            catch (er)
            {
                sNotesSmall="??";
            }
        }

        var sItem='<li>';
        sItem+='<div class="msgTime">'+sCallStart+'</div>';
        sItem+='<a href="tel:' + sCallerNumber+'">'+sCallerName+'</a>'
        sItem+='<div class="msgNotes">'+sNotesSmall+'</div>';
        sItem+="</li>";
        msgsHTML+=sItem;
    }

    msgsHTML=msgsHTML + "</ul>";
    messagesDiv.innerHTML=msgsHTML;
};

function mobilecheck(testStr)
{
	try
	{
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(testStr) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(testStr.substr(0, 4)))
			return true;

		return false;
    }
    catch(err)
    {
	}
    return false;
};

function moreClicked()
{
	//show popup menu of extras
    var moreImg = document.getElementById('imgMore');
	if(!moreImg)
		throw Error("!moreImg");
    var divMore = document.getElementById('divMore');
	if(!divMore)
		throw Error("!divMore");

    divMore.setAttribute('class','menuShow');

    divMore.onclick = function(e)
	{
        divMore.setAttribute('class','menuHidden');

		var miID = e.target.id;
		if(miID=="miLogOff")
			logout();
		else
		if(miID=="miSetStatus")
			showPage("pageStatus");
    }
}
document.addEventListener("DOMContentLoaded", init, false);
