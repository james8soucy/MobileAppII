var app = {
    initialize: function()
	{
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
	sendSms: function(number, message)
	{
        console.log("number=" + number + ", message= " + message);

        var options = {
            replaceLineBreaks: false,
            android: {
                intent: 'INTENT'
            }
        };

        var success = function(){console.log('Message sent successfully');};
        var error = function(e){console.log('Message Failed:' + e);};
        sms.send(number, message, options, success, error);
    },
    onDeviceReady: function()
	{
		console.log('ready');
			
		app.receivedEvent('deviceready');
    },
    receivedEvent: function(id)
	{
		var parentElement = document.getElementById(id);
		if(id != 'deviceready')
		{
			console.log(parent)
			var listeningElement = parentElement.querySelector('.listening');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');
		}

		console.log('Received Event: ' + id);
		
		app.initPaymentUI();
    },
    people: [],
    myTable: [],
	onPrepareRender: function() 
	{
		var payPalButton = document.getElementById("payPalButton");

		payPalButton.onclick = function(e)
		{
			PayPalMobile.renderSinglePaymentUI(app.createPayment(), app.onSuccesfulPayment, app.onUserCanceled);
		};
	},
	onPayPalMobileInit: function()
	{
		PayPalMobile.prepareToRender("PayPalEnvironmentNoNetwork", app.configuration(), app.onPrepareRender);
	},
	configuration: function() {
		var config = new PayPalConfiguration({
		  merchantName: "My test shop",
		  merchantPrivacyPolicyURL: "https://mytestshop.com/policy",
		  merchantUserAgreementURL: "https://mytestshop.com/agreement"
		});
		return config;
	},
	initPaymentUI: function()
	{
		var clientIDs = 
		{
			"PayPalEnvironmentProduction": null,
			"PayPalEnvironmentSandbox": "AYMgtZsSwGSaQ9ppydeSn6IM3H325MTJe29aE7QZ-GPuP_ic-dNJORvV3ir5swfvBSvjC5fFnwvuifyD"
		};
		PayPalMobile.init(clientIDs, app.onPayPalMobileInit);

	},
	onSuccesfulPayment: function(payment)
	{
		console.log("payment success: " + JSON.stringify(payment, null, 4));
	},
	createPayment: function()
	{
		var total = document.getElementById('itemsResTable').rows[curResRow].cells[1].innerHTML.toString();
		
		if(!total.includes('.'))
		{
			total = total + '.00';
		}
		
		var paymentDetails = new PayPalPaymentDetails(total, "0.00", "0.00");
		var payment = new PayPalPayment(total, "USD", "billSplit", "Sale", paymentDetails);
		return payment;
	},
	onUserCanceled: function(result)
	{
		console.log(result);
	}	
};

var contactList = [];
var curRow = -1;
var curResRow = 1;

app.initialize();

function add(data = {description: "", cost: "", quantity: ""})
{
	var table = document.getElementById("itemsTable");
	var row = table.insertRow(-1);
	var item = row.insertCell(0);
	var cost = row.insertCell(1);
	var quantity = row.insertCell(2);
	
	var itemInput = document.createElement("INPUT")
	itemInput.setAttribute("type", "text")
	var costInput = document.createElement("INPUT")
	costInput.setAttribute("type", "text")
	var quantityInput = document.createElement("INPUT")
	quantityInput.setAttribute("type", "text")
	
	row.onclick = function(){curRow = row.rowIndex};
	
	itemInput.setAttribute("class", "startItem");
	costInput.setAttribute("class", "headItem");
	quantityInput.setAttribute("class", "headItem");
	
	itemInput.value = data.description;
	costInput.value = data.cost;
	quantityInput.value = data.quantity;
	
	item.appendChild(itemInput);
	cost.appendChild(costInput);
	quantity.appendChild(quantityInput);

	var people = document.createElement("select");
	people.setAttribute("class", "people startItem");

	row.appendChild(people);

	function refreshPeople() 
	{
		const selectedPerson = people.querySelector("option:checked");
		const selectedPerson_id = selectedPerson && selectedPerson.getAttribute("data-id");

		const createPerson = ({id, displayName}) => `<option data-id="${id}" value="${displayName}">${displayName}</option>`
		people.innerHTML = app.people.map(createPerson).join("");

		const newOption = people.querySelector(`option[data-id="${selectedPerson_id}"]`);
		newOption && (newOption.selected = "true");
	}

	var record = {row, item, cost, people, refreshPeople};
	app.myTable.push(record);

	searchContact();
}
function remove()
{
	if (curRow != -1)
	{
		var table = document.getElementById("itemsTable");
		table.deleteRow(curRow);
	}
}

function submit()
{
	document.getElementById('addRowBtn').style.display = 'none';
	document.getElementById('remRowBtn').style.display = 'none';
	document.getElementById('buyNowBtn').style.display = 'none';
	document.getElementById('tableDiv').style.display = 'none';
	
	var dict = {};
	
	var table = document.getElementById('itemsTable');
	
	for(var i = 1; i < document.getElementById('itemsTable').rows.length; i++)
	{
		if(table.rows[i].childNodes[3].options[table.rows[i].childNodes[3].selectedIndex].value in dict)
		{
			dict[table.rows[i].childNodes[3].options[table.rows[i].childNodes[3].selectedIndex].value] += (parseFloat(table.rows[i].cells[1].childNodes[0].value) * parseFloat(table.rows[i].cells[2].childNodes[0].value));
		}
		else
		{
			dict[table.rows[i].childNodes[3].options[table.rows[i].childNodes[3].selectedIndex].value] = parseFloat(table.rows[i].cells[1].childNodes[0].value) * parseFloat(table.rows[i].cells[2].childNodes[0].value);
		}

	}
	
	document.getElementById('itemsTable').style.display = 'none';
	
	document.getElementById('tableResDiv').style.display = 'block';
	
	document.getElementById('requestButton').style.display = 'block';
	document.getElementById('payPalButton').style.display = 'block';
	
	table = document.getElementById('itemsResTable');
	table.style.display = 'block';
	
	for (key in dict)
	{
		var row = table.insertRow(-1);
		var person = row.insertCell(0);
		var total = row.insertCell(1);
		
		row.onclick = function(){curResRow = row.rowIndex};
		
		person.innerHTML = key;
		total.innerHTML = dict[key];
	}
}

function onSuccess(contacts)
{
    // alert('Found ' + contacts.length + ' contacts.');
    app.people = contacts.filter(person => person.displayName);
    app.myTable.forEach(record => record.refreshPeople())
};

function onError(contactError)
{
    alert('onError!');
};

function searchContact()
{
	var options      = new ContactFindOptions();
	options.filter   = "";
	options.multiple = true;
	var fields       = ["*"];
	navigator.contacts.find(fields, onSuccess, onError, options);
}
function textRequest()
{	
	var options      = new ContactFindOptions();
	options.filter   = "";
	options.multiple = true;
	var fields       = ["*"];
	
	navigator.contacts.find(fields, gotContacts, onError, options);	
}
function gotContacts(c)
{
	var total = document.getElementById('itemsResTable').rows[curResRow].cells[1].innerHTML.toString();
	var recip = document.getElementById('itemsResTable').rows[curResRow].cells[0].innerHTML.toString();
	
	console.log(total);
	
	if(!total.includes('.'))
	{
		total = total + '.00';
	}
	for(var i = 0, len = c.length; i < len; i++)
	{
		if(c[i].phoneNumbers)
		{
			contactList.push([c[i].name.formatted, c[i].phoneNumbers[0].value]);
		}
	}
	for(var i = 0; i < contactList.length; i++)
	{
		if(contactList[i][0] == recip || contactList[i][0] == (recip + ' '))
		{
			app.sendSms(contactList[i][1], 'You owe me $' + total);
			break;
		}
	}
}
function goToPicture()
{
	document.getElementById('addRowBtn').style.display = 'inline-block';
	document.getElementById('remRowBtn').style.display = 'inline-block';
	document.getElementById('buyNowBtn').style.display = 'inline-block';
	document.getElementById('itemsTable').style.display = 'block';

	document.getElementById('pictureButton').style.display = 'none';
	document.getElementById('hideDiv').style.display = 'none';
	
	navigator.camera.getPicture(
		function(imageData)
		{
			$.ajax({
				url: 'http://10.0.0.33:8000/api/call',
				contentType: "application/json; charset=utf-8",
				method: 'POST',
				data: JSON.stringify({'base64':imageData}),
				success: function(response)
				{
					console.log(response);
					console.log(response['line_items']);
					for(var i = 0; i < response['line_items'].length; i++)
					{
						add({description: response['line_items'][i]['description'], cost: response['line_items'][i]['total']/response['line_items'][i]['quantity'], quantity: response['line_items'][i]['quantity']});
					}
				},
				error: function(err)
				{
					console.log(err);
				}
			});
		},
		function(error)
		{
			console.log(error);
		},
		{ quality:10, destinationType: Camera.DestinationType.DATA_URL }
	);
}

