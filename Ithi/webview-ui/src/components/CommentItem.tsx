export type commentInfo = {
  original: string;
  translation: string;
  startLine: string;
  endLine: string;
};
type Props = {
  commentInfo: commentInfo;
  expanded: boolean;
};
const CommentItem = ({ commentInfo, expanded }: Props) => {
  const shortString =
    commentInfo.original.split(' ').slice(0, 5).join(' ') + ' ...';

  return (
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
