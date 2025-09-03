export type Row = {
  original: string;
  translation: string;
  startLine: string;
  endLine: string;
};
type Props = {
  row: Row;
  selected: boolean;
  onToggle: () => void;
};
const CommentItem = ({ row, selected, onToggle }: Props) => {
  //create item, it receives data row, selected and onToggle
  return(
    //show icon like open close first, then show original and line range
    <div onClick={onToggle}>    
      {selected ? "[v]" : "[>]"} {row.original} (Lines {row.startLine}-{row.endLine})
      {selected && (
        //if open, show detail, if closed, do not render
        <div>
          <div>Original:</div>
          <pre>{row.original}</pre>
          <div>Translation:</div>
          <pre>{row.translation}</pre>
        </div>
      )}
    </div>
  ); 
};

export default CommentItem;
