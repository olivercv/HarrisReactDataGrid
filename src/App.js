// import logo from './logo.svg';
import './App.css';

// 'use strict';

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  StrictMode,
} from 'react';

import { AgGridReact } from '@ag-grid-community/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

function App() {

  const gridRef = useRef();
  const [scrollMode, setScrollMode] = useState('vertical');

  // date formatting
  const dateFormatter = (params) => {
    let date = new Date(params.value);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    let hourNum = date.getHours() % 12;
    let hour = (hourNum === 0 ? 12 : hourNum).toString().padStart(2, '0');
    let min = date.getMinutes().toString().padStart(2, '0');
    let amPM = date.getHours() < 12 ? 'AM' : 'PM';
    return ( day +'/' +month +'/' +year +' ' +hour +':' +min +' ' +amPM);

  };

  const [rowData, setRowData] = useState(
    [
      { "patientName": "Francis, Henry", "resource": "Mc Coy Henry", "apptType": "Sick Visit", "apptTime": "2020-05-30T10:01:00" , "status": "Ready for Provider 9:26 AM", "wait": "00:05" },
      { "patientName": "Murphy, Catrine", "resource": "Mc Coy Henry", "apptType": "Sick Visit", "apptTime":"2015-04-21T16:30:00" , "status": "", "wait": "" },
      { "patientName": "Murphy, Alicia", "resource": "Anna Bates", "apptType": "Sick Visit", "apptTime":"2010-02-19T12:02:00" , "status": "Checked in 9:57 AM", "wait": "00:05" },
      { "patientName": "Murphy, Alicia", "resource": "Mc Coy Henry", "apptType": "Sick Visit", "apptTime":"1995-10-04T03:27:00" , "status": "", "wait": "" },
      { "patientName": "Francis, Henry", "resource": "Mc Coy Henry", "apptType": "Sick Visit", "apptTime":"1995-10-04T03:27:00" , "status": "In Re-schedule Queue", "wait": "" },
      { "patientName": "Pandy, Peggy", "resource": "Mc Coy Henry", "apptType": "CQM New", "apptTime":"1995-10-04T03:27:00" , "status": "", "wait": "" },
      { "patientName": "Murphy, Alicia", "resource": "Anna Bates", "apptType": "Sick Visit", "apptTime":"1995-10-04T03:27:00" , "status": "Checked in 9:57 AM", "wait": "00:05" },
      { "patientName": "Murphy, Alicia", "resource": "Mc Coy Henry", "apptType": "Sick Visit", "apptTime":"1995-10-04T03:27:00" , "status": "", "wait": "" },
      { "patientName": "Murphy, Alicia", "resource": "Anna Bates", "apptType": "Sick Visit", "apptTime":"1995-10-04T03:27:00" , "status": "Checked in 9:57 AM", "wait": "00:05" },
      { "patientName": "Murphy, Alicia", "resource": "Mc Coy Henry", "apptType": "Sick Visit", "apptTime":"1995-10-04T03:27:00" , "status": "", "wait": "" }
    ]
  )
  const [columnDefs, setColumnDefs] = useState(
    [
      { headerName: 'PATIENT NAME', field: 'patientName', sortable: true, headerCheckboxSelection: true, checkboxSelection: true, showDisabledCheckboxes: true, minWidth: 250},
      { headerName: 'RESOURCE', field: 'resource', sortable: true, minWidth: 250 },
      { headerName: 'APPT TYPE', field: 'apptType', sortable: true, minWidth: 150 },
      { headerName: 'APPT TIME', field: 'apptTime', sortable: true, minWidth: 150, valueFormatter: dateFormatter},
      { headerName: 'STATUS', field: 'status', sortable: true, minWidth: 300 },
      { headerName: 'WAIT', field: 'wait', sortable: true, minWidth: 150 }
    ]
  )

  const [rowDataStr, setRowDataStr] = useState(JSON.stringify(rowData, undefined, 2));
  const [columnDefsStr, setColumnDefStr] = useState(JSON.stringify(columnDefs, undefined, 2));

  const editRowData = e => {
    let rowDataText =  e.target.value;
    setRowDataStr(rowDataText);
    setRowData(JSON.parse(rowDataText))
  };

  const editColumnDefs = e => {
    let columnDefsText = e.target.value;
    setColumnDefStr(columnDefsText);
    setColumnDefs(JSON.parse(columnDefsText));
  }

  const changeScrollMode = e => {
    let scrollModeSelected = e.target.value;
    setScrollMode(scrollModeSelected);
  };


  // default column configuration
  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
    };
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    gridRef.current.api.sizeColumnsToFit();
  }, []);

   // run when Grid Size event changed
   const onGridSizeChanged = useCallback((params) => {
    // get the current grids width
    let gridWidth = document.getElementById('grid-wrapper').offsetWidth;
    let mode = document.getElementById('select-mode').value;
    // keep track of which columns to hide/show
    let columnsToShow = [];
    let columnsToHide = [];
    // iterate over all columns (visible or not) and work out
    // now many columns can fit (based on their minWidth)
    let totalColsWidth = 0;
    let allColumns = gridRef.current.columnApi.getColumns();
    if (allColumns && allColumns.length > 0) {
      for (let i = 0; i < allColumns.length; i++) {
        let column = allColumns[i];
        totalColsWidth += column.getMinWidth() || 0;
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(column.getColId());
        } else {
          columnsToShow.push(column.getColId());
        }
      }
    }
    if(mode === 'vertical') {
      // show/hide columns based on current grid width
      gridRef.current.columnApi.setColumnsVisible(columnsToShow, true);
      gridRef.current.columnApi.setColumnsVisible(columnsToHide, false);
    } else if (mode === 'both') {
      gridRef.current.columnApi.setColumnsVisible(columnsToHide, true);
    } else {
      gridRef.current.columnApi.setColumnsVisible(columnsToShow, true);
      gridRef.current.columnApi.setColumnsVisible(columnsToHide, false);
    }

    // fill out any available space to ensure there are no gaps
    gridRef.current.api.sizeColumnsToFit();
    
  }, []);

  return (

    <div>
      <h2>Harris React Grid</h2>
      <br/>
      <div className='textBox'>
        <textarea value={rowDataStr} onChange={editRowData} rows="30" cols="50"></textarea>
        <textarea value={columnDefsStr} onChange={editColumnDefs} rows="30" cols="50"></textarea>
      </div>
      <div id="grid-wrapper" className={scrollMode}  >
      
      <AgGridReact
        className='ag-theme-alpine'
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection='multiple'
        onFirstDataRendered={onFirstDataRendered}
        onGridSizeChanged={onGridSizeChanged}
      />
      </div>
      <div className='selectScroll'>
        <p>Scroll Mode: 
          <select id='select-mode' value={scrollMode} onChange={changeScrollMode}>
            <option value="vertical">Vertical</option>
            <option value="both" >Both</option>
            <option value="none" >None</option>
          </select>
        {scrollMode}
      </p>
      </div>     
    </div>
   
  );
}

export default App;
