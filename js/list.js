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
* Function will return html markup for a list block.
*/
export function getListMarkup(
  listBlocks: Array<Object>,
  entityMap: Object,
  hashtagConfig: Object,
  directional: boolean,
  customEntityTransform: Function,
): string {
  const listHtml = [];
  let nestedListBlock = [];
  let previousBlock;
  listBlocks.forEach((block) => {
    let nestedBlock = false;
    if (!previousBlock) {
      listHtml.push(`[${getBlockTagStart(block.type)}]\n`);
    } else if (previousBlock.type !== block.type) {
      listHtml.push(`[/${getBlockTag(previousBlock.type)}]\n`);
      listHtml.push(`[${getBlockTagStart(block.type)}]\n`);
    } else if (previousBlock.depth === block.depth) {
      if (nestedListBlock && nestedListBlock.length > 0) {
        listHtml.push(getListMarkup(
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
      listHtml.push('[*]');

      const { blockStyleStart, blockStyleEnd } = getBlockStyle(block.data);
      if (blockStyleStart) {
        listHtml.push(blockStyleStart);
      }
      // if (directional) {
      //   listHtml.push(' dir = "auto"');
      // }
      listHtml.push(getBlockInnerMarkup(block, entityMap, hashtagConfig, customEntityTransform));

      if (blockStyleEnd) {
        listHtml.push(blockStyleEnd);
      }

      listHtml.push('\n');
      previousBlock = block;
    }
  });
  if (nestedListBlock && nestedListBlock.length > 0) {
    listHtml.push(getListMarkup(
      nestedListBlock,
      entityMap,
      hashtagConfig,
      directional,
      customEntityTransform,
    ));
  }
  listHtml.push(`[/${getBlockTag(previousBlock.type)}]\n`);
  return listHtml.join('');
}
