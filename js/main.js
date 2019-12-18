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

  /* make the buttons for the sheets */
  var make_buttons = function (sheetnames, cb) {
    var buttons = document.getElementById('buttons');
    buttons.innerHTML = "";
    sheetnames.forEach(function (s, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.name = 'btn' + idx;
      btn.text = s;
      var txt = document.createElement('h3');
      txt.innerText = s;
      btn.appendChild(txt);
      btn.addEventListener('click', function () {
        cb(idx);
      }, false);
      buttons.appendChild(btn);
      buttons.appendChild(document.createElement('br'));
    });
  };
  var _target = document.getElementById('drop');
  var _file = document.getElementById('file');
  var _grid = document.getElementById('grid');

  // create a new grid
  var cdg = canvasDatagrid({
    parentNode: _grid
  });

  cdg.style.height = '50%';
  cdg.style.width = '50%';


  function _resize() {
    _grid.style.height = (window.innerHeight - 450) + "px";
    _grid.style.width = window.innerWidth  + "px";
  }

  var _onsheet = function (json, sheetnames, select_sheet_cb) {
    //make_buttons(sheetnames, select_sheet_cb);
    document.getElementById('drop').style.display = "none";

    /* show grid */
    _grid.style.display = "block";
    _resize();

    /* set up table headers*/
    var L = 0;
    json.forEach(function (r) {
      if (L < r.length) L = r.length;
    });
    console.log(L);

    //Sort by floor number NRA3204X43200Y05Z12 where "4" is index 6
    json.forEach((loc, index) => {
      function sortThings(a, b) {
        return a[0][6] > b[0][6] ? -1 : b[0][6] > a[0][6] ? 1 : 0;
      }
      json.sort(sortThings);
    });

    /* load data */
    cdg.data = json;
    //first row is the header, save the first row for later use. 
    firstRow = cdg.data[0];

    for (var i = 0; i < L; i++) {
      console.log(json[0][i]);
      cdg.schema[i].title = json[0][i];
    }
    cdg.attributes.columnHeaderClickBehavior = 'select';
    cdg.style.columnHeaderCellHorizontalAlignment = 'right';
    cdg.attributes.selectionMode = 'row';
    //first row is the header now, remove it
    cdg.deleteRow(0);

    cdg.addEventListener('click', function (e) {
      if (!e.cell || e.cell.columnIndex !== 0) {
        parseData(e.cell.data[0]);
        console.log(cdg.data[0]);
        return;
      }
      parseData(e.cell.value);
    });

    cdg.addEventListener('keydown', function (e) {
      if (!e.cell || e.cell.columnIndex !== 0) {
        console.log(e.cell);
        console.log(e.cell.selected);
        console.log(cdg.activeCell)
        return;
      }
      parseData(e.cell.value);
    });

  };
//Listen for the save button to be pressed
  var sv = document.getElementById("save");
  sv.addEventListener("click", function (e) {
    cdg.insertRow(firstRow, 0);
    writeBook();
  });

// Save the workbook
  function writeBook() {
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(cdg.data);
    XLSX.utils.book_append_sheet(wb, ws)
    var d = new Date();
    let m = d.toLocaleString('default', {
      month: 'long'
    });
    d = d.toJSON().slice(0, 5);
    var filename = d + m + ' Blockade Checklist Complete.xlsx'
    var buffer = XLSX.writeFile(wb, filename)
  };
  /** Drop it like it's hot **/
  DropSheet({
    file: _file,
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