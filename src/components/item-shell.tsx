import React, { useState, useEffect } from 'react';
import { ItemCarouselComponent } from './items-carousel/item-carousel';
import { CommentsCardComponent } from './comments/comments-card';
import { Comment } from '../types';
import { postData } from '../https-client/post-data';
import { config } from '../https-client/config';

// type imports
import { Judgment } from '../types';

// style imports
import '../index.css';

interface ItemShellProps {
  halalComments: Comment[],
  highlightedHalalComment?: number[],
  totalHalalComments: number,
  haramComments: Comment[],
  highlightedHaramComment?: number[],
  totalHaramComments: number,
};

export const ItemShellComponent = (props: ItemShellProps) => {
  const [state, setState] = useState({
    username: "op",
    items: [],
  });

  useEffect(() => {
    const fetchData = async () => {
        const data = await postData({ baseUrl: config().itemsUrl, path: 'get-items', data: { }});
        setState({ ...state, items: data });
    };
    fetchData();
  }, [])

  return (
    <div className="item-shell">
      <ItemCarouselComponent items={state.items} />
      <CommentsCardComponent judgment={Judgment.HARAM} />
      <CommentsCardComponent judgment={Judgment.HALAL} />
      <div className="floor"/>
    </div>
  )
}
