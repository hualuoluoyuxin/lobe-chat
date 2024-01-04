import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import React, { CSSProperties, memo, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  WindowScroller,
} from 'react-virtualized';
import { CellMeasurerChildProps } from 'react-virtualized/dist/es/CellMeasurer';
import { ListRowRenderer } from 'react-virtualized/dist/es/List';

import SafeSpacing from '@/components/SafeSpacing';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Item from '../ChatItem';

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true,
});

interface CellProps extends CellMeasurerChildProps {
  index: number;
  style: CSSProperties;
}

const Cell = memo<CellProps>(({ registerChild, measure, style, index }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 只在高度变化时触发重新计算
        if (entry.target === ref.current) {
          // 触发CellMeasurer的measure方法，重新计算高度
          measure();
        }
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [measure]);

  return (
    <div
      ref={(instance) => {
        registerChild?.(instance!);
      }}
      style={style}
    >
      {index === 0 ? (
        <SafeSpacing />
      ) : (
        <div ref={ref}>
          <Item index={index - 1} />
        </div>
      )}
    </div>
  );
}, isEqual);

const rowRenderer: ListRowRenderer = ({ index, parent, key, style }) => (
  <CellMeasurer
    cache={cache}
    columnIndex={0}
    index={index}
    key={key}
    parent={parent}
    rowIndex={index}
  >
    {({ registerChild, measure }) => (
      <Cell index={index} measure={measure} registerChild={registerChild} style={style} />
    )}
  </CellMeasurer>
);

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      position: relative;
      overflow: hidden auto;
      height: 100%;
    `,
  };
});

const VirtualizedList = () => {
  const { styles } = useStyles();
  const listRef = useRef<List>(null);

  const dataLength = useChatStore((s) => chatSelectors.currentChatIDsWithGuideMessage(s).length);

  return (
    <Flexbox className={styles.container}>
      <AutoSizer>
        {({ width, height }) => (
          <WindowScroller>
            {({ isScrolling, onChildScroll, scrollTop }) => (
              <List
                autoHeight
                deferredMeasurementCache={cache}
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                overscanRowCount={3}
                ref={listRef}
                rowCount={dataLength + 1}
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer}
                scrollToAlignment={'end'}
                scrollTop={scrollTop}
                width={width}
              />
            )}
          </WindowScroller>
        )}
      </AutoSizer>
    </Flexbox>
  );
};

export default VirtualizedList;
