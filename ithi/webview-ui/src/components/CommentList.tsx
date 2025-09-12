import { useState } from 'react';
import CommentItem from './CommentItem';

interface commentInfo {
  startLine: string;
  endLine: string;
  original: string;
  translation: string;
}

interface CommentListProps {
  commentData: commentInfo[];
}

const CommentList: React.FC<CommentListProps> = ({ commentData }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleExpand = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  };

  if (!commentData) {
    return (
      <div className='flex-grow flex flex-col justify-center'>
        <p>
          No translations yet! Click <a>'Translate'</a> to get started.
        </p>
      </div>
    );
  }
  return (
    <div
      className={`${
        expanded ? 'commentCollapse' : 'commentExpand'
      } flex-grow flex flex-col overflow-scroll`}
    >
      {commentData.map((commentInfo, index) => (
        <CommentItem
          key={index}
          commentInfo={commentInfo}
          expanded={expanded}
        />
      ))}
      <div className='commentSettings flex justify-between mb-1 sticky bottom-0'>
        <p className='self-center !ml-1'>
          {commentData.length > 1
            ? `${commentData.length} Comments`
            : '1 Comment'}
        </p>
        <button className='m-2 rounded-sm smallButton' onClick={handleExpand}>
          {!expanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
    </div>
  );
};

export default CommentList;
