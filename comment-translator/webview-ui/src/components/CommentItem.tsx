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
  expanded: boolean;
};
const CommentItem = ({ commentInfo, expanded }: Props) => {
  const shortString =
    commentInfo.original.split(' ').slice(0, 5).join(' ') + ' ...';
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
    <div className='mb-3'>
      <div className='commentBckgrd flex justify-between px-4 py-1'>
        <code className={`${expanded ? 'visible' : 'invisible'} codePreview`}>
          {shortString}
        </code>
        <p className='ignore'>
          {commentInfo.startLine === commentInfo.endLine
            ? `Line ${commentInfo.startLine}`
            : `Lines ${commentInfo.startLine} - ${commentInfo.endLine}`}
        </p>
      </div>
      <div className='commentBckgrd commentInfo p-4 h-auto'>
        <p className='title'>Original:</p>
        <pre className='text-wrap mb-1'>
          <code>{commentInfo.original}</code>
        </pre>
        <p className='title'>Translation:</p>
        <pre className='text-wrap'>
          <code className='translation'>{commentInfo.translation}</code>
        </pre>
      </div>
    </div>
  );
};

export default CommentItem;
