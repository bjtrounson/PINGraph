import Api from 'datatables.net';
import 'jquery'

enum TableType {
    LATEST = "LATEST",
    ALL = "ALL"
}

export default class PINTable {
    settings;
    table;

    constructor(table: JQuery<HTMLTableElement>, tableType: TableType, url: string, preloader: () => void) {
        this.table = table.DataTable();
        this.settings = {
            searching: false,
            paging: true,
            order: [],
            ordering: false,
            responsive: true,
            scrollX: true,
            autoWidth: false,
            drawCallback: preloader,
            ajax: {
                url: url,
                type: "GET",
                dataSrc: ''
            },
            columns: [
                { data: 'hash',
                    render: function(data, type, row, meta) {
                        if(type === 'display') { data = `<a href="{{url('hash')}}/${data}">${data}</a>` }
                        return data;
                    },
                },
                { data: 'to',
                    render: function(data, type, row, meta) {
                        if(type === 'display') { data = `<a href="{{url('address')}}/${data}">${data}</a>`; }
                        return data;
                    },
                },
                { data: 'from',
                    render: function(data, type, row, meta) {
                        if(type === 'display') { data = `<a href="{{url('address')}}/${data}">${data}</a>`; }
                        return data;
                    },
                },
                { data: 'amount'},
                { data: 'asset' }
            ],
        };
    }
    
    createTableSettings(tableType: TableType) {
        let settings = null;
        switch (tableType) {
            case TableType.LATEST:
                settings = {
                    ...this.settings,
                    pageLength : 10,
                    order: [],
                    ordering: false,
                    responsive: true,
                    scrollX: true,
                    autoWidth: false,
                    dom: 'lftri',
                    columnDefs: [
                        { width: '100px', targets: [0, 1, 2] },
                        { width: '50px', targets: [3, 4] }
                    ],
                }
                break;
            case TableType.ALL:
                    settings = {
                        ...this.settings,
                        pageLength : 50,
                        columnDefs: [
                            { width: '100px', targets: [0, 3, 4] },
                            { width: '50px', targets: [1, 5, 6] },
                            { width: '75px', targets: [2]},
                        ],
                        columns: [
                            { data: 'method' },
                            { data: 'time',
                                render: function(data, type, row, meta) {
                                    if(type === 'display') {
                                        data = `<p title="${data.timestamp}">${data.diff}</p>`;
                                    }
                                    return data;
                                }
                            }
                        ]
                    }
                break;
            default:
                break;
        }
    }

    getTable() {
        return this.table;
    }

    updateTable(initialLoad: boolean) {
        this.table.ajax.reload()
        if (initialLoad) this.table.columns.adjust();
    }
}