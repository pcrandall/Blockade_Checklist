/* oss.sheetjs.com (C) 2014-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */

window.addEventListener('load', function () {
  /** Spinner **/
  var spinner;
  var _workstart = function () {
    spinner = new Spinner().spin(_target);
  }
  var _workend = function () {
    spinner.stop();
  }
  var _scroll = function () {
    //focus the bottom of the screen after the sheet loads. 
    window.scrollTo(0, document.body.scrollHeight);
  }
  var _filename = function () {
    /*
    var d = new Date();
    let m = d.toLocaleString('default', {
      month: 'long'
    });
    d = d.toJSON().slice(0, 10);
    */
    if (wbName.value != null) {
      var filename = _file.value.slice(12, _file.value.length - 5) + "_complete";
      //console.log(_file);
    } else {
      var filename = wbName.value + '_complete'
    }
    return filename;
  }

  /** Alerts **/
  var _badfile = function () {
    alertify.alert('This file does not appear to be a valid Excel file.  If we made a mistake, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can take a look.', function () {});
  };

  var _pending = function () {
    alertify.alert('Please wait until the current file is processed.', function () {});
  };

  var _large = function (len, cb) {
    alertify.confirm("This file is " + len + " bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?", cb);
  };

  var _failed = function (e) {
    console.log(e, e.stack);
    alertify.alert('We unfortunately dropped the ball here.  Please test the file using the <a href="/js-xlsx/">raw parser</a>.  If there are issues with the file processor, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can make things right.', function () {});
  };

  var _target = document.getElementById('drop');
  var _file = document.getElementById('file');
  var _grid = document.getElementById('grid');

  // create a new grid
  var cdg = canvasDatagrid({
    parentNode: _grid
  });

  cdg.style.height = '100%';
  cdg.style.width = '100%';

  function _resize() {
    //_grid.style.height = (window.innerHeight - 450) + "px";
    //_grid.style.width = (window.innerWidth - 10) + "px";
    _grid.style.height = "266px";
    _grid.style.width = "810px";

  }

  var _onsheet = function (json, sheetnames, select_sheet_cb) {
    //reset everything.
    resultText.value = "";
    document.getElementById("resultText").style.backgroundColor = "white";
    inputText.value = "";
    wbName.value = _filename();

    /*
    console.log("wbName.value");
    console.log(wbName.value);
    */

    //remove the drop target when the sheet loads. 
    document.getElementById('drop').style.display = "none";

    /* show grid */
    _grid.style.display = "block";
    _scroll();
    _resize();

    //Sort by floor number NRA3204X43200Y05Z12 where "4" is index 6
    json.forEach((loc, index) => {

      function sortThings(a, b) {
        var nav1 = a[0][3] + a[0][4];
        var nav2 = b[0][3] + b[0][4];
        //if on the same floor
        if (a[0][6] == b[0][6]) {
          return nav1 > nav2 ? -1 : nav2 > nav1 ? 1 : 0;
        } else {
          return a[0][6] > b[0][6] ? -1 : b[0][6] > a[0][6] ? 1 : 0;
        }
      }

      json.sort(sortThings);
    });

    //Check the lenght, make sure we have at least three columns for the sheet.
    if (json[0].length < 2) {
      json.unshift(["STOLOC", "LU", "Verified LU"]);
    }
    /* load data */
    cdg.data = json;

    //first row is the header, save the first row for later use. 
    firstRow = json[0];
    //write the headers.
    firstRow.forEach((item, index) => {
      cdg.schema[index].title = item; 
      //console.log(item);
    });

    cdg.attributes.columnHeaderClickBehavior = 'none';
    cdg.style.columnHeaderCellHorizontalAlignment = 'right';
    cdg.attributes.selectionMode = 'row';
    cdg.attributes.snapToRow = true;
    cdg.attributes.scrollIndexRect = 15

    //first row is the header now, remove it
    cdg.deleteRow(0);

    cdg.addEventListener('click', function (e) {
      //clear the input text for single coordinates.
      inputText.value = "";
      if (!e.cell || e.cell.columnIndex !== 0) {
        parseData(e.cell.data[0]);
      } else {
        parseData(e.cell.value);
      }
    });

  };

  //Listen for the save button to be pressed
  var sv = document.getElementById("save");
  sv.addEventListener("click", function (e) {
    cdg.insertRow(firstRow, 0);
    writeBook();
    cdg.deleteRow(0);
  });

  // Save the workbook
  function writeBook() {
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(cdg.data);
    //set the column width
    var wscols = [{
        wch: 25
      }, //chars
      {
        wpx: 125
      }, //pixels
      {
        width: 20
      } // max digit width
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws)

    var filename = wbName.value + '.xlsx';
    var buffer = XLSX.writeFile(wb, filename)
  };



  /** Drop it like it's hot **/
  DropSheet({
    file: _file,
    _filename,
    drop: _target,
    on: {
      workstart: _workstart,
      workend: _workend,
      sheet: _onsheet,
      foo: 'bar'
    },
    errors: {
      badfile: _badfile,
      pending: _pending,
      failed: _failed,
      large: _large,
      foo: 'bar'
    }
  })
});