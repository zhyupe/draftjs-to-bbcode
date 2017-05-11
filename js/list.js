import {
  getBlockTag,
  getBlockStyle,
  getBlockInnerMarkup,
} from './block';

/**
* Function to check if a block is of type list.
*/
export function isList(blockType: string): any {
  return (
    blockType === 'unordered-list-item' ||
    blockType === 'ordered-list-item'
  );
}

function getBlockTagStart(type) {
  if (type === 'ordered-list-item') {
    return `${getBlockTag(type)}=1`;
  }
  return getBlockTag(type);
}

/**
* Function will return BBCode markup for a list block.
*/
export function getListMarkup(
  listBlocks: Array<Object>,
  entityMap: Object,
  hashtagConfig: Object,
  directional: boolean,
  customEntityTransform: Function,
): string {
  const listBBCode = [];
  let nestedListBlock = [];
  let previousBlock;
  listBlocks.forEach((block) => {
    let nestedBlock = false;
    if (!previousBlock) {
      listBBCode.push(`[${getBlockTagStart(block.type)}]\n`);
    } else if (previousBlock.type !== block.type) {
      listBBCode.push(`[/${getBlockTag(previousBlock.type)}]\n`);
      listBBCode.push(`[${getBlockTagStart(block.type)}]\n`);
    } else if (previousBlock.depth === block.depth) {
      if (nestedListBlock && nestedListBlock.length > 0) {
        listBBCode.push(getListMarkup(
          nestedListBlock,
          entityMap,
          hashtagConfig,
          directional,
          customEntityTransform,
        ));
        nestedListBlock = [];
      }
    } else {
      nestedBlock = true;
      nestedListBlock.push(block);
    }
    if (!nestedBlock) {
      listBBCode.push('[*]');

      const { blockStyleStart, blockStyleEnd } = getBlockStyle(block.data);
      if (blockStyleStart) {
        listBBCode.push(blockStyleStart);
      }
      // if (directional) {
      //   listBBCode.push(' dir = "auto"');
      // }
      listBBCode.push(getBlockInnerMarkup(block, entityMap, hashtagConfig, customEntityTransform));

      if (blockStyleEnd) {
        listBBCode.push(blockStyleEnd);
      }

      listBBCode.push('\n');
      previousBlock = block;
    }
  });
  if (nestedListBlock && nestedListBlock.length > 0) {
    listBBCode.push(getListMarkup(
      nestedListBlock,
      entityMap,
      hashtagConfig,
      directional,
      customEntityTransform,
    ));
  }
  listBBCode.push(`[/${getBlockTag(previousBlock.type)}]\n`);
  return listBBCode.join('');
}
