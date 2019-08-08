export interface Institution {
    role: string;
    affiliation: string;
}

export interface ColumnDefs {
    title: string;
    field: string;
}

export interface Researchers {
    name: string;
    researchersAccessLevel: string;
    institute: Institution[];
    removed: boolean;
}

export interface RowData {
    wsName: string;
    accessLevel: string;
    createdDate: string;
    researchers: Researchers[];
}

export interface RdTableData {
    header: ColumnDefs[];
    rowData: RowData[];
}

