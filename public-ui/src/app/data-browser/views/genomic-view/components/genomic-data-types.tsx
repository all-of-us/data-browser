// Genomic data types shown in the participant demographics charts. `value` matches the
// stratum_4 written by run-achilles-queries.sh; `color` is used for the dropdown bullet,
// the chart series and the location heat map.
export interface GenomicDataType {
  value: string;
  label: string;
  color: string;
}

export const GENOMIC_DATA_TYPES: GenomicDataType[] = [
  { value: "wgs_shortread", label: "Short-Read WGS (srWGS)", color: "#6F98A0" },
  { value: "wgs_longread", label: "Long-Read WGS (lrWGS)", color: "#01429D" },
  {
    value: "wgs_structural_variants",
    label: "srWGS Structural Variants",
    color: "#93003A",
  },
  { value: "micro-array", label: "Genotyping Arrays", color: "#FAAF56" },
  { value: "rna_seq", label: "Bulk RNASeq", color: "#853890" },
  { value: "proteomics", label: "Proteomics", color: "#da694f" },
  {
    value: "lrwgs_rna_seq_proteomics",
    label: "lrWGS + RNASeq + Proteomics",
    color: "#048898",
  },
];

export function getGenomicDataType(value: string): GenomicDataType | undefined {
  return GENOMIC_DATA_TYPES.find((t) => t.value === value);
}
