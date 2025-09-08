import { useState } from 'react';
import CommentItem from './CommentItem';
// import type { Row } from "./CommentItem";

// type CommentListProps = {
//   commentData: object[];
// };

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
  // const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // const toggleIndex = (index: number) => {
  //   //after clicking on a card, if open close it, if close open it
  //   setSelectedIndex((prev) => (prev === index ? null : index));
  // };

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
      <div className='commentSettings flex justify-between mb-1 sticky top-0'>
        <p className='self-center !ml-1'>
          {commentData.length > 1
            ? `${commentData.length} Comments`
            : '1 Comment'}
        </p>
        <button className='m-2 rounded-sm smallButton' onClick={handleExpand}>
          {!expanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      {commentData.map((commentInfo, index) => (
        //for each card, draw one commentItem
        // <div
        //   key={`${row.startLine}-${row.endLine}-${index}`}
        //   onClick={() =>
        //     setSelectedIndex((prev) => (prev === index ? null : index))
        //   }
        // >
        <CommentItem
          key={index}
          commentInfo={commentInfo}
          expanded={expanded}
          // selected={index === selectedIndex}
          // onToggle={() => toggleIndex(index)}
          //we give data to each child card, tell it should look open, give toggle option
        />
        // </div>
      ))}
    </div>
  );
};

export default CommentList;
