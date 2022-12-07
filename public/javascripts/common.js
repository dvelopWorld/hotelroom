function commonToastr(message, status){
  // for showing toastr messages in admin panel
  let toastrargs = {
    positionClass: "toast-top-right",
    timeOut: 3000,
    closeButton: !0,
    debug: !1,
    newestOnTop: !0,
    progressBar: !0,
    preventDuplicates: !0,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
    tapToDismiss: !1
  }

  if(status){
    toastr.success(message, "Success", toastrargs)
  }else{
    toastr.error(message, "Error", toastrargs)
  }
}



function doAjaxCall(url, data, tokenCall, send_type, callback){
  /* a common function for all the api calls make us apply same logic to all the api calls easily.
  // for example if we need to show loader while the api gets its result then we can do it easily with this type of funciton
  // currently this we are not applying any logic to the api calls so this function is not doing any significant job but if in later stage we need to apply a common logic to all the ajax, we can make use of this function
  */

  let authHead = null
  if(tokenCall){    // this is front side token passing..   we are not using it in this proect. we are using "cookie-parser" node module for getting cookie data in backend.
    authHead = {Authorization: $.cookie("token")};
  }

  $.ajax({
    url: url,
    type: send_type,
    data: data,
    cache: false,
    headers: authHead,
    success: function (data){
      callback(data,1);
    },
    error: function (data,errorThrown) {
      if(data.status == 401){
        throwSessionOut();
      }
      callback(data,2);
    }
  });
}



function createTable(tableId, tableAttributes, recordsArray){
  /*
    this function creates and returns an html table. the arguments are described as follows
    1. tableId  -- string containing the id of the table
    2. tableAttributes  -- object containing attribute names as key of property and attribute value as value of property
    3. recordsArray  -- array of objects where property names are the names of table head and property values are value for that column
  */


  let theTable = document.createElement("TABLE");
  theTable.setAttribute("id", tableId);

  for(const [key, value] of Object.entries(tableAttributes)){
    theTable.setAttribute(key, value);
  }

  let tableHead = document.createElement("THEAD");

  let tableRow = document.createElement("TR");

  if(recordsArray.length>0){
    for(rowData of Object.keys(recordsArray[0])){
      let trth = document.createElement("TH");
      let textData = document.createTextNode(rowData);
      trth.appendChild(textData);
      tableRow.appendChild(trth);
    }
  }

  tableHead.appendChild(tableRow);
  theTable.appendChild(tableHead);

  let tableBody = document.createElement("TBODY");

  for(record of recordsArray){
    let tableRow = document.createElement("TR");
    for(rowData of Object.values(record)){
      let trtd = document.createElement("TD");
      if(typeof rowData == 'string' && rowData.slice(0, 10) == 'thisIsHtml'){
        trtd.innerHTML = rowData.slice(10);
      }else{
        let textData = document.createTextNode(rowData);
        trtd.appendChild(textData);
      }
      tableRow.appendChild(trtd);
    }
    tableBody.appendChild(tableRow);
  }

  theTable.appendChild(tableBody);

  return theTable;
}

function getDateForSql(date){
  let theMonth = date.getMonth();
  theMonth++;
  return `${date.getFullYear()}-${theMonth}-${date.getDate()} ${date.toLocaleTimeString()}`;
}