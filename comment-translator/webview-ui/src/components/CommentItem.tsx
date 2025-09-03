export type commentInfo = {
  original: string;
  translation: string;
  startLine: string;
  endLine: string;
};
type Props = {
  // row: Row;
  // selected: boolean;
  // onToggle: () => void;
  commentInfo: commentInfo;
};
const CommentItem = ({ commentInfo }: Props) => {
  //create item, it receives data row, selected and onToggle
  // return (
  //   //show icon like open close first, then show original and line range
  //   <div onClick={onToggle}>
  //     {selected ? '[v]' : '[>]'} {commentInfo.original} (Lines{' '}
  //     {commentInfo.startLine}-{commentInfo.endLine})
  //     {selected && (
  //       //if open, show detail, if closed, do not render
  //       <div>
  //         <div>Original:</div>
  //         <pre>{commentInfo.original}</pre>
  //         <div>Translation:</div>
  //         <pre>{commentInfo.translation}</pre>
  //       </div>
  //     )}
  //   </div>
  // );

  return (
    //show icon like open close first, then show original and line range
    <div className='commentItem p-1 mb-3'>
      <div className='flex justify-end'>
        <p className='ignore'>
          {commentInfo.startLine === commentInfo.endLine
            ? `Line ${commentInfo.startLine}`
            : `Lines ${commentInfo.startLine} - ${commentInfo.endLine}`}
        </p>
      </div>
      <p>Original:</p>
      <pre className='text-wrap mb-1'>
        <code>{commentInfo.original}</code>
      </pre>
      <p>Translation:</p>
      <pre className='text-wrap'>
        <code className='translation'>{commentInfo.translation}</code>
      </pre>
    </div>
  );
};

export default CommentItem;
