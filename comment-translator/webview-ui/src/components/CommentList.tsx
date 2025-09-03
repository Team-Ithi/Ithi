import { useState} from "react";
import CommentItem from "./CommentItem";
import type { Row } from "./CommentItem";

const CommentList = () => {
  //we start with empty container called rows and later fill them with 
  // cards (original+translation) 
  const [rows] = useState<Row[]>([]);
  //we keep track of which card is open, rn nothing is open
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // useEffect(() => {
  //   //page loads, if we get messages with data as commentData we fill rows with cards
  //   const handler = (event: MessageEvent<unknown>) => {
  //     const msg = event.data as { type?: string; value?: { commentData?: Row[] } };
  //     if (msg?.type === "translationData" && Array.isArray(msg.value?.commentData)) {
  //     setRows(msg.value.commentData);
  //     }
  //   };
  //   window.addEventListener("message", handler);
  //   //upon leaving container page stop listening 
  //   return () => window.removeEventListener("message", handler);
  // }, []);

  const toggleIndex = (index: number) => {
    //after clicking on a card, if open close it, if close open it
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  if (rows.length === 0) return null; //if empty don't show anything


  return (
    //draw all the cards in container
    <div>
      {rows.map((row, index) => (
        //for each card, draw one commentItem
        <div key={`${row.startLine}-${row.endLine}-${index}`}
            onClick={() => setSelectedIndex(prev => (prev === index ? null : index))}>
          <CommentItem
            row={row}
            selected={index === selectedIndex}
            onToggle={() => toggleIndex(index)}
            //we give data to each child card, tell it should look open, give toggle option
          />
        </div>
      ))}
    </div>
  );
};

export default CommentList;
