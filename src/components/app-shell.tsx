import React, { useState, useEffect } from 'react';
import { MenuComponent } from './menu/menu';
import { ItemCarouselComponent } from './item-carousel/item-carousel';
import { CommentsCardComponent } from './comments/comments-card';
import { Comment, Item } from '../types';
import { postData } from '../https-client/post-data';
import { itemsConfig } from '../https-client/config';

// type imports
import { Judgment } from '../types';

// style imports
import './app-shell.css';

export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<{ username: string; items: Item[]; itemIndex: number; }>({
    username: "op",
    items: [],
    itemIndex: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
        const data = await postData({ baseUrl: itemsConfig.url, path: 'get-items', data: { }, additionalHeaders: { },});
        setState({ ...state, items: data });
    };
    fetchData();
  }, [])

  const iterateItem = (iteration: number) => () => {
    if ((state.itemIndex + iteration) < state.items.length && (state.itemIndex + iteration) >= 0) {
        setState({  ...state, itemIndex: state.itemIndex + iteration });
    } else {
        return undefined;
    }
  };

  const itemName = state.items.length > 0 ? state.items[state.itemIndex].itemName : undefined;

  return (
    <div className="app-shell">
      <MenuComponent />
      <ItemCarouselComponent iterateItem={iterateItem} itemText={itemName} />
      <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} />
      <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} />
    </div>
  )
}
