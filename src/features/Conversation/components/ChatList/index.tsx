import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Item from '../ChatItem';

const ChatList = memo(() => {
  const ids = useChatStore(chatSelectors.currentChatIDsWithGuideMessage, isEqual);

  return (
    <Flexbox height={'100%'} style={{ position: 'relative' }}>
      {ids.map((id, index) => (
        <Item index={index} key={id} />
      ))}
    </Flexbox>
  );
});

export default ChatList;
