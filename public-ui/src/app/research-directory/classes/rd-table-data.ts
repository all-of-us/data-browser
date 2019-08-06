export interface Institution {
    role: string;
    affiliation: string;
}
export interface Header {
    title: string;
}
export interface Researchers {
    name: string;
    accessLevel: string;
    institute: Institution[];
    removed: boolean;
}

export interface RowData {
    name: string;
    accessLevel: string;
    createdDate: string;
    researchers: Researchers[];
}

export interface RdTableData {
    header: Header[];
    rowData: RowData[];
}
